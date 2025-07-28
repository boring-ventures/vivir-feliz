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
    const { status, notes, selectedProposal, selectedPaymentPlan } = body;

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

    // Create payment record when status is PAYMENT_CONFIRMED
    if (status === "PAYMENT_CONFIRMED") {
      // Check if payment record already exists
      const existingPayment = await prisma.payment.findFirst({
        where: {
          proposalId: id,
          status: { in: ["COMPLETED", "PARTIAL"] as const },
        },
      });

      if (!existingPayment) {
        // Calculate payment amount based on selected payment plan
        let paymentAmount = 0;
        let paymentStatus: "COMPLETED" | "PARTIAL" = "COMPLETED";
        let paymentNotes =
          notes ||
          `Pago confirmado el ${new Date().toLocaleDateString("es-ES")}`;

        console.log("🔍 Payment plan data:", {
          paymentPlan: proposal.paymentPlan,
          paymentPlanType: typeof proposal.paymentPlan,
          selectedProposal: proposal.selectedProposal,
          selectedPaymentPlan: proposal.selectedPaymentPlan,
        });

        if (proposal.paymentPlan) {
          // Handle both string and object payment plan data
          let paymentPlanObj: PaymentPlanData = {};
          if (typeof proposal.paymentPlan === "string") {
            try {
              paymentPlanObj = JSON.parse(proposal.paymentPlan);
            } catch (error) {
              console.error("Error parsing payment plan JSON:", error);
              paymentPlanObj = {};
            }
          } else {
            paymentPlanObj = (proposal.paymentPlan as PaymentPlanData) ?? {};
          }

          const selectedProposal = proposal.selectedProposal;
          const selectedPaymentPlan = proposal.selectedPaymentPlan;

          console.log("🔍 Payment calculation debug:", {
            paymentPlanObj,
            selectedProposal,
            selectedPaymentPlan,
          });

          if (
            selectedProposal &&
            selectedPaymentPlan &&
            paymentPlanObj[selectedProposal]
          ) {
            const planData = paymentPlanObj[selectedProposal];
            console.log("🔍 Plan data for selected proposal:", planData);

            if (selectedPaymentPlan === "single") {
              // Single payment - full amount, completed status
              paymentAmount = Number(planData.single) || 0;
              paymentStatus = "COMPLETED";
              paymentNotes = `${paymentNotes} - Pago único con 5% de descuento`;
            } else if (selectedPaymentPlan === "monthly") {
              // Monthly payment - first installment, partial status
              paymentAmount = Number(planData.monthly) || 0;
              paymentStatus = "PARTIAL";
              paymentNotes = `${paymentNotes} - Primera cuota mensual (1 de 6)`;
            } else if (selectedPaymentPlan === "bimonthly") {
              // Bimonthly payment - first installment, partial status
              paymentAmount = Number(planData.bimonthly) || 0;
              paymentStatus = "PARTIAL";
              paymentNotes = `${paymentNotes} - Primera cuota bimestral (1 de 3)`;
            }

            console.log("🔍 Calculated payment amount:", paymentAmount);
          } else {
            console.log("❌ Missing required data for payment calculation:", {
              hasSelectedProposal: !!selectedProposal,
              hasSelectedPaymentPlan: !!selectedPaymentPlan,
              hasPlanData:
                !!selectedProposal && !!paymentPlanObj[selectedProposal],
            });
          }
        } else {
          console.log("❌ No payment plan found, using fallback calculation");
        }

        // Ensure we have a valid payment amount
        if (paymentAmount <= 0) {
          console.log("⚠️ Payment amount is 0 or negative, using fallback");
          // Fallback: use total amount from proposal
          if (
            proposal.totalAmount &&
            typeof proposal.totalAmount === "object"
          ) {
            const totalAmountObj = proposal.totalAmount as TotalAmountData;
            if (
              proposal.selectedProposal &&
              totalAmountObj &&
              totalAmountObj[proposal.selectedProposal]
            ) {
              paymentAmount = Number(totalAmountObj[proposal.selectedProposal]);
            } else {
              const amounts = totalAmountObj
                ? Object.values(totalAmountObj)
                : [];
              paymentAmount = amounts.length > 0 ? Number(amounts[0]) : 0;
            }
          } else {
            paymentAmount = Number(proposal.totalAmount) || 0;
          }
          console.log("🔍 Fallback payment amount:", paymentAmount);
        }

        // Create payment record
        await prisma.payment.create({
          data: {
            proposalId: id,
            amount: paymentAmount,
            paymentMethod: "TRANSFER", // Default method
            status: paymentStatus,
            referenceNumber: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            notes: paymentNotes,
            paymentDate: new Date(),
          },
        });
      }
    }

    const updatedProposal = await prisma.treatmentProposal.update({
      where: { id },
      data: {
        status,
        notes,
        patientId, // Link the patient if created
        selectedProposal: selectedProposal || null, // Save the selected proposal
        selectedPaymentPlan: selectedPaymentPlan || null, // Save the selected payment plan
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
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, paymentPlan, selectedPaymentPlan } = body;

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

    // Create payment record when status is PAYMENT_CONFIRMED
    if (status === "PAYMENT_CONFIRMED") {
      // Check if payment record already exists
      const existingPayment = await prisma.payment.findFirst({
        where: {
          proposalId: id,
          status: { in: ["COMPLETED", "PARTIAL"] as const },
        },
      });

      if (!existingPayment) {
        // Calculate payment amount based on selected payment plan
        let paymentAmount = 0;
        let paymentStatus: "COMPLETED" | "PARTIAL" = "COMPLETED";
        let paymentNotes =
          notes ||
          `Pago confirmado el ${new Date().toLocaleDateString("es-ES")}`;

        if (proposal.paymentPlan && typeof proposal.paymentPlan === "object") {
          const paymentPlanObj = proposal.paymentPlan as PaymentPlanData;
          const selectedProposal = proposal.selectedProposal;
          const selectedPaymentPlan = proposal.selectedPaymentPlan;

          if (
            selectedProposal &&
            selectedPaymentPlan &&
            paymentPlanObj[selectedProposal]
          ) {
            const planData = paymentPlanObj[selectedProposal];

            if (selectedPaymentPlan === "single") {
              // Single payment - full amount, completed status
              paymentAmount = Number(planData.single) || 0;
              paymentStatus = "COMPLETED";
              paymentNotes = `${paymentNotes} - Pago único con 5% de descuento`;
            } else if (selectedPaymentPlan === "monthly") {
              // Monthly payment - first installment, partial status
              paymentAmount = Number(planData.monthly) || 0;
              paymentStatus = "PARTIAL";
              paymentNotes = `${paymentNotes} - Primera cuota mensual (1 de 6)`;
            } else if (selectedPaymentPlan === "bimonthly") {
              // Bimonthly payment - first installment, partial status
              paymentAmount = Number(planData.bimonthly) || 0;
              paymentStatus = "PARTIAL";
              paymentNotes = `${paymentNotes} - Primera cuota bimestral (1 de 3)`;
            }
          }
        } else {
          // Fallback: use total amount from proposal
          if (
            proposal.totalAmount &&
            typeof proposal.totalAmount === "object"
          ) {
            const totalAmountObj = proposal.totalAmount as TotalAmountData;
            if (
              proposal.selectedProposal &&
              totalAmountObj &&
              totalAmountObj[proposal.selectedProposal]
            ) {
              paymentAmount = Number(totalAmountObj[proposal.selectedProposal]);
            } else if (totalAmountObj) {
              const amounts = Object.values(totalAmountObj);
              paymentAmount = amounts.length > 0 ? Number(amounts[0]) : 0;
            }
          } else {
            paymentAmount = Number(proposal.totalAmount) || 0;
          }
        }

        // Create payment record
        await prisma.payment.create({
          data: {
            proposalId: id,
            amount: paymentAmount,
            paymentMethod: "TRANSFER", // Default method
            status: paymentStatus,
            referenceNumber: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            notes: paymentNotes,
            paymentDate: new Date(),
          },
        });
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
        paymentPlan: paymentPlan || proposal.paymentPlan,
        selectedPaymentPlan:
          selectedPaymentPlan || proposal.selectedPaymentPlan,
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
