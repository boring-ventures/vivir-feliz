import { NextRequest, NextResponse } from "next/server";
import { AppointmentType, AppointmentStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

// Type for service appointments mapping
interface ServiceAppointments {
  [serviceId: string]: string[];
}

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

// Helper function to create date from string without timezone issues
const createDateFromString = (dateStr: string): Date => {
  // dateStr should be in format "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JS Date
};

// POST /api/admin/patients/proposals/[id]/appointments - Schedule service-based appointments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params;
    const body = await request.json();
    const { serviceAppointments } = body as {
      serviceAppointments: ServiceAppointments;
    };

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

    // Get proposal services - filter by selected proposal type
    const allProposalServices = await prisma.proposalService.findMany({
      where: { treatmentProposalId: proposalId },
    });

    if (allProposalServices.length === 0) {
      return NextResponse.json(
        { error: "No services found for this proposal" },
        { status: 400 }
      );
    }

    // Filter services based on selected proposal type
    const proposalServices = allProposalServices.filter(
      (service) => service.proposalType === proposal.selectedProposal
    );

    if (proposalServices.length === 0) {
      return NextResponse.json(
        {
          error: `No services found for selected proposal ${proposal.selectedProposal}`,
        },
        { status: 400 }
      );
    }

    // Validate that all services for the selected proposal have appointments scheduled
    const totalRequiredAppointments = proposalServices.reduce(
      (sum, service) => sum + service.sessions,
      0
    );

    const totalProvidedAppointments = Object.values(serviceAppointments).reduce(
      (sum: number, appointments: string[]) => sum + appointments.length,
      0
    );

    // Debug logging
    console.log("🔍 Selected proposal:", proposal.selectedProposal);
    console.log("🔍 All proposal services count:", allProposalServices.length);
    console.log(
      "🔍 Filtered proposal services count:",
      proposalServices.length
    );
    console.log("🔍 Total required appointments:", totalRequiredAppointments);
    console.log("🔍 Total provided appointments:", totalProvidedAppointments);

    if (totalProvidedAppointments !== totalRequiredAppointments) {
      return NextResponse.json(
        {
          error: `Expected ${totalRequiredAppointments} appointments for Proposal ${proposal.selectedProposal}, received ${totalProvidedAppointments}`,
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

        console.log(`📅 Processing service "${service.service}":`, {
          serviceId: service.id,
          sessions: service.sessions,
          slots: serviceSlots,
          therapistId: service.therapistId,
        });

        for (const slot of serviceSlots) {
          console.log(`🔍 Processing slot: "${slot}"`);

          // Handle different possible formats
          let dateStr, timeStr;

          if (slot.includes("-")) {
            const parts = slot.split("-");
            console.log(`🔍 Split parts:`, parts);

            // If we have more than 2 parts, it might be a date with time
            if (parts.length > 2) {
              // Could be something like "2025-01-01-09:00"
              const timeIndex = parts.findIndex((part: string) =>
                part.includes(":")
              );
              if (timeIndex !== -1) {
                timeStr = parts[timeIndex];
                dateStr = parts.slice(0, timeIndex).join("-");
              } else {
                throw new Error(`Could not parse time from slot: ${slot}`);
              }
            } else {
              [dateStr, timeStr] = parts;
            }
          } else {
            throw new Error(
              `Invalid slot format: ${slot}. Expected format: YYYY-MM-DD-HH:MM`
            );
          }

          console.log(
            `🔍 Parsed parts: dateStr="${dateStr}", timeStr="${timeStr}"`
          );

          // Validate time format
          if (!timeStr || !timeStr.includes(":")) {
            console.error(
              `❌ Invalid time format in slot: ${slot}, timeStr: ${timeStr}`
            );
            console.error(`❌ Slot split result:`, slot.split("-"));
            throw new Error(
              `Invalid time format: "${timeStr}". Expected format: HH:MM from slot: "${slot}"`
            );
          }

          // Use local timezone date creation to avoid timezone issues
          const appointmentDate = createDateFromString(dateStr);
          const endTime = calculateEndTime(timeStr, 60); // Assuming 60-minute sessions

          console.log(`📝 Creating appointment:`, {
            date: dateStr,
            time: timeStr,
            appointmentDate: appointmentDate.toISOString(),
            endTime,
            therapistId: service.therapistId,
            service: service.service,
          });

          allAppointmentData.push({
            proposalId,
            therapistId: service.therapistId, // Use therapistId from the specific service
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
            type: "TERAPIA" as AppointmentType,
            status: "SCHEDULED" as AppointmentStatus,
            price: null, // Set price to null as requested
            notes: `${service.service} - Sesión programada`,
          });
        }
      }

      console.log(`💾 Creating ${allAppointmentData.length} appointments`);

      // Create all appointments
      await tx.appointment.createMany({
        data: allAppointmentData,
      });

      // Create therapist-patient relationships for all unique therapists involved
      if (proposal.patientId) {
        // Get unique therapist IDs from the services
        const uniqueTherapistIds = [
          ...new Set(proposalServices.map((service) => service.therapistId)),
        ];

        console.log(
          "🔗 Creating therapist-patient relationships for therapists:",
          uniqueTherapistIds
        );

        // Log which services each therapist is responsible for
        const therapistServices = proposalServices.reduce(
          (acc, service) => {
            if (!acc[service.therapistId]) {
              acc[service.therapistId] = [];
            }
            acc[service.therapistId].push(service.service);
            return acc;
          },
          {} as Record<string, string[]>
        );

        console.log("🔗 Therapist services mapping:", therapistServices);

        for (const therapistId of uniqueTherapistIds) {
          await tx.therapistPatient.upsert({
            where: {
              therapistId_patientId: {
                therapistId: therapistId,
                patientId: proposal.patientId,
              },
            },
            update: {
              // Update existing relationship if needed
              active: true,
            },
            create: {
              therapistId: therapistId,
              patientId: proposal.patientId,
              active: true,
            },
          });

          console.log(
            `✅ Created/updated therapist-patient relationship: ${therapistId} - ${proposal.patientId}`
          );
        }
      }

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
