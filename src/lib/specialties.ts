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

export const getSpecialtyLabelEs = (value?: string | null): string => {
  if (!value) return "Sin especialidad";
  return SPECIALTY_LABELS_ES[value as SpecialtyType] || value;
};
