import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface ServiceData {
  codigo: string;
  terapeutaId: string;
  terapeutaNombre: string;
  terapeutaEspecialidad: string;
  servicio: string;
  sesiones: number;
  proposalType: string;
}

interface ProposalData {
  appointmentId: string;
  quienTomaConsulta: string;
  derivacion: string;
  timeAvailability: Record<string, { morning: boolean; afternoon: boolean }>;
  serviciosEvaluacionA: ServiceData[];
  serviciosTratamientoA: ServiceData[];
  serviciosEvaluacionB: ServiceData[];
  serviciosTratamientoB: ServiceData[];
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
      timeAvailability,
      serviciosEvaluacionA,
      serviciosTratamientoA,
      serviciosEvaluacionB,
      serviciosTratamientoB,
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

    // Calculate total sessions and estimated cost for both proposals
    const evaluationSessionsA = serviciosEvaluacionA.reduce(
      (total: number, service: ServiceData) => total + (service.sesiones || 0),
      0
    );
    const treatmentSessionsA = serviciosTratamientoA.reduce(
      (total: number, service: ServiceData) => total + (service.sesiones || 0),
      0
    );
    const totalSessionsA = evaluationSessionsA + treatmentSessionsA;

    const evaluationSessionsB = serviciosEvaluacionB.reduce(
      (total: number, service: ServiceData) => total + (service.sesiones || 0),
      0
    );
    const treatmentSessionsB = serviciosTratamientoB.reduce(
      (total: number, service: ServiceData) => total + (service.sesiones || 0),
      0
    );
    const totalSessionsB = evaluationSessionsB + treatmentSessionsB;

    // Default pricing (this could be configurable)
    const sessionPrice = 150.0; // Price per session in Bs
    const totalAmountA = totalSessionsA * sessionPrice;
    const totalAmountB = totalSessionsB * sessionPrice;

    // Prepare the proposal description
    const evaluationListA = serviciosEvaluacionA
      .map((s: ServiceData) => `${s.servicio} (${s.sesiones} sesiones)`)
      .join(", ");

    const treatmentListA = serviciosTratamientoA
      .map((s: ServiceData) => `${s.servicio} (${s.sesiones} sesiones)`)
      .join(", ");

    const evaluationListB = serviciosEvaluacionB
      .map((s: ServiceData) => `${s.servicio} (${s.sesiones} sesiones)`)
      .join(", ");

    const treatmentListB = serviciosTratamientoB
      .map((s: ServiceData) => `${s.servicio} (${s.sesiones} sesiones)`)
      .join(", ");

    const proposalDescription = [
      evaluationListA && `Propuesta A - Evaluación: ${evaluationListA}`,
      treatmentListA && `Propuesta A - Tratamiento: ${treatmentListA}`,
      evaluationListB && `Propuesta B - Evaluación: ${evaluationListB}`,
      treatmentListB && `Propuesta B - Tratamiento: ${treatmentListB}`,
    ]
      .filter(Boolean)
      .join(". ");

    // Function to ensure time availability is saved in correct order (Monday to Friday)
    const getOrderedTimeAvailability = (
      availability: Record<string, { morning: boolean; afternoon: boolean }>
    ) => {
      const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday"];
      const orderedAvailability: Record<
        string,
        { morning: boolean; afternoon: boolean }
      > = {};

      dayOrder.forEach((day) => {
        if (availability[day]) {
          orderedAvailability[day] = availability[day];
        }
      });

      return orderedAvailability;
    };

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
          ...serviciosEvaluacionA.map(
            (s: ServiceData) => `Propuesta A - Evaluar: ${s.servicio}`
          ),
          ...serviciosTratamientoA.map(
            (s: ServiceData) => `Propuesta A - Tratar: ${s.servicio}`
          ),
          ...serviciosEvaluacionB.map(
            (s: ServiceData) => `Propuesta B - Evaluar: ${s.servicio}`
          ),
          ...serviciosTratamientoB.map(
            (s: ServiceData) => `Propuesta B - Tratar: ${s.servicio}`
          ),
        ],
        methodology: "Metodología basada en los servicios seleccionados",
        totalSessions: { A: totalSessionsA, B: totalSessionsB },
        sessionDuration: 60, // Default 60 minutes
        frequency: "Semanal",
        estimatedDuration: `${Math.ceil(Math.max(totalSessionsA, totalSessionsB) / 4)} meses`,
        sessionPrice,
        totalAmount: { A: totalAmountA, B: totalAmountB },
        selectedProposal: null, // Parents haven't chosen yet
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
        timeAvailability: getOrderedTimeAvailability(timeAvailability),
      },
    });

    // Create proposal services in the new table for both proposals
    const servicesToCreate = [
      // Proposal A services
      ...serviciosEvaluacionA.map((service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "EVALUATION" as const,
        proposalType: "A",
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: sessionPrice * service.sesiones,
        therapistId: service.terapeutaId,
      })),
      ...serviciosTratamientoA.map((service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "TREATMENT" as const,
        proposalType: "A",
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: sessionPrice * service.sesiones,
        therapistId: service.terapeutaId,
      })),
      // Proposal B services
      ...serviciosEvaluacionB.map((service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "EVALUATION" as const,
        proposalType: "B",
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: sessionPrice * service.sesiones,
        therapistId: service.terapeutaId,
      })),
      ...serviciosTratamientoB.map((service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "TREATMENT" as const,
        proposalType: "B",
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: sessionPrice * service.sesiones,
        therapistId: service.terapeutaId,
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
