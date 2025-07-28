import { useQuery } from "@tanstack/react-query";

export interface AdminDashboardData {
  kpis: {
    totalPatients: number;
    activePatients: number;
    monthlyAppointments: number;
    totalRevenue: number;
    monthlyRevenue: number;
    satisfactionScore: number;
    patientGrowth: number;
    appointmentGrowth: number;
    revenueGrowth: number;
  };
  requests: {
    consultationRequests: {
      total: number;
      pending: number;
      scheduled: number;
    };
    interviewRequests: {
      total: number;
      pending: number;
      scheduled: number;
    };
  };
  staff: {
    activeTherapists: number;
    totalTherapists: number;
  };
  patients: {
    active: number;
    inEvaluation: number;
    completed: number;
  };
  financial: {
    totalPaid: number;
    pending: number;
    collectionRate: number;
  };
  today: {
    appointments: number;
  };
  recentActivity: Array<{
    id: string;
    date: string;
    time: string;
    status: string;
    patient: {
      firstName: string;
      lastName: string;
    };
    therapist: {
      firstName: string | null;
      lastName: string | null;
    };
  }>;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async (): Promise<AdminDashboardData> => {
      const response = await fetch("/api/admin/dashboard");
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
} 