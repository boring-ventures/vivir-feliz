import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserRole, SpecialtyType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");

    // Build the where clause
    const whereClause: {
      role: UserRole;
      active: boolean;
      specialty?: SpecialtyType;
    } = {
      role: UserRole.THERAPIST,
      active: true,
    };

    if (specialty && specialty !== "all") {
      whereClause.specialty = specialty as SpecialtyType;
    }

    const therapists = await prisma.profile.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialty: true,
        active: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: therapists,
    });
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
