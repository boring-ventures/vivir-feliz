import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type EvaluationLevel =
  | "NEEDS_SUPPORT"
  | "IN_DEVELOPMENT"
  | "DEVELOPING_WELL"
  | "WITH_OUTSTANDING_SKILLS"
  | null;

export interface DevelopmentEvaluationData {
  id?: string;
  appointmentId: string;

  // Development Areas Evaluation
  communicationAndLanguage: EvaluationLevel;
  grossMotorSkills: EvaluationLevel;
  fineMotorSkills: EvaluationLevel;
  attentionAndLearning: EvaluationLevel;
  socialRelations: EvaluationLevel;
  autonomyAndAdaptation: EvaluationLevel;

  // Text sections
  strengths: string;
  areasToSupport: string;
  homeRecommendations: string;
  schoolRecommendations: string;

  // System fields
  createdAt?: string;
  updatedAt?: string;
}

// Hook to fetch development evaluation data for an appointment
export const useDevelopmentEvaluation = (appointmentId: string) => {
  return useQuery<DevelopmentEvaluationData | null>({
    queryKey: ["development-evaluation", appointmentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}/development-evaluation`
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch development evaluation data"
        );
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook to save/update development evaluation data
export const useSaveDevelopmentEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<DevelopmentEvaluationData> & { appointmentId: string }
    ) => {
      const response = await fetch(
        `/api/therapist/appointments/${data.appointmentId}/development-evaluation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save development evaluation"
        );
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch development evaluation data
      queryClient.invalidateQueries({
        queryKey: ["development-evaluation", variables.appointmentId],
      });

      // Also invalidate the medical form analysis query
      queryClient.invalidateQueries({
        queryKey: ["medical-form-analysis", variables.appointmentId],
      });

      // Invalidate therapist appointments to update status
      queryClient.invalidateQueries({
        queryKey: ["therapist-appointments"],
      });
    },
  });
};

// Helper function to get the display text for evaluation levels
export const getEvaluationLevelText = (level: EvaluationLevel): string => {
  switch (level) {
    case "NEEDS_SUPPORT":
      return "Necesita apoyo";
    case "IN_DEVELOPMENT":
      return "En desarrollo";
    case "DEVELOPING_WELL":
      return "Se desarrolla bien";
    case "WITH_OUTSTANDING_SKILLS":
      return "Con habilidades destacadas";
    default:
      return "";
  }
};

// Helper function to get the display text for development areas
export const getDevelopmentAreaText = (area: string): string => {
  switch (area) {
    case "communicationAndLanguage":
      return "Comunicación y lenguaje";
    case "grossMotorSkills":
      return "Habilidades motoras gruesas";
    case "fineMotorSkills":
      return "Habilidades motoras finas";
    case "attentionAndLearning":
      return "Atención y aprendizaje";
    case "socialRelations":
      return "Relación con otros";
    case "autonomyAndAdaptation":
      return "Autonomía y adaptación";
    default:
      return area;
  }
};

// Constants for the evaluation options
export const EVALUATION_LEVELS: Array<{
  value: EvaluationLevel;
  label: string;
}> = [
  { value: "NEEDS_SUPPORT", label: "Necesita apoyo" },
  { value: "IN_DEVELOPMENT", label: "En desarrollo" },
  { value: "DEVELOPING_WELL", label: "Se desarrolla bien" },
  { value: "WITH_OUTSTANDING_SKILLS", label: "Con habilidades destacadas" },
];

export const DEVELOPMENT_AREAS = [
  { key: "communicationAndLanguage", label: "Comunicación y lenguaje" },
  { key: "grossMotorSkills", label: "Habilidades motoras gruesas" },
  { key: "fineMotorSkills", label: "Habilidades motoras finas" },
  { key: "attentionAndLearning", label: "Atención y aprendizaje" },
  { key: "socialRelations", label: "Relación con otros" },
  { key: "autonomyAndAdaptation", label: "Autonomía y adaptación" },
] as const;
