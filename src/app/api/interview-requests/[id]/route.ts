import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { InterviewRequestStatus } from "@prisma/client";

// Validation schema for updating interview request
const updateInterviewRequestSchema = z.object({
  status: z.enum(["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  assignedTherapistId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const interviewRequest = await prisma.interviewRequest.findUnique({
      where: { id },
      include: {
        assignedTherapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    if (!interviewRequest) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: interviewRequest });
  } catch (error) {
    console.error("Error fetching interview request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // For updates, we require authentication (admin/therapist access)
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Check if user has permission (admin or therapist)
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (
      !currentUserProfile ||
      (currentUserProfile.role !== "ADMIN" &&
        currentUserProfile.role !== "SUPER_ADMIN" &&
        currentUserProfile.role !== "THERAPIST")
    ) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = updateInterviewRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if interview request exists
    const existingRequest = await prisma.interviewRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Prepare update data with proper typing
    const updateData: {
      status?: InterviewRequestStatus;
      notes?: string;
      scheduledDate?: Date;
      scheduledTime?: string;
      assignedTherapistId?: string;
    } = {};

    if (data.status) {
      updateData.status = data.status as InterviewRequestStatus;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.scheduledDate) {
      updateData.scheduledDate = new Date(data.scheduledDate);
    }

    if (data.scheduledTime !== undefined) {
      updateData.scheduledTime = data.scheduledTime;
    }

    if (data.assignedTherapistId !== undefined) {
      updateData.assignedTherapistId = data.assignedTherapistId;
    }

    // Update the interview request
    const updatedRequest = await prisma.interviewRequest.update({
      where: { id },
      data: updateData,
      include: {
        assignedTherapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: "Solicitud actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error updating interview request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // For deletion, we require authentication (admin access only)
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Check if user has admin permission
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (
      !currentUserProfile ||
      (currentUserProfile.role !== "ADMIN" &&
        currentUserProfile.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Check if interview request exists
    const existingRequest = await prisma.interviewRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Delete the interview request
    await prisma.interviewRequest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Solicitud eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting interview request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
