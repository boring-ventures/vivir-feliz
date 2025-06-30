import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

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

    // Build where clause
    const whereClause: {
      therapistId: string;
      status?: { in: AppointmentStatus[] } | AppointmentStatus;
    } = {
      therapistId: profile.id,
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
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where: whereClause }),
    ]);

    // Transform appointments to include additional calculated fields
    const transformedAppointments = appointments.map((appointment) => {
      // Calculate age if we have patient data
      let age = null;
      if (appointment.date) {
        // For now, we'll estimate age based on typical consultation ages
        // In a real implementation, you might want to store birth date
        age = Math.floor(Math.random() * 10) + 5; // Random age between 5-14 for demo
      }

      // Determine priority based on appointment type and date
      let priority = "media";
      const daysDiff = Math.ceil(
        (appointment.date.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (appointment.type === "ENTREVISTA") {
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
        appointmentId: `${appointment.type === "CONSULTA" ? "CON" : "INT"}-${appointment.id}`,
        patientName: appointment.patientName || "Nombre no disponible",
        patientAge: age,
        parentName: appointment.parentName || "No especificado",
        parentPhone: appointment.parentPhone || "",
        parentEmail: appointment.parentEmail || "",
        appointmentDate: appointment.date.toISOString().split("T")[0],
        appointmentTime: appointment.startTime,
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes || "",
        priority: priority,
        therapist: appointment.therapist,
        createdAt: appointment.createdAt.toISOString(),
        // Additional fields for analysis
        analysisStatus:
          appointment.status === "COMPLETED" ? "completado" : "pendiente",
        analysisDate:
          appointment.status === "COMPLETED"
            ? appointment.updatedAt.toISOString().split("T")[0]
            : null,
        diagnosis: appointment.sessionNotes || null,
        recommendations: appointment.homework || null,
        sentToAdmin:
          appointment.status === "COMPLETED" &&
          appointment.notes?.includes("[SENT_TO_ADMIN:"),
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
        scheduled: transformedAppointments.filter((a) =>
          ["SCHEDULED", "CONFIRMED"].includes(a.status)
        ).length,
        completed: transformedAppointments.filter(
          (a) => a.status === "COMPLETED"
        ).length,
        highPriority: transformedAppointments.filter(
          (a) => a.priority === "alta"
        ).length,
        consultations: transformedAppointments.filter(
          (a) => a.type === "CONSULTA"
        ).length,
        interviews: transformedAppointments.filter(
          (a) => a.type === "ENTREVISTA"
        ).length,
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
