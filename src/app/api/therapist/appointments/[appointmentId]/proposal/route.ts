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
    const patientId = appointment.patientId; // Use existing patientId if available

    if (appointment.consultationRequestId) {
      consultationRequestId = appointment.consultationRequestId;
      console.log(
        "Found consultation request ID from appointment:",
        consultationRequestId
      );
    }

    // Note: We'll proceed with or without a patientId
    // No patient creation logic - patients will be created through other flows

    // We can proceed without a patientId - the proposal will be linked to the appointment
    // and can be processed by admin later

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
        patientId, // This might be null, which is fine
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
        status: "NEW_PROPOSAL",
        notes: JSON.stringify({
          quienTomaConsulta,
          derivacion,
          consultationRequestId, // Include for reference
          appointmentData: {
            patientName: appointment.patientName,
            patientAge: appointment.patientAge,
            parentName: appointment.parentName,
            parentPhone: appointment.parentPhone,
            parentEmail: appointment.parentEmail,
          },
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

    // Update the analysis status to completed and appointment status to completed
    await prisma.analysis.updateMany({
      where: { appointmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Update the appointment status to completed since the proposal has been sent to admin
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      proposalId: proposal.id,
      consultationRequestId,
      message: consultationRequestId
        ? "Propuesta técnica creada exitosamente y vinculada a la solicitud de consulta. El administrador se encargará de la gestión del paciente."
        : "Propuesta técnica creada exitosamente. El administrador se encargará de la gestión del paciente.",
    });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
