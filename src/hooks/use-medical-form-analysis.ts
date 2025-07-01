import { useQuery } from "@tanstack/react-query";

interface HospitalizationRecord {
  motivo: string;
  edad: string;
}

interface MedicationRecord {
  nombre: string;
  dosis: string;
  motivo: string;
}

export interface MedicalFormData {
  basicInfo: {
    childName: string;
    childBirthDate: string;
    childAgeYears?: string;
    childAgeMonths?: string;
  };
  perinatalHistory: {
    pregnancyType?: string;
    prematureWeeks?: string;
    postTermWeeks?: string;
    pregnancyComplications?: string;
    deliveryType?: string;
    cesareanReason?: string;
    birthWeight?: string;
    birthHeight?: string;
    deliveryComplications?: string;
    complicationDetails?: string;
    specialCare?: string[];
    hospitalizationDays?: string;
    hospitalizationReason?: string;
  };
  medicalHistory: {
    importantIllnesses?: string[];
    otherIllness?: string;
    hospitalizations?: HospitalizationRecord[];
    previousSurgeries?: string;
    surgeryDetails?: string;
    surgeryAge?: string;
  };
  medicationsAllergies: {
    takesMedications?: string;
    medications?: MedicationRecord[];
    foodAllergies?: string[];
    otherFoodAllergy?: string;
    medicationAllergies?: string[];
    otherMedicationAllergy?: string;
    otherAllergies?: string[];
    otherAllergyDescription?: string;
  };
  motorDevelopment: {
    headControlAge?: string;
    sittingAge?: string;
    crawlingAge?: string;
    walkingAge?: string;
    climbsStairs?: boolean;
    balanceDifficulties?: string;
    balanceDifficultyDetails?: string;
    fineMotorSkills?: string[];
    blockTowers?: string;
    fineMotorDifficulties?: string;
    fineMotorDifficultyDetails?: string;
  };
  languageCognition: {
    firstWordsAge?: string;
    twoWordPhrasesAge?: string;
    completeSentences?: boolean;
    currentCommunication?: string[];
    otherCommunication?: string;
    comprehension?: string;
    followsSimpleInstructions?: boolean;
    followsComplexInstructions?: boolean;
    respondsToName?: boolean;
    cognitiveDevelopment?: string[];
    learningDifficulties?: string;
  };
  socialEmotional: {
    interactsWithChildren?: string;
    interactionDetails?: string;
    sharesToys?: boolean;
    expressesEmotions?: boolean;
    tantrums?: string;
    tantrumFrequency?: string;
    adaptsToChanges?: string;
    repetitiveBehaviors?: string;
    behaviorDetails?: string;
    feedingHabits?: string[];
    usesUtensils?: boolean;
    sleepHabits?: string[];
    daytimeToiletControl?: string;
    nighttimeToiletControl?: string;
    usesDiapers?: boolean;
    diaperAge?: string;
  };
  familyInfo: {
    livesWithWhom?: string;
    hasSiblings?: string;
    numberOfSiblings?: string;
    siblingsAges?: string;
    familyEnvironment?: string;
    recentChanges?: string;
    typesOfChanges?: string[];
    otherChange?: string;
    changeDetails?: string;
    familyHistory?: string;
    familyHistoryDetails?: string;
  };
  submittedAt?: string;
  status?: string;
}

export interface AppointmentData {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  patientName: string;
  patientAge?: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  notes?: string;
  status: string;
}

interface PatientData {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

interface TherapistData {
  id?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

export interface AnalysisData {
  appointment: AppointmentData;
  medicalForm: MedicalFormData | null;
  patient?: PatientData;
  therapist?: TherapistData;
}

// Hook to fetch appointment and medical form data for analysis
export const useMedicalFormAnalysis = (appointmentId: string) => {
  return useQuery<AnalysisData>({
    queryKey: ["medical-form-analysis", appointmentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}/medical-form`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analysis data");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!appointmentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook to check if medical form exists for an appointment
export const useMedicalFormExists = (appointmentId: string) => {
  return useQuery<boolean>({
    queryKey: ["medical-form-exists", appointmentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/medical-forms?appointmentId=${appointmentId}`
      );

      if (response.status === 404) {
        return false;
      }

      if (!response.ok) {
        throw new Error("Failed to check medical form");
      }

      return true;
    },
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
