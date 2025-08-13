import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to format date without timezone issues
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to create Date object from date string without timezone issues
const createDateFromString = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentType = searchParams.get("type") || "CONSULTATION"; // CONSULTATION or INTERVIEW

    // Map frontend types to database enum values
    const dbAppointmentType =
      appointmentType === "CONSULTATION" ? "CONSULTA" : "ENTREVISTA";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get consultation reasons from request (for consultation type only)
    const consultationReasonsParam = searchParams.get("consultationReasons");
    let consultationReasons: Record<string, boolean> = {};

    if (appointmentType === "CONSULTATION" && consultationReasonsParam) {
      try {
        consultationReasons = JSON.parse(consultationReasonsParam);
      } catch (error) {
        console.error("Error parsing consultation reasons:", error);
      }
    }

    // Default to next 30 days if no date range provided
    const start = startDate ? createDateFromString(startDate) : new Date();
    const end = endDate
      ? createDateFromString(endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Determine required specialties based on consultation reasons
    const getRequiredSpecialties = (
      reasons: Record<string, boolean>
    ): string[] => {
      const selectedReasons = Object.entries(reasons)
        .filter(([, value]) => value === true)
        .map(([key]) => key);

      if (selectedReasons.length === 0) {
        return []; // No filtering if no reasons selected
      }

      // Define specialty groups according to requirements
      const speechTherapyReasons = ["dificultadesLenguaje"]; // Opción 1
      const occupationalTherapyReasons = [
        "retrasoMotor", // Opción 2
        "problemasCoordinacion", // Opción 3
        "dificultadesAlimentacion", // Opción 9
        "sensibilidadEstimulos", // Opción 11
        "dificultadesControl", // Opción 13
        "dificultadesSueno", // Opción 10
        "dificultadesAutonomia", // Opción 14
      ];
      const psychopedagogyReasons = [
        "dificultadesAprendizaje", // Opción 4
        "problemasAtencion", // Opción 5
      ];
      const psychologyReasons = [
        "dificultadesInteraccion", // Opción 6
        "problemasComportamiento", // Opción 8
        "bajaAutoestima", // Opción 12
      ];
      const asdTherapyReasons = ["indicadoresComportamiento"]; // Opción 7
      const coordinatorReasons = [
        "necesitaOrientacion", // Opción 17
        "noSeguroDificultad", // Opción 18
        "quiereValoracion", // Opción 19
        "derivacionColegio", // Opción 20
        "evaluacionReciente", // Opción 21
        "evaluacionMedica", // Opción 22
      ];

      // Check for special cases first

      // Opción 15: Assign to coordinator (no cost interview)
      if (
        selectedReasons.includes("diagnosticoPrevio") &&
        selectedReasons.length === 1
      ) {
        return ["COORDINATOR", "COORDINATION_ASSISTANT"];
      }

      // Opción 16: If only "otro" is selected, assign to psychopedagogue or neuropsychologist
      if (selectedReasons.includes("otro") && selectedReasons.length === 1) {
        return ["PSYCHOPEDAGOGUE", "NEUROPSYCHOLOGIST"];
      }

      // Opciones 17,18,19,20,21,22: If any coordinator reasons are selected, assign to coordinator
      const hasCoordinatorReasons = selectedReasons.some((reason) =>
        coordinatorReasons.includes(reason)
      );
      if (hasCoordinatorReasons) {
        return ["COORDINATOR", "COORDINATION_ASSISTANT"];
      }

      // Count how many different specialty areas are selected (opciones 1-15)
      const clinicalReasons = selectedReasons.filter(
        (reason) => !coordinatorReasons.includes(reason) && reason !== "otro"
      );

      const hasMultipleAreas = [
        clinicalReasons.some((reason) => speechTherapyReasons.includes(reason)),
        clinicalReasons.some((reason) =>
          occupationalTherapyReasons.includes(reason)
        ),
        clinicalReasons.some((reason) =>
          psychopedagogyReasons.includes(reason)
        ),
        clinicalReasons.some((reason) => psychologyReasons.includes(reason)),
        clinicalReasons.some((reason) => asdTherapyReasons.includes(reason)),
        clinicalReasons.includes("diagnosticoPrevio"),
      ].filter(Boolean).length;

      // If 3 or more different areas are selected (opciones 1-15), assign integral consultation
      if (hasMultipleAreas >= 3) {
        return ["PSYCHOPEDAGOGUE", "NEUROPSYCHOLOGIST"];
      }

      // Single area assignments according to requirements

      // Opción 1: If only speech therapy is selected
      if (
        selectedReasons.some((reason) =>
          speechTherapyReasons.includes(reason)
        ) &&
        selectedReasons.length === 1
      ) {
        return ["SPEECH_THERAPIST"];
      }

      // Opciones 2,3,9,11,13,10,14: If only occupational therapy reasons are selected
      if (
        selectedReasons.some((reason) =>
          occupationalTherapyReasons.includes(reason)
        ) &&
        selectedReasons.every((reason) =>
          occupationalTherapyReasons.includes(reason)
        )
      ) {
        return ["OCCUPATIONAL_THERAPIST"];
      }

      // Opciones 4,5: If only psychopedagogy reasons are selected
      if (
        selectedReasons.some((reason) =>
          psychopedagogyReasons.includes(reason)
        ) &&
        selectedReasons.every((reason) =>
          psychopedagogyReasons.includes(reason)
        )
      ) {
        return ["PSYCHOPEDAGOGUE"];
      }

      // Opciones 6,8,12: If only psychology reasons are selected
      if (
        selectedReasons.some((reason) => psychologyReasons.includes(reason)) &&
        selectedReasons.every((reason) => psychologyReasons.includes(reason))
      ) {
        return ["PSYCHOLOGIST"];
      }

      // Opción 7: If only ASD therapy is selected
      if (
        selectedReasons.some((reason) => asdTherapyReasons.includes(reason)) &&
        selectedReasons.length === 1
      ) {
        return ["ASD_THERAPIST"];
      }

      // Mixed cases - assign to most appropriate specialty based on primary reason
      if (
        selectedReasons.some((reason) => speechTherapyReasons.includes(reason))
      ) {
        return ["SPEECH_THERAPIST"];
      }

      if (
        selectedReasons.some((reason) =>
          occupationalTherapyReasons.includes(reason)
        )
      ) {
        return ["OCCUPATIONAL_THERAPIST"];
      }

      if (
        selectedReasons.some((reason) => psychopedagogyReasons.includes(reason))
      ) {
        return ["PSYCHOPEDAGOGUE"];
      }

      if (
        selectedReasons.some((reason) => psychologyReasons.includes(reason))
      ) {
        return ["PSYCHOLOGIST"];
      }

      if (
        selectedReasons.some((reason) => asdTherapyReasons.includes(reason))
      ) {
        return ["ASD_THERAPIST"];
      }

      // Default fallback
      return [];
    };

    const requiredSpecialties = getRequiredSpecialties(consultationReasons);

    // Get all active therapists with their schedules
    const therapists = await prisma.profile.findMany({
      where: {
        role: "THERAPIST",
        active: true,
        // For consultations, only therapists who can take consultations
        ...(appointmentType === "CONSULTATION"
          ? { canTakeConsultations: true }
          : {}),
        // For interviews, restrict to coordinator roles only
        ...(appointmentType === "INTERVIEW"
          ? {
              specialty: {
                in: ["COORDINATOR", "COORDINATION_ASSISTANT"] as (
                  | "COORDINATOR"
                  | "COORDINATION_ASSISTANT"
                )[],
              },
            }
          : requiredSpecialties.length > 0
            ? {
                specialty: {
                  in: requiredSpecialties as (
                    | "SPEECH_THERAPIST"
                    | "OCCUPATIONAL_THERAPIST"
                    | "PSYCHOPEDAGOGUE"
                    | "NEUROPSYCHOLOGIST"
                    | "COORDINATOR"
                    | "PSYCHOMOTRICIAN"
                    | "PEDIATRIC_KINESIOLOGIST"
                    | "PSYCHOLOGIST"
                    | "COORDINATION_ASSISTANT"
                    | "BEHAVIORAL_THERAPIST"
                  )[],
                },
              }
            : {}),
      },
      include: {
        schedule: {
          where: {
            isActive: true,
          },
          include: {
            timeSlots: {
              where: {
                isAvailable: true,
                appointmentTypes: {
                  has: dbAppointmentType,
                },
              },
              orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
            },
            restPeriods: true,
            blockedSlots: {
              where: {
                date: {
                  gte: start,
                  lte: end,
                },
              },
            },
          },
        },
        appointments: {
          where: {
            date: {
              gte: start,
              lte: end,
            },
            status: {
              in: ["SCHEDULED", "CONFIRMED"],
            },
          },
        },
      },
    });

    // Process available slots for each day in the range
    const availableSlots: Record<
      string,
      Array<{
        time: string;
        therapistId: string;
        therapistName: string;
        therapistSpecialty?: string;
      }>
    > = {};

    const dayNames = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    // Generate dates for the range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = formatDateLocal(currentDate);
      const dayOfWeek = dayNames[currentDate.getDay()];

      availableSlots[dateStr] = [];

      // Check each therapist's availability for this date
      for (const therapist of therapists) {
        if (!therapist.schedule) continue;

        const schedule = therapist.schedule;

        // Find time slots for this day of week
        const daySlots = schedule.timeSlots.filter(
          (slot) => slot.dayOfWeek === dayOfWeek
        );

        for (const slot of daySlots) {
          // Check if date is blocked
          const isBlocked = schedule.blockedSlots.some(
            (blocked) =>
              formatDateLocal(blocked.date) === dateStr &&
              blocked.startTime <= slot.startTime &&
              blocked.endTime >= slot.endTime
          );

          if (isBlocked) continue;

          // Check if slot is during rest period
          const isRestTime = schedule.restPeriods.some(
            (rest) =>
              rest.dayOfWeek === dayOfWeek &&
              rest.startTime <= slot.startTime &&
              rest.endTime >= slot.endTime
          );

          if (isRestTime) continue;

          // Generate time slots based on slot duration
          const slotDuration = schedule.slotDuration || 60;
          const startTime = slot.startTime;
          const endTime = slot.endTime;

          let currentSlotTime = startTime;

          while (currentSlotTime < endTime) {
            // Check if this specific time slot is already booked
            const isBooked = therapist.appointments.some((appointment) => {
              const appointmentDateStr = formatDateLocal(appointment.date);
              return (
                appointmentDateStr === dateStr &&
                appointment.startTime === currentSlotTime
              );
            });

            if (!isBooked) {
              availableSlots[dateStr].push({
                time: currentSlotTime,
                therapistId: therapist.id,
                therapistName: `${therapist.firstName} ${therapist.lastName}`,
                therapistSpecialty: therapist.specialty || undefined,
              });
            }

            // Move to next slot
            const [hours, minutes] = currentSlotTime.split(":").map(Number);
            const nextSlotMinutes =
              hours * 60 +
              minutes +
              slotDuration +
              (schedule.breakBetween || 0);
            const nextHours = Math.floor(nextSlotMinutes / 60);
            const nextMins = nextSlotMinutes % 60;

            if (nextHours >= 24) break;

            currentSlotTime = `${nextHours.toString().padStart(2, "0")}:${nextMins.toString().padStart(2, "0")}`;
          }
        }
      }

      // Sort slots by time and remove duplicates (keeping first available therapist)
      const uniqueSlots = new Map<
        string,
        {
          time: string;
          therapistId: string;
          therapistName: string;
          therapistSpecialty?: string;
        }
      >();
      availableSlots[dateStr]
        .sort((a, b) => a.time.localeCompare(b.time))
        .forEach((slot) => {
          if (!uniqueSlots.has(slot.time)) {
            uniqueSlots.set(slot.time, slot);
          }
        });

      availableSlots[dateStr] = Array.from(uniqueSlots.values());

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      availableSlots,
      appointmentType,
      dateRange: {
        start: formatDateLocal(start),
        end: formatDateLocal(end),
      },
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
