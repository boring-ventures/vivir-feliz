import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/admin/patients/proposals/[id]/payments - Confirm payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params;
    const body = await request.json();

    const { amount, paymentMethod, referenceNumber, notes } = body;

    // Validate required fields
    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if proposal exists
    const proposal = await prisma.treatmentProposal.findUnique({
      where: { id: proposalId },
      include: {
        payments: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Calculate total paid so far
    const totalPaid = proposal.payments
      .filter((p) => p.status === "COMPLETED" || p.status === "PARTIAL")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const newTotal = totalPaid + Number(amount);
    const isFullyPaid = newTotal >= Number(proposal.totalAmount);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        proposalId,
        amount: Number(amount),
        paymentDate: new Date(),
        paymentMethod,
        referenceNumber,
        status: "COMPLETED",
        confirmedAt: new Date(),
        notes,
      },
    });

    // Update proposal status if fully paid
    let updatedProposal = proposal;
    if (isFullyPaid && proposal.status === "PAYMENT_PENDING") {
      updatedProposal = await prisma.treatmentProposal.update({
        where: { id: proposalId },
        data: {
          status: "PAYMENT_CONFIRMED",
          approvedDate: new Date(),
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
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    return NextResponse.json(
      {
        payment,
        proposal: updatedProposal,
        totalPaid: newTotal,
        isFullyPaid,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Error confirming payment" },
      { status: 500 }
    );
  }
}
