import { NextRequest, NextResponse } from "next/server";
import { ProposalStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

// GET /api/admin/patients/proposals - Fetch treatment proposals
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

        if (proposal.status === "PAYMENT_PENDING") {
          estadoPropuesta = "Pago Pendiente";
          pagoConfirmado = false;
          citasProgramadas = false;
        } else if (proposal.status === "PAYMENT_CONFIRMED") {
          estadoPropuesta = "Pago Confirmado";
          pagoConfirmado = true;
          citasProgramadas = false;
        } else if (proposal.status === "APPOINTMENTS_SCHEDULED") {
          estadoPropuesta = "Citas Programadas";
          pagoConfirmado = true;
          citasProgramadas = true;
        }

        return {
          id: proposal.id,
          nombre: patient
            ? `${patient.firstName} ${patient.lastName}`
            : "Paciente no asignado",
          edad: age,
          padre: parent
            ? `${parent.firstName} ${parent.lastName}`
            : "Padre no asignado",
          telefono: parent?.phone || "Sin teléfono",
          terapeuta: `${proposal.therapist.firstName} ${proposal.therapist.lastName}`,
          estadoPropuesta,
          fechaPropuesta: (() => {
            const date = new Date(proposal.proposalDate);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          })(),
          montoPropuesta: `Bs. ${proposal.totalAmount.toFixed(2)}`,
          pagoConfirmado,
          citasProgramadas,
          // Additional data for the proposal
          proposalData: {
            title: proposal.title,
            totalSessions: proposal.totalSessions,
            sessionDuration: proposal.sessionDuration,
            frequency: proposal.frequency,
            sessionPrice: proposal.sessionPrice,
            totalAmount: proposal.totalAmount,
            status: proposal.status,
          },
        };
      });

      return NextResponse.json({
        success: true,
        data: transformedData,
      });
    }

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
