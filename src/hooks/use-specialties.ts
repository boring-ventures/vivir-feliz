import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Specialty {
  id: string;
  specialtyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialtyData {
  specialtyId: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSpecialtyData {
  specialtyId: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

// Fetch all specialties
export const useSpecialties = () => {
  return useQuery<Specialty[]>({
    queryKey: ["specialties"],
    queryFn: async () => {
      const response = await fetch("/api/specialties");
      if (!response.ok) {
        throw new Error("Failed to fetch specialties");
      }
      return response.json();
    },
  });
};

// Fetch active specialties only
export const useActiveSpecialties = () => {
  return useQuery<Specialty[]>({
    queryKey: ["specialties", "active"],
    queryFn: async () => {
      const response = await fetch("/api/specialties");
      if (!response.ok) {
        throw new Error("Failed to fetch specialties");
      }
      const specialties = await response.json();
      return specialties.filter((specialty: Specialty) => specialty.isActive);
    },
  });
};

// Fetch single specialty
export const useSpecialty = (id: string) => {
  return useQuery<Specialty>({
    queryKey: ["specialties", id],
    queryFn: async () => {
      const response = await fetch(`/api/specialties/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch specialty");
      }
      return response.json();
    },
    enabled: !!id,
  });
};

// Create specialty
export const useCreateSpecialty = () => {
  const queryClient = useQueryClient();

  return useMutation<Specialty, Error, CreateSpecialtyData>({
    mutationFn: async (data) => {
      const response = await fetch("/api/specialties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create specialty");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
    },
  });
};

// Update specialty
export const useUpdateSpecialty = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Specialty,
    Error,
    { id: string; data: UpdateSpecialtyData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/specialties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update specialty");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties", id] });
    },
  });
};

// Delete specialty
export const useDeleteSpecialty = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/specialties/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete specialty");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
    },
  });
};
