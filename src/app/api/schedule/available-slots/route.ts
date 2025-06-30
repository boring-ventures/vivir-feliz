import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentType = searchParams.get("type") || "CONSULTATION"; // CONSULTATION or INTERVIEW

    // Map frontend types to database enum values
    const dbAppointmentType =
      appointmentType === "CONSULTATION" ? "CONSULTA" : "ENTREVISTA";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Default to next 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Get all active therapists with their schedules
    const therapists = await prisma.profile.findMany({
      where: {
        role: "THERAPIST",
        active: true,
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
      const dateStr = currentDate.toISOString().split("T")[0];
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
              blocked.date.toISOString().split("T")[0] === dateStr &&
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
              const appointmentDateStr = appointment.date
                .toISOString()
                .split("T")[0];
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
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
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
