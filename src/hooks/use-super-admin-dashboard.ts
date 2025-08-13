import { useQuery } from "@tanstack/react-query";

export interface SuperAdminTopTherapist {
  therapistId: string;
  therapistName: string;
  amount: number;
}

export interface SuperAdminDashboardData {
  kpis: {
    totalPatients: number;
    monthlyAppointments: number;
    monthlyRevenue: number;
    totalRevenue: number;
    appointmentGrowth: number;
    revenueGrowth: number;
    patientGrowth: number;
  };
  financial: {
    totalPaid: number;
    pending: number;
    overdue: number;
    collectionRate: number;
    monthly: {
      paid: number;
      pending: number;
    };
    byMethod: {
      total: Record<string, number>;
      monthly: Record<string, number>;
    };
    topTherapistsMonthly: SuperAdminTopTherapist[];
    revenueTrend: Array<{ month: string; amount: number }>;
    arAging: {
      b0_30: number;
      b31_60: number;
      b61_90: number;
      b91_plus: number;
    };
    appointmentQuality: {
      completed: number;
      cancelled: number;
      noShow: number;
      noShowRate: number;
      cancellationRate: number;
    };
    averages: {
      revenuePerPatient: number;
      revenuePerAppointment: number;
    };
    outstandingByTherapist: SuperAdminTopTherapist[];
    monthlyTherapistPerformance: Array<{
      therapistId: string;
      therapistName: string;
      scheduled: number;
      completed: number;
      cancelled: number;
      noShow: number;
      completionRate: number;
      revenue: number;
    }>;
  };
  today: { appointments: number };
}

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: ["super-admin-dashboard"],
    queryFn: async (): Promise<SuperAdminDashboardData> => {
      const response = await fetch("/api/super-admin/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch super-admin dashboard data");
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
