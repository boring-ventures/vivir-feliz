import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const specialtyUpdateSchema = z.object({
  specialtyId: z.string().min(1, "Specialty ID is required"),
  name: z.string().min(1, "Specialty name is required"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const specialty = await prisma.specialty.findUnique({
      where: { id },
    });

    if (!specialty) {
      return NextResponse.json(
        { error: "Specialty not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(specialty);
  } catch (error) {
    console.error("Error fetching specialty:", error);
    return NextResponse.json(
      { error: "Failed to fetch specialty" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = specialtyUpdateSchema.parse(body);

    // Check if specialty exists
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { id },
    });

    if (!existingSpecialty) {
      return NextResponse.json(
        { error: "Specialty not found" },
        { status: 404 }
      );
    }

    // Check if the new specialty ID already exists (excluding current specialty)
    if (validatedData.specialtyId !== existingSpecialty.specialtyId) {
      const specialtyIdExists = await prisma.specialty.findUnique({
        where: { specialtyId: validatedData.specialtyId },
      });

      if (specialtyIdExists) {
        return NextResponse.json(
          { error: "Specialty ID already exists" },
          { status: 400 }
        );
      }
    }

    const updatedSpecialty = await prisma.specialty.update({
      where: { id },
      data: {
        specialtyId: validatedData.specialtyId,
        name: validatedData.name,
        description: validatedData.description,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json(updatedSpecialty);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating specialty:", error);
    return NextResponse.json(
      { error: "Failed to update specialty" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if specialty exists
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { id },
      include: {
        profiles: true,
        services: true,
      },
    });

    if (!existingSpecialty) {
      return NextResponse.json(
        { error: "Specialty not found" },
        { status: 404 }
      );
    }

    // Check if specialty is being used
    if (
      existingSpecialty.profiles.length > 0 ||
      existingSpecialty.services.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete specialty that is being used by therapists or services",
          profilesCount: existingSpecialty.profiles.length,
          servicesCount: existingSpecialty.services.length,
        },
        { status: 400 }
      );
    }

    await prisma.specialty.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Specialty deleted successfully" });
  } catch (error) {
    console.error("Error deleting specialty:", error);
    return NextResponse.json(
      { error: "Failed to delete specialty" },
      { status: 500 }
    );
  }
}
