import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// POST /api/therapist/objective-progress - Create or update objective progress
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get therapist profile
    const therapist = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true, role: true },
    });

    if (!therapist || therapist.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Access denied. Therapist role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { objectiveId, percentage, comment } = body;

    if (!objectiveId || percentage === undefined) {
      return NextResponse.json(
        { error: "objectiveId and percentage are required" },
        { status: 400 }
      );
    }

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: "Percentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Verify the objective belongs to this therapist and get patient info
    const objective = await prisma.patientObjective.findFirst({
      where: {
        id: objectiveId,
        therapistId: therapist.id,
      },
      include: {
        patient: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!objective) {
      return NextResponse.json(
        { error: "Objective not found" },
        { status: 404 }
      );
    }

    // Find the latest completed appointment for this patient
    const latestCompletedAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: objective.patient.id,
        therapistId: therapist.id,
        status: "COMPLETED",
      },
      orderBy: { date: "desc" },
    });

    if (!latestCompletedAppointment) {
      return NextResponse.json(
        { error: "No completed sessions found for this patient" },
        { status: 400 }
      );
    }

    // Check if progress already exists for this objective and appointment
    const existingProgress = await prisma.objectiveProgress.findUnique({
      where: {
        objectiveId_appointmentId: {
          objectiveId,
          appointmentId: latestCompletedAppointment.id,
        },
      },
    });

    let progress;

    if (existingProgress) {
      // Update existing progress
      progress = await prisma.objectiveProgress.update({
        where: {
          objectiveId_appointmentId: {
            objectiveId,
            appointmentId: latestCompletedAppointment.id,
          },
        },
        data: {
          percentage: parseInt(percentage.toString()),
          comment: comment || null,
        },
        include: {
          appointment: {
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
            },
          },
          objective: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });
    } else {
      // Create new progress entry
      progress = await prisma.objectiveProgress.create({
        data: {
          objectiveId,
          appointmentId: latestCompletedAppointment.id,
          therapistId: therapist.id,
          percentage: parseInt(percentage.toString()),
          comment: comment || null,
        },
        include: {
          appointment: {
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
            },
          },
          objective: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });
    }

    // Auto-update objective status based on progress
    let newObjectiveStatus = objective.status;
    if (percentage === 100) {
      newObjectiveStatus = "COMPLETED";
    } else if (percentage > 0) {
      newObjectiveStatus = "IN_PROGRESS";
    }

    // Update objective status if it changed
    if (newObjectiveStatus !== objective.status) {
      await prisma.patientObjective.update({
        where: { id: objectiveId },
        data: { status: newObjectiveStatus },
      });
    }

    return NextResponse.json({
      message: "Progress updated successfully",
      progress,
      linkedAppointment: {
        id: latestCompletedAppointment.id,
        date: latestCompletedAppointment.date,
        startTime: latestCompletedAppointment.startTime,
        endTime: latestCompletedAppointment.endTime,
      },
    });
  } catch (error) {
    console.error("Error updating objective progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
