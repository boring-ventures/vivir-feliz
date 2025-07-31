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
  specialty: z.enum([
    "SPEECH_THERAPIST",
    "OCCUPATIONAL_THERAPIST",
    "PSYCHOPEDAGOGUE",
    "ASD_THERAPIST",
    "NEUROPSYCHOLOGIST",
    "COORDINATOR",
    "PSYCHOMOTRICIAN",
    "PEDIATRIC_KINESIOLOGIST",
    "PSYCHOLOGIST",
    "COORDINATION_ASSISTANT",
    "BEHAVIORAL_THERAPIST",
  ]),
  status: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const services = await prisma.service.findMany({
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

    const service = await prisma.service.create({
      data: {
        code: validatedData.code,
        serviceName: validatedData.serviceName,
        description: validatedData.description,
        sessions: validatedData.sessions,
        costPerSession: validatedData.costPerSession,
        type: validatedData.type,
        specialty: validatedData.specialty,
        status: validatedData.status,
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
