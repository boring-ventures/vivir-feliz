import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const specialtySchema = z.object({
  specialtyId: z.string().min(1, "Specialty ID is required"),
  name: z.string().min(1, "Specialty name is required"),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const specialties = await prisma.specialty.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(specialties);
  } catch (error) {
    console.error("Error fetching specialties:", error);
    return NextResponse.json(
      { error: "Failed to fetch specialties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = specialtySchema.parse(body);

    // Check if specialty ID already exists
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { specialtyId: validatedData.specialtyId },
    });

    if (existingSpecialty) {
      return NextResponse.json(
        { error: "Specialty ID already exists" },
        { status: 400 }
      );
    }

    const specialty = await prisma.specialty.create({
      data: {
        specialtyId: validatedData.specialtyId,
        name: validatedData.name,
        description: validatedData.description,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json(specialty, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating specialty:", error);
    return NextResponse.json(
      { error: "Failed to create specialty" },
      { status: 500 }
    );
  }
}
