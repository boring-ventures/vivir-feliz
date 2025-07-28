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

    // Get therapist profile
    const therapist = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!therapist || therapist.role !== "THERAPIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (patientId) {
      // Get specific progress reports for a patient
      const progressReports = await prisma.progressReport.findMany({
        where: {
          patientId,
          therapistId: therapist.id,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ progressReports });
    } else {
      // Get all progress reports for the therapist
      const progressReports = await prisma.progressReport.findMany({
        where: {
          therapistId: therapist.id,
        },
        include: {
          patient: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ progressReports });
    }
  } catch (error) {
    console.error("Error fetching progress reports:", error);
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

    // Get therapist profile
    const therapist = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!therapist || therapist.role !== "THERAPIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      patientId,
      patientName,
      patientDateOfBirth,
      patientAge,
      school,
      grade,
      reportDate,
      treatmentArea,
      diagnoses,
      generalObjective,
      specificObjectives,
      indicators,
      progressEntries,
      recommendations,
    } = body;

    if (
      !patientId ||
      !patientName ||
      !patientDateOfBirth ||
      !patientAge ||
      !reportDate ||
      !treatmentArea
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const progressReport = await prisma.progressReport.create({
      data: {
        patientId,
        therapistId: therapist.id,
        patientName,
        patientDateOfBirth: new Date(patientDateOfBirth),
        patientAge,
        school,
        grade,
        reportDate: new Date(reportDate),
        treatmentArea,
        diagnoses,
        generalObjective,
        specificObjectives,
        indicators,
        progressEntries,
        recommendations,
      },
    });

    return NextResponse.json({ progressReport });
  } catch (error) {
    console.error("Error creating progress report:", error);
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
      patientName,
      patientDateOfBirth,
      patientAge,
      school,
      grade,
      reportDate,
      treatmentArea,
      diagnoses,
      generalObjective,
      specificObjectives,
      indicators,
      progressEntries,
      recommendations,
    } = body;

    if (
      !id ||
      !patientId ||
      !patientName ||
      !patientDateOfBirth ||
      !patientAge ||
      !reportDate ||
      !treatmentArea
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const progressReport = await prisma.progressReport.update({
      where: { id },
      data: {
        patientId,
        patientName,
        patientDateOfBirth: new Date(patientDateOfBirth),
        patientAge,
        school,
        grade,
        reportDate: new Date(reportDate),
        treatmentArea,
        diagnoses,
        generalObjective,
        specificObjectives,
        indicators,
        progressEntries,
        recommendations,
      },
    });

    return NextResponse.json({ progressReport });
  } catch (error) {
    console.error("Error updating progress report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
