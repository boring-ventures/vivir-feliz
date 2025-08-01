import { useQuery } from "@tanstack/react-query";

interface ExistingProposalData {
  quienTomaConsulta: string;
  derivacion: string;
  timeAvailability:
    | Record<string, { morning: boolean; afternoon: boolean }>
    | Array<{ day: string; morning: boolean; afternoon: boolean }>;
  serviciosEvaluacionA: Array<{
    codigo: string;
    terapeutaId: string;
    terapeutaNombre: string;
    terapeutaEspecialidad: string;
    servicio: string;
    sesiones: number;
    proposalType: string;
  }>;
  serviciosTratamientoA: Array<{
    codigo: string;
    terapeutaId: string;
    terapeutaNombre: string;
    terapeutaEspecialidad: string;
    servicio: string;
    sesiones: number;
    proposalType: string;
  }>;
  serviciosEvaluacionB: Array<{
    codigo: string;
    terapeutaId: string;
    terapeutaNombre: string;
    terapeutaEspecialidad: string;
    servicio: string;
    sesiones: number;
    proposalType: string;
  }>;
  serviciosTratamientoB: Array<{
    codigo: string;
    terapeutaId: string;
    terapeutaNombre: string;
    terapeutaEspecialidad: string;
    servicio: string;
    sesiones: number;
    proposalType: string;
  }>;
}

export const useExistingProposal = (appointmentId: string) => {
  return useQuery<ExistingProposalData>({
    queryKey: ["existing-proposal", appointmentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}/proposal`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No existing proposal found, return null
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch existing proposal");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!appointmentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
