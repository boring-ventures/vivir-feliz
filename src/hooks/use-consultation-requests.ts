"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export interface ConsultationChild {
  nombre: string;
  fechaNacimiento: string;
  gradoEscolar: string;
  problemas: boolean;
  descripcionProblemas: string;
}

export interface ConsultationReasonsData {
  dificultadesLenguaje: boolean;
  retrasoMotor: boolean;
  problemasCoordinacion: boolean;
  dificultadesAprendizaje: boolean;
  problemasAtencion: boolean;
  dificultadesInteraccion: boolean;
  indicadoresComportamiento: boolean;
  problemasComportamiento: boolean;
  dificultadesAlimentacion: boolean;
  dificultadesSueno: boolean;
  sensibilidadEstimulos: boolean;
  bajaAutoestima: boolean;
  dificultadesControl: boolean;
  dificultadesAutonomia: boolean;
  diagnosticoPrevio: boolean;
  diagnosticoTexto: string;
  otro: boolean;
  otroTexto: string;
  necesitaOrientacion: boolean;
  noSeguroDificultad: boolean;
  quiereValoracion: boolean;
  derivacionColegio: boolean;
  evaluacionReciente: boolean;
  evaluacionMedica: boolean;
  quienDeriva: string;
}

export interface ConsultationRequestFormData {
  // Child data
  childName: string;
  childGender: string;
  childDateOfBirth: string;
  childLivesWith: string;
  childOtherLivesWith?: string;
  childAddress: string;

  // Parent data
  motherName?: string;
  motherAge?: string;
  motherPhone?: string;
  motherEmail?: string;
  motherEducation?: string;
  motherOccupation?: string;
  fatherName?: string;
  fatherAge?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  fatherEducation?: string;
  fatherOccupation?: string;

  // School data
  schoolName?: string;
  schoolPhone?: string;
  schoolAddress?: string;
  schoolLevel?: string;
  teacherName?: string;

  // Additional children
  children?: ConsultationChild[];

  // Consultation reasons
  consultationReasons: ConsultationReasonsData;
  referredBy?: string;
}

export interface ConsultationRequest {
  id: string;
  childName: string;
  childGender: string;
  childDateOfBirth: string;
  childLivesWith: string;
  childOtherLivesWith?: string;
  childAddress: string;
  motherName?: string;
  motherAge?: string;
  motherPhone?: string;
  motherEmail?: string;
  motherEducation?: string;
  motherOccupation?: string;
  fatherName?: string;
  fatherAge?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  fatherEducation?: string;
  fatherOccupation?: string;
  schoolName?: string;
  schoolPhone?: string;
  schoolAddress?: string;
  schoolLevel?: string;
  teacherName?: string;
  consultationReasons: ConsultationReasonsData;
  referredBy?: string;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  assignedTherapistId?: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
  children?: Array<{
    id: string;
    name: string;
    dateOfBirth: string;
    schoolGrade: string;
    hasProblems: boolean;
    problemDescription?: string;
  }>;
  assignedTherapist?: {
    id: string;
    firstName?: string;
    lastName?: string;
    specialty?: string;
  };
}

export interface ConsultationRequestsResponse {
  consultationRequests: ConsultationRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Hook for creating consultation requests
export function useCreateConsultationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConsultationRequestFormData) => {
      const response = await fetch("/api/consultation-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la solicitud");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "¡Solicitud enviada!",
        description:
          data.message ||
          "Tu solicitud de consulta ha sido enviada exitosamente.",
      });

      // Invalidate and refetch consultation requests
      queryClient.invalidateQueries({ queryKey: ["consultation-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description:
          error.message ||
          "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });
}

// Hook for fetching consultation requests (for admin/therapist dashboard)
export function useConsultationRequests(options?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { page = 1, limit = 10, status } = options || {};

  return useQuery({
    queryKey: ["consultation-requests", { page, limit, status }],
    queryFn: async (): Promise<ConsultationRequestsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status && status !== "all") {
        params.append("status", status);
      }

      const response = await fetch(`/api/consultation-requests?${params}`);

      if (!response.ok) {
        throw new Error("Error al cargar las solicitudes");
      }

      return response.json();
    },
  });
}

// Hook for updating consultation request status
export function useUpdateConsultationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ConsultationRequest>;
    }) => {
      const response = await fetch(`/api/consultation-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la solicitud");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitud actualizada",
        description: "La solicitud ha sido actualizada exitosamente.",
      });

      // Invalidate and refetch consultation requests
      queryClient.invalidateQueries({ queryKey: ["consultation-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la solicitud.",
        variant: "destructive",
      });
    },
  });
}
 