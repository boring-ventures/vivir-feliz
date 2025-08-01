import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface Indicator {
  name: string;
  previousLevel?: string;
  currentLevel: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Get therapist profile
    let therapist = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    console.log("Session user ID:", user.id);
    console.log("Session user email:", user.email);
    console.log("Therapist profile:", therapist);
    console.log("Therapist role:", therapist?.role);

    // Check if user is a therapist (either in session or profile)
    const isTherapist = therapist?.role === "THERAPIST";

    if (!isTherapist) {
      return NextResponse.json(
        { message: "Solo los terapeutas pueden contribuir al informe" },
        { status: 403 }
      );
    }

    // If no profile exists, create one
    if (!therapist) {
      console.log("Creating therapist profile for user:", user.id);
      therapist = await prisma.profile.create({
        data: {
          userId: user.id,
          role: "THERAPIST",
          active: true,
        },
      });
      console.log("Created therapist profile:", therapist.id);
    }

    if (!therapist) {
      return NextResponse.json(
        { message: "Perfil de terapeuta no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log("Received request body:", body);

    const {
      patientId,
      objectives,
      background,
      indicators,
      indicatorsComment,
      conclusions,
    } = body;

    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { message: "Paciente no encontrado" },
        { status: 404 }
      );
    }

    // Check if contribution already exists for this therapist and patient
    const existingContribution =
      await prisma.therapistReportContribution.findFirst({
        where: {
          patientId,
          therapistId: therapist.id,
        },
      });

    if (existingContribution) {
      return NextResponse.json(
        { message: "Ya has enviado una contribución para este paciente" },
        { status: 400 }
      );
    }

    // Calculate patient age (for future use if needed)
    // const birthDate = new Date(patient.dateOfBirth);
    // const today = new Date();
    // const age = today.getFullYear() - birthDate.getFullYear();
    // const monthDiff = today.getMonth() - birthDate.getMonth();
    // const ageString =
    //   monthDiff < 0 ||
    //   (monthDiff === 0 && today.getDate() < birthDate.getDate())
    //     ? `${age - 1} años`
    //     : `${age} años`;

    // Process indicators to store only initial status and new value
    let processedIndicators: Prisma.InputJsonValue | undefined = undefined;
    if (indicators && Array.isArray(indicators)) {
      processedIndicators = indicators.map((indicator: Indicator) => {
        // Map the internal level system back to database status values
        const mapLevelToDatabaseStatus = (level: string): string => {
          switch (level) {
            case "INITIAL":
              return "not_achieved";
            case "DEVELOPING":
              return "with_help";
            case "ACHIEVED":
              return "in_progress";
            case "CONSOLIDATED":
              return "achieved";
            default:
              return "not_achieved";
          }
        };

        return {
          name: indicator.name,
          initialStatus: indicator.previousLevel
            ? mapLevelToDatabaseStatus(indicator.previousLevel)
            : mapLevelToDatabaseStatus(indicator.currentLevel),
          newStatus: mapLevelToDatabaseStatus(indicator.currentLevel),
        };
      });
    }

    // Create the contribution
    const contribution = await prisma.therapistReportContribution.create({
      data: {
        patientId,
        therapistId: therapist.id,
        objectives: objectives || null,
        background: background || null,
        indicators: processedIndicators,
        indicatorsComment: indicatorsComment || null,
        conclusions: conclusions || null,
        // Note: progressEntries and recommendations are not stored in this table
        // They are only used for the therapist's contribution to the final report
      },
    });

    return NextResponse.json(
      {
        message: "Contribución enviada exitosamente",
        contribution,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating therapist report contribution:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const allContributions = searchParams.get("all") === "true";

    if (!patientId) {
      return NextResponse.json(
        { message: "ID del paciente requerido" },
        { status: 400 }
      );
    }

    // Get therapist profile
    let therapist = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    console.log("API Debug - Session user:", {
      id: user.id,
      role: user.role,
      email: user.email,
    });
    console.log("API Debug - Therapist profile:", {
      id: therapist?.id,
      role: therapist?.role,
      specialty: therapist?.specialty,
      firstName: therapist?.firstName,
      lastName: therapist?.lastName,
    });

    // Check if user is a therapist (either in session or profile)
    const isTherapist = therapist?.role === "THERAPIST";

    if (!isTherapist) {
      return NextResponse.json(
        { message: "Solo los terapeutas pueden ver las contribuciones" },
        { status: 403 }
      );
    }

    // If no profile exists, create one
    if (!therapist) {
      console.log("Creating therapist profile for user:", user.id);
      therapist = await prisma.profile.create({
        data: {
          userId: user.id,
          role: "THERAPIST",
          active: true,
        },
      });
      console.log("Created therapist profile:", therapist.id);
    }

    if (!therapist) {
      return NextResponse.json(
        { message: "Perfil de terapeuta no encontrado" },
        { status: 404 }
      );
    }

    // If requesting all contributions, fetch all contributions for the patient
    if (allContributions) {
      console.log(
        "API Debug - Fetching all contributions for patient:",
        patientId
      );

      // Fetch all contributions for the patient with therapist info
      const contributions = await prisma.therapistReportContribution.findMany({
        where: {
          patientId,
        },
        include: {
          therapist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(
        `Found ${contributions.length} contributions for patient ${patientId}`
      );
      console.log(
        "Contributions data:",
        JSON.stringify(contributions, null, 2)
      );

      return NextResponse.json({ contributions });
    }

    // Get contribution for this specific therapist and patient
    const contribution = await prisma.therapistReportContribution.findFirst({
      where: {
        patientId,
        therapistId: therapist.id,
      },
    });

    return NextResponse.json({ contribution });
  } catch (error) {
    console.error("Error fetching therapist report contribution:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
