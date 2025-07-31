import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Service {
  id: string;
  code: string;
  serviceName: string;
  description?: string;
  sessions: number;
  costPerSession: number;
  type: "EVALUATION" | "TREATMENT";
  specialty:
    | "SPEECH_THERAPIST"
    | "OCCUPATIONAL_THERAPIST"
    | "PSYCHOPEDAGOGUE"
    | "ASD_THERAPIST"
    | "NEUROPSYCHOLOGIST"
    | "COORDINATOR"
    | "PSYCHOMOTRICIAN"
    | "PEDIATRIC_KINESIOLOGIST"
    | "PSYCHOLOGIST"
    | "COORDINATION_ASSISTANT"
    | "BEHAVIORAL_THERAPIST";
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  code: string;
  serviceName: string;
  description?: string;
  sessions: number;
  costPerSession: number;
  type: "EVALUATION" | "TREATMENT";
  specialty:
    | "SPEECH_THERAPIST"
    | "OCCUPATIONAL_THERAPIST"
    | "PSYCHOPEDAGOGUE"
    | "ASD_THERAPIST"
    | "NEUROPSYCHOLOGIST"
    | "COORDINATOR"
    | "PSYCHOMOTRICIAN"
    | "PEDIATRIC_KINESIOLOGIST"
    | "PSYCHOLOGIST"
    | "COORDINATION_ASSISTANT"
    | "BEHAVIORAL_THERAPIST";
  status?: boolean;
}

export interface UpdateServiceData extends CreateServiceData {
  status: boolean;
}

// Fetch all services
export const useServices = () => {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      return response.json();
    },
  });
};

// Create a new service
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceData) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create service");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

// Update a service
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateServiceData;
    }) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update service");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

// Delete a service
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete service");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
