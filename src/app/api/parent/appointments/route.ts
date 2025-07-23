import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

// Helper function to format date for display
const formatDateLocal = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all"; // all, scheduled, completed
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Get all patients belonging to this parent
    const patients = await prisma.patient.findMany({
      where: {
        parentId: profile.id,
      },
      select: {
        id: true,
      },
    });

    const patientIds = patients.map((patient) => patient.id);

    if (patientIds.length === 0) {
      return NextResponse.json({
        appointments: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
        stats: {
          scheduled: 0,
          completed: 0,
          upcoming: 0,
          total: 0,
        },
      });
    }

    // Build where clause
    const whereClause: {
      patientId: { in: string[] };
      status?: { in: AppointmentStatus[] } | AppointmentStatus;
    } = {
      patientId: { in: patientIds },
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

    // Fetch appointments with relations
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
            },
          },
          therapist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
          proposal: {
            select: {
              id: true,
              title: true,
              totalSessions: true,
            },
          },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where: whereClause }),
    ]);

    // Calculate statistics
    const [scheduledCount, completedCount, upcomingCount] = await Promise.all([
      prisma.appointment.count({
        where: {
          patientId: { in: patientIds },
          status: {
            in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
          },
        },
      }),
      prisma.appointment.count({
        where: {
          patientId: { in: patientIds },
          status: AppointmentStatus.COMPLETED,
        },
      }),
      prisma.appointment.count({
        where: {
          patientId: { in: patientIds },
          status: {
            in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
          },
          date: {
            gte: new Date(),
          },
        },
      }),
    ]);

    // Transform appointments for response
    const transformedAppointments = appointments.map((appointment) => {
      const patientAge = appointment.patient?.dateOfBirth
        ? Math.floor(
            (Date.now() - appointment.patient.dateOfBirth.getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : appointment.patientAge || 0;

      const patientName = appointment.patient
        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
        : appointment.patientName || "Nombre no disponible";

      const therapistName = appointment.therapist
        ? `${appointment.therapist.firstName} ${appointment.therapist.lastName}`
        : "Terapeuta no asignado";

      return {
        id: appointment.id,
        appointmentId: `${appointment.type === "CONSULTA" ? "CON" : "INT"}-${appointment.id}`,
        patientName,
        patientAge,
        therapistName,
        therapistSpecialty: appointment.therapist?.specialty || "",
        appointmentDate: formatDateLocal(appointment.date),
        appointmentTime: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes || "",
        sessionNotes: appointment.sessionNotes || "",
        homework: appointment.homework || "",
        nextSessionPlan: appointment.nextSessionPlan || "",
        price: appointment.price ? Number(appointment.price) : null,
        proposalTitle: appointment.proposal?.title || "",
        totalSessions: appointment.proposal?.totalSessions || 0,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      appointments: transformedAppointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        scheduled: scheduledCount,
        completed: completedCount,
        upcoming: upcomingCount,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching parent appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
