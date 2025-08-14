import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");

    // Build the where clause
    const whereClause: {
      role: UserRole;
      active: boolean;
      specialtyId?: string;
    } = {
      role: UserRole.THERAPIST,
      active: true,
    };

    if (specialty && specialty !== "all") {
      whereClause.specialtyId = specialty;
    }

    const therapists = await prisma.profile.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialty: {
          select: {
            id: true,
            specialtyId: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
        active: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return NextResponse.json(therapists);
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
