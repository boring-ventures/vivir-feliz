import { useQuery } from "@tanstack/react-query";

export interface AdminDashboardData {
  kpis: {
    totalPatients: number;
    activePatients: number;
    monthlyAppointments: number;
    patientGrowth: number;
    appointmentGrowth: number;
    satisfactionScore: number;
    revenueGrowth: number; // retained in API, but not used in UI
  };
  metrics: {
    patients: { monthlyNew: number; total: number };
    retention: {
      retained: number;
      lost: number;
      new: number;
      retentionRate: number;
      churnRate: number;
    };
    consultas: { monthly: number; ytd: number };
    evaluaciones: {
      monthly: { development: number; analysis: number; total: number };
      ytd: { development: number; analysis: number; total: number };
    };
    tratamientosPorArea: {
      monthlyBySpecialty: Record<string, number>;
      totalBySpecialty: Record<string, number>;
      monthlyTotal: number;
      total: number;
      activeBySpecialty?: Record<string, number>;
      activeTotal?: number;
    };
    programas: { neuro: number; atencionTemprana: number };
    agendaPorTerapeuta: Array<{
      therapistId: string;
      therapistName: string;
      scheduled: number;
      completed: number;
      cancelled: number;
      noShow: number;
    }>;
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
    availableForConsultations?: number;
    activeList?: Array<{
      id: string;
      name: string;
      canTakeConsultations: boolean;
    }>;
    bySpecialty?: Record<string, { active: number; available: number }>;
  };
  patients: {
    active: number;
    inEvaluation: number;
    completed: number;
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
