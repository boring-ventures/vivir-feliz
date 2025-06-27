import { NextRequest, NextResponse } from "next/server";
import { DayOfWeek, AppointmentType } from "@prisma/client";
import prisma from "@/lib/prisma";

interface ScheduleUpdateData {
  availability: Record<string, string[]>;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: therapistId } = await params;
    const { availability }: ScheduleUpdateData = await request.json();

    // Verify therapist exists
    const therapist = await prisma.profile.findUnique({
      where: { id: therapistId, role: "THERAPIST" },
      include: { schedule: true },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Create or update schedule
    let schedule = therapist.schedule;
    if (!schedule) {
      schedule = await prisma.schedule.create({
        data: {
          therapistId,
        },
      });
    }

    // Map day names to DayOfWeek enum
    const dayMapping: Record<string, DayOfWeek> = {
      lunes: "MONDAY",
      martes: "TUESDAY",
      miercoles: "WEDNESDAY",
      jueves: "THURSDAY",
      viernes: "FRIDAY",
    };

    // Delete existing time slots
    await prisma.timeSlot.deleteMany({
      where: { scheduleId: schedule.id },
    });

    // Create new time slots
    const timeSlots = [];
    for (const [dayName, times] of Object.entries(availability)) {
      const dayOfWeek = dayMapping[dayName];
      if (!dayOfWeek) continue;

      for (const time of times) {
        // Calculate end time (30 minutes later)
        const [hours, minutes] = time.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + 30; // 30-minute slots

        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;

        timeSlots.push({
          scheduleId: schedule.id,
          dayOfWeek,
          startTime: time,
          endTime,
          isAvailable: true,
          appointmentTypes: [
            "CONSULTA",
            "ENTREVISTA",
            "SEGUIMIENTO",
            "TERAPIA",
          ] as AppointmentType[],
          maxAppointments: 1, // One appointment per 30-minute slot
        });
      }
    }

    if (timeSlots.length > 0) {
      await prisma.timeSlot.createMany({
        data: timeSlots,
      });
    }

    // Fetch updated schedule
    const updatedSchedule = await prisma.schedule.findUnique({
      where: { id: schedule.id },
      include: {
        timeSlots: true,
        therapist: true,
      },
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}
