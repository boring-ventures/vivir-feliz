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

      // Map reasons to EXCLUSIVE specialties (only one specialty per reason)
      const reasonToSpecialty: Record<string, string> = {
        dificultadesLenguaje: "SPEECH_THERAPIST",
        retrasoMotor: "OCCUPATIONAL_THERAPIST",
        problemasCoordinacion: "OCCUPATIONAL_THERAPIST",
        dificultadesAprendizaje: "PSYCHOPEDAGOGUE",
        problemasAtencion: "PSYCHOPEDAGOGUE",
        dificultadesInteraccion: "SPEECH_THERAPIST", // Only speech therapist
        indicadoresComportamiento: "PSYCHOPEDAGOGUE", // Only psychopedagogue
        problemasComportamiento: "PSYCHOPEDAGOGUE", // Only psychopedagogue
        dificultadesAlimentacion: "OCCUPATIONAL_THERAPIST",
        dificultadesSueno: "OCCUPATIONAL_THERAPIST",
        sensibilidadEstimulos: "OCCUPATIONAL_THERAPIST",
        bajaAutoestima: "PSYCHOPEDAGOGUE", // Only psychopedagogue
        dificultadesControl: "OCCUPATIONAL_THERAPIST",
        dificultadesAutonomia: "OCCUPATIONAL_THERAPIST",
        diagnosticoPrevio: "PSYCHOPEDAGOGUE", // Only psychopedagogue
        otro: "PSYCHOPEDAGOGUE", // Default to psychopedagogue
        necesitaOrientacion: "COORDINATOR",
        noSeguroDificultad: "COORDINATOR",
        quiereValoracion: "COORDINATOR",
        derivacionColegio: "COORDINATOR",
        evaluacionReciente: "COORDINATOR",
        evaluacionMedica: "COORDINATOR",
      };

      // Get unique specialties for selected reasons
      const requiredSpecialties = new Set<string>();
      selectedReasons.forEach((reason) => {
        const specialty = reasonToSpecialty[reason];
        if (specialty) {
          requiredSpecialties.add(specialty);
        }
      });

      // If multiple specialties are required, only show therapists that match ALL specialties
      // This is very restrictive, so we'll use the most common specialty or fallback
      const specialtiesArray = Array.from(requiredSpecialties);

      if (specialtiesArray.length === 0) {
        return []; // No filtering if no valid specialties found
      }

      if (specialtiesArray.length === 1) {
        return specialtiesArray; // Single specialty
      }

      // For multiple specialties, prioritize PSYCHOPEDAGOGUE or NEUROPSYCHOLOGIST
      if (specialtiesArray.includes("PSYCHOPEDAGOGUE")) {
        return ["PSYCHOPEDAGOGUE"];
      }
      if (specialtiesArray.includes("NEUROPSYCHOLOGIST")) {
        return ["NEUROPSYCHOLOGIST"];
      }

      // If no psychopedagogue or neuropsychologist, return the first specialty
      return [specialtiesArray[0]];
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
