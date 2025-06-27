import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const body = await request.json();
    const { newDate, newStartTime, newEndTime, reason } = body;

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

    // Check if the appointment belongs to this therapist
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

    // Check for conflicts with existing appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        therapistId: profile.id,
        date: new Date(newDate),
        startTime: newStartTime,
        id: {
          not: appointmentId, // Exclude the current appointment
        },
        status: {
          not: "CANCELLED",
        },
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 409 }
      );
    }

    // Store the original date for tracking
    const originalDate = appointment.date;

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        date: new Date(newDate),
        startTime: newStartTime,
        endTime: newEndTime,
        rescheduledFrom: originalDate,
        rescheduledTo: new Date(newDate),
        status: "RESCHEDULED",
        notes: reason
          ? `${appointment.notes || ""}\n\nRescheduled: ${reason}`.trim()
          : appointment.notes,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
