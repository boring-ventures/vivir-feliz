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
  timeAvailability:
    | Record<string, { morning: boolean; afternoon: boolean }>
    | Array<{ day: string; morning: boolean; afternoon: boolean }>;
  serviciosEvaluacionA: ServiceData[];
  serviciosTratamientoA: ServiceData[];
  serviciosEvaluacionB: ServiceData[];
  serviciosTratamientoB: ServiceData[];
}

// GET /api/therapist/appointments/[appointmentId]/proposal - Fetch existing proposal data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

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

    // Find existing proposal by consultation request ID
    let existingProposal = null;
    if (appointment.consultationRequestId) {
      existingProposal = await prisma.treatmentProposal.findFirst({
        where: {
          consultationRequestId: appointment.consultationRequestId,
        },
        include: {
          services: {
            include: {
              therapist: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  specialty: true,
                },
              },
            },
            orderBy: [
              { proposalType: "asc" },
              { type: "asc" },
              { createdAt: "asc" },
            ],
          },
        },
      });
    }

    if (!existingProposal) {
      return NextResponse.json(
        { error: "No se encontró propuesta existente" },
        { status: 404 }
      );
    }

    // Parse the notes to extract quienTomaConsulta and derivacion
    let quienTomaConsulta = "";
    let derivacion = "";

    if (existingProposal.notes) {
      try {
        const notesData = JSON.parse(existingProposal.notes);
        quienTomaConsulta = notesData.quienTomaConsulta || "";
        derivacion = notesData.derivacion || "";
      } catch (error) {
        console.error("Error parsing proposal notes:", error);
      }
    }

    // Helper functions for time availability conversion
    const objectToArray = (
      obj: Record<string, { morning: boolean; afternoon: boolean }>
    ) => {
      return [
        {
          day: "monday",
          ...(obj.monday || { morning: false, afternoon: false }),
        },
        {
          day: "tuesday",
          ...(obj.tuesday || { morning: false, afternoon: false }),
        },
        {
          day: "wednesday",
          ...(obj.wednesday || { morning: false, afternoon: false }),
        },
        {
          day: "thursday",
          ...(obj.thursday || { morning: false, afternoon: false }),
        },
        {
          day: "friday",
          ...(obj.friday || { morning: false, afternoon: false }),
        },
      ];
    };

    const arrayToObject = (
      array: Array<{ day: string; morning: boolean; afternoon: boolean }>
    ) => {
      const result: Record<string, { morning: boolean; afternoon: boolean }> =
        {};
      array.forEach(({ day, morning, afternoon }) => {
        result[day] = { morning, afternoon };
      });
      return result;
    };

    // Parse time availability
    let timeAvailability: Record<
      string,
      { morning: boolean; afternoon: boolean }
    > = {
      monday: { morning: false, afternoon: false },
      tuesday: { morning: false, afternoon: false },
      wednesday: { morning: false, afternoon: false },
      thursday: { morning: false, afternoon: false },
      friday: { morning: false, afternoon: false },
    };

    if (existingProposal.timeAvailability) {
      try {
        console.log(
          "Raw time availability from DB:",
          existingProposal.timeAvailability
        );
        const parsedTimeAvailability =
          existingProposal.timeAvailability as Record<
            string,
            { morning: boolean; afternoon: boolean }
          >;

        // Check if the data is in array format (new format) or object format (old format)
        if (Array.isArray(parsedTimeAvailability)) {
          // New array format - convert to object for UI
          timeAvailability = arrayToObject(parsedTimeAvailability);
        } else {
          // Old object format - convert to array for storage, then back to object for UI
          const arrayFormat = objectToArray(parsedTimeAvailability);
          timeAvailability = arrayToObject(arrayFormat);
        }
        console.log("Processed time availability:", timeAvailability);
      } catch (error) {
        console.error("Error parsing time availability:", error);
      }
    }

    // Organize services by proposal type and evaluation/treatment
    const serviciosEvaluacionA: ServiceData[] = [];
    const serviciosTratamientoA: ServiceData[] = [];
    const serviciosEvaluacionB: ServiceData[] = [];
    const serviciosTratamientoB: ServiceData[] = [];

    existingProposal.services.forEach((service) => {
      const serviceData: ServiceData = {
        codigo: service.code,
        terapeutaId: service.therapist.id,
        terapeutaNombre: `${service.therapist.firstName} ${service.therapist.lastName}`,
        terapeutaEspecialidad: service.therapist.specialty || "",
        servicio: service.service,
        sesiones: service.sessions,
        proposalType: service.proposalType,
      };

      if (service.proposalType === "A") {
        if (service.type === "EVALUATION") {
          serviciosEvaluacionA.push(serviceData);
        } else if (service.type === "TREATMENT") {
          serviciosTratamientoA.push(serviceData);
        }
      } else if (service.proposalType === "B") {
        if (service.type === "EVALUATION") {
          serviciosEvaluacionB.push(serviceData);
        } else if (service.type === "TREATMENT") {
          serviciosTratamientoB.push(serviceData);
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        quienTomaConsulta,
        derivacion,
        timeAvailability,
        serviciosEvaluacionA,
        serviciosTratamientoA,
        serviciosEvaluacionB,
        serviciosTratamientoB,
      },
    });
  } catch (error) {
    console.error("Error fetching existing proposal:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
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

    // Calculate costs based on database service prices
    const calculateServiceCost = async (
      service: ServiceData,
      serviceType: "EVALUATION" | "TREATMENT"
    ) => {
      // Find the service in the database to get its costPerSession
      const dbService = await prisma.service.findFirst({
        where: {
          code: service.codigo,
          type: serviceType,
          status: true,
        },
      });

      // If service not found in DB, use default price of 150
      const costPerSession = dbService?.costPerSession || 150;
      return Number(costPerSession) * service.sesiones;
    };

    // Calculate total amounts using database service costs
    const totalAmountA = await Promise.all([
      ...serviciosEvaluacionA.map((service) =>
        calculateServiceCost(service, "EVALUATION")
      ),
      ...serviciosTratamientoA.map((service) =>
        calculateServiceCost(service, "TREATMENT")
      ),
    ]).then((costs) => costs.reduce((total, cost) => total + cost, 0));

    const totalAmountB = await Promise.all([
      ...serviciosEvaluacionB.map((service) =>
        calculateServiceCost(service, "EVALUATION")
      ),
      ...serviciosTratamientoB.map((service) =>
        calculateServiceCost(service, "TREATMENT")
      ),
    ]).then((costs) => costs.reduce((total, cost) => total + cost, 0));

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

    // Helper functions for time availability conversion
    const objectToArray = (
      obj: Record<string, { morning: boolean; afternoon: boolean }>
    ) => {
      return [
        {
          day: "monday",
          ...(obj.monday || { morning: false, afternoon: false }),
        },
        {
          day: "tuesday",
          ...(obj.tuesday || { morning: false, afternoon: false }),
        },
        {
          day: "wednesday",
          ...(obj.wednesday || { morning: false, afternoon: false }),
        },
        {
          day: "thursday",
          ...(obj.thursday || { morning: false, afternoon: false }),
        },
        {
          day: "friday",
          ...(obj.friday || { morning: false, afternoon: false }),
        },
      ];
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
        sessionPrice: 0, // This field is deprecated, costs are calculated per service
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
        timeAvailability: (() => {
          console.log(
            "Received timeAvailability from frontend:",
            timeAvailability
          );
          // Handle both array and object formats
          let arrayFormat;
          if (Array.isArray(timeAvailability)) {
            arrayFormat = timeAvailability;
          } else {
            arrayFormat = objectToArray(timeAvailability);
          }
          console.log("Saving time availability to DB:", arrayFormat);
          return arrayFormat;
        })(),
      },
    });

    // Create proposal services in the new table for both proposals
    const servicesToCreate = await Promise.all([
      // Proposal A services
      ...serviciosEvaluacionA.map(async (service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "EVALUATION" as const,
        proposalType: "A",
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: await calculateServiceCost(service, "EVALUATION"),
        therapistId: service.terapeutaId,
      })),
      ...serviciosTratamientoA.map(async (service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "TREATMENT" as const,
        proposalType: "A",
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: await calculateServiceCost(service, "TREATMENT"),
        therapistId: service.terapeutaId,
      })),
      // Proposal B services
      ...serviciosEvaluacionB.map(async (service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "EVALUATION" as const,
        proposalType: "B",
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: await calculateServiceCost(service, "EVALUATION"),
        therapistId: service.terapeutaId,
      })),
      ...serviciosTratamientoB.map(async (service: ServiceData) => ({
        treatmentProposalId: proposal.id,
        type: "TREATMENT" as const,
        proposalType: "B",
        code: service.codigo,
        service: service.servicio,
        sessions: service.sesiones,
        cost: await calculateServiceCost(service, "TREATMENT"),
        therapistId: service.terapeutaId,
      })),
    ]);

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
