import { useQuery, useQueryClient } from "@tanstack/react-query";

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

// Helper function to create a consistent query key
const createQueryKey = (params: FetchAppointmentsParams) => {
  return [
    "parent-appointments",
    {
      status: params.status || "all",
      page: params.page || 1,
      limit: params.limit || 50,
    },
  ];
};

export const useParentAppointments = (params: FetchAppointmentsParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return useQuery<ParentAppointmentsResponse>({
    queryKey: createQueryKey(params),
    queryFn: async () => {
      const response = await fetch(`/api/parent/appointments?${searchParams}`);

      if (!response.ok) {
        // Enhanced error handling with specific error types
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "Failed to fetch parent appointments";

        if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        }

        if (response.status === 404) {
          throw new Error("Parent profile not found.");
        }

        if (response.status === 503) {
          throw new Error(
            "Service temporarily unavailable. Please try again later."
          );
        }

        throw new Error(errorMessage);
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication or client errors
      if (
        error.message.includes("Authentication") ||
        error.message.includes("not found")
      ) {
        return false;
      }

      // Retry up to 3 times for server errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Export the query key creator for cache invalidation
export const getParentAppointmentsQueryKey = createQueryKey;

// Utility hook for refreshing appointments data
export const useRefreshParentAppointments = () => {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      queryClient.invalidateQueries({
        queryKey: ["parent-appointments"],
      });
    },
    refreshSpecific: (params: FetchAppointmentsParams) => {
      queryClient.invalidateQueries({
        queryKey: createQueryKey(params),
      });
    },
  };
};
