import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

// Helper function to format date without timezone issues
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const appointmentId = params.appointmentId;
    const body = await request.json();
    const { status, sessionNotes, homework } = body;

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

    // Find the appointment and verify ownership
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        therapistId: profile.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      updatedAt: Date;
      status?: AppointmentStatus;
      sessionNotes?: string;
      homework?: string;
    } = {
      updatedAt: new Date(),
    };

    if (
      status &&
      Object.values(AppointmentStatus).includes(status as AppointmentStatus)
    ) {
      updateData.status = status as AppointmentStatus;
    }

    if (sessionNotes) {
      updateData.sessionNotes = sessionNotes;
    }

    if (homework) {
      updateData.homework = homework;
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: updateData,
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
    });

    // Transform the response
    const transformedAppointment = {
      id: updatedAppointment.id,
      appointmentId: `${updatedAppointment.type === "CONSULTA" ? "CON" : "INT"}-${updatedAppointment.id}`,
      patientName: updatedAppointment.patientName || "Nombre no disponible",
      patientAge: updatedAppointment.patientAge,
      parentName: updatedAppointment.parentName || "No especificado",
      parentPhone: updatedAppointment.parentPhone || "",
      parentEmail: updatedAppointment.parentEmail || "",
      appointmentDate: formatDateLocal(updatedAppointment.date),
      appointmentTime: updatedAppointment.startTime,
      type: updatedAppointment.type,
      status: updatedAppointment.status,
      notes: updatedAppointment.notes || "",
      therapist: updatedAppointment.therapist,
      createdAt: updatedAppointment.createdAt.toISOString(),
      analysisStatus:
        updatedAppointment.status === "COMPLETED" ? "completado" : "pendiente",
      analysisDate:
        updatedAppointment.status === "COMPLETED"
          ? formatDateLocal(updatedAppointment.updatedAt)
          : null,
      diagnosis: updatedAppointment.sessionNotes || null,
      recommendations: updatedAppointment.homework || null,
      sentToAdmin:
        updatedAppointment.status === "COMPLETED" &&
        updatedAppointment.notes?.includes("[SENT_TO_ADMIN:"),
    };

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: transformedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const appointmentId = params.appointmentId;

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

    // Find the appointment and verify ownership
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        therapistId: profile.id,
      },
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
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Transform the response
    const transformedAppointment = {
      id: appointment.id,
      appointmentId: `${appointment.type === "CONSULTA" ? "CON" : "INT"}-${appointment.id}`,
      patientName: appointment.patientName || "Nombre no disponible",
      patientAge: appointment.patientAge,
      parentName: appointment.parentName || "No especificado",
      parentPhone: appointment.parentPhone || "",
      parentEmail: appointment.parentEmail || "",
      appointmentDate: formatDateLocal(appointment.date),
      appointmentTime: appointment.startTime,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes || "",
      therapist: appointment.therapist,
      createdAt: appointment.createdAt.toISOString(),
      analysisStatus:
        appointment.status === "COMPLETED" ? "completado" : "pendiente",
      analysisDate:
        appointment.status === "COMPLETED"
          ? formatDateLocal(appointment.updatedAt)
          : null,
      diagnosis: appointment.sessionNotes || null,
      recommendations: appointment.homework || null,
      sentToAdmin:
        appointment.status === "COMPLETED" &&
        appointment.notes?.includes("[SENT_TO_ADMIN:"),
    };

    return NextResponse.json({
      appointment: transformedAppointment,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
