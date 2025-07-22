import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
interface PatientObjective {
  id: string;
  patientId: string;
  therapistId: string;
  proposalId: string | null;
  name: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PAUSED" | "CANCELLED" | "PENDING";
  type: string | null;
  createdAt: string;
  updatedAt: string;
  progressEntries: ObjectiveProgress[];
}

interface ObjectiveProgress {
  id: string;
  objectiveId: string;
  appointmentId: string;
  therapistId: string;
  percentage: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

interface CreateObjectiveData {
  patientId: string;
  name: string;
  type?: string;
  proposalId: string;
}

interface UpdateObjectiveData {
  name?: string;
  type?: string;
  status?: "COMPLETED" | "IN_PROGRESS" | "PAUSED" | "CANCELLED" | "PENDING";
}

interface UpdateProgressData {
  objectiveId: string;
  percentage: number;
  comment?: string;
}

// Get objectives for a patient
export function usePatientObjectives(patientId: string | null) {
  return useQuery<{ objectives: PatientObjective[] }>({
    queryKey: ["patient-objectives", patientId],
    queryFn: async () => {
      if (!patientId) throw new Error("Patient ID is required");

      const response = await fetch(
        `/api/therapist/patient-objectives?patientId=${patientId}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch objectives");
      }

      return response.json();
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create new objective
export function useCreateObjective() {
  const queryClient = useQueryClient();

  return useMutation<PatientObjective, Error, CreateObjectiveData>({
    mutationFn: async (data: CreateObjectiveData) => {
      const response = await fetch("/api/therapist/patient-objectives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create objective");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the objectives query for this patient
      queryClient.invalidateQueries({
        queryKey: ["patient-objectives", variables.patientId],
      });
      // Also invalidate therapist patients to update the objectives count
      queryClient.invalidateQueries({ queryKey: ["therapist-patients"] });
    },
  });
}

// Update objective
export function useUpdateObjective() {
  const queryClient = useQueryClient();

  return useMutation<
    PatientObjective,
    Error,
    { objectiveId: string; data: UpdateObjectiveData }
  >({
    mutationFn: async ({ objectiveId, data }) => {
      const response = await fetch(
        `/api/therapist/patient-objectives/${objectiveId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update objective");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all patient objectives queries
      queryClient.invalidateQueries({ queryKey: ["patient-objectives"] });
      queryClient.invalidateQueries({ queryKey: ["therapist-patients"] });
    },
  });
}

// Delete objective
export function useDeleteObjective() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (objectiveId: string) => {
      const response = await fetch(
        `/api/therapist/patient-objectives/${objectiveId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete objective");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all patient objectives queries
      queryClient.invalidateQueries({ queryKey: ["patient-objectives"] });
      queryClient.invalidateQueries({ queryKey: ["therapist-patients"] });
    },
  });
}

// Update objective progress
export function useUpdateObjectiveProgress() {
  const queryClient = useQueryClient();

  return useMutation<PatientObjective, Error, UpdateProgressData>({
    mutationFn: async (data: UpdateProgressData) => {
      const response = await fetch("/api/therapist/objective-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update progress");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["patient-objectives"] });
      queryClient.invalidateQueries({ queryKey: ["therapist-patients"] });
    },
  });
}
