import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
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

    // Fetch appointments for the date range
    const appointments = await prisma.appointment.findMany({
      where: {
        therapistId: profile.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Transform the data for the frontend
    const transformedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      therapistId: appointment.therapistId,
      date: appointment.date.toISOString().split("T")[0],
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      type: appointment.type,
      patientName:
        appointment.patientName ||
        (appointment.patient
          ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
          : null),
      patientAge: appointment.patientAge,
      parentName: appointment.parentName,
      parentPhone: appointment.parentPhone,
      parentEmail: appointment.parentEmail,
      notes: appointment.notes,
      price: appointment.price ? Number(appointment.price) : null,
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      patient: appointment.patient,
    }));

    return NextResponse.json({
      appointments: transformedAppointments,
    });
  } catch (error) {
    console.error("Error fetching therapist appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
