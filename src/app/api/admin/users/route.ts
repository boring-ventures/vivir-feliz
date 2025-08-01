import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { UserRole, SpecialtyType } from "@prisma/client";
import { z } from "zod";

// Server-side password hashing function (mirrors client-side)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Server-side salted password hash function (mirrors client-side)
async function saltAndHashPassword(
  password: string,
  salt: string
): Promise<string> {
  const saltedPassword = `${password}:${salt}`;
  return hashPassword(saltedPassword);
}

// Validation schema for creating users
const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "THERAPIST", "PARENT"]),
  nationalId: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  biography: z.string().optional(),
  specialty: z
    .enum([
      "SPEECH_THERAPIST",
      "OCCUPATIONAL_THERAPIST",
      "PSYCHOPEDAGOGUE",
      "ASD_THERAPIST",
      "NEUROPSYCHOLOGIST",
      "COORDINATOR",
    ])
    .optional(),
  canTakeConsultations: z.boolean().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// GET: Fetch all users (admin only) with pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin or super admin
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (
      currentUserProfile?.role !== "ADMIN" &&
      currentUserProfile?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Build where clause - exclude current admin user
    const whereClause: {
      userId: { not: string };
      role?: "SUPER_ADMIN" | "ADMIN" | "THERAPIST" | "PARENT";
      OR?: Array<{
        firstName?: { contains: string; mode: "insensitive" };
        lastName?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      userId: { not: session.user.id }, // Exclude current admin user
    };

    if (role && role !== "all") {
      whereClause.role = role as UserRole;
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalUsers = await prisma.profile.count({ where: whereClause });
    const totalPages = Math.ceil(totalUsers / limit);

    // Fetch users from database with pagination
    const profiles = await prisma.profile.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });

    // Get user data from Supabase for each profile
    const usersWithAuth = await Promise.all(
      profiles.map(async (profile) => {
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(
            profile.userId
          );
          return {
            ...profile,
            email: authUser.user?.email || null,
          };
        } catch (error) {
          console.error(
            `Error fetching auth data for user ${profile.userId}:`,
            error
          );
          return {
            ...profile,
            email: null,
          };
        }
      })
    );

    return NextResponse.json({
      users: usersWithAuth,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin or super admin
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (
      currentUserProfile?.role !== "ADMIN" &&
      currentUserProfile?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if email already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const emailExists = existingUsers.users?.some(
      (user) => user.email === validatedData.email
    );

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Check if nationalId already exists (if provided)
    if (validatedData.nationalId) {
      const existingNationalId = await prisma.profile.findUnique({
        where: { nationalId: validatedData.nationalId },
      });

      if (existingNationalId) {
        return NextResponse.json(
          { error: "National ID already exists" },
          { status: 409 }
        );
      }
    }

    // Create user in Supabase Auth using salted and hashed password
    const hashedPassword = await saltAndHashPassword(
      validatedData.password,
      validatedData.email
    );

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: validatedData.email,
        password: hashedPassword,
        email_confirm: true, // Auto-confirm email for admin-created users
      });

    if (authError || !authUser.user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Failed to create user authentication" },
        { status: 500 }
      );
    }

    // Create profile in database
    const newProfile = await prisma.profile.create({
      data: {
        userId: authUser.user.id,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        role: validatedData.role as UserRole,
        nationalId: validatedData.nationalId || null,
        address: validatedData.address || null,
        dateOfBirth: validatedData.dateOfBirth
          ? new Date(validatedData.dateOfBirth)
          : null,
        biography: validatedData.biography || null,
        specialty: (validatedData.specialty as SpecialtyType) || null,
        canTakeConsultations: validatedData.canTakeConsultations ?? null,
        active: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: { ...newProfile, email: validatedData.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
