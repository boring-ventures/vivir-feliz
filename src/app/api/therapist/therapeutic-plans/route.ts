import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

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

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const therapistId = searchParams.get("therapistId");

    if (!patientId || !therapistId) {
      return NextResponse.json(
        { error: "Patient ID and Therapist ID are required" },
        { status: 400 }
      );
    }

    const therapeuticPlans = await prisma.therapeuticPlan.findMany({
      where: {
        patientId,
        therapistId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ therapeuticPlans });
  } catch (error) {
    console.error("Error fetching therapeutic plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const {
      patientId,
      therapistId,
      patientName,
      patientDateOfBirth,
      patientAge,
      school,
      grade,
      objectivesDate,
      planning,
      treatmentArea,
      frequency,
      therapyStartDate,
      background,
      diagnoses,
      generalObjective,
      specificObjectives,
      indicators,
      methodologies,
      observations,
    } = body;

    if (
      !patientId ||
      !therapistId ||
      !patientName ||
      !patientDateOfBirth ||
      !patientAge ||
      !treatmentArea
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const therapeuticPlan = await prisma.therapeuticPlan.create({
      data: {
        patientId,
        therapistId,
        patientName,
        patientDateOfBirth: new Date(patientDateOfBirth),
        patientAge,
        school,
        grade,
        objectivesDate: objectivesDate ? new Date(objectivesDate) : null,
        planning,
        treatmentArea,
        frequency,
        therapyStartDate: therapyStartDate ? new Date(therapyStartDate) : null,
        background,
        diagnoses,
        generalObjective,
        specificObjectives,
        indicators,
        methodologies,
        observations,
      },
    });

    return NextResponse.json({ therapeuticPlan }, { status: 201 });
  } catch (error) {
    console.error("Error creating therapeutic plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      id,
      patientId,
      therapistId,
      patientName,
      patientDateOfBirth,
      patientAge,
      school,
      grade,
      objectivesDate,
      planning,
      treatmentArea,
      frequency,
      therapyStartDate,
      background,
      diagnoses,
      generalObjective,
      specificObjectives,
      indicators,
      methodologies,
      observations,
    } = body;

    if (
      !id ||
      !patientId ||
      !therapistId ||
      !patientName ||
      !patientDateOfBirth ||
      !patientAge ||
      !treatmentArea
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const therapeuticPlan = await prisma.therapeuticPlan.update({
      where: { id },
      data: {
        patientId,
        therapistId,
        patientName,
        patientDateOfBirth: new Date(patientDateOfBirth),
        patientAge,
        school,
        grade,
        objectivesDate: objectivesDate ? new Date(objectivesDate) : null,
        planning,
        treatmentArea,
        frequency,
        therapyStartDate: therapyStartDate ? new Date(therapyStartDate) : null,
        background,
        diagnoses,
        generalObjective,
        specificObjectives,
        indicators,
        methodologies,
        observations,
      },
    });

    return NextResponse.json({ therapeuticPlan });
  } catch (error) {
    console.error("Error updating therapeutic plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
