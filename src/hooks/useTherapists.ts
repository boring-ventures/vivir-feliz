"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WeeklyAvailability, TherapistProfile } from "@/types/therapists";

export interface Therapist {
  id: string;
  firstName: string | null;
  lastName: string | null;
  specialty: {
    id: string;
    specialtyId: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  active: boolean;
}

// Hook for basic therapist data (used in selectors)
export const useTherapists = (specialty?: string) => {
  return useQuery<Therapist[]>({
    queryKey: ["therapists", specialty],
    queryFn: async () => {
      const url = specialty
        ? `/api/therapists?specialty=${encodeURIComponent(specialty)}`
        : "/api/therapists";

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch therapists");
      }

      const result = await response.json();
      return result; // Return the result directly, not result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for full therapist data with schedules (used in admin)
export const useTherapistsWithSchedule = () => {
  return useQuery<TherapistProfile[]>({
    queryKey: ["therapists", "admin"],
    queryFn: async (): Promise<TherapistProfile[]> => {
      const response = await fetch("/api/admin/therapists");
      if (!response.ok) {
        throw new Error("Failed to fetch therapists");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useUpdateTherapistSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      therapistId,
      availability,
    }: {
      therapistId: string;
      availability: WeeklyAvailability;
    }) => {
      const response = await fetch(
        `/api/admin/therapists/${therapistId}/schedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ availability }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapists"] });
    },
  });
};

// Utility function to get therapist display name
export const getTherapistDisplayName = (therapist: Therapist): string => {
  const firstName = therapist.firstName || "";
  const lastName = therapist.lastName || "";
  return `${firstName} ${lastName}`.trim() || "Sin nombre";
};

// Utility function to get specialty display name - updated to handle both string and object types
export const getSpecialtyDisplayName = (
  specialty:
    | string
    | {
        id: string;
        specialtyId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      }
    | null
): string => {
  // If specialty is null, return default message
  if (!specialty) {
    return "No especificado";
  }

  // If specialty is a string (legacy format), use the old mapping
  if (typeof specialty === "string") {
    const specialtyMap: Record<string, string> = {
      SPEECH_THERAPIST: "Fonoaudiólogo",
      OCCUPATIONAL_THERAPIST: "Terapeuta Ocupacional",
      PSYCHOPEDAGOGUE: "Psicopedagogo",
      ASD_THERAPIST: "Terapeuta TEA",
      NEUROPSYCHOLOGIST: "Neuropsicólogo",
      COORDINATOR: "Coordinador",
      PSYCHOMOTRICIAN: "Psicomotricista",
      PEDIATRIC_KINESIOLOGIST: "Kinesiólogo Pediátrico",
      PSYCHOLOGIST: "Psicólogo",
      COORDINATION_ASSISTANT: "Asistente de Coordinación",
      BEHAVIORAL_THERAPIST: "Terapeuta Conductual",
    };
    return specialtyMap[specialty] || specialty;
  }

  // If specialty is an object (new format), return the name
  return specialty.name || "No especificado";
};
