// Updated to work with the new Specialty model structure
export interface Specialty {
  id: string;
  specialtyId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy type for backward compatibility (if needed)
export type SpecialtyType =
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

// Legacy labels for backward compatibility
export const SPECIALTY_LABELS_ES: Record<SpecialtyType, string> = {
  SPEECH_THERAPIST: "Fonoaudiólogo",
  OCCUPATIONAL_THERAPIST: "Terapeuta Ocupacional",
  PSYCHOPEDAGOGUE: "Psicopedagogo",
  ASD_THERAPIST: "Terapeuta TEA",
  NEUROPSYCHOLOGIST: "Neuropsicólogo",
  COORDINATOR: "Coordinador o Asistente",
  PSYCHOMOTRICIAN: "Psicomotricista",
  PEDIATRIC_KINESIOLOGIST: "Kinesiólogo Pediátrico",
  PSYCHOLOGIST: "Psicólogo",
  COORDINATION_ASSISTANT: "Asistente de Coordinación",
  BEHAVIORAL_THERAPIST: "Terapeuta Conductual",
};

// Updated function to handle both new object structure and legacy string structure
export const getSpecialtyLabelEs = (
  specialty?: string | Specialty | null
): string => {
  if (!specialty) return "Sin especialidad";

  // If specialty is an object (new structure), use the name
  if (typeof specialty === "object" && "name" in specialty) {
    return specialty.name || "Sin especialidad";
  }

  // If specialty is a string (legacy structure), use the mapping
  if (typeof specialty === "string") {
    return SPECIALTY_LABELS_ES[specialty as SpecialtyType] || specialty;
  }

  return "Sin especialidad";
};

// Updated helper function to check if a user is a coordinator
export const isCoordinator = (
  specialty: string | Specialty | null | undefined
): boolean => {
  if (!specialty) return false;

  // If specialty is an object (new structure), check specialtyId
  if (typeof specialty === "object" && "specialtyId" in specialty) {
    return specialty.specialtyId === "COORDINATOR";
  }

  // If specialty is a string (old structure), check directly
  if (typeof specialty === "string") {
    return specialty === "COORDINATOR";
  }

  return false;
};

// Helper function to get specialty display name (consistent with useTherapists hook)
export const getSpecialtyDisplayName = (
  specialty: string | Specialty | null
): string => {
  if (!specialty) return "Sin especialidad";

  // If specialty is an object (new structure), use the name
  if (typeof specialty === "object" && "name" in specialty) {
    return specialty.name || "Sin especialidad";
  }

  // If specialty is a string (legacy structure), use the mapping
  if (typeof specialty === "string") {
    return SPECIALTY_LABELS_ES[specialty as SpecialtyType] || specialty;
  }

  return "Sin especialidad";
};
