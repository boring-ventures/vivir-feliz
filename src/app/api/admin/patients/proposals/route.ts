import { NextRequest, NextResponse } from "next/server";
import { ProposalStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

// GET /api/admin/patients/proposals - Fetch treatment proposals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const therapistId = searchParams.get("therapistId");

    const where: {
      status?: ProposalStatus;
      therapistId?: string;
    } = {};

    if (status) {
      where.status = status as ProposalStatus;
    }

    if (therapistId) {
      where.therapistId = therapistId;
    }

    const proposals = await prisma.treatmentProposal.findMany({
      where,
      include: {
        consultationRequest: {
          select: {
            id: true,
            childName: true,
            childDateOfBirth: true,
            childGender: true,
            motherName: true,
            motherPhone: true,
            fatherName: true,
            fatherPhone: true,
          },
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          orderBy: { date: "asc" },
        },
      } as any,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      {
        error: "Error fetching proposals",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/patients/proposals - Create new treatment proposal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      patientId,
      therapistId,
      title,
      description,
      diagnosis,
      objectives,
      methodology,
      totalSessions,
      sessionDuration,
      frequency,
      estimatedDuration,
      sessionPrice,
      totalAmount,
      paymentPlan,
      notes,
    } = body;

    // Validate required fields
    if (
      !patientId ||
      !therapistId ||
      !title ||
      !totalSessions ||
      !sessionDuration ||
      !sessionPrice ||
      !totalAmount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify patient and therapist exist
    const [patient, therapist] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.profile.findUnique({ where: { id: therapistId } }),
    ]);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Create proposal
    const proposal = await prisma.treatmentProposal.create({
      data: {
        patientId,
        therapistId,
        title,
        description,
        diagnosis,
        objectives: Array.isArray(objectives) ? objectives : [objectives],
        methodology,
        totalSessions,
        sessionDuration,
        frequency,
        estimatedDuration,
        sessionPrice,
        totalAmount,
        paymentPlan,
        notes,
      },
      include: {
        patient: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Error creating proposal" },
      { status: 500 }
    );
  }
}
