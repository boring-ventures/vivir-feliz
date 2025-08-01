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

// Fetch proposals for therapists
export function useTherapistProposals(params?: ProposalSearchParams) {
  return useQuery({
    queryKey: ["therapist-proposals", params],
    queryFn: async (): Promise<TreatmentProposal[]> => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append("status", params.status);
      if (params?.therapistId)
        searchParams.append("therapistId", params.therapistId);
      if (params?.patientId) searchParams.append("patientId", params.patientId);
      if (params?.query) searchParams.append("query", params.query);
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());

      const response = await fetch(`/api/therapist/proposals?${searchParams}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch proposals");
      }
      return response.json();
    },
  });
}

// Fetch a single proposal for therapists
export function useTherapistProposal(id: string) {
  return useQuery({
    queryKey: ["therapist-proposal", id],
    queryFn: async (): Promise<TreatmentProposal> => {
      const response = await fetch(`/api/therapist/proposals/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch proposal");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Create proposal for therapists
export function useCreateTherapistProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateProposalData
    ): Promise<TreatmentProposal> => {
      const response = await fetch("/api/therapist/proposals", {
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
      queryClient.invalidateQueries({
        queryKey: ["therapist-proposals"],
      });
    },
  });
}

// Update proposal for therapists
export function useUpdateTherapistProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProposalData;
    }): Promise<TreatmentProposal> => {
      const response = await fetch(`/api/therapist/proposals/${id}`, {
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
      queryClient.invalidateQueries({
        queryKey: ["therapist-proposals"],
      });
      queryClient.invalidateQueries({
        queryKey: ["therapist-proposal", variables.id],
      });
    },
  });
}

// Delete proposal for therapists
export function useDeleteTherapistProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/therapist/proposals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete proposal");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapist-proposals"],
      });
    },
  });
}

// Fetch proposal services for therapists
export function useTherapistProposalServices(proposalId: string | null) {
  return useQuery({
    queryKey: ["therapist-proposal-services", proposalId],
    queryFn: async (): Promise<ProposalService[]> => {
      if (!proposalId) return [];
      const response = await fetch(
        `/api/therapist/proposals/${proposalId}/services`
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

// Update proposal services for therapists
export function useUpdateTherapistProposalServices() {
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
        `/api/therapist/proposals/${proposalId}/services`,
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
        queryKey: ["therapist-proposal-services", variables.proposalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["therapist-proposal", variables.proposalId],
      });
    },
  });
}
