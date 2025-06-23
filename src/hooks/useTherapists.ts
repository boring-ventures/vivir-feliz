"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TherapistProfile, WeeklyAvailability } from "@/types/therapists";

export const useTherapists = () => {
  return useQuery({
    queryKey: ["therapists"],
    queryFn: async (): Promise<TherapistProfile[]> => {
      const response = await fetch("/api/admin/therapists");
      if (!response.ok) {
        throw new Error("Failed to fetch therapists");
      }
      return response.json();
    },
  });
};

export const useUpdateTherapistSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      therapistId,
      availability,
    }: {
      therapistId: string;
      availability: WeeklyAvailability;
    }) => {
      const response = await fetch(
        `/api/admin/therapists/${therapistId}/schedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ availability }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapists"] });
    },
  });
};
