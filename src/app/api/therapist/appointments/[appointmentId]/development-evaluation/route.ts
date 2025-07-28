import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET development evaluation data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId: rawAppointmentId } = await params;

    // Extract the actual appointment ID from formats like "CON-{id}-{timestamp}" or "INT-{id}-{timestamp}"
    const appointmentId = (() => {
      if (
        rawAppointmentId.startsWith("CON-") ||
        rawAppointmentId.startsWith("INT-")
      ) {
        const parts = rawAppointmentId.split("-");
        if (parts.length === 3) {
          // Format: CON-{id}-{timestamp} -> return just {id}
          return parts[1];
        } else if (parts.length === 2) {
          // Format: CON-{id} -> return just {id}
          return parts[1];
        }
      }
      return rawAppointmentId;
    })();

    const developmentEvaluation = await prisma.developmentEvaluation.findUnique(
      {
        where: {
          appointmentId,
        },
        include: {
          appointment: {
            select: {
              id: true,
              patientName: true,
              patientAge: true,
              parentName: true,
              date: true,
              startTime: true,
              status: true,
            },
          },
        },
      }
    );

    if (!developmentEvaluation) {
      // Return empty development evaluation structure if none exists
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: developmentEvaluation,
    });
  } catch (error) {
    console.error("Error fetching development evaluation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST/PUT development evaluation data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId: rawAppointmentId } = await params;

    // Extract the actual appointment ID from formats like "CON-{id}-{timestamp}" or "INT-{id}-{timestamp}"
    const appointmentId = (() => {
      if (
        rawAppointmentId.startsWith("CON-") ||
        rawAppointmentId.startsWith("INT-")
      ) {
        const parts = rawAppointmentId.split("-");
        if (parts.length === 3) {
          // Format: CON-{id}-{timestamp} -> return just {id}
          return parts[1];
        } else if (parts.length === 2) {
          // Format: CON-{id} -> return just {id}
          return parts[1];
        }
      }
      return rawAppointmentId;
    })();

    const body = await request.json();

    const {
      communicationAndLanguage = null,
      grossMotorSkills = null,
      fineMotorSkills = null,
      attentionAndLearning = null,
      socialRelations = null,
      autonomyAndAdaptation = null,
      strengths = "",
      areasToSupport = "",
      homeRecommendations = "",
      schoolRecommendations = "",
    } = body;

    // Verify appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Upsert development evaluation
    const developmentEvaluation = await prisma.developmentEvaluation.upsert({
      where: {
        appointmentId,
      },
      update: {
        communicationAndLanguage,
        grossMotorSkills,
        fineMotorSkills,
        attentionAndLearning,
        socialRelations,
        autonomyAndAdaptation,
        strengths,
        areasToSupport,
        homeRecommendations,
        schoolRecommendations,
      },
      create: {
        appointmentId,
        communicationAndLanguage,
        grossMotorSkills,
        fineMotorSkills,
        attentionAndLearning,
        socialRelations,
        autonomyAndAdaptation,
        strengths,
        areasToSupport,
        homeRecommendations,
        schoolRecommendations,
      },
    });

    return NextResponse.json({
      success: true,
      data: developmentEvaluation,
      message: "Evaluación de desarrollo guardada exitosamente",
    });
  } catch (error) {
    console.error("Error saving development evaluation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
