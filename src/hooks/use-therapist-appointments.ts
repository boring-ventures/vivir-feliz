import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export type TherapistAppointment = {
  id: string;
  therapistId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "CONSULTA" | "ENTREVISTA" | "SEGUIMIENTO" | "TERAPIA";
  patientName: string | null;
  patientAge: number | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  notes: string | null;
  price: number | null;
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW"
    | "RESCHEDULED";
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

// Hook to fetch therapist appointments for a specific week
export const useTherapistAppointments = (
  therapistId: string | null,
  weekStartDate: Date
) => {
  return useQuery({
    queryKey: [
      "therapist-appointments",
      therapistId,
      weekStartDate.toISOString().split("T")[0],
    ],
    queryFn: async (): Promise<TherapistAppointment[]> => {
      if (!therapistId) return [];

      const weekEnd = new Date(weekStartDate);
      weekEnd.setDate(weekEnd.getDate() + 6); // Get the full week

      const params = new URLSearchParams({
        startDate: weekStartDate.toISOString().split("T")[0],
        endDate: weekEnd.toISOString().split("T")[0],
      });

      const response = await fetch(`/api/therapist/appointments?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      return data.appointments || [];
    },
    enabled: !!therapistId,
  });
};

// Hook to update appointment status
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      status,
      notes,
    }: {
      appointmentId: string;
      status: string;
      notes?: string;
    }) => {
      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, notes }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: ["therapist-appointments"] });

      toast({
        title: "Success",
        description: "Appointment updated successfully",
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

// Hook to add session notes
export const useAddSessionNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      sessionNotes,
      homework,
      nextSessionPlan,
    }: {
      appointmentId: string;
      sessionNotes: string;
      homework?: string;
      nextSessionPlan?: string;
    }) => {
      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionNotes,
            homework,
            nextSessionPlan,
            status: "COMPLETED",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add session notes");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist-appointments"] });

      toast({
        title: "Success",
        description: "Session notes saved successfully",
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

// Hook to reschedule appointment
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      newDate,
      newStartTime,
      newEndTime,
      reason,
    }: {
      appointmentId: string;
      newDate: string;
      newStartTime: string;
      newEndTime: string;
      reason?: string;
    }) => {
      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newDate,
            newStartTime,
            newEndTime,
            reason,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reschedule appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist-appointments"] });

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
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
