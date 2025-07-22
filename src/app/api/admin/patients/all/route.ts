import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        parent: true,
        treatmentProposals: {
          include: {
            therapist: true,
            payments: true,
            appointments: {
              include: {
                therapist: true,
                medicalRecords: true,
              },
            },
            consultationRequest: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        appointments: {
          include: {
            therapist: true,
            proposal: true,
            medicalRecords: true,
          },
          orderBy: {
            date: "desc",
          },
        },
        medicalRecords: {
          include: {
            appointment: {
              include: {
                therapist: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching all patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
