import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: therapistId } = await params;

    // Verify therapist exists
    const therapist = await prisma.profile.findUnique({
      where: { id: therapistId, role: "THERAPIST" },
      include: {
        schedule: {
          include: {
            timeSlots: {
              orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
            },
            restPeriods: {
              orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
            },
            blockedSlots: {
              where: {
                date: {
                  gte: new Date(), // Only future blocked slots
                },
              },
              orderBy: {
                date: "asc",
              },
            },
          },
        },
      },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    if (!therapist.schedule) {
      return NextResponse.json(
        { error: "Schedule not found for therapist" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected interface
    const transformedSchedule = {
      id: therapist.schedule.id,
      therapistId: therapist.schedule.therapistId,
      isActive: therapist.schedule.isActive,
      timeZone: therapist.schedule.timeZone,
      startTime: therapist.schedule.startTime,
      endTime: therapist.schedule.endTime,
      slotDuration: therapist.schedule.slotDuration,
      breakBetween: therapist.schedule.breakBetween,
      timeSlots: therapist.schedule.timeSlots.map((slot) => ({
        id: slot.id,
        scheduleId: slot.scheduleId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
        appointmentTypes: slot.appointmentTypes,
        maxAppointments: slot.maxAppointments,
      })),
      restPeriods: therapist.schedule.restPeriods,
      blockedSlots: therapist.schedule.blockedSlots,
    };

    return NextResponse.json(transformedSchedule);
  } catch (error) {
    console.error("Error fetching therapist schedule config:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapist schedule config" },
      { status: 500 }
    );
  }
}
