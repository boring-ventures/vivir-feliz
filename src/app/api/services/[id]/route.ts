import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateServiceSchema = z.object({
  code: z.string().min(1, "Code is required"),
  serviceName: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  sessions: z.number().int().positive("Sessions must be a positive integer"),
  costPerSession: z.number().positive("Cost per session must be positive"),
  type: z.enum(["EVALUATION", "TREATMENT"]),
  specialty: z.string().optional(),
  status: z.boolean(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        specialty: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
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
    const validatedData = updateServiceSchema.parse(body);

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Check if code is being changed and if it already exists
    if (validatedData.code !== existingService.code) {
      const codeExists = await prisma.service.findUnique({
        where: { code: validatedData.code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Service code already exists" },
          { status: 400 }
        );
      }
    }

    // If specialty is provided, verify it exists and get its ID
    let specialtyId = null;
    if (
      validatedData.specialty &&
      validatedData.specialty.trim() !== "" &&
      validatedData.specialty !== "none"
    ) {
      const specialtyExists = await prisma.specialty.findUnique({
        where: { specialtyId: validatedData.specialty },
      });

      if (!specialtyExists) {
        return NextResponse.json(
          { error: "Selected specialty does not exist" },
          { status: 400 }
        );
      }

      specialtyId = specialtyExists.id; // Use the actual ID, not the specialtyId string
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        code: validatedData.code,
        serviceName: validatedData.serviceName,
        description: validatedData.description,
        sessions: validatedData.sessions,
        costPerSession: validatedData.costPerSession,
        type: validatedData.type,
        specialtyId: specialtyId,
        status: validatedData.status,
      },
      include: {
        specialty: true,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
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
    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
