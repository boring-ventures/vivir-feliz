import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProgressReport {
  id: string;
  patientId: string;
  therapistId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school?: string;
  grade?: string;
  reportDate: string;
  treatmentArea: string;
  diagnoses?: string[];
  generalObjective?: string;
  specificObjectives?: string[];
  indicators?: Array<{ indicator: string; status: string }>;
  progressEntries?: string[];
  recommendations?: string[];
  createdAt: string;
  updatedAt: string;
}

interface CreateProgressReportData {
  patientId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school?: string;
  grade?: string;
  reportDate: string;
  treatmentArea: string;
  diagnoses?: string[];
  generalObjective?: string;
  specificObjectives?: string[];
  indicators?: Array<{ indicator: string; status: string }>;
  progressEntries?: string[];
  recommendations?: string[];
}

interface UpdateProgressReportData extends CreateProgressReportData {
  id: string;
}

export function useProgressReports(patientId?: string) {
  const queryClient = useQueryClient();

  const {
    data: progressReports = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["progressReports", patientId],
    queryFn: async () => {
      const url = patientId
        ? `/api/therapist/progress-reports?patientId=${patientId}`
        : "/api/therapist/progress-reports";

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch progress reports");
      }
      const data = await response.json();
      return data.progressReports as ProgressReport[];
    },
  });

  const createProgressReportMutation = useMutation({
    mutationFn: async (data: CreateProgressReportData) => {
      const response = await fetch("/api/therapist/progress-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create progress report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressReports"] });
    },
  });

  const updateProgressReportMutation = useMutation({
    mutationFn: async (data: UpdateProgressReportData) => {
      const response = await fetch("/api/therapist/progress-reports", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update progress report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressReports"] });
    },
  });

  // Get the latest progress report for the patient
  const latestProgressReport =
    progressReports.length > 0 ? progressReports[0] : null;

  return {
    progressReports,
    latestProgressReport,
    isLoading,
    error,
    refetch,
    createProgressReport: createProgressReportMutation.mutate,
    updateProgressReport: updateProgressReportMutation.mutate,
    isCreating: createProgressReportMutation.isPending,
    isUpdating: updateProgressReportMutation.isPending,
  };
}
