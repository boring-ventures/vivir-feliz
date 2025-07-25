import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type EvaluationLevel =
  | "NECESITA_APOYO"
  | "EN_DESARROLLO"
  | "SE_DESARROLLA_BIEN"
  | "CON_HABILIDADES_DESTACADAS"
  | null;

export interface DevelopmentEvaluationData {
  id?: string;
  appointmentId: string;

  // Development Areas Evaluation
  comunicacionYLenguaje: EvaluationLevel;
  habilidadesGruesas: EvaluationLevel;
  habilidadesFinas: EvaluationLevel;
  atencionYAprendizaje: EvaluationLevel;
  relacionConOtros: EvaluationLevel;
  autonomiaYAdaptacion: EvaluationLevel;

  // Text sections
  fortalezas: string;
  areasParaApoyar: string;
  recomendacionCasas: string;
  recomendacionColegio: string;

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
    case "NECESITA_APOYO":
      return "Necesita apoyo";
    case "EN_DESARROLLO":
      return "En desarrollo";
    case "SE_DESARROLLA_BIEN":
      return "Se desarrolla bien";
    case "CON_HABILIDADES_DESTACADAS":
      return "Con habilidades destacadas";
    default:
      return "";
  }
};

// Helper function to get the display text for development areas
export const getDevelopmentAreaText = (area: string): string => {
  switch (area) {
    case "comunicacionYLenguaje":
      return "Comunicación y lenguaje";
    case "habilidadesGruesas":
      return "Habilidades motoras gruesas";
    case "habilidadesFinas":
      return "Habilidades motoras finas";
    case "atencionYAprendizaje":
      return "Atención y aprendizaje";
    case "relacionConOtros":
      return "Relación con otros";
    case "autonomiaYAdaptacion":
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
  { value: "NECESITA_APOYO", label: "Necesita apoyo" },
  { value: "EN_DESARROLLO", label: "En desarrollo" },
  { value: "SE_DESARROLLA_BIEN", label: "Se desarrolla bien" },
  { value: "CON_HABILIDADES_DESTACADAS", label: "Con habilidades destacadas" },
];

export const DEVELOPMENT_AREAS = [
  { key: "comunicacionYLenguaje", label: "Comunicación y lenguaje" },
  { key: "habilidadesGruesas", label: "Habilidades motoras gruesas" },
  { key: "habilidadesFinas", label: "Habilidades motoras finas" },
  { key: "atencionYAprendizaje", label: "Atención y aprendizaje" },
  { key: "relacionConOtros", label: "Relación con otros" },
  { key: "autonomiaYAdaptacion", label: "Autonomía y adaptación" },
] as const;
