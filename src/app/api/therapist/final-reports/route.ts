import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

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

    // Check if user is COORDINATOR
    if (therapist.specialty !== "COORDINATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      patientId,
      patientName,
      patientDateOfBirth,
      patientAge,
      reportDate,
      generalObjective,
      generalBackground,
      generalConclusions,
      otherObjectives,
      therapistBackgrounds,
      therapistProgress,
      therapistConclusions,
      isPublished,
    } = body;

    if (
      !patientId ||
      !patientName ||
      !patientDateOfBirth ||
      !patientAge ||
      !reportDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if a final report already exists for this patient
    const existingReport = await prisma.finalReport.findFirst({
      where: { patientId },
    });

    let finalReport;

    if (existingReport) {
      // Update existing report
      finalReport = await prisma.finalReport.update({
        where: { id: existingReport.id },
        data: {
          generalObjective: generalObjective || null,
          generalBackground: generalBackground || null,
          generalConclusions: generalConclusions || null,
          otherObjectives: otherObjectives || null,
          therapistBackgrounds: therapistBackgrounds || null,
          therapistProgress: therapistProgress || null,
          therapistConclusions: therapistConclusions || null,
          isPublished: isPublished || false,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new report
      finalReport = await prisma.finalReport.create({
        data: {
          patientId,
          coordinatorId: therapist.id,
          patientName,
          patientDateOfBirth: new Date(patientDateOfBirth),
          patientAge,
          reportDate: new Date(reportDate),
          generalObjective: generalObjective || null,
          generalBackground: generalBackground || null,
          generalConclusions: generalConclusions || null,
          otherObjectives: otherObjectives || null,
          therapistBackgrounds: therapistBackgrounds || null,
          therapistProgress: therapistProgress || null,
          therapistConclusions: therapistConclusions || null,
          isPublished: isPublished || false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      finalReport,
      message: isPublished
        ? "Informe final publicado exitosamente"
        : "Borrador guardado exitosamente",
    });
  } catch (error) {
    console.error("Error saving final report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Check if user is COORDINATOR
    if (therapist.specialty !== "COORDINATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (patientId) {
      // Get specific final report for a patient
      const finalReport = await prisma.finalReport.findFirst({
        where: { patientId },
        include: {
          patient: true,
          coordinator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
      });

      return NextResponse.json({ finalReport });
    } else {
      // Get all final reports
      const finalReports = await prisma.finalReport.findMany({
        include: {
          patient: true,
          coordinator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ finalReports });
    }
  } catch (error) {
    console.error("Error fetching final reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
