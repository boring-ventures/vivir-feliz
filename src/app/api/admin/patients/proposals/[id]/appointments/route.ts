import { NextRequest, NextResponse } from "next/server";
import { AppointmentType, AppointmentStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

// Helper function to calculate age from date of birth
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// POST /api/admin/patients/proposals/[id]/appointments - Schedule appointments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params;
    const body = await request.json();
    const { appointments } = body;

    // Validate required fields
    if (
      !appointments ||
      !Array.isArray(appointments) ||
      appointments.length === 0
    ) {
      return NextResponse.json(
        { error: "No appointments provided" },
        { status: 400 }
      );
    }

    // Check if proposal exists and payment is confirmed
    const proposal = await prisma.treatmentProposal.findUnique({
      where: { id: proposalId },
      include: {
        patient: true,
        therapist: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    if (proposal.status !== "PAYMENT_CONFIRMED") {
      return NextResponse.json(
        { error: "Payment must be confirmed before scheduling appointments" },
        { status: 400 }
      );
    }

    if (!proposal.patient) {
      return NextResponse.json(
        { error: "Patient information not found" },
        { status: 400 }
      );
    }

    // Validate appointment count matches proposal
    if (appointments.length !== proposal.totalSessions) {
      return NextResponse.json(
        {
          error: `Expected ${proposal.totalSessions} appointments, received ${appointments.length}`,
        },
        { status: 400 }
      );
    }

    // Create appointments in a transaction
    const createdAppointments = await prisma.$transaction(async (tx) => {
      const appointmentData = appointments.map(
        (apt: {
          date: string;
          startTime: string;
          endTime: string;
          type?: string;
        }) => ({
          proposalId,
          therapistId: proposal.therapistId,
          patientId: proposal.patientId,
          patientName: `${proposal.patient!.firstName} ${proposal.patient!.lastName}`,
          patientAge: calculateAge(proposal.patient!.dateOfBirth),
          date: new Date(apt.date),
          startTime: apt.startTime,
          endTime: apt.endTime,
          type: (apt.type || "TERAPIA") as AppointmentType,
          status: "SCHEDULED" as AppointmentStatus,
          price: proposal.sessionPrice,
        })
      );

      await tx.appointment.createMany({
        data: appointmentData,
      });

      // Update proposal status to appointments scheduled
      await tx.treatmentProposal.update({
        where: { id: proposalId },
        data: {
          status: "APPOINTMENTS_SCHEDULED",
        },
      });

      // Fetch the created appointments with relations
      return tx.appointment.findMany({
        where: { proposalId },
        include: {
          therapist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { date: "asc" },
      });
    });

    // Fetch updated proposal
    const updatedProposal = await prisma.treatmentProposal.findUnique({
      where: { id: proposalId },
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
        appointments: {
          orderBy: { date: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        appointments: createdAppointments,
        proposal: updatedProposal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error scheduling appointments:", error);
    return NextResponse.json(
      { error: "Error scheduling appointments" },
      { status: 500 }
    );
  }
}
