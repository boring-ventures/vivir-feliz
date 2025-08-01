import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PatientSearchParams,
  PatientsResponse,
  PatientWithRelations,
  TreatmentProposalWithRelations,
  CreatePatientForm,
  CreateTreatmentProposalForm,
  ConfirmPaymentForm,
  ScheduleAppointmentsForm,
  PatientsModuleStats,
  ProposalDisplayData,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUS_COLORS,
} from "@/types/patients";

// Fetch patients with search and filters
export function usePatients(params?: PatientSearchParams) {
  const searchParams = new URLSearchParams();

  if (params?.query) searchParams.set("query", params.query);
  if (params?.filters?.status)
    searchParams.set("status", params.filters.status.join(","));
  if (params?.filters?.therapistId)
    searchParams.set("therapistId", params.filters.therapistId);
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  searchParams.set("includeStats", "true");

  return useQuery<PatientsResponse & { stats: PatientsModuleStats }>({
    queryKey: ["patients", params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/patients?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      return response.json();
    },
  });
}

// Fetch treatment proposals
export function useProposals(
  status?: string,
  therapistId?: string,
  forNewPatients?: boolean
) {
  const searchParams = new URLSearchParams();
  if (status) searchParams.set("status", status);
  if (therapistId) searchParams.set("therapistId", therapistId);
  if (forNewPatients) searchParams.set("forNewPatients", "true");

  return useQuery<
    | TreatmentProposalWithRelations[]
    | { success: boolean; data: TreatmentProposalWithRelations[] }
  >({
    queryKey: ["proposals", status, therapistId, forNewPatients],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/patients/proposals?${searchParams}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch proposals");
      }
      return response.json();
    },
  });
}

// Fetch single proposal
export function useProposal(id: string) {
  return useQuery<TreatmentProposalWithRelations>({
    queryKey: ["proposal", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/patients/proposals/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch proposal");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Create patient mutation
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreatePatientForm
    ): Promise<PatientWithRelations> => {
      const response = await fetch("/api/admin/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create patient");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

// Create treatment proposal mutation
export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateTreatmentProposalForm
    ): Promise<TreatmentProposalWithRelations> => {
      const response = await fetch("/api/admin/patients/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create proposal");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

// Confirm payment mutation
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConfirmPaymentForm) => {
      const { proposalId, ...paymentData } = data;
      const response = await fetch(
        `/api/admin/patients/proposals/${proposalId}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to confirm payment");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["proposal", variables.proposalId],
      });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

// Schedule appointments mutation
export function useScheduleAppointments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ScheduleAppointmentsForm) => {
      const { proposalId, appointments } = data;
      const response = await fetch(
        `/api/admin/patients/proposals/${proposalId}/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appointments }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to schedule appointments");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["proposal", variables.proposalId],
      });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

// Update proposal status mutation
export function useUpdateProposalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      status,
      notes,
      selectedProposal,
      selectedPaymentPlan,
    }: {
      proposalId: string;
      status: string;
      notes?: string;
      selectedProposal?: string;
      selectedPaymentPlan?: string;
    }) => {
      const response = await fetch(
        `/api/admin/patients/proposals/${proposalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            notes,
            selectedProposal,
            selectedPaymentPlan,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update proposal status");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["proposal", variables.proposalId],
      });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

// Helper function to convert proposals to display format
export function useProposalsDisplayData(
  proposals: TreatmentProposalWithRelations[]
): ProposalDisplayData[] {
  return proposals.map((proposal) => {
    // Get date of birth from patient or fallback to consultation request
    const dateOfBirth =
      proposal.patient?.dateOfBirth ||
      proposal.consultationRequest?.childDateOfBirth;

    if (!dateOfBirth) {
      console.warn(`No date of birth found for proposal ${proposal.id}`);
    }

    const patientAge = dateOfBirth
      ? Math.floor(
          (Date.now() - new Date(dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : 0;

    // Get parent name from patient or fallback to consultation request
    const parentName = proposal.patient?.parent
      ? `${proposal.patient.parent.firstName || ""} ${proposal.patient.parent.lastName || ""}`.trim()
      : `${proposal.consultationRequest?.motherName || proposal.consultationRequest?.fatherName || "Padre/Madre"}`;

    const therapistName =
      `${proposal.therapist.firstName || ""} ${proposal.therapist.lastName || ""}`.trim();

    const totalPaid = proposal.payments
      .filter((p) => p.status === "COMPLETED" || p.status === "PARTIAL")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const paymentConfirmed = totalPaid >= Number(proposal.totalAmount);
    const appointmentsScheduled = proposal.appointments.length > 0;

    // Get patient name from patient or fallback to consultation request
    const patientName = proposal.patient
      ? `${proposal.patient.firstName} ${proposal.patient.lastName}`
      : proposal.consultationRequest?.childName || "Paciente";

    // Get parent phone from patient or fallback to consultation request
    const parentPhone =
      proposal.patient?.parent?.phone ||
      proposal.consultationRequest?.motherPhone ||
      proposal.consultationRequest?.fatherPhone ||
      "";

    // Get parent email from consultation request
    const parentEmail =
      proposal.consultationRequest?.motherEmail ||
      proposal.consultationRequest?.fatherEmail ||
      "";

    return {
      id: proposal.id,
      patientName,
      patientAge,
      parentName,
      parentPhone,
      parentEmail,
      therapistName,
      proposalDate: (() => {
        const date = new Date(proposal.proposalDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      })(),
      totalAmount: (() => {
        if (!proposal.totalAmount) return "Bs. 0";

        // Handle JSON structure for dual proposals
        if (
          typeof proposal.totalAmount === "object" &&
          proposal.totalAmount !== null
        ) {
          const totalAmountObj = proposal.totalAmount as {
            A?: number;
            B?: number;
          };

          if (proposal.selectedProposal === "A") {
            return `Bs. ${(totalAmountObj.A || 0).toLocaleString()}`;
          } else if (proposal.selectedProposal === "B") {
            return `Bs. ${(totalAmountObj.B || 0).toLocaleString()}`;
          } else {
            // If no proposal selected, show both amounts
            const amountA = totalAmountObj.A || 0;
            const amountB = totalAmountObj.B || 0;

            if (amountA > 0 && amountB > 0) {
              return `A: Bs. ${amountA.toLocaleString()} | B: Bs. ${amountB.toLocaleString()}`;
            } else if (amountA > 0) {
              return `Bs. ${amountA.toLocaleString()}`;
            } else if (amountB > 0) {
              return `Bs. ${amountB.toLocaleString()}`;
            } else {
              return "Bs. 0";
            }
          }
        }

        // Handle legacy number format
        const amount = Number(proposal.totalAmount) || 0;
        return `Bs. ${amount.toLocaleString()}`;
      })(),
      status: proposal.status,
      statusDisplay: PROPOSAL_STATUS_LABELS[proposal.status],
      statusColor: PROPOSAL_STATUS_COLORS[proposal.status],
      paymentConfirmed,
      appointmentsScheduled,
      canConfirmPayment: proposal.status === "PAYMENT_PENDING",
      canScheduleAppointments:
        proposal.status === "PAYMENT_CONFIRMED" && !appointmentsScheduled,
      selectedProposal: proposal.selectedProposal || undefined,
    };
  });
}

// Helper function to get therapist display name
export function getTherapistDisplayName(therapist: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  return (
    `${therapist.firstName || ""} ${therapist.lastName || ""}`.trim() ||
    "Sin nombre"
  );
}

// Helper function to get patient display name
export function getPatientDisplayName(patient: {
  firstName: string;
  lastName: string;
}): string {
  return `${patient.firstName} ${patient.lastName}`;
}

// Helper function to get parent display name
export function getParentDisplayName(parent: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  return (
    `${parent.firstName || ""} ${parent.lastName || ""}`.trim() || "Sin nombre"
  );
}

// Helper function to calculate patient age
export function calculateAge(dateOfBirth: Date): number {
  return Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );
}

// Fetch all patients with complete information for admin
export function useAllPatients() {
  return useQuery<PatientWithRelations[]>({
    queryKey: ["all-patients"],
    queryFn: async () => {
      const response = await fetch("/api/admin/patients/all");
      if (!response.ok) {
        throw new Error("Failed to fetch all patients");
      }
      return response.json();
    },
  });
}
