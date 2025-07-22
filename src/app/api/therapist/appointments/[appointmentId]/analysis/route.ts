import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET analysis data
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

    const analysis = await prisma.analysis.findUnique({
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
    });

    if (!analysis) {
      // Return empty analysis structure if none exists
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST/PUT analysis data
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
      presentation = [],
      disposition = [],
      eyeContact = [],
      activityLevel = [],
      sensoryEvaluation = "",
      generalBehavior = "",
      psychologicalAnalysis = "",
      cognitiveArea = "",
      learningArea = "",
      schoolPerformance = "",
      languageAnalysis = "",
      motorAnalysis = "",
      additionalInformation = "",
      generalObservations = "",
      diagnosticHypothesis = "",
      recommendations = "",
      treatmentPlan = "",
      followUpNeeded = false,
      status = "DRAFT",
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

    // Upsert analysis
    const analysis = await prisma.analysis.upsert({
      where: {
        appointmentId,
      },
      update: {
        presentation,
        disposition,
        eyeContact,
        activityLevel,
        sensoryEvaluation,
        generalBehavior,
        psychologicalAnalysis,
        cognitiveArea,
        learningArea,
        schoolPerformance,
        languageAnalysis,
        motorAnalysis,
        additionalInformation,
        generalObservations,
        diagnosticHypothesis,
        recommendations,
        treatmentPlan,
        followUpNeeded,
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
        sentToAdminAt: status === "SENT_TO_ADMIN" ? new Date() : null,
      },
      create: {
        appointmentId,
        presentation,
        disposition,
        eyeContact,
        activityLevel,
        sensoryEvaluation,
        generalBehavior,
        psychologicalAnalysis,
        cognitiveArea,
        learningArea,
        schoolPerformance,
        languageAnalysis,
        motorAnalysis,
        additionalInformation,
        generalObservations,
        diagnosticHypothesis,
        recommendations,
        treatmentPlan,
        followUpNeeded,
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
        sentToAdminAt: status === "SENT_TO_ADMIN" ? new Date() : null,
      },
    });

    // Update appointment status when analysis is sent to admin
    if (status === "SENT_TO_ADMIN") {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "COMPLETED",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: analysis,
      message: "Análisis guardado exitosamente",
    });
  } catch (error) {
    console.error("Error saving analysis:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
