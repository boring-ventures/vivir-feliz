import { useQuery } from "@tanstack/react-query";
import { TherapistData } from "@/types/reports";

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
  otherObjectives: TherapistData[] | null;
  therapistBackgrounds: TherapistData[] | null;
  therapistProgress: TherapistData[] | null;
  therapistConclusions: TherapistData[] | null;
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
