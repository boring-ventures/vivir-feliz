import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./use-current-user";
import { TherapistData } from "@/types/reports";

interface TherapistContribution {
  id: string;
  patientId: string;
  therapistId: string;
  objectives: TherapistData[] | null;
  background: string | null;
  indicators: TherapistData[] | null;
  indicatorsComment: string | null;
  conclusions: string | null;
  createdAt: string;
  updatedAt: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

interface TherapistContributionsData {
  contributions: TherapistContribution[];
}

export function useTherapistContributions(patientId: string | null) {
  const { profile } = useCurrentUser();

  return useQuery<TherapistContributionsData>({
    queryKey: ["therapist-contributions", patientId],
    queryFn: async () => {
      console.log("Hook: Fetching contributions for patient:", patientId);

      if (!patientId) {
        throw new Error("Patient ID is required");
      }

      const url = `/api/therapist/report-contributions?patientId=${patientId}&all=true`;
      console.log("Hook: Making request to:", url);

      const response = await fetch(url);

      console.log("Hook: Response status:", response.status);
      console.log("Hook: Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Hook: Error response:", errorText);
        throw new Error(
          `Failed to fetch therapist contributions: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Hook: Received data:", data);
      return data;
    },
    enabled: !!profile && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
