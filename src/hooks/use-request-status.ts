import { useQuery } from "@tanstack/react-query";

// Hook to check if a consultation or interview request is already scheduled
export const useRequestStatus = (
  requestId: string | null,
  requestType: "consultation" | "interview"
) => {
  return useQuery({
    queryKey: ["request-status", requestId, requestType],
    queryFn: async () => {
      if (!requestId) return null;

      const endpoint =
        requestType === "consultation"
          ? `/api/consultation-requests/${requestId}`
          : `/api/interview-requests/${requestId}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Failed to fetch request status");
      }

      return response.json();
    },
    enabled: !!requestId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
