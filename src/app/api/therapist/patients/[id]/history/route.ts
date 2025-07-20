import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
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

    const patientId = params.id;

    // Fetch comprehensive patient data
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        // Ensure the therapist has access to this patient
        treatmentProposals: {
          some: {
            therapistId: therapist.id,
          },
        },
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        appointments: {
          include: {
            sessionNote: true,
            objectiveProgress: {
              include: {
                objective: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                  },
                },
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        treatmentProposals: {
          where: {
            therapistId: therapist.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found or access denied" },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      patient: {
        id: patient.id,
        user: {
          id: patient.parent.id,
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email || "",
        },
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        school: patient.address, // Using address as school for now
        appointments: patient.appointments.map((appointment: any) => ({
          id: appointment.id,
          date: appointment.date.toISOString(),
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          sessionNote: appointment.sessionNote
            ? {
                id: appointment.sessionNote.id,
                sessionComment: appointment.sessionNote.sessionComment,
                parentMessage: appointment.sessionNote.parentMessage,
                createdAt: appointment.sessionNote.createdAt.toISOString(),
              }
            : undefined,
          objectiveProgress:
            appointment.objectiveProgress?.map((progress: any) => ({
              id: progress.id,
              percentage: progress.percentage,
              comment: progress.comment,
              createdAt: progress.createdAt.toISOString(),
              objective: progress.objective,
            })) || [],
        })),
        treatmentProposals: patient.treatmentProposals.map((proposal: any) => ({
          id: proposal.id,
          diagnosis: proposal.diagnosis,
          totalSessions: proposal.totalSessions,
          status: proposal.status,
          notes: proposal.notes, // Using notes instead of recommendations
          createdAt: proposal.createdAt.toISOString(),
        })),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching patient history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
