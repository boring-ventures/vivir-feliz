import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the parent profile
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile || profile.role !== "PARENT") {
      return NextResponse.json(
        { error: "Parent profile not found" },
        { status: 404 }
      );
    }

    // Get all patients belonging to this parent
    const patients = await prisma.patient.findMany({
      where: {
        parentId: profile.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    const patientIds = patients.map((patient) => patient.id);

    if (patientIds.length === 0) {
      return NextResponse.json({
        objectives: [],
        sessionNotes: [],
        evaluations: [],
      });
    }

    // Fetch objectives for all patients
    const objectives = await prisma.patientObjective.findMany({
      where: {
        patientId: { in: patientIds },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        progressEntries: {
          orderBy: { createdAt: "desc" },
          include: {
            appointment: {
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch session notes for all patients
    const sessionNotes = await prisma.sessionNote.findMany({
      where: {
        appointment: {
          patientId: { in: patientIds },
        },
      },
      include: {
        appointment: {
          select: {
            id: true,
            date: true,
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform objectives for response
    const transformedObjectives = objectives.map((objective) => {
      const patientName = objective.patient
        ? `${objective.patient.firstName} ${objective.patient.lastName}`
        : "Paciente no disponible";

      const therapistName = objective.therapist
        ? `${objective.therapist.firstName} ${objective.therapist.lastName}`
        : "Terapeuta no disponible";

      // Calculate progress percentage based on latest progress entry
      const latestProgress = objective.progressEntries[0];
      const progressPercentage = latestProgress ? latestProgress.percentage : 0;

      return {
        id: objective.id,
        patientId: objective.patientId,
        patientName,
        therapistId: objective.therapistId,
        therapistName,
        proposalId: objective.proposalId,
        name: objective.name,
        status: objective.status,
        type: objective.type,
        progressPercentage,
        createdAt: objective.createdAt.toISOString(),
        updatedAt: objective.updatedAt.toISOString(),
        progressEntries: objective.progressEntries.map((entry) => ({
          id: entry.id,
          objectiveId: entry.objectiveId,
          appointmentId: entry.appointmentId,
          therapistId: entry.therapistId,
          percentage: entry.percentage,
          comment: entry.comment,
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
          appointment: {
            id: entry.appointment.id,
            date: entry.appointment.date.toISOString(),
            startTime: entry.appointment.startTime,
            endTime: entry.appointment.endTime,
          },
        })),
      };
    });

    // Transform session notes for response
    const transformedSessionNotes = sessionNotes.map((note) => {
      const patientName = note.appointment.patient
        ? `${note.appointment.patient.firstName} ${note.appointment.patient.lastName}`
        : "Paciente no disponible";

      const therapistName = note.therapist
        ? `${note.therapist.firstName} ${note.therapist.lastName}`
        : "Terapeuta no disponible";

      return {
        id: note.id,
        appointmentId: note.appointmentId,
        therapistId: note.therapistId,
        therapistName,
        patientName,
        sessionComment: note.sessionComment,
        parentMessage: note.parentMessage,
        appointmentDate: note.appointment.date.toISOString(),
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      objectives: transformedObjectives,
      sessionNotes: transformedSessionNotes,
      evaluations: [],
    });
  } catch (error) {
    console.error("Error fetching parent progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
