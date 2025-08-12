import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const therapists = await prisma.profile.findMany({
      where: {
        role: "THERAPIST",
        active: true,
      },
      include: {
        schedule: {
          include: {
            timeSlots: true,
            restPeriods: true,
            blockedSlots: true,
          },
        },
        // Include all appointments; client will filter by week/month
        appointments: {
          orderBy: {
            date: "asc",
          },
        },
        // Active patients linked to the therapist (for patients count)
        therapistPatients: {
          where: {
            active: true,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return NextResponse.json(therapists);
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapists" },
      { status: 500 }
    );
  }
}
