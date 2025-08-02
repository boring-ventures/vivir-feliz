import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (
      !profile ||
      (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all patients with their reports
    const patients = await prisma.patient.findMany({
      include: {
        // Final Reports
        finalReports: {
          include: {
            coordinator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Progress Reports
        progressReports: {
          include: {
            therapist: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Therapeutic Plans
        therapeuticPlans: {
          include: {
            therapist: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // Therapist Report Contributions
        reportContributions: {
          include: {
            therapist: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { firstName: "asc" },
    });

    // Transform the data to group reports by patient
    const patientsWithReports = patients.map((patient) => {
      // Calculate age from dateOfBirth
      const today = new Date();
      const birthDate = new Date(patient.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const calculatedAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;

      return {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        dateOfBirth: patient.dateOfBirth,
        age: calculatedAge.toString(),
        finalReports: patient.finalReports,
        progressReports: patient.progressReports,
        therapeuticPlans: patient.therapeuticPlans,
        therapistContributions: patient.reportContributions,
        totalReports:
          patient.finalReports.length +
          patient.progressReports.length +
          patient.therapeuticPlans.length +
          patient.reportContributions.length,
      };
    });

    return NextResponse.json({ patients: patientsWithReports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
