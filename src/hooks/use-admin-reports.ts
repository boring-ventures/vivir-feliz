import { useQuery } from "@tanstack/react-query";
import { PatientWithReports } from "@/types/reports";

export const useAdminReports = () => {
  return useQuery<{ patients: PatientWithReports[] }>({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const response = await fetch("/api/admin/reports");
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      return response.json();
    },
  });
};
