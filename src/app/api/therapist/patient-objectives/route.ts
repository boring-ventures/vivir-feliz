import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// GET /api/therapist/patient-objectives - Get objectives for a specific patient
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    // Verify the therapist has access to this patient
    const therapistPatient = await prisma.therapistPatient.findFirst({
      where: {
        therapistId: therapist.id,
        patientId,
        active: true,
      },
    });

    if (!therapistPatient) {
      return NextResponse.json(
        { error: "Patient not found or access denied" },
        { status: 404 }
      );
    }

    // Get objectives with latest progress
    const objectives = await prisma.patientObjective.findMany({
      where: {
        patientId,
        therapistId: therapist.id,
      },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ objectives });
  } catch (error) {
    console.error("Error fetching patient objectives:", error);
    return NextResponse.json(
      { error: "Failed to fetch objectives" },
      { status: 500 }
    );
  }
}

// POST /api/therapist/patient-objectives - Create a new objective
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
    const { patientId, name, type, proposalId } = body;

    if (!patientId || !name || !proposalId) {
      return NextResponse.json(
        { error: "patientId, name, and proposalId are required" },
        { status: 400 }
      );
    }

    // Verify the proposal belongs to this therapist and patient
    const proposal = await prisma.treatmentProposal.findFirst({
      where: {
        id: proposalId,
        patientId,
        therapistId: therapist.id,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Treatment proposal not found or access denied" },
        { status: 404 }
      );
    }

    // Verify the therapist has access to this patient
    const therapistPatient = await prisma.therapistPatient.findFirst({
      where: {
        therapistId: therapist.id,
        patientId,
        active: true,
      },
    });

    if (!therapistPatient) {
      return NextResponse.json(
        { error: "Patient not found or access denied" },
        { status: 404 }
      );
    }

    // Create the objective
    const objective = await prisma.patientObjective.create({
      data: {
        patientId,
        therapistId: therapist.id,
        proposalId: proposalId,
        name: name.trim(),
        type: type || null,
        status: "PENDING",
      },
      include: {
        progressEntries: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      message: "Objective created successfully",
      objective,
    });
  } catch (error) {
    console.error("Error creating objective:", error);
    return NextResponse.json(
      { error: "Failed to create objective" },
      { status: 500 }
    );
  }
}
