import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schedule validation schema
const scheduleSchema = z.object({
  slotDuration: z.number().min(15).max(120),
  breakBetween: z.number().min(0).max(60),
  dailySchedules: z
    .array(
      z.object({
        day: z.enum([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ]),
        enabled: z.boolean(),
        startTime: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
        endTime: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      })
    )
    .refine((schedules) => schedules.some((schedule) => schedule.enabled), {
      message: "At least one day must be selected",
    }),
  restPeriods: z.array(
    z.object({
      day: z.enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ]),
      enabled: z.boolean(),
      startTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })
  ),
});

// POST: Create schedule for therapist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the requesting user's profile to check role
    const requestingUser = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    });

    if (
      !requestingUser ||
      (requestingUser.role !== "ADMIN" && requestingUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = scheduleSchema.parse(body);

    // Check if therapist exists
    const therapist = await prisma.profile.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    if (therapist.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Only therapists can have schedules" },
        { status: 400 }
      );
    }

    // Check if schedule already exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { therapistId: userId },
    });

    if (existingSchedule) {
      return NextResponse.json(
        { error: "Schedule already exists for this therapist" },
        { status: 409 }
      );
    }

    // Create schedule with time slots in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the main schedule
      const schedule = await tx.schedule.create({
        data: {
          therapistId: userId,
          slotDuration: validatedData.slotDuration,
          breakBetween: validatedData.breakBetween,
        },
      });

      // Create time slots for enabled days
      const enabledDays = validatedData.dailySchedules.filter(
        (day) => day.enabled
      );

      const timeSlots = await Promise.all(
        enabledDays.map((daySchedule) =>
          tx.timeSlot.create({
            data: {
              scheduleId: schedule.id,
              dayOfWeek: daySchedule.day,
              startTime: daySchedule.startTime,
              endTime: daySchedule.endTime,
              isAvailable: true,
              appointmentTypes: [
                "CONSULTA",
                "TERAPIA",
                "SEGUIMIENTO",
                "ENTREVISTA",
              ],
            },
          })
        )
      );

      // Create rest periods for enabled days
      const enabledRestPeriods = validatedData.restPeriods.filter(
        (period) => period.enabled
      );

      const restPeriods = await Promise.all(
        enabledRestPeriods.map((restPeriod) =>
          tx.restPeriod.create({
            data: {
              scheduleId: schedule.id,
              dayOfWeek: restPeriod.day,
              startTime: restPeriod.startTime,
              endTime: restPeriod.endTime,
            },
          })
        )
      );

      return { schedule, timeSlots, restPeriods };
    });

    return NextResponse.json({
      message: "Schedule created successfully",
      scheduleId: result.schedule.id,
      timeSlots: result.timeSlots.length,
      restPeriods: result.restPeriods.length,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get schedule for therapist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the requesting user's profile to check role
    const requestingUser = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    });

    if (
      !requestingUser ||
      (requestingUser.role !== "ADMIN" && requestingUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get schedule with time slots
    const schedule = await prisma.schedule.findUnique({
      where: { therapistId: userId },
      include: {
        timeSlots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
        restPeriods: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
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

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update schedule for therapist
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the requesting user's profile to check role
    const requestingUser = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    });

    if (
      !requestingUser ||
      (requestingUser.role !== "ADMIN" && requestingUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = scheduleSchema.parse(body);

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { therapistId: userId },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Update schedule with time slots in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the main schedule
      const schedule = await tx.schedule.update({
        where: { therapistId: userId },
        data: {
          slotDuration: validatedData.slotDuration,
          breakBetween: validatedData.breakBetween,
        },
      });

      // Delete existing time slots
      await tx.timeSlot.deleteMany({
        where: { scheduleId: schedule.id },
      });

      // Delete existing rest periods
      await tx.restPeriod.deleteMany({
        where: { scheduleId: schedule.id },
      });

      // Create new time slots for enabled days
      const enabledDays = validatedData.dailySchedules.filter(
        (day) => day.enabled
      );

      const timeSlots = await Promise.all(
        enabledDays.map((daySchedule) =>
          tx.timeSlot.create({
            data: {
              scheduleId: schedule.id,
              dayOfWeek: daySchedule.day,
              startTime: daySchedule.startTime,
              endTime: daySchedule.endTime,
              isAvailable: true,
              appointmentTypes: [
                "CONSULTA",
                "TERAPIA",
                "SEGUIMIENTO",
                "ENTREVISTA",
              ],
            },
          })
        )
      );

      // Create rest periods for enabled days
      const enabledRestPeriods = validatedData.restPeriods.filter(
        (period) => period.enabled
      );

      const restPeriods = await Promise.all(
        enabledRestPeriods.map((restPeriod) =>
          tx.restPeriod.create({
            data: {
              scheduleId: schedule.id,
              dayOfWeek: restPeriod.day,
              startTime: restPeriod.startTime,
              endTime: restPeriod.endTime,
            },
          })
        )
      );

      return { schedule, timeSlots, restPeriods };
    });

    return NextResponse.json({
      message: "Schedule updated successfully",
      scheduleId: result.schedule.id,
      timeSlots: result.timeSlots.length,
      restPeriods: result.restPeriods.length,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete schedule for therapist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the requesting user's profile to check role
    const requestingUser = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    });

    if (
      !requestingUser ||
      (requestingUser.role !== "ADMIN" && requestingUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { therapistId: userId },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Delete schedule (cascade will delete time slots and blocked slots)
    await prisma.schedule.delete({
      where: { therapistId: userId },
    });

    return NextResponse.json({
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
