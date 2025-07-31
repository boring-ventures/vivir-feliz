import { useQuery } from "@tanstack/react-query";

interface PatientAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientAppointmentsResponse {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  appointments: PatientAppointment[];
  total: number;
}

export const usePatientAppointments = (patientId: string | undefined) => {
  return useQuery<PatientAppointmentsResponse>({
    queryKey: ["patient-appointments", patientId],
    queryFn: async () => {
      if (!patientId) {
        throw new Error("Patient ID is required");
      }

      const response = await fetch(
        `/api/admin/patients/${patientId}/appointments`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch patient appointments");
      }

      return response.json();
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
