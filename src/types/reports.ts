export interface FinalReport {
  id: string;
  patientId: string;
  coordinatorId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  reportDate: string;
  generalObjective: string | null;
  generalBackground: string | null;
  generalConclusions: string | null;
  otherObjectives: any | null;
  therapistBackgrounds: any | null;
  therapistProgress: any | null;
  therapistConclusions: any | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  coordinator: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

export interface TherapistData {
  therapistName: string;
  specialty: string;
  objectives?: string[];
  background?: string;
  indicators?: Indicator[];
  indicatorsComment?: string;
  conclusions?: string;
}

export interface Indicator {
  name: string;
  initialStatus: string;
  newStatus: string;
}
