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
            blockedSlots: true,
          },
        },
        appointments: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: "asc",
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
