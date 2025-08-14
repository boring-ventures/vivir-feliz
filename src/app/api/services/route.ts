import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const serviceSchema = z.object({
  code: z.string().min(1, "Code is required"),
  serviceName: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  sessions: z.number().int().positive("Sessions must be a positive integer"),
  costPerSession: z.number().positive("Cost per session must be positive"),
  type: z.enum(["EVALUATION", "TREATMENT"]),
  specialty: z.string().optional(),
  status: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        specialty: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = serviceSchema.parse(body);

    // Check if service code already exists
    const existingService = await prisma.service.findUnique({
      where: { code: validatedData.code },
    });

    if (existingService) {
      return NextResponse.json(
        { error: "Service code already exists" },
        { status: 400 }
      );
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

    const serviceData = {
      code: validatedData.code,
      serviceName: validatedData.serviceName,
      description: validatedData.description,
      sessions: validatedData.sessions,
      costPerSession: validatedData.costPerSession,
      type: validatedData.type,
      specialtyId: specialtyId,
      status: validatedData.status,
    };

    const service = await prisma.service.create({
      data: serviceData,
      include: {
        specialty: true,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
