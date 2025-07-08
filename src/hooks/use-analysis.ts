import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export interface AnalysisData {
  id?: string;
  appointmentId: string;

  // Clinical Observation
  presentation: string[];
  disposition: string[];
  eyeContact: string[];
  activityLevel: string[];
  sensoryEvaluation: string;
  generalBehavior: string;

  // Professional Analysis
  psychologicalAnalysis: string;
  cognitiveArea: string;
  learningArea: string;
  schoolPerformance: string;
  languageAnalysis: string;
  motorAnalysis: string;
  additionalInformation: string;
  generalObservations: string;
  diagnosticHypothesis: string;

  // Recommendations and Treatment Plan
  recommendations: string;
  treatmentPlan: string;
  followUpNeeded: boolean;

  // System fields
  status: "DRAFT" | "COMPLETED" | "SENT_TO_ADMIN";
  completedAt?: string;
  sentToAdminAt?: string;
}

export interface MedicalFormUpdateData {
  [key: string]: unknown;
}

// Hook to fetch analysis data for an appointment
export const useAnalysis = (appointmentId: string) => {
  return useQuery<AnalysisData | null>({
    queryKey: ["analysis", appointmentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}/analysis`
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analysis data");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook to save/update analysis data
export const useSaveAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<AnalysisData> & { appointmentId: string }
    ) => {
      const response = await fetch(
        `/api/therapist/appointments/${data.appointmentId}/analysis`,
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
        throw new Error(errorData.error || "Failed to save analysis");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch analysis data
      queryClient.invalidateQueries({
        queryKey: ["analysis", variables.appointmentId],
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

// Hook to update medical form data (for therapists to complete missing fields)
export const useUpdateMedicalForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      appointmentId: string;
      formData: MedicalFormUpdateData;
    }) => {
      const response = await fetch(`/api/medical-forms/${data.appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update medical form");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate medical form queries
      queryClient.invalidateQueries({
        queryKey: ["medical-form-analysis", variables.appointmentId],
      });

      // Invalidate analysis query as well since it includes medical form data
      queryClient.invalidateQueries({
        queryKey: ["analysis", variables.appointmentId],
      });
    },
  });
};

// Hook to generate auto-populated analysis based on medical form data
export const useAutoPopulateAnalysis = () => {
  return useCallback((medicalForm: unknown): Partial<AnalysisData> => {
    if (!medicalForm || typeof medicalForm !== "object") return {};

    // Type assertion for medical form structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = medicalForm as any;
    const autoAnalysis: Partial<AnalysisData> = {};

    // Auto-populate psychological analysis based on medical form data
    const psychologicalPoints: string[] = [];

    if (form.perinatalHistory?.pregnancyComplications) {
      psychologicalPoints.push(
        `Antecedentes perinatales: ${form.perinatalHistory.pregnancyComplications}`
      );
    }

    if (form.medicalHistory?.importantIllnesses?.length > 0) {
      psychologicalPoints.push(
        `Historial médico: ${form.medicalHistory.importantIllnesses.join(", ")}`
      );
    }

    if (form.familyInfo?.recentChanges) {
      psychologicalPoints.push(
        `Cambios familiares recientes: ${form.familyInfo.recentChanges}`
      );
    }

    if (psychologicalPoints.length > 0) {
      autoAnalysis.psychologicalAnalysis = `Factores relevantes identificados:\n${psychologicalPoints.map((p) => `• ${p}`).join("\n")}`;
    }

    // Auto-populate language analysis
    const languagePoints: string[] = [];

    if (form.languageCognition?.firstWordsAge) {
      languagePoints.push(
        `Primeras palabras: ${form.languageCognition.firstWordsAge} meses`
      );
    }

    if (form.languageCognition?.twoWordPhrasesAge) {
      languagePoints.push(
        `Frases de dos palabras: ${form.languageCognition.twoWordPhrasesAge} meses`
      );
    }

    if (form.languageCognition?.comprehension) {
      languagePoints.push(
        `Comprensión: ${form.languageCognition.comprehension}`
      );
    }

    if (form.languageCognition?.learningDifficulties) {
      languagePoints.push(
        `Dificultades reportadas: ${form.languageCognition.learningDifficulties}`
      );
    }

    if (languagePoints.length > 0) {
      autoAnalysis.languageAnalysis = `Desarrollo del lenguaje:\n${languagePoints.map((p) => `• ${p}`).join("\n")}`;
    }

    // Auto-populate motor analysis
    const motorPoints: string[] = [];

    if (form.motorDevelopment?.headControlAge) {
      motorPoints.push(
        `Control cefálico: ${form.motorDevelopment.headControlAge} meses`
      );
    }

    if (form.motorDevelopment?.walkingAge) {
      motorPoints.push(
        `Caminata independiente: ${form.motorDevelopment.walkingAge} meses`
      );
    }

    if (form.motorDevelopment?.balanceDifficulties) {
      motorPoints.push(
        `Dificultades de equilibrio: ${form.motorDevelopment.balanceDifficulties}`
      );
    }

    if (form.motorDevelopment?.fineMotorDifficulties) {
      motorPoints.push(
        `Motricidad fina: ${form.motorDevelopment.fineMotorDifficulties}`
      );
    }

    if (motorPoints.length > 0) {
      autoAnalysis.motorAnalysis = `Desarrollo motor:\n${motorPoints.map((p) => `• ${p}`).join("\n")}`;
    }

    // Auto-populate cognitive area analysis
    const cognitivePoints: string[] = [];

    if (form.languageCognition?.cognitiveDevelopment?.length > 0) {
      cognitivePoints.push(
        `Habilidades cognitivas: ${form.languageCognition.cognitiveDevelopment.join(", ")}`
      );
    }

    if (form.languageCognition?.followsSimpleInstructions !== undefined) {
      cognitivePoints.push(
        `Sigue instrucciones simples: ${form.languageCognition.followsSimpleInstructions ? "Sí" : "No"}`
      );
    }

    if (form.languageCognition?.followsComplexInstructions !== undefined) {
      cognitivePoints.push(
        `Sigue instrucciones complejas: ${form.languageCognition.followsComplexInstructions ? "Sí" : "No"}`
      );
    }

    if (cognitivePoints.length > 0) {
      autoAnalysis.cognitiveArea = `Evaluación cognitiva:\n${cognitivePoints.map((p) => `• ${p}`).join("\n")}`;
    }

    // Auto-populate additional information from family context
    const additionalPoints: string[] = [];

    if (form.familyInfo?.livesWithWhom) {
      additionalPoints.push(
        `Composición familiar: ${form.familyInfo.livesWithWhom}`
      );
    }

    if (form.familyInfo?.familyEnvironment) {
      additionalPoints.push(
        `Ambiente familiar: ${form.familyInfo.familyEnvironment}`
      );
    }

    if (form.socialEmotional?.tantrums) {
      additionalPoints.push(`Berrinches: ${form.socialEmotional.tantrums}`);
    }

    if (additionalPoints.length > 0) {
      autoAnalysis.additionalInformation = `Contexto familiar y social:\n${additionalPoints.map((p) => `• ${p}`).join("\n")}`;
    }

    return autoAnalysis;
  }, []); // Empty dependency array since the function doesn't depend on any external values
};
