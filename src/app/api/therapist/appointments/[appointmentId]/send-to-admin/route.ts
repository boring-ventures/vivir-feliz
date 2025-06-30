import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(
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
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if appointment is completed
    if (appointment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Appointment must be completed before sending to admin" },
        { status: 400 }
      );
    }

    // Update appointment to mark as sent to admin
    // For now, we'll use a field in the notes to track this
    // In a real implementation, you might want to add a specific field to the schema
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        notes: appointment.notes
          ? `${appointment.notes}\n[SENT_TO_ADMIN: ${new Date().toISOString()}]`
          : `[SENT_TO_ADMIN: ${new Date().toISOString()}]`,
        updatedAt: new Date(),
      },
    });

    // TODO: In a real implementation, you might want to:
    // 1. Send an email notification to the admin
    // 2. Create an admin notification record
    // 3. Log the action for audit purposes

    return NextResponse.json({
      success: true,
      message: "Analysis sent to admin successfully",
      appointment: {
        id: updatedAppointment.id,
        sentToAdmin: true,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error sending analysis to admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
