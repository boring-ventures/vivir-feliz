import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

// Validation schema for rescheduling appointment
const rescheduleSchema = z.object({
  newDate: z.string().min(1, "New date is required"),
  newStartTime: z.string().min(1, "New start time is required"),
  newEndTime: z.string().min(1, "New end time is required"),
});

// PATCH: Reschedule appointment (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const appointmentId = (await params).appointmentId;
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (
      currentUserProfile?.role !== "ADMIN" &&
      currentUserProfile?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = rescheduleSchema.parse(body);

    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        therapist: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if appointment can be rescheduled (must be SCHEDULED or NO_SHOW)
    if (
      appointment.status !== "SCHEDULED" &&
      appointment.status !== "NO_SHOW"
    ) {
      return NextResponse.json(
        { error: "Appointment cannot be rescheduled in its current status" },
        { status: 400 }
      );
    }

    // Check if the new date/time conflicts with existing appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        therapistId: appointment.therapistId,
        date: new Date(validatedData.newDate),
        status: {
          in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
        },
        id: {
          not: appointmentId,
        },
        OR: [
          {
            startTime: {
              lt: validatedData.newEndTime,
            },
            endTime: {
              gt: validatedData.newStartTime,
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "The selected time conflicts with another appointment" },
        { status: 400 }
      );
    }

    // Update appointment with new date/time and mark as rescheduled
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date: new Date(validatedData.newDate),
        startTime: validatedData.newStartTime,
        endTime: validatedData.newEndTime,
        status: "RESCHEDULED" as AppointmentStatus,
        rescheduledFrom: appointment.date,
        rescheduledTo: new Date(validatedData.newDate),
      },
      include: {
        patient: true,
        therapist: true,
      },
    });

    return NextResponse.json({
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
