import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RescheduleData {
  newDate: string;
  newStartTime: string;
  newEndTime: string;
}

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  patientId: string;
  therapistId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RescheduleResponse {
  message: string;
  appointment: Appointment;
}

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RescheduleResponse,
    Error,
    { appointmentId: string; data: RescheduleData }
  >({
    mutationFn: async ({ appointmentId, data }) => {
      const response = await fetch(
        `/api/admin/appointments/${appointmentId}/reschedule`,
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
        throw new Error(errorData.error || "Failed to reschedule appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch appointments queries
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["therapist-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["reschedule-slots"] });
    },
  });
};
