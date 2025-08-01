import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/therapist/proposals/[id] - Get a specific treatment proposal
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
        consultationRequest: {
          select: {
            id: true,
            childName: true,
            childDateOfBirth: true,
            childGender: true,
            childAddress: true,
            motherName: true,
            motherPhone: true,
            motherEmail: true,
            fatherName: true,
            fatherPhone: true,
            fatherEmail: true,
            status: true,
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
        services: {
          include: {
            therapist: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
          orderBy: [
            { proposalType: "asc" },
            { type: "asc" },
            { createdAt: "asc" },
          ],
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Propuesta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Error al obtener la propuesta" },
      { status: 500 }
    );
  }
}

// PUT /api/therapist/proposals/[id] - Update a treatment proposal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      totalAmount,
      selectedPaymentPlan,
      notes,
      objectives,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (selectedPaymentPlan !== undefined)
      updateData.selectedPaymentPlan = selectedPaymentPlan;
    if (notes !== undefined) updateData.notes = notes;
    if (objectives !== undefined) updateData.objectives = objectives;

    const updatedProposal = await prisma.treatmentProposal.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          include: {
            parent: true,
          },
        },
        consultationRequest: true,
        therapist: true,
        services: {
          include: {
            therapist: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Error al actualizar la propuesta" },
      { status: 500 }
    );
  }
}

// PATCH /api/therapist/proposals/[id] - Update specific fields of a treatment proposal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      status,
      title,
      description,
      totalAmount,
      selectedPaymentPlan,
      notes,
      objectives,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (selectedPaymentPlan !== undefined)
      updateData.selectedPaymentPlan = selectedPaymentPlan;
    if (notes !== undefined) updateData.notes = notes;
    if (objectives !== undefined) updateData.objectives = objectives;

    const updatedProposal = await prisma.treatmentProposal.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          include: {
            parent: true,
          },
        },
        consultationRequest: true,
        therapist: true,
        services: {
          include: {
            therapist: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Error al actualizar la propuesta" },
      { status: 500 }
    );
  }
}
