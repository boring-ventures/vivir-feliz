import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      appointmentType, // "CONSULTATION" or "INTERVIEW"
      appointmentDate,
      appointmentTime,
      therapistId,
      requestId, // ID of the consultation or interview request
      paymentConfirmed, // For consultations
      receiptImageName, // For consultations
      referenceNumber, // For consultations
    } = body;

    // Validate required fields
    if (
      !appointmentType ||
      !appointmentDate ||
      !appointmentTime ||
      !therapistId ||
      !requestId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For consultations, payment confirmation is required
    if (appointmentType === "CONSULTATION" && !paymentConfirmed) {
      return NextResponse.json(
        { error: "Payment confirmation is required for consultations" },
        { status: 400 }
      );
    }

    // Verify the therapist exists and is active
    const therapist = await prisma.profile.findUnique({
      where: {
        id: therapistId,
        role: "THERAPIST",
        active: true,
      },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found or inactive" },
        { status: 404 }
      );
    }

    // Check if the time slot is still available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        therapistId,
        date: new Date(appointmentDate),
        startTime: appointmentTime,
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "Time slot is no longer available" },
        { status: 409 }
      );
    }

    // Get the request data based on type
    let requestData;
    if (appointmentType === "CONSULTATION") {
      requestData = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
      });
    } else {
      requestData = await prisma.interviewRequest.findUnique({
        where: { id: requestId },
      });
    }

    if (!requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if this request is already scheduled
    if (requestData.status === "SCHEDULED") {
      return NextResponse.json(
        { error: "This request has already been scheduled" },
        { status: 409 }
      );
    }

    // Calculate end time (assuming 60 minutes duration)
    const [hours, minutes] = appointmentTime.split(":").map(Number);
    const endTimeMinutes = hours * 60 + minutes + 60; // 60 minutes duration
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMins = endTimeMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;

    // Prepare appointment data based on request type
    let appointmentData;
    const appointmentPrice = appointmentType === "CONSULTATION" ? 250.0 : 300.0;

    if (appointmentType === "CONSULTATION") {
      const consultationRequest = requestData as {
        childName: string;
        motherName?: string;
        fatherName?: string;
        motherPhone?: string;
        fatherPhone?: string;
        motherEmail?: string;
        fatherEmail?: string;
      };
      appointmentData = {
        type: "CONSULTA" as const,
        date: new Date(appointmentDate),
        startTime: appointmentTime,
        endTime,
        status: "SCHEDULED" as const,
        therapistId,
        patientName: consultationRequest.childName,
        parentName:
          consultationRequest.motherName ||
          consultationRequest.fatherName ||
          "No especificado",
        parentPhone:
          consultationRequest.motherPhone ||
          consultationRequest.fatherPhone ||
          "",
        parentEmail:
          consultationRequest.motherEmail ||
          consultationRequest.fatherEmail ||
          "",
        price: appointmentPrice,
        notes: `Consulta inicial agendada - Pago confirmado`,
      };
    } else {
      const interviewRequest = requestData as {
        childFirstName: string;
        childLastName: string;
        parentName: string;
        parentPhone: string;
        parentEmail: string;
      };
      appointmentData = {
        type: "ENTREVISTA" as const,
        date: new Date(appointmentDate),
        startTime: appointmentTime,
        endTime,
        status: "SCHEDULED" as const,
        therapistId,
        patientName: `${interviewRequest.childFirstName} ${interviewRequest.childLastName}`,
        parentName: interviewRequest.parentName,
        parentPhone: interviewRequest.parentPhone,
        parentEmail: interviewRequest.parentEmail,
        price: appointmentPrice,
        notes: `Entrevista con derivación escolar agendada`,
      };
    }

    // Create the appointment and payment record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the appointment
      const appointment = await tx.appointment.create({
        data: appointmentData,
        include: {
          therapist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

      // Create payment record for consultations
      if (appointmentType === "CONSULTATION") {
        const paymentData = {
          appointmentId: appointment.id,
          consultationRequestId: requestId,
          amount: appointmentPrice,
          paymentDate: new Date(),
          paymentMethod: "QR_TRANSFER" as const,
          status: "COMPLETED" as const,
          notes: "Pago confirmado por el usuario al agendar la cita",
          ...(referenceNumber && { referenceNumber }),
          ...(receiptImageName && { receiptImageUrl: receiptImageName }),
        };

        await tx.payment.create({
          data: paymentData,
        });
      }

      // Update the request status to indicate it has been scheduled
      if (appointmentType === "CONSULTATION") {
        await tx.consultationRequest.update({
          where: { id: requestId },
          data: { status: "SCHEDULED" },
        });
      } else {
        await tx.interviewRequest.update({
          where: { id: requestId },
          data: { status: "SCHEDULED" },
        });
      }

      return appointment;
    });

    const appointment = result;

    // Generate appointment ID
    const appointmentId = `${appointmentType === "CONSULTATION" ? "CON" : "INT"}-${appointment.id}-${Date.now().toString().slice(-6)}`;

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        appointmentId,
        type: appointment.type,
        date: appointment.date.toISOString().split("T")[0],
        time: appointment.startTime,
        status: appointment.status,
        therapist: appointment.therapist,
        childName: appointment.patientName,
        parentContact: {
          phone: appointment.parentPhone,
          email: appointment.parentEmail,
        },
      },
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
