import { useQuery } from "@tanstack/react-query";

interface FinalReport {
  id: string;
  patientId: string;
  coordinatorId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  reportDate: string;
  generalObjective: string | null;
  generalBackground: string | null;
  generalConclusions: string | null;
  otherObjectives: any | null;
  therapistBackgrounds: any | null;
  therapistProgress: any | null;
  therapistConclusions: any | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  coordinator: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

interface FinalReportData {
  finalReport: FinalReport | null;
}

export function useFinalReport(patientId?: string) {
  const {
    data: finalReportData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["finalReport", patientId],
    queryFn: async () => {
      if (!patientId) {
        return { finalReport: null };
      }

      const response = await fetch(
        `/api/therapist/final-reports?patientId=${patientId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch final report");
      }
      const data = await response.json();
      return data as FinalReportData;
    },
    enabled: !!patientId,
  });

  return {
    finalReport: finalReportData?.finalReport || null,
    isLoading,
    error,
    refetch,
  };
}
