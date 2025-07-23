import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// Schedule types for therapist
export type TherapistScheduleFormData = {
  slotDuration: number;
  breakBetween: number;
  dailySchedules: Array<{
    day:
      | "MONDAY"
      | "TUESDAY"
      | "WEDNESDAY"
      | "THURSDAY"
      | "FRIDAY"
      | "SATURDAY"
      | "SUNDAY";
    enabled: boolean;
    startTime: string;
    endTime: string;
  }>;
  restPeriods: Array<{
    day:
      | "MONDAY"
      | "TUESDAY"
      | "WEDNESDAY"
      | "THURSDAY"
      | "FRIDAY"
      | "SATURDAY"
      | "SUNDAY";
    enabled: boolean;
    startTime: string;
    endTime: string;
  }>;
};

export interface TherapistTimeSlot {
  id: string;
  scheduleId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentTypes: string[];
  maxAppointments: number;
}

export interface TherapistSchedule {
  id: string;
  therapistId: string;
  isActive: boolean;
  timeZone: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  breakBetween: number;
  timeSlots: TherapistTimeSlot[];
}

export function useTherapistSchedule(therapistId: string | undefined) {
  return useQuery<TherapistSchedule>({
    queryKey: ["therapist-schedule", therapistId],
    queryFn: async () => {
      if (!therapistId) throw new Error("Therapist ID is required");

      const response = await fetch(
        `/api/admin/therapists/${therapistId}/schedule-config`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch therapist schedule");
      }

      return response.json();
    },
    enabled: !!therapistId,
  });
}

// Hook to create or update therapist's schedule
export const useUpdateTherapistSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData: TherapistScheduleFormData) => {
      const response = await fetch("/api/therapist/schedule", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update schedule");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist-schedule"] });

      toast({
        title: "Success",
        description: "Schedule updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook to block a time slot
export const useBlockTimeSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      startTime,
      endTime,
      reason,
      isRecurring = false,
    }: {
      date: string;
      startTime: string;
      endTime: string;
      reason?: string;
      isRecurring?: boolean;
    }) => {
      const response = await fetch("/api/therapist/schedule/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          startTime,
          endTime,
          reason,
          isRecurring,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to block time slot");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist-schedule"] });

      toast({
        title: "Success",
        description: "Time slot blocked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook to unblock a time slot
export const useUnblockTimeSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedSlotId: string) => {
      const response = await fetch(
        `/api/therapist/schedule/block/${blockedSlotId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unblock time slot");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist-schedule"] });

      toast({
        title: "Success",
        description: "Time slot unblocked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
