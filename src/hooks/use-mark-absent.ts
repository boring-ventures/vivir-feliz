import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MarkAbsentData {
  reason: string;
}

interface MarkAbsentResponse {
  message: string;
  appointment: any;
}

export const useMarkAbsent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MarkAbsentResponse,
    Error,
    { appointmentId: string; data: MarkAbsentData }
  >({
    mutationFn: async ({ appointmentId, data }) => {
      const response = await fetch(
        `/api/admin/appointments/${appointmentId}/mark-absent`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to mark appointment as absent"
        );
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch appointments queries
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["therapist-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
    },
  });
};
