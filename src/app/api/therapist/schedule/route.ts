import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the therapist profile
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile || profile.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    // Fetch the schedule
    const schedule = await prisma.schedule.findUnique({
      where: {
        therapistId: profile.id,
      },
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
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Transform the data
    const transformedSchedule = {
      id: schedule.id,
      therapistId: schedule.therapistId,
      isActive: schedule.isActive,
      timeZone: schedule.timeZone,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      slotDuration: schedule.slotDuration,
      breakBetween: schedule.breakBetween,
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
      timeSlots: schedule.timeSlots.map((slot) => ({
        id: slot.id,
        scheduleId: slot.scheduleId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
        appointmentTypes: slot.appointmentTypes,
        maxAppointments: slot.maxAppointments,
      })),
      restPeriods: schedule.restPeriods.map((period) => ({
        id: period.id,
        scheduleId: period.scheduleId,
        dayOfWeek: period.dayOfWeek,
        startTime: period.startTime,
        endTime: period.endTime,
      })),
      blockedSlots: schedule.blockedSlots.map((blocked) => ({
        id: blocked.id,
        scheduleId: blocked.scheduleId,
        date: blocked.date.toISOString().split("T")[0],
        startTime: blocked.startTime,
        endTime: blocked.endTime,
        reason: blocked.reason,
        isRecurring: blocked.isRecurring,
      })),
    };

    return NextResponse.json(transformedSchedule);
  } catch (error) {
    console.error("Error fetching therapist schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the therapist profile
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile || profile.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { slotDuration, breakBetween, dailySchedules, restPeriods } = body;

    // Use a transaction to update the schedule
    const result = await prisma.$transaction(async (tx) => {
      // Check if schedule exists
      let schedule = await tx.schedule.findUnique({
        where: {
          therapistId: profile.id,
        },
      });

      if (schedule) {
        // Update existing schedule
        schedule = await tx.schedule.update({
          where: {
            id: schedule.id,
          },
          data: {
            slotDuration: slotDuration || 60,
            breakBetween: breakBetween || 15,
            updatedAt: new Date(),
          },
        });

        // Delete existing time slots
        await tx.timeSlot.deleteMany({
          where: {
            scheduleId: schedule.id,
          },
        });

        // Delete existing rest periods
        await tx.restPeriod.deleteMany({
          where: {
            scheduleId: schedule.id,
          },
        });
      } else {
        // Create new schedule
        schedule = await tx.schedule.create({
          data: {
            therapistId: profile.id,
            slotDuration: slotDuration || 60,
            breakBetween: breakBetween || 15,
            isActive: true,
            timeZone: "America/La_Paz",
            startTime: "08:00",
            endTime: "18:00",
          },
        });
      }

      // Create new time slots
      for (const daySchedule of dailySchedules) {
        if (daySchedule.enabled) {
          await tx.timeSlot.create({
            data: {
              scheduleId: schedule.id,
              dayOfWeek: daySchedule.day,
              startTime: daySchedule.startTime,
              endTime: daySchedule.endTime,
              isAvailable: true,
              appointmentTypes: [
                "CONSULTA",
                "ENTREVISTA",
                "SEGUIMIENTO",
                "TERAPIA",
              ],
              maxAppointments: 1,
            },
          });
        }
      }

      // Create rest periods for enabled days
      if (restPeriods) {
        for (const restPeriod of restPeriods) {
          if (restPeriod.enabled) {
            await tx.restPeriod.create({
              data: {
                scheduleId: schedule.id,
                dayOfWeek: restPeriod.day,
                startTime: restPeriod.startTime,
                endTime: restPeriod.endTime,
              },
            });
          }
        }
      }

      return schedule;
    });

    return NextResponse.json({
      message: "Schedule updated successfully",
      schedule: result,
    });
  } catch (error) {
    console.error("Error updating therapist schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
