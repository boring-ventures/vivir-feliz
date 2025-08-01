import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Type definitions for JSON fields
type ProposalTotalsData = {
  A: number;
  B: number;
};

// GET /api/therapist/proposals/[id]/services - Get proposal services
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Fetching services for proposal ID:", id);

    const services = await prisma.proposalService.findMany({
      where: { treatmentProposalId: id },
      orderBy: { createdAt: "asc" },
    });

    console.log("Found services:", services);

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching proposal services:", error);
    return NextResponse.json(
      { error: "Error fetching proposal services" },
      { status: 500 }
    );
  }
}

// PUT /api/therapist/proposals/[id]/services - Update proposal services
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { services } = body;

    console.log("Updating services for proposal ID:", id);
    console.log("Services to update:", services);

    // Calculate total amount and total sessions for both proposals
    const proposalATotals = services
      .filter(
        (service: { proposalType: string }) => service.proposalType === "A"
      )
      .reduce(
        (
          sum: { amount: number; sessions: number },
          service: { cost: number; sessions: number }
        ) => ({
          amount: sum.amount + Number(service.cost),
          sessions: sum.sessions + Number(service.sessions),
        }),
        { amount: 0, sessions: 0 }
      );

    const proposalBTotals = services
      .filter(
        (service: { proposalType: string }) => service.proposalType === "B"
      )
      .reduce(
        (
          sum: { amount: number; sessions: number },
          service: { cost: number; sessions: number }
        ) => ({
          amount: sum.amount + Number(service.cost),
          sessions: sum.sessions + Number(service.sessions),
        }),
        { amount: 0, sessions: 0 }
      );

    const totalAmount = {
      A: proposalATotals.amount,
      B: proposalBTotals.amount,
    };
    const totalSessions = {
      A: proposalATotals.sessions,
      B: proposalBTotals.sessions,
    };

    // Use a transaction to update both services and proposal
    const result = await prisma.$transaction(async (tx) => {
      // First, delete existing services for this proposal
      await tx.proposalService.deleteMany({
        where: { treatmentProposalId: id },
      });

      // Then create the new services
      if (services && services.length > 0) {
        await tx.proposalService.createMany({
          data: services.map(
            (service: {
              type: string;
              proposalType: string;
              code: string;
              service: string;
              sessions: number;
              cost: number;
              therapistId: string;
            }) => ({
              treatmentProposalId: id,
              type: service.type,
              proposalType: service.proposalType,
              code: service.code,
              service: service.service,
              sessions: service.sessions,
              cost: service.cost,
              therapistId: service.therapistId,
            })
          ),
        });
      }

      // Update the proposal's total amount and total sessions with JSON structure
      await tx.treatmentProposal.update({
        where: { id },
        data: {
          totalAmount: totalAmount as ProposalTotalsData,
          totalSessions: totalSessions as ProposalTotalsData,
        },
      });

      // Return updated services
      return tx.proposalService.findMany({
        where: { treatmentProposalId: id },
        orderBy: { createdAt: "asc" },
      });
    });

    console.log("Updated services:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating proposal services:", error);
    return NextResponse.json(
      { error: "Error updating proposal services" },
      { status: 500 }
    );
  }
}
