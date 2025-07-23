import { useQuery } from "@tanstack/react-query";

export interface ParentDashboardData {
  stats: {
    totalPatients: number;
    upcomingAppointments: number;
    completedAppointments: number;
    totalDocuments: number;
    totalPaid: number;
    totalPending: number;
  };
  nextAppointment: {
    id: string;
    patientName: string;
    therapistName: string;
    appointmentDate: string;
    appointmentTime: string;
    endTime: string;
    type: string;
    status: string;
    proposalTitle: string;
    totalSessions: number;
  } | null;
  recentDocuments: Array<{
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    documentType: string;
    patientName: string;
    uploadedAt: string;
  }>;
  recentActivity: Array<{
    type: "appointment" | "payment" | "document";
    id: string;
    title: string;
    description: string;
    date: string;
    status?: string;
    documentType?: string;
  }>;
}

export const useParentDashboard = () => {
  return useQuery<ParentDashboardData>({
    queryKey: ["parent-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/parent/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch parent dashboard data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
