"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export interface InterviewRequestFormData {
  childFirstName: string;
  childLastName: string;
  childDateOfBirth: string;
  childGender: "masculino" | "femenino";
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  schoolName: string;
  derivationDescription: string;
  derivationFileUrl?: string;
}

export interface InterviewRequest {
  id: string;
  childFirstName: string;
  childLastName: string;
  childDateOfBirth: string;
  childGender: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  schoolName: string;
  derivationDescription: string;
  derivationFileUrl?: string;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  assignedTherapistId?: string;
  createdAt: string;
  updatedAt: string;
  assignedTherapist?: {
    id: string;
    firstName?: string;
    lastName?: string;
    specialty?: string;
  };
}

export interface InterviewRequestsResponse {
  data: InterviewRequest[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// Hook for creating interview requests
export function useCreateInterviewRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InterviewRequestFormData) => {
      const response = await fetch("/api/interview-requests", {
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
          "Tu solicitud de entrevista ha sido enviada exitosamente.",
      });

      // Invalidate and refetch interview requests
      queryClient.invalidateQueries({ queryKey: ["interview-requests"] });
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

// Hook for fetching interview requests (for admin/therapist dashboard)
export function useInterviewRequests(options?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { page = 1, limit = 10, status = "all" } = options || {};

  return useQuery({
    queryKey: ["interview-requests", { page, limit, status }],
    queryFn: async (): Promise<InterviewRequestsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
      });

      const response = await fetch(`/api/interview-requests?${params}`);

      if (!response.ok) {
        throw new Error("Error al cargar las solicitudes");
      }

      return response.json();
    },
  });
}

// Hook for updating interview request status
export function useUpdateInterviewRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<InterviewRequest>;
    }) => {
      const response = await fetch(`/api/interview-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
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

      // Invalidate and refetch interview requests
      queryClient.invalidateQueries({ queryKey: ["interview-requests"] });
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
