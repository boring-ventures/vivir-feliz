import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface ServiceData {
  codigo: string;
  terapeutaId: string;
  terapeutaNombre: string;
  terapeutaEspecialidad: string;
  servicio: string;
  sesiones: number;
}

interface ProposalData {
  appointmentId: string;
  quienTomaConsulta: string;
  derivacion: string;
  serviciosEvaluacion: ServiceData[];
  serviciosTratamiento: ServiceData[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    const body = (await request.json()) as ProposalData;

    const {
      quienTomaConsulta,
      derivacion,
      serviciosEvaluacion,
      serviciosTratamiento,
    } = body;

    // First, verify the appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Check if this is a CONSULTA appointment with consultationRequestId
    let consultationRequestId = null;
    let patientId = appointment.patientId;

    // @ts-ignore - consultationRequestId exists but Prisma client needs regeneration
    if (appointment.consultationRequestId) {
      // @ts-ignore
      consultationRequestId = appointment.consultationRequestId;
      console.log(
        "Found consultation request ID from appointment:",
        consultationRequestId
      );
    }

    // If no patient is linked, create one based on appointment data
    if (!patientId && appointment.patientName) {
      // First, find or create a parent profile
      let parentProfile = await prisma.profile.findFirst({
        where: {
          OR: [{ phone: appointment.parentPhone }],
          role: "PARENT",
        },
      });

      if (!parentProfile && appointment.parentName) {
        // Create a parent profile
        const nameParts = appointment.parentName.split(" ");
        parentProfile = await prisma.profile.create({
          data: {
            userId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Temporary unique userId
            firstName: nameParts[0] || appointment.parentName,
            lastName: nameParts.slice(1).join(" ") || "",
            phone: appointment.parentPhone,
            role: "PARENT",
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      if (parentProfile) {
        // Create a patient record based on appointment information
        const newPatient = await prisma.patient.create({
          data: {
            parentId: parentProfile.id,
            firstName:
              appointment.patientName.split(" ")[0] || appointment.patientName,
            lastName:
              appointment.patientName.split(" ").slice(1).join(" ") || "",
            dateOfBirth: new Date(
              Date.now() -
                (appointment.patientAge || 8) * 365.25 * 24 * 60 * 60 * 1000
            ),
            phone: appointment.parentPhone,
            emergencyContact: appointment.parentName,
            emergencyPhone: appointment.parentPhone,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Link the patient to the appointment
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { patientId: newPatient.id },
        });

        patientId = newPatient.id;
      }
    }

    if (!patientId) {
      return NextResponse.json(
        { error: "No se pudo determinar el paciente para esta cita" },
        { status: 400 }
      );
    }

    // Calculate total sessions and estimated cost
    const evaluationSessions = serviciosEvaluacion.reduce(
      (total: number, service: ServiceData) => total + (service.sesiones || 0),
      0
    );
    const treatmentSessions = serviciosTratamiento.reduce(
      (total: number, service: ServiceData) => total + (service.sesiones || 0),
      0
    );
    const totalSessions = evaluationSessions + treatmentSessions;

    // Default pricing (this could be configurable)
    const sessionPrice = 150.0; // Price per session in Bs
    const totalAmount = totalSessions * sessionPrice;

    // Prepare the proposal description
    const evaluationList = serviciosEvaluacion
      .map((s: ServiceData) => `${s.servicio} (${s.sesiones} sesiones)`)
      .join(", ");

    const treatmentList = serviciosTratamiento
      .map((s: ServiceData) => `${s.servicio} (${s.sesiones} sesiones)`)
      .join(", ");

    const proposalDescription = [
      evaluationList && `Evaluación: ${evaluationList}`,
      treatmentList && `Tratamiento: ${treatmentList}`,
    ]
      .filter(Boolean)
      .join(". ");

    // Create the treatment proposal
    const proposal = await prisma.treatmentProposal.create({
      data: {
        consultationRequestId, // 🔗 Use consultation request ID when available
        patientId,
        therapistId: appointment.therapistId,
        title: `Propuesta Técnica - ${appointment.patientName}`,
        description: proposalDescription,
        diagnosis: `Derivación: ${derivacion}. Evaluado por: ${quienTomaConsulta}`,
        objectives: [
          ...serviciosEvaluacion.map(
            (s: ServiceData) => `Evaluar: ${s.servicio}`
          ),
          ...serviciosTratamiento.map(
            (s: ServiceData) => `Tratar: ${s.servicio}`
          ),
        ],
        methodology: "Metodología basada en los servicios seleccionados",
        totalSessions,
        sessionDuration: 60, // Default 60 minutes
        frequency: "Semanal",
        estimatedDuration: `${Math.ceil(totalSessions / 4)} meses`,
        sessionPrice,
        totalAmount,
        paymentPlan: "Por definir con administración",
        status: "PAYMENT_PENDING",
        notes: JSON.stringify({
          quienTomaConsulta,
          derivacion,
          consultationRequestId, // Include for reference
        }),
      },
    });

    // Create proposal services in the new table
    const servicesToCreate = [
      ...serviciosEvaluacion.map((service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "EVALUATION" as const,
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: sessionPrice * service.sesiones,
      })),
      ...serviciosTratamiento.map((service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "TREATMENT" as const,
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: sessionPrice * service.sesiones,
      })),
    ];

    if (servicesToCreate.length > 0) {
      await prisma.proposalService.createMany({
        data: servicesToCreate,
      });
    }

    // Update the analysis status to completed
    await prisma.analysis.updateMany({
      where: { appointmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      proposalId: proposal.id,
      consultationRequestId,
      patientId,
      message: consultationRequestId
        ? "Propuesta técnica creada exitosamente y vinculada a la solicitud de consulta"
        : "Propuesta técnica creada exitosamente y vinculada al paciente",
    });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
