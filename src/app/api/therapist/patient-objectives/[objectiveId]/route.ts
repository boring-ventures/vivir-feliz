import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { ObjectiveStatus } from "@prisma/client";

// PUT /api/therapist/patient-objectives/[objectiveId] - Update objective
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ objectiveId: string }> }
) {
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

    const { objectiveId } = await params;
    const body = await request.json();
    const { name, type, status } = body;

    // Verify the objective belongs to this therapist
    const objective = await prisma.patientObjective.findFirst({
      where: {
        id: objectiveId,
        therapistId: therapist.id,
      },
    });

    if (!objective) {
      return NextResponse.json(
        { error: "Objective not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      name?: string;
      type?: string | null;
      status?: ObjectiveStatus;
    } = {};

    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type || null;
    if (status !== undefined) updateData.status = status as ObjectiveStatus;

    // Update the objective
    const updatedObjective = await prisma.patientObjective.update({
      where: { id: objectiveId },
      data: updateData,
      include: {
        progressEntries: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            appointment: {
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Objective updated successfully",
      objective: updatedObjective,
    });
  } catch (error) {
    console.error("Error updating objective:", error);
    return NextResponse.json(
      { error: "Failed to update objective" },
      { status: 500 }
    );
  }
}

// DELETE /api/therapist/patient-objectives/[objectiveId] - Delete objective
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ objectiveId: string }> }
) {
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

    const { objectiveId } = await params;

    // Verify the objective belongs to this therapist
    const objective = await prisma.patientObjective.findFirst({
      where: {
        id: objectiveId,
        therapistId: therapist.id,
      },
    });

    if (!objective) {
      return NextResponse.json(
        { error: "Objective not found" },
        { status: 404 }
      );
    }

    // Delete the objective (progress entries will be cascade deleted)
    await prisma.patientObjective.delete({
      where: { id: objectiveId },
    });

    return NextResponse.json({
      message: "Objective deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting objective:", error);
    return NextResponse.json(
      { error: "Failed to delete objective" },
      { status: 500 }
    );
  }
}
