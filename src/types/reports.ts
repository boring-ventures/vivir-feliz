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
  otherObjectives: TherapistData[] | null;
  therapistBackgrounds: TherapistData[] | null;
  therapistProgress: TherapistData[] | null;
  therapistConclusions: TherapistData[] | null;
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

export interface ProgressReport {
  id: string;
  patientId: string;
  therapistId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school?: string;
  grade?: string;
  reportDate: string;
  treatmentArea: string;
  diagnoses?: string[];
  generalObjective?: string;
  specificObjectives?: string[];
  indicators?: string[];
  progressEntries?: string[];
  recommendations?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

export interface TherapistReportContribution {
  id: string;
  patientId: string;
  therapistId: string;
  objectives?: string[];
  background?: string;
  indicators?: string[];
  indicatorsComment?: string;
  conclusions?: string;
  createdAt: string;
  updatedAt: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

export interface TherapeuticPlan {
  id: string;
  patientId: string;
  therapistId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school?: string;
  grade?: string;
  objectivesDate?: string;
  planning?: string;
  treatmentArea: string;
  frequency?: string;
  therapyStartDate?: string;
  background?: string;
  diagnoses?: string[];
  generalObjective?: string;
  specificObjectives?: string[];
  indicators?: string[];
  methodologies?: string[];
  observations?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

export interface PatientWithReports {
  id: string;
  name: string;
  dateOfBirth: string;
  age: string;
  finalReports: FinalReport[];
  progressReports: ProgressReport[];
  therapeuticPlans: TherapeuticPlan[];
  therapistContributions: TherapistReportContribution[];
  totalReports: number;
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
