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
      const speechTherapyReasons = ["dificultadesLenguaje"]; // Option 1
      const occupationalTherapyReasons = [
        "retrasoMotor", // Option 2
        "problemasCoordinacion", // Option 3
        "dificultadesAlimentacion", // Option 9
        "sensibilidadEstimulos", // Option 11
        "dificultadesControl", // Option 13
        "dificultadesSueno", // Option 10
        "dificultadesAutonomia", // Option 14
      ];
      const psychopedagogyReasons = [
        "dificultadesAprendizaje", // Option 4
        "problemasAtencion", // Option 5
      ];
      const psychologyReasons = [
        "dificultadesInteraccion", // Option 6
        "problemasComportamiento", // Option 8
        "bajaAutoestima", // Option 12
      ];
      const asdTherapyReasons = ["indicadoresComportamiento"]; // Option 7
      const coordinatorReasons = [
        "necesitaOrientacion", // Option 17
        "noSeguroDificultad", // Option 18
        "quiereValoracion", // Option 19
        "derivacionColegio", // Option 20
        "evaluacionReciente", // Option 21
        "evaluacionMedica", // Option 22
      ];

      // Check for special cases first

      // Option 15: Assign to coordinator (no cost interview)
      if (
        selectedReasons.includes("diagnosticoPrevio") &&
        selectedReasons.length === 1
      ) {
        return ["COORDINATOR"];
      }

      // Option 16: If only "otro" is selected, assign to psychopedagogue or neuropsychologist
      if (selectedReasons.includes("otro") && selectedReasons.length === 1) {
        return ["PSYCHOPEDAGOGUE", "NEUROPSYCHOLOGIST"];
      }

      // Options 17-22: If any coordinator reasons are selected, assign to coordinator
      const hasCoordinatorReasons = selectedReasons.some((reason) =>
        coordinatorReasons.includes(reason)
      );
      if (hasCoordinatorReasons) {
        return ["COORDINATOR"];
      }

      // Count how many different specialty areas are selected (options 1-15)
      const clinicalReasons = selectedReasons.filter(
        (reason) => !coordinatorReasons.includes(reason)
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
        clinicalReasons.includes("otro"),
      ].filter(Boolean).length;

      // If 3 or more different areas are selected (options 1-15), assign integral consultation
      if (hasMultipleAreas >= 3) {
        return ["PSYCHOPEDAGOGUE", "NEUROPSYCHOLOGIST"];
      }

      // Single area assignments
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
        // For now, return any specialty for psychology (as requested)
        return [
          "SPEECH_THERAPIST",
          "OCCUPATIONAL_THERAPIST",
          "PSYCHOPEDAGOGUE",
          "ASD_THERAPIST",
          "NEUROPSYCHOLOGIST",
        ];
      }

      if (
        selectedReasons.some((reason) => asdTherapyReasons.includes(reason))
      ) {
        return ["ASD_THERAPIST"];
      }

      // Option 15: diagnosticoPrevio with other options - assign to coordinator
      if (selectedReasons.includes("diagnosticoPrevio")) {
        return ["COORDINATOR"];
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
        canTakeConsultations: true, // Only therapists who can take consultations
        ...(requiredSpecialties.length > 0 && {
          specialty: {
            in: requiredSpecialties as (
              | "SPEECH_THERAPIST"
              | "OCCUPATIONAL_THERAPIST"
              | "PSYCHOPEDAGOGUE"
              | "NEUROPSYCHOLOGIST"
              | "COORDINATOR"
            )[],
          },
        }),
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
      Array<{ time: string; therapistId: string; therapistName: string }>
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
        { time: string; therapistId: string; therapistName: string }
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
