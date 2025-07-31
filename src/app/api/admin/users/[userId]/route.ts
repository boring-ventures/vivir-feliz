import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { SpecialtyType } from "@prisma/client";

// DELETE: Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;
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

    // Prevent self-deletion
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete profile from database
    await prisma.profile.delete({
      where: { userId },
    });

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user from auth:", deleteError);
      // If auth deletion fails, we might want to recreate the profile
      // But for now, we'll log the error and continue
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update user (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;
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

    const body = await request.json();

    // Validate data
    const updateData: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      role: "SUPER_ADMIN" | "ADMIN" | "THERAPIST" | "PARENT";
      nationalId: string | null;
      address: string | null;
      dateOfBirth: Date | null;
      biography: string | null;
      specialty: SpecialtyType | null;
      canTakeConsultations: boolean | null;
      active: boolean;
    }> = {};

    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.nationalId !== undefined) updateData.nationalId = body.nationalId;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = body.dateOfBirth
        ? new Date(body.dateOfBirth)
        : null;
    }
    if (body.biography !== undefined) updateData.biography = body.biography;
    if (body.specialty !== undefined) updateData.specialty = body.specialty;
    if (body.canTakeConsultations !== undefined)
      updateData.canTakeConsultations = body.canTakeConsultations;
    if (body.active !== undefined) updateData.active = body.active;

    // Check if nationalId already exists (if being updated and not null)
    if (body.nationalId && body.nationalId.trim() !== "") {
      const existingNationalId = await prisma.profile.findFirst({
        where: {
          nationalId: body.nationalId,
          userId: { not: userId },
        },
      });

      if (existingNationalId) {
        return NextResponse.json(
          { error: "National ID already exists" },
          { status: 409 }
        );
      }
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
