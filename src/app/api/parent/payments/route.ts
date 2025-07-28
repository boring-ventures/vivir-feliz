import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the parent profile
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile || profile.role !== "PARENT") {
      return NextResponse.json(
        { error: "Parent profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Get all patients belonging to this parent
    const patients = await prisma.patient.findMany({
      where: {
        parentId: profile.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    const patientIds = patients.map((patient) => patient.id);

    if (patientIds.length === 0) {
      return NextResponse.json({
        payments: [],
        proposals: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
        stats: {
          totalPaid: 0,
          totalPending: 0,
          totalProposals: 0,
          activeProposals: 0,
        },
      });
    }

    // Fetch treatment proposals with payments
    const proposals = await prisma.treatmentProposal.findMany({
      where: {
        patientId: { in: patientIds },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Calculate statistics
    const totalProposals = await prisma.treatmentProposal.count({
      where: {
        patientId: { in: patientIds },
      },
    });

    const activeProposals = await prisma.treatmentProposal.count({
      where: {
        patientId: { in: patientIds },
        status: {
          in: [
            "PAYMENT_CONFIRMED",
            "APPOINTMENTS_SCHEDULED",
            "TREATMENT_ACTIVE",
          ],
        },
      },
    });

    // Transform proposals and payments for response
    const transformedProposals = proposals.map((proposal) => {
      const patientName = proposal.patient
        ? `${proposal.patient.firstName} ${proposal.patient.lastName}`
        : "Paciente no disponible";

      const therapistName = proposal.therapist
        ? `${proposal.therapist.firstName} ${proposal.therapist.lastName}`
        : "Terapeuta no disponible";

      const totalPaid = proposal.payments
        .filter((p) => p.status === "COMPLETED" || p.status === "PARTIAL")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalAmount = Number(proposal.totalAmount);
      const pendingAmount = Math.max(0, totalAmount - totalPaid);
      const paymentPercentage =
        totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

      return {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description || "",
        patientName,
        therapistName,
        therapistSpecialty: proposal.therapist?.specialty || "",
        totalAmount,
        totalPaid,
        pendingAmount,
        paymentPercentage: Math.round(paymentPercentage),
        status: proposal.status,
        totalSessions: proposal.totalSessions,
        sessionPrice: Number(proposal.sessionPrice),
        createdAt: proposal.createdAt.toISOString(),
        updatedAt: proposal.updatedAt.toISOString(),
        payments: proposal.payments.map((payment) => ({
          id: payment.id,
          amount: Number(payment.amount),
          paymentMethod: payment.paymentMethod,
          referenceNumber: payment.referenceNumber,
          status: payment.status,
          paymentDate: payment.paymentDate.toISOString(),
          confirmedAt: payment.confirmedAt?.toISOString(),
          notes: payment.notes || "",
          createdAt: payment.createdAt.toISOString(),
        })),
      };
    });

    // Calculate overall statistics
    const totalPaid = proposals.reduce((sum, proposal) => {
      return (
        sum +
        proposal.payments
          .filter((p) => p.status === "COMPLETED" || p.status === "PARTIAL")
          .reduce((pSum, p) => pSum + Number(p.amount), 0)
      );
    }, 0);

    const totalPending = proposals.reduce((sum, proposal) => {
      const totalPaid = proposal.payments
        .filter((p) => p.status === "COMPLETED" || p.status === "PARTIAL")
        .reduce((pSum, p) => pSum + Number(p.amount), 0);
      return sum + Math.max(0, Number(proposal.totalAmount) - totalPaid);
    }, 0);

    return NextResponse.json({
      proposals: transformedProposals,
      pagination: {
        page,
        limit,
        total: totalProposals,
        pages: Math.ceil(totalProposals / limit),
      },
      stats: {
        totalPaid,
        totalPending,
        totalProposals,
        activeProposals,
      },
    });
  } catch (error) {
    console.error("Error fetching parent payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
