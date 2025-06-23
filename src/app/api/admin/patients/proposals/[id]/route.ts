import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/patients/proposals/[id] - Get single proposal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const proposal = await prisma.treatmentProposal.findUnique({
      where: { id },
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
        payments: {
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          orderBy: { date: "asc" },
          include: {
            therapist: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Error fetching proposal" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/patients/proposals/[id] - Update proposal status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const proposal = await prisma.treatmentProposal.findUnique({
      where: { id },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    const updatedProposal = await prisma.treatmentProposal.update({
      where: { id },
      data: {
        status,
        notes,
        approvedDate:
          status === "PAYMENT_CONFIRMED" ? new Date() : proposal.approvedDate,
        startDate:
          status === "TREATMENT_ACTIVE" ? new Date() : proposal.startDate,
        endDate:
          status === "TREATMENT_COMPLETED" ? new Date() : proposal.endDate,
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
        payments: true,
        appointments: true,
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Error updating proposal" },
      { status: 500 }
    );
  }
}
