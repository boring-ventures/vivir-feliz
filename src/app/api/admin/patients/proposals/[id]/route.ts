import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to find or create parent profile from consultation request data
async function findOrCreateParentFromConsultationRequest(
  consultationRequest: any
) {
  // First, try to find existing parent by phone number
  const existingParent = await prisma.profile.findFirst({
    where: {
      OR: [
        { phone: consultationRequest.motherPhone },
        { phone: consultationRequest.fatherPhone },
      ],
      role: "PARENT",
    },
  });

  if (existingParent) {
    console.log("Found existing parent profile:", existingParent.id);
    return existingParent;
  }

  // If no existing parent found, create a new one
  // Generate a unique userId for now (parent can claim this account later)
  const uniqueUserId = `pending_parent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Parse parent name (prefer mother's data, fallback to father's)
  const parentName =
    consultationRequest.motherName ||
    consultationRequest.fatherName ||
    "Padre/Madre";
  const nameParts = parentName.trim().split(" ");
  const firstName = nameParts[0] || "Padre/Madre";
  const lastName = nameParts.slice(1).join(" ") || "";

  const parentData = {
    userId: uniqueUserId,
    firstName,
    lastName,
    phone:
      consultationRequest.motherPhone || consultationRequest.fatherPhone || "",
    role: "PARENT" as const,
    active: true,
  };

  console.log("Creating new parent profile with data:", parentData);

  const newParent = await prisma.profile.create({
    data: parentData,
  });

  console.log("Created new parent profile:", newParent.id);
  return newParent;
}

// Helper function to create patient from consultation request data
async function createPatientFromConsultationRequest(
  consultationRequest: any,
  parentId: string
) {
  // Calculate age for patient
  const birthDate = new Date(consultationRequest.childDateOfBirth);

  // Parse child name (assuming format "FirstName LastName")
  const nameParts = consultationRequest.childName.split(" ");
  const firstName = nameParts[0] || consultationRequest.childName;
  const lastName = nameParts.slice(1).join(" ") || "";

  const patientData = {
    parentId,
    firstName,
    lastName,
    dateOfBirth: birthDate,
    gender: consultationRequest.childGender,
    address: consultationRequest.childAddress || "",
  };

  const newPatient = await prisma.patient.create({
    data: patientData,
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

  return newPatient;
}

// GET /api/admin/patients/proposals/[id] - Get single proposal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const proposal = await prisma.treatmentProposal.findUnique({
      where: { id },
      include: {
        patient: {
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
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          orderBy: { date: "asc" },
          include: {
            therapist: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        consultationRequest: true, // Include consultation request data
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Error fetching proposal" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/patients/proposals/[id] - Update proposal status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const proposal = await prisma.treatmentProposal.findUnique({
      where: { id },
      include: {
        consultationRequest: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Handle patient creation when payment is confirmed
    let patientId = proposal.patientId;

    if (
      status === "PAYMENT_CONFIRMED" &&
      !proposal.patientId &&
      proposal.consultationRequestId &&
      proposal.consultationRequest
    ) {
      try {
        console.log("Creating patient from consultation request data...");

        // Validate required data exists
        if (
          !proposal.consultationRequest.childName ||
          !proposal.consultationRequest.childDateOfBirth
        ) {
          console.error("Missing required child data in consultation request");
          throw new Error("Missing required child data for patient creation");
        }

        // Create parent profile
        const parent = await findOrCreateParentFromConsultationRequest(
          proposal.consultationRequest
        );
        console.log("Parent created/found:", parent.id);

        // Create patient
        const patient = await createPatientFromConsultationRequest(
          proposal.consultationRequest,
          parent.id
        );
        console.log("Patient created:", patient.id);

        patientId = patient.id;

        console.log(
          `Successfully linked patient ${patient.id} to proposal ${proposal.id}`
        );
      } catch (error) {
        console.error("Error creating patient:", error);
        // Continue with proposal update even if patient creation fails
        // Admin can manually create patient later if needed
      }
    }

    const updatedProposal = await prisma.treatmentProposal.update({
      where: { id },
      data: {
        status,
        notes,
        patientId, // Link the patient if created
        approvedDate:
          status === "PAYMENT_CONFIRMED" ? new Date() : proposal.approvedDate,
        startDate:
          status === "TREATMENT_ACTIVE" ? new Date() : proposal.startDate,
        endDate:
          status === "TREATMENT_COMPLETED" ? new Date() : proposal.endDate,
      },
      include: {
        patient: {
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
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        payments: true,
        appointments: true,
        consultationRequest: true,
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Error updating proposal" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/patients/proposals/[id] - Update proposal status (alias for PUT)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}
