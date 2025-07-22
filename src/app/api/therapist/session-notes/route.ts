import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// POST /api/therapist/session-notes - Create or update session note
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { appointmentId, sessionComment, parentMessage } = body;

    if (!appointmentId || !sessionComment) {
      return NextResponse.json(
        { error: "appointmentId and sessionComment are required" },
        { status: 400 }
      );
    }

    // Verify the appointment belongs to this therapist and is completed
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        therapistId: therapist.id,
        status: "COMPLETED",
      },
      include: {
        sessionNote: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or not completed" },
        { status: 404 }
      );
    }

    let sessionNote;

    if (appointment.sessionNote) {
      // Update existing session note
      sessionNote = await prisma.sessionNote.update({
        where: { appointmentId },
        data: {
          sessionComment,
          parentMessage: parentMessage || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new session note
      sessionNote = await prisma.sessionNote.create({
        data: {
          appointmentId,
          therapistId: therapist.id,
          sessionComment,
          parentMessage: parentMessage || null,
        },
      });
    }

    return NextResponse.json({
      message: "Session note saved successfully",
      sessionNote,
    });
  } catch (error) {
    console.error("Error saving session note:", error);
    return NextResponse.json(
      { error: "Failed to save session note" },
      { status: 500 }
    );
  }
}
