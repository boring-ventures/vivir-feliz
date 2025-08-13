import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export type AvailableSlot = {
  time: string;
  therapistId: string;
  therapistName: string;
  therapistSpecialty?: string;
};

export type AvailableSlotsResponse = {
  availableSlots: Record<string, AvailableSlot[]>;
  appointmentType: string;
  dateRange: {
    start: string;
    end: string;
  };
};

export type BookAppointmentData = {
  appointmentType: "CONSULTATION" | "INTERVIEW";
  appointmentDate: string;
  appointmentTime: string;
  therapistId: string;
  requestId: string;
};

export type BookedAppointment = {
  id: number;
  appointmentId: string;
  type: string;
  date: string;
  time: string;
  status: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  childName: string;
  parentContact: {
    phone: string;
    email: string;
  };
};

// Hook to fetch available time slots
export const useAvailableSlots = (
  appointmentType: "CONSULTATION" | "INTERVIEW",
  startDate?: string,
  endDate?: string,
  consultationReasons?: Record<string, boolean>
) => {
  return useQuery({
    queryKey: [
      "available-slots",
      appointmentType,
      startDate,
      endDate,
      consultationReasons,
    ],
    queryFn: async (): Promise<AvailableSlotsResponse> => {
      const params = new URLSearchParams({
        type: appointmentType,
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (consultationReasons) {
        params.append(
          "consultationReasons",
          JSON.stringify(consultationReasons)
        );
      }

      const response = await fetch(`/api/schedule/available-slots?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch available slots");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes to keep data fresh
  });
};

// Hook to book an appointment
export const useBookAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: BookAppointmentData
    ): Promise<{ success: boolean; appointment: BookedAppointment }> => {
      const response = await fetch("/api/schedule/book-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to book appointment");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "¡Cita Agendada!",
        description: `Tu ${variables.appointmentType === "CONSULTATION" ? "consulta" : "entrevista"} ha sido agendada exitosamente.`,
      });

      // Invalidate available slots to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["available-slots"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Error al agendar la cita",
        variant: "destructive",
      });
    },
  });
};
