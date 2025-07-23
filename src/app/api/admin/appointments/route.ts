import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// GET: Fetch all appointments (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (currentUserProfile?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const search = searchParams.get("search") || "";

    // Build where clause
    const whereClause: any = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (date) {
      whereClause.date = {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000), // Next day
      };
    }

    if (search) {
      whereClause.OR = [
        { patientName: { contains: search, mode: "insensitive" } },
        { parentName: { contains: search, mode: "insensitive" } },
        { parentPhone: { contains: search, mode: "insensitive" } },
        { patient: { firstName: { contains: search, mode: "insensitive" } } },
        { patient: { lastName: { contains: search, mode: "insensitive" } } },
        { therapist: { firstName: { contains: search, mode: "insensitive" } } },
        { therapist: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Fetch appointments with related data
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        therapist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Transform appointments to show new date/time for rescheduled appointments
    const transformedAppointments = appointments.map((appointment) => {
      if (appointment.status === "RESCHEDULED" && appointment.rescheduledTo) {
        // For rescheduled appointments, use the new date/time
        return {
          ...appointment,
          date: appointment.rescheduledTo.toISOString().split("T")[0],
          startTime: appointment.startTime, // Keep original start time for now
          endTime: appointment.endTime, // Keep original end time for now
          originalDate: appointment.rescheduledFrom
            ?.toISOString()
            .split("T")[0],
          isRescheduled: true,
        };
      }
      return {
        ...appointment,
        isRescheduled: false,
      };
    });

    return NextResponse.json(transformedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
