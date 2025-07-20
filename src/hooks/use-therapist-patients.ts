import { useQuery } from "@tanstack/react-query";
import type { PatientWithSessions } from "@/types/patients";

interface TherapistPatientsResponse {
  patients: PatientWithSessions[];
  total: number;
}

interface UseTherapistPatientsOptions {
  query?: string;
  status?: "active" | "inactive" | "all";
  enabled?: boolean;
}

export function useTherapistPatients(
  options: UseTherapistPatientsOptions = {}
) {
  const { query = "", status = "active", enabled = true } = options;

  return useQuery<TherapistPatientsResponse>({
    queryKey: ["therapist-patients", query, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (status) params.append("status", status);

      const response = await fetch(
        `/api/therapist/patients?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch therapist patients");
      }

      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
