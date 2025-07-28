import { useQuery } from "@tanstack/react-query";

export interface PatientHistoryData {
  patient: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    dateOfBirth?: string;
    gender?: string;
    school?: string;
    appointments: Array<{
      id: string;
      date: string;
      startTime: string;
      endTime: string;
      status: string;
      sessionNote?: {
        id: string;
        sessionComment: string;
        parentMessage?: string;
        createdAt: string;
      };
      objectiveProgress?: Array<{
        id: string;
        percentage: number;
        comment?: string;
        createdAt: string;
        objective: {
          id: string;
          name: string;
          type?: string;
        };
      }>;
    }>;
    treatmentProposals?: Array<{
      id: string;
      diagnosis?: string;
      totalSessions: number;
      status: string;
      recommendations?: string;
      frequency: string;
      createdAt: string;
      consultationRequest?: {
        schoolName?: string;
        schoolLevel?: string;
      };
    }>;
  };
}

async function fetchPatientHistory(
  patientId: string
): Promise<PatientHistoryData> {
  const response = await fetch(`/api/therapist/patients/${patientId}/history`);

  if (!response.ok) {
    throw new Error(`Error fetching patient history: ${response.statusText}`);
  }

  return response.json();
}

export function usePatientHistory(patientId: string) {
  return useQuery({
    queryKey: ["patient-history", patientId],
    queryFn: () => fetchPatientHistory(patientId),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
