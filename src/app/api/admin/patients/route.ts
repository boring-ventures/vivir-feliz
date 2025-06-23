import { NextRequest, NextResponse } from "next/server";
import { ProposalStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { PatientsResponse, PatientsModuleStats } from "@/types/patients";

// GET /api/admin/patients - Fetch patients with search and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status")?.split(",") || [];
    const therapistId = searchParams.get("therapistId") || undefined;
    const sortBy = searchParams.get("sortBy") || "proposalDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeStats = searchParams.get("includeStats") === "true";

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    // Search filter
    if (query) {
      where.OR = [
        {
          firstName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          parent: {
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ];
    }

    // Status filter (filter by treatment proposal status)
    if (status.length > 0) {
      where.treatmentProposals = {
        some: {
          status: {
            in: status as ProposalStatus[],
          },
        },
      };
    }

    // Therapist filter
    if (therapistId) {
      where.treatmentProposals = {
        some: {
          therapistId: therapistId,
        },
      };
    }

    // Build order by clause
    let orderBy: Record<string, unknown> | Record<string, unknown>[] = {
      createdAt: sortOrder,
    };

    switch (sortBy) {
      case "name":
        orderBy = [{ firstName: sortOrder }];
        break;
      case "age":
        orderBy = { dateOfBirth: sortOrder === "asc" ? "desc" : "asc" }; // Reverse for age
        break;
      case "proposalDate":
        orderBy = {
          treatmentProposals: {
            _count: sortOrder,
          },
        };
        break;
      default:
        orderBy = { createdAt: sortOrder };
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch patients with relations
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          parent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          treatmentProposals: {
            include: {
              therapist: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  specialty: true,
                },
              },
              payments: true,
              appointments: {
                orderBy: { date: "desc" },
                take: 1,
              },
            },
            orderBy: { createdAt: "desc" },
          },
          appointments: {
            orderBy: { date: "desc" },
            take: 5,
            include: {
              therapist: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          medicalRecords: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    const response: PatientsResponse = {
      patients: patients as unknown as PatientsResponse["patients"],
      total,
      page,
      limit,
    };

    // Include statistics if requested
    if (includeStats) {
      const stats = await getPatientsModuleStats();
      (response as PatientsResponse & { stats: PatientsModuleStats }).stats =
        stats;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Error fetching patients" },
      { status: 500 }
    );
  }
}

// POST /api/admin/patients - Create new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      nationalId,
      phone,
      email,
      address,
      emergencyContact,
      emergencyPhone,
      allergies,
      medications,
      medicalHistory,
      specialNeeds,
      parentId,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !parentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if parent exists
    const parent = await prisma.profile.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    // Check for duplicate national ID if provided
    if (nationalId) {
      const existingPatient = await prisma.patient.findUnique({
        where: { nationalId },
      });

      if (existingPatient) {
        return NextResponse.json(
          { error: "Patient with this national ID already exists" },
          { status: 409 }
        );
      }
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        nationalId,
        phone,
        email,
        address,
        emergencyContact,
        emergencyPhone,
        allergies,
        medications,
        medicalHistory,
        specialNeeds,
        parentId,
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Error creating patient" },
      { status: 500 }
    );
  }
}

// Helper function to get module statistics
async function getPatientsModuleStats(): Promise<PatientsModuleStats> {
  const [
    totalPatients,
    activePatients,
    proposalsSent,
    paymentsPending,
    paymentsConfirmed,
    appointmentsScheduled,
    activeTreatments,
    completedTreatments,
  ] = await Promise.all([
    // Total patients
    prisma.patient.count({
      where: { isActive: true },
    }),

    // Active patients (with active proposals)
    prisma.patient.count({
      where: {
        isActive: true,
        treatmentProposals: {
          some: {
            status: {
              in: [
                "TREATMENT_ACTIVE",
                "APPOINTMENTS_SCHEDULED",
                "PAYMENT_CONFIRMED",
              ],
            },
          },
        },
      },
    }),

    // Total proposals sent
    prisma.treatmentProposal.count(),

    // Payments pending
    prisma.treatmentProposal.count({
      where: {
        status: "PAYMENT_PENDING",
      },
    }),

    // Payments confirmed
    prisma.treatmentProposal.count({
      where: {
        status: {
          in: [
            "PAYMENT_CONFIRMED",
            "APPOINTMENTS_SCHEDULED",
            "TREATMENT_ACTIVE",
          ],
        },
      },
    }),

    // Appointments scheduled
    prisma.treatmentProposal.count({
      where: {
        status: {
          in: ["APPOINTMENTS_SCHEDULED", "TREATMENT_ACTIVE"],
        },
      },
    }),

    // Active treatments
    prisma.treatmentProposal.count({
      where: {
        status: "TREATMENT_ACTIVE",
      },
    }),

    // Completed treatments
    prisma.treatmentProposal.count({
      where: {
        status: "TREATMENT_COMPLETED",
      },
    }),
  ]);

  return {
    totalPatients,
    activePatients,
    proposalsSent,
    paymentsPending,
    paymentsConfirmed,
    appointmentsScheduled,
    activeTreatments,
    completedTreatments,
  };
}
