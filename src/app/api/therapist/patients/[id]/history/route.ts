import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// Type definitions for the response data
interface SessionNote {
  id: string;
  sessionComment: string;
  parentMessage: string | null;
  createdAt: Date;
}

interface Objective {
  id: string;
  name: string;
  type: string | null;
}

interface ObjectiveProgress {
  id: string;
  percentage: number;
  comment: string | null;
  createdAt: Date;
  objective: Objective;
}

interface Appointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  sessionNote: SessionNote | null;
  objectiveProgress: ObjectiveProgress[];
}

interface TreatmentProposalWithConsultation {
  id: string;
  diagnosis: string | null;
  totalSessions: unknown; // Json field from Prisma
  status: string;
  notes: string | null;
  frequency: string | null;
  createdAt: Date;
  consultationRequest: {
    schoolName: string | null;
    schoolLevel: string | null;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: patientId } = await params;

    // Fetch comprehensive patient data
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        // Ensure the therapist has access to this patient
        therapistPatients: {
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
          where: {
            therapistId: therapist.id,
          },
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
          include: {
            consultationRequest: {
              select: {
                schoolName: true,
                schoolLevel: true,
              },
            },
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
        dateOfBirth: patient.dateOfBirth?.toISOString(),
        gender: patient.gender,
        school: patient.address, // Using address as school for now
        appointments: patient.appointments.map((appointment: Appointment) => ({
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
            appointment.objectiveProgress?.map(
              (progress: ObjectiveProgress) => ({
                id: progress.id,
                percentage: progress.percentage,
                comment: progress.comment,
                createdAt: progress.createdAt.toISOString(),
                objective: progress.objective,
              })
            ) || [],
        })),
        treatmentProposals: patient.treatmentProposals.map(
          (proposal: TreatmentProposalWithConsultation) => {
            // Calculate total sessions from the proposal's totalSessions JSON field
            let calculatedTotalSessions = 0;
            if (
              proposal.totalSessions &&
              typeof proposal.totalSessions === "object"
            ) {
              const totalSessionsObj = proposal.totalSessions as {
                A?: number;
                B?: number;
              };
              calculatedTotalSessions = Math.max(
                totalSessionsObj.A || 0,
                totalSessionsObj.B || 0
              );
            } else if (typeof proposal.totalSessions === "number") {
              calculatedTotalSessions = proposal.totalSessions;
            }

            return {
              id: proposal.id,
              diagnosis: proposal.diagnosis,
              totalSessions: calculatedTotalSessions,
              status: proposal.status,
              recommendations: proposal.notes, // Map notes to recommendations for frontend compatibility
              frequency: proposal.frequency,
              createdAt: proposal.createdAt.toISOString(),
              consultationRequest: proposal.consultationRequest
                ? {
                    schoolName: proposal.consultationRequest.schoolName,
                    schoolLevel: proposal.consultationRequest.schoolLevel,
                  }
                : undefined,
            };
          }
        ),
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
