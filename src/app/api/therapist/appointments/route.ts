import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AppointmentStatus, AppointmentType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the therapist profile
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile || profile.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all"; // all, scheduled, completed
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause - include all appointment types for the therapist
    const whereClause: {
      therapistId: string;
      type?: AppointmentType;
      status?: { in: AppointmentStatus[] } | AppointmentStatus;
    } = {
      therapistId: profile.id,
      // Remove type filter to include all appointment types
    };

    if (status !== "all") {
      if (status === "scheduled") {
        whereClause.status = {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        };
      } else if (status === "completed") {
        whereClause.status = AppointmentStatus.COMPLETED;
      }
    }

    // Fetch appointments with related data
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: whereClause,
        include: {
          therapist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
          patient: {
            select: {
              id: true,
              dateOfBirth: true,
            },
          },
          medicalForm: {
            select: {
              id: true,
              childBirthDate: true,
            },
          },
          analysis: {
            select: {
              id: true,
              status: true,
              completedAt: true,
              sentToAdminAt: true,
            },
          },
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where: whereClause }),
    ]);

    // Helper function to calculate age from birthdate
    const calculateAge = (birthDate: Date): number => {
      // Parse birthdate properly to avoid timezone issues
      const birthDateLocal = new Date(
        birthDate.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );
      const today = new Date();
      const todayLocal = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      let years = todayLocal.getFullYear() - birthDateLocal.getFullYear();
      const monthDiff = todayLocal.getMonth() - birthDateLocal.getMonth();

      // Adjust if current month/day is before birth month/day
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && todayLocal.getDate() < birthDateLocal.getDate())
      ) {
        years--;
      }

      return years;
    };

    // Helper function to format date without timezone issues
    const formatDateLocal = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Transform appointments to include additional calculated fields
    const transformedAppointments = appointments.map((appointment) => {
      // Calculate age from actual birthdate
      let age = null;

      // Try to get birthdate from patient first, then medical form
      if (appointment.patient?.dateOfBirth) {
        age = calculateAge(appointment.patient.dateOfBirth);
      } else if (appointment.medicalForm?.childBirthDate) {
        age = calculateAge(appointment.medicalForm.childBirthDate);
      }

      // Determine priority based on appointment type and date
      let priority = "media";
      const daysDiff = Math.ceil(
        (appointment.date.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (appointment.type === AppointmentType.ENTREVISTA) {
        priority = "alta";
      } else if (daysDiff <= 3) {
        priority = "alta";
      } else if (daysDiff <= 7) {
        priority = "media";
      } else {
        priority = "baja";
      }

      return {
        id: appointment.id,
        appointmentId: `${appointment.type === AppointmentType.CONSULTA ? "CON" : "INT"}-${appointment.id}`,
        patientId: appointment.patient?.id || null,
        patientName: appointment.patientName || "Nombre no disponible",
        patientAge: age,
        parentName: appointment.parentName || "No especificado",
        parentPhone: appointment.parentPhone || "",
        parentEmail: appointment.parentEmail || "",
        appointmentDate: formatDateLocal(appointment.date),
        appointmentTime: appointment.startTime,
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes || "",
        priority: priority,
        therapist: appointment.therapist,
        createdAt: appointment.createdAt.toISOString(),
        // Additional fields for analysis
        analysisStatus:
          appointment.analysis?.status === "COMPLETED" ||
          appointment.analysis?.status === "SENT_TO_ADMIN"
            ? "completado"
            : appointment.analysis?.status === "DRAFT"
              ? "borrador"
              : "pendiente",
        analysisDate: appointment.analysis?.completedAt
          ? formatDateLocal(appointment.analysis.completedAt)
          : appointment.status === "COMPLETED"
            ? formatDateLocal(appointment.updatedAt)
            : null,
        diagnosis: appointment.sessionNotes || null,
        recommendations: appointment.homework || null,
        sentToAdmin:
          appointment.analysis?.status === "SENT_TO_ADMIN" ||
          (appointment.status === "COMPLETED" &&
            appointment.notes?.includes("[SENT_TO_ADMIN:")),
      };
    });

    // Get stats for all appointment types
    const allAppointmentsWhereClause = {
      therapistId: profile.id,
      // Include all appointment types for stats
    };

    const [
      allScheduled,
      allCompleted,
      allHighPriority,
      consultationCount,
      interviewCount,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          ...allAppointmentsWhereClause,
          status: {
            in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
          },
        },
      }),
      prisma.appointment.count({
        where: {
          ...allAppointmentsWhereClause,
          status: AppointmentStatus.COMPLETED,
        },
      }),
      prisma.appointment.count({
        where: {
          ...allAppointmentsWhereClause,
          date: {
            lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Within 3 days
          },
        },
      }),
      // Count consultations specifically
      prisma.appointment.count({
        where: {
          therapistId: profile.id,
          type: AppointmentType.CONSULTA,
        },
      }),
      // Count interviews specifically
      prisma.appointment.count({
        where: {
          therapistId: profile.id,
          type: AppointmentType.ENTREVISTA,
        },
      }),
    ]);

    return NextResponse.json({
      appointments: transformedAppointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        scheduled: allScheduled,
        completed: allCompleted,
        highPriority: allHighPriority,
        consultations: consultationCount,
        interviews: interviewCount,
      },
    });
  } catch (error) {
    console.error("Error fetching therapist appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
