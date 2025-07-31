import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Type definitions for JSON fields
type TotalAmountData = {
  [key: string]: number;
} | null;

type PaymentPlanData = {
  [proposalType: string]: {
    single: number;
    monthly: number;
    bimonthly: number;
  };
};

interface ConsultationRequestData {
  id: string;
  childName: string;
  childGender: string;
  childDateOfBirth: Date | string;
  childAddress?: string | null;
  motherName?: string | null;
  motherPhone?: string | null;
  motherEmail?: string | null;
  fatherName?: string | null;
  fatherPhone?: string | null;
  fatherEmail?: string | null;
  status: string;
  [key: string]: unknown; // Allow additional properties from Prisma
}

// Helper function to find or create parent profile from consultation request data
async function findOrCreateParentFromConsultationRequest(
  consultationRequest: ConsultationRequestData
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
  consultationRequest: ConsultationRequestData,
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
    active: true,
  };

  console.log("Creating new patient with data:", patientData);

  const newPatient = await prisma.patient.create({
    data: patientData,
  });

  console.log("Created new patient:", newPatient.id);
  return newPatient;
}

// GET /api/therapist/proposals/[id] - Get a specific treatment proposal
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
                email: true,
              },
            },
          },
        },
        consultationRequest: {
          select: {
            id: true,
            childName: true,
            childDateOfBirth: true,
            childGender: true,
            childAddress: true,
            motherName: true,
            motherPhone: true,
            motherEmail: true,
            fatherName: true,
            fatherPhone: true,
            fatherEmail: true,
            status: true,
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
        proposalServices: {
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
          orderBy: [
            { proposalType: "asc" },
            { type: "asc" },
            { createdAt: "asc" },
          ],
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Propuesta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Error al obtener la propuesta" },
      { status: 500 }
    );
  }
}

// PUT /api/therapist/proposals/[id] - Update a treatment proposal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      totalAmount,
      selectedPaymentPlan,
      notes,
      objectives,
    } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (selectedPaymentPlan !== undefined)
      updateData.selectedPaymentPlan = selectedPaymentPlan;
    if (notes !== undefined) updateData.notes = notes;
    if (objectives !== undefined) updateData.objectives = objectives;

    const updatedProposal = await prisma.treatmentProposal.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          include: {
            parent: true,
          },
        },
        consultationRequest: true,
        therapist: true,
        proposalServices: {
          include: {
            therapist: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Error al actualizar la propuesta" },
      { status: 500 }
    );
  }
}

// PATCH /api/therapist/proposals/[id] - Update specific fields of a treatment proposal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      status,
      title,
      description,
      totalAmount,
      selectedPaymentPlan,
      notes,
      objectives,
    } = body;

    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (selectedPaymentPlan !== undefined)
      updateData.selectedPaymentPlan = selectedPaymentPlan;
    if (notes !== undefined) updateData.notes = notes;
    if (objectives !== undefined) updateData.objectives = objectives;

    const updatedProposal = await prisma.treatmentProposal.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          include: {
            parent: true,
          },
        },
        consultationRequest: true,
        therapist: true,
        proposalServices: {
          include: {
            therapist: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Error al actualizar la propuesta" },
      { status: 500 }
    );
  }
}
