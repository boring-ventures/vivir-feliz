import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

// Validation schema for marking appointment as absent
const markAbsentSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
});

// PATCH: Mark appointment as absent (admin only)
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
    const validatedData = markAbsentSchema.parse(body);

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

    // Check if appointment can be marked as absent (must be SCHEDULED or CONFIRMED)
    if (
      appointment.status !== "SCHEDULED" &&
      appointment.status !== "CONFIRMED"
    ) {
      return NextResponse.json(
        {
          error: "Appointment cannot be marked as absent in its current status",
        },
        { status: 400 }
      );
    }

    // Update appointment status to NO_SHOW and add absence details
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "NO_SHOW" as AppointmentStatus,
        absenceReason: validatedData.reason,
        markedAbsentBy: session.user.id,
        markedAbsentAt: new Date(),
      },
      include: {
        patient: true,
        therapist: true,
      },
    });

    return NextResponse.json({
      message: "Appointment marked as absent successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error marking appointment as absent:", error);

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
