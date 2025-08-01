import { NextRequest, NextResponse } from "next/server";
import { ProposalStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

// Type for the totalAmount JSON field
type TotalAmountData = {
  [key: string]: number;
} | null;

// GET /api/therapist/proposals - Fetch treatment proposals for therapists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const therapistId = searchParams.get("therapistId");
    const forNewPatients = searchParams.get("forNewPatients");

    const where: {
      status?: ProposalStatus | { in: ProposalStatus[] };
      therapistId?: string;
    } = {};

    // If forNewPatients is true, filter for specific statuses
    if (forNewPatients === "true") {
      where.status = {
        in: ["PAYMENT_PENDING", "PAYMENT_CONFIRMED", "APPOINTMENTS_SCHEDULED"],
      };
    } else if (status) {
      where.status = status as ProposalStatus;
    }

    if (therapistId) {
      where.therapistId = therapistId;
    }

    const proposals = await prisma.treatmentProposal.findMany({
      where,
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
            motherName: true,
            motherPhone: true,
            motherEmail: true,
            fatherName: true,
            fatherPhone: true,
            fatherEmail: true,
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
      },
      orderBy: { createdAt: "desc" },
    });

    // If forNewPatients is true, transform the data to match the expected format
    if (forNewPatients === "true") {
      const transformedData = proposals.map((proposal) => {
        const patient = proposal.patient;
        const parent = patient?.parent;

        // Calculate age
        const age = patient?.dateOfBirth
          ? Math.floor(
              (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
                (1000 * 60 * 60 * 24 * 365.25)
            )
          : 0;

        // Determine status for display
        let estadoPropuesta = "";
        let pagoConfirmado = false;
        let citasProgramadas = false;

        switch (proposal.status) {
          case "PAYMENT_PENDING":
            estadoPropuesta = "Pago Pendiente";
            break;
          case "PAYMENT_CONFIRMED":
            estadoPropuesta = "Pago Confirmado";
            pagoConfirmado = true;
            break;
          case "APPOINTMENTS_SCHEDULED":
            estadoPropuesta = "Citas Programadas";
            pagoConfirmado = true;
            citasProgramadas = true;
            break;
          default:
            estadoPropuesta = "Nuevo";
        }

        // Calculate total amount
        const totalAmountData = proposal.totalAmount as TotalAmountData;
        const totalAmount = totalAmountData
          ? Object.values(totalAmountData).reduce(
              (sum, amount) => sum + amount,
              0
            )
          : 0;

        return {
          id: proposal.id,
          title: proposal.title,
          status: proposal.status,
          estadoPropuesta,
          pagoConfirmado,
          citasProgramadas,
          totalAmount,
          createdAt: proposal.createdAt,
          patient: {
            id: patient?.id,
            name: patient?.firstName + " " + patient?.lastName,
            age,
            parentName: parent?.firstName + " " + parent?.lastName,
            phone: parent?.phone,
          },
          therapist: {
            id: proposal.therapist.id,
            name:
              proposal.therapist.firstName + " " + proposal.therapist.lastName,
            specialty: proposal.therapist.specialty,
          },
          consultationRequest: proposal.consultationRequest,
          payments: proposal.payments,
          appointments: proposal.appointments,
        };
      });

      return NextResponse.json(transformedData);
    }

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Error al obtener las propuestas" },
      { status: 500 }
    );
  }
}

// POST /api/therapist/proposals - Create new treatment proposal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      consultationRequestId,
      therapistId,
      title,
      description,
      totalAmount,
      totalSessions,
      sessionDuration,
      frequency,
      sessionPrice,
    } = body;

    const proposal = await prisma.treatmentProposal.create({
      data: {
        patientId,
        consultationRequestId,
        therapistId,
        title,
        description,
        status: "NEW_PROPOSAL",
        totalAmount,
        totalSessions,
        sessionDuration,
        frequency,
        sessionPrice,
      },
      include: {
        patient: {
          include: {
            parent: true,
          },
        },
        consultationRequest: true,
        therapist: true,
      },
    });

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Error al crear la propuesta" },
      { status: 500 }
    );
  }
}
