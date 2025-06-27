import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// Schedule types
export type ScheduleFormData = {
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

export type Schedule = {
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
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
};

// Create schedule mutation
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      therapistId,
      scheduleData,
    }: {
      therapistId: string;
      scheduleData: ScheduleFormData;
    }) => {
      const response = await fetch(`/api/admin/users/${therapistId}/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create schedule");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Horario creado",
        description: "El horario ha sido creado exitosamente.",
      });

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["schedule", variables.therapistId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el horario",
        variant: "destructive",
      });
    },
  });
};

// Hook to fetch schedule for a therapist
export const useSchedule = (therapistId: string | null) => {
  return useQuery({
    queryKey: ["schedule", therapistId],
    queryFn: async () => {
      if (!therapistId) return null;

      const response = await fetch(`/api/admin/users/${therapistId}/schedule`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No schedule found
        }
        throw new Error("Failed to fetch schedule");
      }

      return response.json();
    },
    enabled: !!therapistId,
  });
};

// Hook to update schedule for a therapist
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      therapistId,
      scheduleData,
    }: {
      therapistId: string;
      scheduleData: ScheduleFormData;
    }) => {
      const response = await fetch(`/api/admin/users/${therapistId}/schedule`, {
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
    onSuccess: (_, { therapistId }) => {
      // Invalidate and refetch schedule data
      queryClient.invalidateQueries({ queryKey: ["schedule", therapistId] });

      toast({
        title: "Éxito",
        description: "Horario actualizado correctamente",
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

// Delete schedule mutation
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (therapistId: string) => {
      const response = await fetch(`/api/admin/users/${therapistId}/schedule`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete schedule");
      }

      return response.json();
    },
    onSuccess: (data, therapistId) => {
      toast({
        title: "Horario eliminado",
        description: "El horario ha sido eliminado exitosamente.",
      });

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["schedule", therapistId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el horario",
        variant: "destructive",
      });
    },
  });
};
