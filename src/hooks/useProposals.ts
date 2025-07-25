import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProposalStatus } from "@prisma/client";

export interface TreatmentProposal {
  id: string;
  patientId?: string | null;
  consultationRequestId?: string | null;
  therapistId: string;
  title: string;
  description?: string;
  diagnosis?: string;
  objectives: string[];
  methodology?: string;
  totalSessions: number;
  sessionDuration: number;
  frequency?: string;
  estimatedDuration?: string;
  sessionPrice: number;
  totalAmount: number;
  paymentPlan?: string;
  notes?: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  consultationRequest: {
    id: string;
    childName: string;
    childDateOfBirth: string;
    childGender: string;
    motherName?: string | null;
    motherPhone?: string | null;
    fatherName?: string | null;
    fatherPhone?: string | null;
  };
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  appointments?: Array<{
    id: string;
    date: string;
    status: string;
  }>;
}

export interface ProposalSearchParams {
  status?: ProposalStatus;
  therapistId?: string;
  patientId?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface CreateProposalData {
  patientId: string;
  therapistId: string;
  title: string;
  description?: string;
  diagnosis?: string;
  objectives: string[];
  methodology?: string;
  totalSessions: number;
  sessionDuration: number;
  frequency?: string;
  estimatedDuration?: string;
  sessionPrice: number;
  totalAmount: number;
  paymentPlan?: string;
  notes?: string;
}

export interface UpdateProposalData {
  title?: string;
  description?: string;
  diagnosis?: string;
  objectives?: string[];
  methodology?: string;
  totalSessions?: number;
  sessionDuration?: number;
  frequency?: string;
  estimatedDuration?: string;
  sessionPrice?: number;
  totalAmount?: number;
  paymentPlan?: string;
  notes?: string;
  status?: ProposalStatus;
}

export interface ProposalService {
  id: string;
  treatmentProposalId: string;
  type: "EVALUATION" | "TREATMENT";
  proposalType: string; // Add proposalType field
  code: string;
  service: string;
  sessions: number;
  cost?: number;
  therapistId: string;
  createdAt: string;
  updatedAt: string;
}

// Fetch proposals with search and filters
export function useProposals(params?: ProposalSearchParams) {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.set("status", params.status);
  if (params?.therapistId) searchParams.set("therapistId", params.therapistId);
  if (params?.patientId) searchParams.set("patientId", params.patientId);
  if (params?.query) searchParams.set("query", params.query);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  return useQuery<TreatmentProposal[]>({
    queryKey: ["proposals", params],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/patients/proposals?${searchParams}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch proposals");
      }
      return response.json();
    },
  });
}

// Fetch single proposal
export function useProposal(id: string) {
  return useQuery<TreatmentProposal>({
    queryKey: ["proposal", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/patients/proposals/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch proposal");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Create proposal mutation
export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateProposalData
    ): Promise<TreatmentProposal> => {
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

// Update proposal mutation
export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProposalData;
    }): Promise<TreatmentProposal> => {
      const response = await fetch(`/api/admin/patients/proposals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update proposal");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

// Delete proposal mutation
export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/patients/proposals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete proposal");
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", id] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

// Fetch proposal services
export function useProposalServices(proposalId: string | null) {
  return useQuery<ProposalService[]>({
    queryKey: ["proposal-services", proposalId],
    queryFn: async () => {
      if (!proposalId) return null;
      const response = await fetch(
        `/api/admin/patients/proposals/${proposalId}/services`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch proposal services");
      }
      return response.json();
    },
    enabled: !!proposalId,
  });
}

// Update proposal services
export function useUpdateProposalServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      services,
    }: {
      proposalId: string;
      services: Omit<ProposalService, "id" | "createdAt" | "updatedAt">[];
    }): Promise<ProposalService[]> => {
      const response = await fetch(
        `/api/admin/patients/proposals/${proposalId}/services`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ services }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update proposal services");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["proposal-services", variables.proposalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["proposal", variables.proposalId],
      });
    },
  });
}

// Schedule service-based appointments
export function useScheduleServiceAppointments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      serviceAppointments,
    }: {
      proposalId: string;
      serviceAppointments: Record<string, string[]>;
    }) => {
      const response = await fetch(
        `/api/admin/patients/proposals/${proposalId}/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ serviceAppointments }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to schedule appointments");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["proposals"],
      });
      queryClient.invalidateQueries({
        queryKey: ["proposal", variables.proposalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["proposal-services", variables.proposalId],
      });
    },
  });
}
