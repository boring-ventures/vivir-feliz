import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { InterviewRequestStatus } from "@prisma/client";

// Validation schema for interview request
const createInterviewRequestSchema = z.object({
  childFirstName: z.string().min(1, "Nombre del niño es requerido"),
  childLastName: z.string().min(1, "Apellido del niño es requerido"),
  childDateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de nacimiento inválida",
  }),
  childGender: z.enum(["masculino", "femenino"], {
    errorMap: () => ({ message: "Género es requerido" }),
  }),
  parentName: z.string().min(1, "Nombre del responsable es requerido"),
  parentPhone: z.string().min(1, "Teléfono es requerido"),
  parentEmail: z.string().email("Email inválido"),
  schoolName: z.string().min(1, "Nombre del colegio es requerido"),
  derivationDescription: z
    .string()
    .min(1, "Descripción del motivo es requerida"),
  derivationFileUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = createInterviewRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create the interview request in the database
    const interviewRequest = await prisma.interviewRequest.create({
      data: {
        childFirstName: data.childFirstName,
        childLastName: data.childLastName,
        childDateOfBirth: new Date(data.childDateOfBirth),
        childGender: data.childGender,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail,
        schoolName: data.schoolName,
        derivationDescription: data.derivationDescription,
        derivationFileUrl: data.derivationFileUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: interviewRequest,
      message: "Solicitud de entrevista creada exitosamente",
    });
  } catch (error) {
    console.error("Error creating interview request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Build where clause with proper typing
    const whereClause: {
      status?: InterviewRequestStatus;
    } = {};
    if (status && status !== "all") {
      whereClause.status = status as InterviewRequestStatus;
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalRequests = await prisma.interviewRequest.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalRequests / limit);

    // Fetch interview requests with pagination
    const interviewRequests = await prisma.interviewRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        assignedTherapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: interviewRequests,
      pagination: {
        total: totalRequests,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching interview requests:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
