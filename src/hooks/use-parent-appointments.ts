import { useQuery } from "@tanstack/react-query";

export interface ParentAppointment {
  id: string;
  appointmentId: string;
  patientName: string;
  patientAge: number;
  therapistName: string;
  therapistSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  type: string;
  status: string;
  notes: string;
  sessionNotes: string;
  homework: string;
  nextSessionPlan: string;
  price: number | null;
  proposalTitle: string;
  totalSessions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParentAppointmentsResponse {
  appointments: ParentAppointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    scheduled: number;
    completed: number;
    upcoming: number;
    total: number;
  };
}

interface FetchAppointmentsParams {
  status?: "all" | "scheduled" | "completed";
  page?: number;
  limit?: number;
}

export const useParentAppointments = (params: FetchAppointmentsParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return useQuery<ParentAppointmentsResponse>({
    queryKey: ["parent-appointments", params],
    queryFn: async () => {
      const response = await fetch(`/api/parent/appointments?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch parent appointments");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};
