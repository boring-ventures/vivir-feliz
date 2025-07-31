import { useQuery } from "@tanstack/react-query";
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
  diagnoses?: unknown;
  generalObjective?: string | null;
  specificObjectives?: unknown;
  indicators?: unknown;
  methodologies?: unknown;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ProgressReport {
  id: string;
  patientId: string;
  therapistId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school?: string | null;
  grade?: string | null;
  reportDate: string;
  treatmentArea: string;
  diagnoses?: unknown;
  generalObjective?: string | null;
  specificObjectives?: unknown;
  indicators?: unknown;
  progressEntries?: unknown;
  recommendations?: unknown;
  createdAt: string;
  updatedAt: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ReportsData {
  therapeuticPlans: TherapeuticPlan[];
  progressReports: ProgressReport[];
}

export function useReports() {
  const { profile } = useCurrentUser();

  return useQuery<ReportsData>({
    queryKey: ["reports"],
    queryFn: async () => {
      const response = await fetch("/api/therapist/reports");

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      return data;
    },
    enabled: !!profile && profile.specialty === "COORDINATOR",
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
