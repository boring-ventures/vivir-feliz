import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "active";

    // Build where clause for patients
    const patientWhere: Prisma.PatientWhereInput = {
      therapistPatients: {
        some: {
          therapistId: therapist.id,
          active: status === "active" ? true : false,
        },
      },
    };

    // Add search filter if query provided
    if (query) {
      patientWhere.OR = [
        {
          firstName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          parent: {
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ];
    }

    // Fetch patients with all related data
    const patients = await prisma.patient.findMany({
      where: patientWhere,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        therapistPatients: {
          where: {
            therapistId: therapist.id,
          },
          select: {
            startedAt: true,
            active: true,
          },
        },
        treatmentProposals: {
          where: {
            therapistId: therapist.id,
          },
          include: {
            payments: true,
            appointments: {
              orderBy: { date: "desc" },
              take: 5,
            },
          },
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          where: {
            therapistId: therapist.id,
          },
          orderBy: { date: "asc" },
          include: {
            analysis: {
              select: {
                id: true,
                status: true,
                completedAt: true,
              },
            },
            sessionNote: {
              select: {
                id: true,
                sessionComment: true,
                parentMessage: true,
              },
            },
          },
        },
        patientObjectives: {
          where: {
            therapistId: therapist.id,
          },
          include: {
            progressEntries: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data to match the expected format
    const transformedPatients = patients.map((patient) => {
      const therapistPatient = patient.therapistPatients[0];
      const latestProposal = patient.treatmentProposals[0];
      const latestAppointment = patient.appointments[0];

      // Calculate progress based on completed vs scheduled appointments
      const completedSessions = patient.appointments.filter(
        (apt) => apt.status === "COMPLETED"
      ).length;
      const scheduledSessions = patient.appointments.filter(
        (apt) => apt.status === "SCHEDULED" || apt.status === "CONFIRMED"
      ).length;
      const totalScheduledSessions = completedSessions + scheduledSessions;

      const progress =
        totalScheduledSessions > 0
          ? Math.round((completedSessions / totalScheduledSessions) * 100)
          : 0;

      // Get next appointment - find the earliest upcoming scheduled appointment
      const now = new Date();
      const nextAppointment = patient.appointments.find(
        (apt) => apt.date > now && apt.status === "SCHEDULED"
      );

      return {
        id: patient.id,
        nombre: `${patient.firstName} ${patient.lastName}`,
        edad: calculateAge(patient.dateOfBirth),
        genero: patient.gender || "No especificado",
        fechaInicio: formatDate(
          therapistPatient?.startedAt || patient.createdAt
        ),
        sesiones: {
          completadas: completedSessions,
          totales: totalScheduledSessions,
        },
        diagnostico: latestProposal?.diagnosis || "Sin diagnóstico",
        proximaCita: nextAppointment
          ? `${formatDate(nextAppointment.date)} - ${nextAppointment.startTime}`
          : "Sin programar",
        progreso: progress,
        estado: therapistPatient?.active ? "En tratamiento" : "Inactivo",
        estadoColor: therapistPatient?.active
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600",
        padre: `${patient.parent.firstName} ${patient.parent.lastName}`,
        telefono: patient.parent.phone || "No especificado",
        email: "No especificado", // Email not available in parent profile
        colegio: "No especificado", // This field doesn't exist in the schema
        observaciones: latestProposal?.notes || "Sin observaciones",
        objetivos: patient.patientObjectives.map((obj) => ({
          id: obj.id,
          titulo: obj.name,
          progreso: obj.progressEntries[0]?.percentage || 0,
          estado: getObjectiveStatus(obj.progressEntries[0]?.percentage || 0),
        })),
        comentarios: patient.appointments
          .filter((apt) => apt.sessionNote)
          .map((apt) => ({
            id: apt.sessionNote!.id,
            fecha: formatDate(apt.date),
            sesion: patient.appointments.indexOf(apt) + 1,
            comentario: apt.sessionNote!.sessionComment || "",
            paraPadre: apt.sessionNote!.parentMessage || "",
          })),
        documentos: [], // This would need to be implemented separately
        // Raw data for advanced features
        rawData: {
          patient,
          latestProposal,
          latestAppointment,
          therapistPatient,
        },
      };
    });

    return NextResponse.json({
      patients: transformedPatients,
      total: patients.length,
    });
  } catch (error) {
    console.error("Error fetching therapist patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// Helper function to calculate age
function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Helper function to get objective status
function getObjectiveStatus(progress: number): string {
  if (progress >= 100) return "completado";
  if (progress > 0) return "en progreso";
  return "pendiente";
}
