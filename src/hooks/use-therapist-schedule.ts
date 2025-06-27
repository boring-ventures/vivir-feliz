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

export type TherapistSchedule = {
  id: string;
  therapistId: string;
  isActive: boolean;
  timeZone: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  breakBetween: number;
  createdAt: string;
  updatedAt: string;
  timeSlots: Array<{
    id: string;
    scheduleId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    appointmentTypes: string[];
    maxAppointments: number;
  }>;
  blockedSlots: Array<{
    id: string;
    scheduleId: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string | null;
    isRecurring: boolean;
  }>;
};

// Hook to fetch therapist's own schedule
export const useTherapistSchedule = () => {
  return useQuery({
    queryKey: ["therapist-schedule"],
    queryFn: async (): Promise<TherapistSchedule | null> => {
      const response = await fetch("/api/therapist/schedule");

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No schedule found
        }
        throw new Error("Failed to fetch schedule");
      }

      return response.json();
    },
  });
};

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
