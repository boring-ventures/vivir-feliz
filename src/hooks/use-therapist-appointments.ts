import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface TherapistAppointment {
  id: string;
  appointmentId: string;
  patientId: string | null;
  patientName: string;
  patientAge: number | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: string;
  notes: string;
  priority: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  createdAt: string;
  analysisStatus: string;
  analysisDate: string | null;
  diagnosis: string | null;
  recommendations: string | null;
  sentToAdmin: boolean;
}

// Interface for monthly appointments from admin API
export interface TherapistMonthlyAppointment {
  id: string;
  therapist_id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: string;
  status: string;
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
      status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
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

export function useTherapistMonthlyAppointments(
  therapistId: string | undefined,
  year: number,
  month: number
) {
  return useQuery<TherapistMonthlyAppointment[]>({
    queryKey: ["therapist-appointments", therapistId, year, month],
    queryFn: async () => {
      if (!therapistId) return [];

      // Format month to ensure two digits
      const monthStr = month.toString().padStart(2, "0");

      const response = await fetch(
        `/api/admin/therapists/${therapistId}/schedule?year=${year}&month=${monthStr}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch therapist appointments");
      }

      const data = await response.json();
      return data as TherapistMonthlyAppointment[];
    },
    enabled: !!therapistId,
  });
}
