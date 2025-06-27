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
    const { sessionNotes, homework, nextSessionPlan, status } = body;

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
      include: {
        patient: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Update the appointment with session notes
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        sessionNotes,
        homework,
        nextSessionPlan,
        status: status || "COMPLETED",
        updatedAt: new Date(),
      },
    });

    // Create a medical record entry for the session
    if (appointment.patientId) {
      await prisma.medicalRecord.create({
        data: {
          patientId: appointment.patientId,
          appointmentId: appointmentId,
          recordType: "SESSION_NOTES",
          title: `Session - ${appointment.date.toLocaleDateString()}`,
          content: sessionNotes,
          recordDate: new Date(),
          createdBy: profile.id,
        },
      });
    }

    return NextResponse.json({
      message: "Session notes added successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error adding session notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
