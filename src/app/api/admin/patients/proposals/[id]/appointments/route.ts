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

// Helper function to calculate end time based on start time and duration (in minutes)
const calculateEndTime = (startTime: string, duration: number = 60): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;

  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;

  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
};

// POST /api/admin/patients/proposals/[id]/appointments - Schedule service-based appointments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params;
    const body = await request.json();
    const { serviceAppointments } = body;

    // Validate required fields
    if (
      !serviceAppointments ||
      typeof serviceAppointments !== "object" ||
      Object.keys(serviceAppointments).length === 0
    ) {
      return NextResponse.json(
        { error: "No service appointments provided" },
        { status: 400 }
      );
    }

    // Check if proposal exists and payment is confirmed
    const proposal = await prisma.treatmentProposal.findUnique({
      where: { id: proposalId },
      include: {
        patient: true,
        therapist: true,
        consultationRequest: true,
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

    // Get proposal services
    const proposalServices = await prisma.proposalService.findMany({
      where: { treatmentProposalId: proposalId },
    });

    if (proposalServices.length === 0) {
      return NextResponse.json(
        { error: "No services found for this proposal" },
        { status: 400 }
      );
    }

    // Validate that all services have appointments scheduled
    const totalRequiredAppointments = proposalServices.reduce(
      (sum, service) => sum + service.sessions,
      0
    );

    const totalProvidedAppointments = Object.values(serviceAppointments).reduce(
      (sum: number, appointments: any) => sum + (appointments?.length || 0),
      0
    );

    if (totalProvidedAppointments !== totalRequiredAppointments) {
      return NextResponse.json(
        {
          error: `Expected ${totalRequiredAppointments} appointments total, received ${totalProvidedAppointments}`,
        },
        { status: 400 }
      );
    }

    // Validate each service has the correct number of appointments
    for (const service of proposalServices) {
      const serviceSlots = serviceAppointments[service.id] || [];
      if (serviceSlots.length !== service.sessions) {
        return NextResponse.json(
          {
            error: `Service "${service.service}" requires ${service.sessions} appointments, received ${serviceSlots.length}`,
          },
          { status: 400 }
        );
      }
    }

    // Get patient information
    let patientName = "";
    let patientAge = 0;
    let parentName = "";
    let parentPhone = "";
    let parentEmail = "";

    if (proposal.patient) {
      patientName = `${proposal.patient.firstName} ${proposal.patient.lastName}`;
      patientAge = calculateAge(proposal.patient.dateOfBirth);

      // Get parent info if available
      const parent = await prisma.profile.findUnique({
        where: { id: proposal.patient.parentId || "" },
      });

      if (parent) {
        parentName = `${parent.firstName} ${parent.lastName}`;
        parentPhone = parent.phone || "";
        // Note: Profile model doesn't have email field, we'll use patient email or consultation request email
      }

      // Use patient email if available
      if (proposal.patient.email) {
        parentEmail = proposal.patient.email;
      }
    } else if (proposal.consultationRequest) {
      // Use consultation request data if no patient profile exists yet
      patientName = proposal.consultationRequest.childName;

      // Calculate age from birth date
      const birthDate = new Date(proposal.consultationRequest.childDateOfBirth);
      patientAge = calculateAge(birthDate);

      parentName =
        proposal.consultationRequest.motherName ||
        proposal.consultationRequest.fatherName ||
        "";
      parentPhone =
        proposal.consultationRequest.motherPhone ||
        proposal.consultationRequest.fatherPhone ||
        "";
      parentEmail =
        proposal.consultationRequest.motherEmail ||
        proposal.consultationRequest.fatherEmail ||
        "";
    }

    // Create appointments in a transaction
    const createdAppointments = await prisma.$transaction(async (tx) => {
      const allAppointmentData = [];

      // Process each service and its appointments
      for (const service of proposalServices) {
        const serviceSlots = serviceAppointments[service.id] || [];

        for (const slot of serviceSlots) {
          const [dateStr, timeStr] = slot.split("-");
          const appointmentDate = new Date(dateStr + "T00:00:00.000Z");
          const endTime = calculateEndTime(timeStr, 60); // Assuming 60-minute sessions

          allAppointmentData.push({
            proposalId,
            therapistId: proposal.therapistId, // Use therapistId from proposal since all services should have the same therapist
            patientId: proposal.patientId,
            consultationRequestId: proposal.consultationRequestId,
            patientName,
            patientAge,
            parentName,
            parentPhone,
            parentEmail,
            date: appointmentDate,
            startTime: timeStr,
            endTime,
            type:
              service.type === "EVALUATION"
                ? ("EVALUACION" as AppointmentType)
                : ("TERAPIA" as AppointmentType),
            status: "SCHEDULED" as AppointmentStatus,
            price: proposal.sessionPrice,
            notes: `${service.service} - Sesión programada`,
          });
        }
      }

      // Create all appointments
      await tx.appointment.createMany({
        data: allAppointmentData,
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
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
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
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        appointments: createdAppointments,
        proposal: updatedProposal,
        message: "Appointments scheduled successfully",
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
