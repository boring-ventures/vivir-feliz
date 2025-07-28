import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "./use-current-user";

interface TherapeuticPlan {
  id: string;
  patientId: string;
  therapistId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school?: string | null;
  grade?: string | null;
  objectivesDate?: string | null;
  planning?: string | null;
  treatmentArea: string;
  frequency?: string | null;
  therapyStartDate?: string | null;
  background?: string | null;
  diagnoses?: unknown; // Json field from Prisma
  generalObjective?: string | null;
  specificObjectives?: unknown; // Json field from Prisma
  indicators?: unknown; // Json field from Prisma
  methodologies?: unknown; // Json field from Prisma
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateTherapeuticPlanData {
  patientId: string;
  therapistId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school?: string;
  grade?: string;
  objectivesDate?: string;
  planning?: string;
  treatmentArea: string;
  frequency?: string;
  therapyStartDate?: string;
  background?: string;
  diagnoses?: unknown; // Json field from Prisma
  generalObjective?: string;
  specificObjectives?: unknown; // Json field from Prisma
  indicators?: unknown; // Json field from Prisma
  methodologies?: unknown; // Json field from Prisma
  observations?: string;
}

interface UpdateTherapeuticPlanData extends CreateTherapeuticPlanData {
  id: string;
}

export const useTherapeuticPlans = (patientId: string) => {
  const { profile } = useCurrentUser();
  const queryClient = useQueryClient();

  const {
    data: therapeuticPlans,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["therapeuticPlans", patientId, profile?.id],
    queryFn: async (): Promise<TherapeuticPlan[]> => {
      if (!patientId || !profile?.id) {
        throw new Error("Patient ID and Therapist ID are required");
      }

      const response = await fetch(
        `/api/therapist/therapeutic-plans?patientId=${patientId}&therapistId=${profile.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch therapeutic plans");
      }

      const data = await response.json();
      return data.therapeuticPlans;
    },
    enabled: !!patientId && !!profile?.id,
  });

  // Get the first (and only) therapeutic plan for this patient-therapist pair
  const existingPlan =
    therapeuticPlans && therapeuticPlans.length > 0
      ? therapeuticPlans[0]
      : null;

  const createTherapeuticPlanMutation = useMutation({
    mutationFn: async (data: CreateTherapeuticPlanData) => {
      const response = await fetch("/api/therapist/therapeutic-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create therapeutic plan");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapeuticPlans", patientId, profile?.id],
      });
    },
  });

  const updateTherapeuticPlanMutation = useMutation({
    mutationFn: async (data: UpdateTherapeuticPlanData) => {
      const response = await fetch("/api/therapist/therapeutic-plans", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update therapeutic plan");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapeuticPlans", patientId, profile?.id],
      });
    },
  });

  return {
    therapeuticPlans,
    existingPlan,
    isLoading,
    error,
    refetch,
    createTherapeuticPlan: createTherapeuticPlanMutation.mutate,
    updateTherapeuticPlan: updateTherapeuticPlanMutation.mutate,
    isCreating: createTherapeuticPlanMutation.isPending,
    isUpdating: updateTherapeuticPlanMutation.isPending,
  };
};
