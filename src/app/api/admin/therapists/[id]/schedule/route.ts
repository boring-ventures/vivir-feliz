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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json(
        { error: "Year and month are required" },
        { status: 400 }
      );
    }

    // Get the first and last day of the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of the month

    const { id: therapistId } = await params;

    // Debug logging
    console.log("🔍 API Debug - Fetching appointments:", {
      therapistId,
      year,
      month,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // First, let's check if there are ANY appointments for this therapist
    const allAppointmentsForTherapist = await prisma.appointment.findMany({
      where: {
        therapistId,
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        type: true,
        status: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    console.log("🔍 API Debug - All appointments for therapist:", {
      totalAppointments: allAppointmentsForTherapist.length,
      appointments: allAppointmentsForTherapist.slice(0, 5), // Show first 5
    });

    // Temporarily remove date filter to see if there are any appointments at all
    const appointments = await prisma.appointment.findMany({
      where: {
        therapistId,
        // date: {
        //   gte: startDate,
        //   lte: endDate,
        // },
        status: {
          notIn: ["CANCELLED", "RESCHEDULED"],
        },
      },
      select: {
        id: true,
        therapistId: true,
        date: true,
        startTime: true,
        endTime: true,
        type: true,
        status: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    console.log("🔍 API Debug - Filtered appointments for month:", {
      filteredAppointments: appointments.length,
      appointments: appointments,
    });

    // Transform the data to match the expected interface
    const transformedAppointments = appointments.map((apt) => ({
      id: apt.id,
      therapist_id: apt.therapistId,
      date: apt.date.toISOString().split("T")[0],
      start_time: apt.startTime,
      end_time: apt.endTime,
      type: apt.type,
      status: apt.status,
    }));

    return NextResponse.json(transformedAppointments);
  } catch (error) {
    console.error("Error fetching therapist schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapist schedule" },
      { status: 500 }
    );
  }
}
