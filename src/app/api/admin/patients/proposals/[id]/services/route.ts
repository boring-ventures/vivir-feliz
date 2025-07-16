import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/patients/proposals/[id]/services - Get proposal services
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

// PUT /api/admin/patients/proposals/[id]/services - Update proposal services
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

    // Calculate total amount from services
    const totalAmount = services.reduce(
      (sum: number, service: { cost: number }) => sum + Number(service.cost),
      0
    );

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
              code: string;
              service: string;
              sessions: number;
              cost: number;
              therapistId: string;
            }) => ({
              treatmentProposalId: id,
              type: service.type,
              code: service.code,
              service: service.service,
              sessions: service.sessions,
              cost: service.cost,
              therapistId: service.therapistId,
            })
          ),
        });
      }

      // Update the proposal's total amount
      await tx.treatmentProposal.update({
        where: { id },
        data: {
          totalAmount,
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
