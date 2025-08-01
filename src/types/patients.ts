import {
  Patient,
  TreatmentProposal,
  Payment,
  MedicalRecord,
  Appointment,
  Profile,
  ProposalStatus,
  PaymentStatus,
  AppointmentStatus,
  AppointmentType,
  SpecialtyType,
} from "@prisma/client";

// Extended types with relations
export interface PatientWithRelations extends Patient {
  parent: Profile;
  treatmentProposals: TreatmentProposalWithRelations[];
  appointments: AppointmentWithRelations[];
  medicalRecords: MedicalRecordWithRelations[];
}

export interface TreatmentProposalWithRelations extends TreatmentProposal {
  patient: PatientWithRelations;
  consultationRequest?: {
    id: string;
    childName: string;
    childDateOfBirth: Date;
    childGender: string;
    motherName?: string | null;
    motherPhone?: string | null;
    motherEmail?: string | null;
    fatherName?: string | null;
    fatherPhone?: string | null;
    fatherEmail?: string | null;
  };
  therapist: Profile;
  payments: Payment[];
  appointments: AppointmentWithRelations[];
}

export interface AppointmentWithRelations extends Appointment {
  therapist: Profile;
  patient?: PatientWithRelations;
  proposal?: TreatmentProposalWithRelations;
  medicalRecords: MedicalRecord[];
  sessionNote?: {
    id: string;
    sessionComment: string;
    parentMessage: string | null;
  } | null;
}

export interface MedicalRecordWithRelations extends MedicalRecord {
  patient: PatientWithRelations;
  appointment?: AppointmentWithRelations;
}

// API Response types
export interface PatientsResponse {
  patients: PatientWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface PatientDetailsResponse {
  patient: PatientWithRelations;
  treatmentHistory: TreatmentProposalWithRelations[];
  appointmentHistory: AppointmentWithRelations[];
  medicalHistory: MedicalRecordWithRelations[];
  statistics: PatientStatistics;
}

// Statistics interfaces
export interface PatientStatistics {
  totalProposals: number;
  activeProposals: number;
  completedTreatments: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPayments: number;
  pendingPayments: number;
  lastAppointment?: Date;
  nextAppointment?: Date;
}

export interface PatientsModuleStats {
  totalPatients: number;
  activePatients: number;
  proposalsSent: number;
  paymentsPending: number;
  paymentsConfirmed: number;
  appointmentsScheduled: number;
  activeTreatments: number;
  completedTreatments: number;
}

// Filter and search interfaces
export interface PatientFilters {
  status?: ProposalStatus[];
  therapistId?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasActiveProposal?: boolean;
  hasUpcomingAppointments?: boolean;
}

export interface PatientSearchParams {
  query?: string;
  filters?: PatientFilters;
  sortBy?: "name" | "age" | "proposalDate" | "lastAppointment";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Form interfaces
export interface CreatePatientForm {
  // Basic information
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: string;
  nationalId?: string;

  // Contact information
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Medical information
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
  specialNeeds?: string;

  // Parent information
  parentId: string;
}

export interface CreateTreatmentProposalForm {
  patientId: string;
  therapistId: string;

  // Proposal details
  title: string;
  description?: string;
  diagnosis?: string;
  objectives: string[];
  methodology?: string;

  // Treatment plan
  totalSessions: number;
  sessionDuration: number;
  frequency: string;
  estimatedDuration?: string;

  // Financial
  sessionPrice: number;
  totalAmount: number;
  paymentPlan?: string;

  // Notes
  notes?: string;
}

export interface UpdateProposalStatusForm {
  proposalId: string;
  status: ProposalStatus;
  notes?: string;
}

export interface ConfirmPaymentForm {
  proposalId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface ScheduleAppointmentsForm {
  proposalId: string;
  appointments: {
    date: Date;
    startTime: string;
    endTime: string;
    type: AppointmentType;
  }[];
}

// Display helper types
export interface ProposalDisplayData {
  id: string;
  patientName: string;
  patientAge: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  therapistName: string;
  proposalDate: string;
  totalAmount: string;
  status: ProposalStatus;
  statusDisplay: string;
  statusColor: string;
  paymentConfirmed: boolean;
  appointmentsScheduled: boolean;
  canConfirmPayment: boolean;
  canScheduleAppointments: boolean;
  timeAvailability?:
    | Record<string, { morning: boolean; afternoon: boolean }>
    | Array<{ day: string; morning: boolean; afternoon: boolean }>;
  selectedProposal?: string;
}

export interface AppointmentCalendarData {
  date: Date;
  timeSlots: {
    time: string;
    isAvailable: boolean;
    isSelected: boolean;
    isBooked: boolean;
  }[];
}

// Enums re-exported for convenience
export {
  ProposalStatus,
  PaymentStatus,
  AppointmentStatus,
  AppointmentType,
  SpecialtyType,
} from "@prisma/client";

// Status mapping utilities
export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  NEW_PROPOSAL: "Nueva Propuesta",
  PAYMENT_PENDING: "Pago Pendiente",
  PAYMENT_CONFIRMED: "Pago Confirmado",
  APPOINTMENTS_SCHEDULED: "Citas Programadas",
  TREATMENT_ACTIVE: "Tratamiento Activo",
  TREATMENT_COMPLETED: "Tratamiento Completado",
  CANCELLED: "Cancelado",
};

export const PROPOSAL_STATUS_COLORS: Record<ProposalStatus, string> = {
  NEW_PROPOSAL: "bg-yellow-100 text-yellow-800",
  PAYMENT_PENDING: "bg-red-100 text-red-800",
  PAYMENT_CONFIRMED: "bg-green-100 text-green-800",
  APPOINTMENTS_SCHEDULED: "bg-blue-100 text-blue-800",
  TREATMENT_ACTIVE: "bg-purple-100 text-purple-800",
  TREATMENT_COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  COMPLETED: "Completado",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No Asistió",
  RESCHEDULED: "Reprogramada",
};

export const SPECIALTY_LABELS: Record<SpecialtyType, string> = {
  SPEECH_THERAPIST: "Fonoaudiología",
  OCCUPATIONAL_THERAPIST: "Terapia Ocupacional",
  PSYCHOPEDAGOGUE: "Psicopedagogía",
  ASD_THERAPIST: "Especialista TEA",
  NEUROPSYCHOLOGIST: "Neuropsicología",
  COORDINATOR: "Coordinación",
  PSYCHOMOTRICIAN: "Psicomotricista",
  PEDIATRIC_KINESIOLOGIST: "Kinesiólogo Infantil",
  PSYCHOLOGIST: "Psicólogo",
  COORDINATION_ASSISTANT: "Asistente de Coordinación",
  BEHAVIORAL_THERAPIST: "Terapeuta Conductual",
};

// Patient types for therapist views
export interface PatientWithSessions {
  id: number;
  nombre: string;
  edad: number;
  genero: string;
  fechaInicio: string;
  sesiones: { completadas: number; totales: number };
  diagnostico: string;
  proximaCita: string;
  progreso: number;
  estado: string;
  estadoColor: string;
  padre: string;
  telefono: string;
  email: string;
  colegio: string;
  observaciones: string;
  objetivos: PatientObjective[];
  comentarios: PatientComment[];
  documentos: PatientDocument[];
  rawData?: {
    patient: PatientWithRelations | null;
    latestProposal: TreatmentProposalWithRelations | null;
    latestAppointment: AppointmentWithRelations | null;
    therapistPatient: PatientWithRelations | null;
  };
}

export interface PatientEvaluation {
  id: number;
  nombre: string;
  edad: number;
  genero: string;
  fechaConsulta: string;
  estado: string;
  estadoColor: string;
  tipo: string;
  padre?: string;
  telefono?: string;
  email?: string;
  colegio?: string;
  diagnostico?: string;
  fechaInicio?: string;
  sesiones?: { completadas: number; totales: number };
  proximaCita?: string;
  progreso?: number;
  observaciones?: string;
  objetivos?: PatientObjective[];
  comentarios?: PatientComment[];
  documentos?: PatientDocument[];
}

export interface PatientObjective {
  id: number;
  titulo: string;
  progreso: number;
  estado: string;
}

export interface PatientComment {
  id: number;
  fecha: string;
  sesion: number;
  comentario: string;
  paraPadre: string;
}

export interface PatientDocument {
  id: number;
  titulo: string;
  tipo: string;
  fecha: string;
  archivo: string;
}

// Request data types
export interface ConsultationRequestData {
  id: string;
  childName: string;
  childGender: string;
  childDateOfBirth: string;
  motherName?: string;
  motherPhone?: string;
  motherEmail?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  status: string;
}

export interface InterviewRequestData {
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
  status: string;
}
