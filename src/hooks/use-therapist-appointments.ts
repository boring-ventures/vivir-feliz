import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface TherapistAppointment {
  id: string;
  appointmentId: string;
  patientName: string;
  patientAge: number | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  type: "CONSULTA" | "ENTREVISTA";
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes: string;
  priority: "alta" | "media" | "baja";
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string | null;
  };
  createdAt: string;
  // Analysis-specific fields
  analysisStatus: "pendiente" | "completado";
  analysisDate: string | null;
  diagnosis: string | null;
  recommendations: string | null;
  sentToAdmin: boolean;
}

export interface TherapistAppointmentsResponse {
  appointments: TherapistAppointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    scheduled: number;
    completed: number;
    highPriority: number;
    consultations: number;
    interviews: number;
  };
}

interface FetchAppointmentsParams {
  status?: "all" | "scheduled" | "completed";
  page?: number;
  limit?: number;
}

// Fetch therapist appointments
export const useTherapistAppointments = (
  params: FetchAppointmentsParams = {}
) => {
  return useQuery<TherapistAppointmentsResponse>({
    queryKey: ["therapist-appointments", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.status) searchParams.append("status", params.status);
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());

      const response = await fetch(
        `/api/therapist/appointments?${searchParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Update appointment status (for completing analysis)
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      status,
      sessionNotes,
      homework,
    }: {
      appointmentId: string;
      status: "COMPLETED" | "CANCELLED";
      sessionNotes?: string;
      homework?: string;
    }) => {
      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            sessionNotes,
            homework,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: ["therapist-appointments"] });
    },
  });
};

// Send analysis to admin
export const useSendAnalysisToAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}/send-to-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send analysis to admin");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: ["therapist-appointments"] });
    },
  });
};
