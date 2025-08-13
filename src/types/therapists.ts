import { SpecialtyType, DayOfWeek, AppointmentType } from "@prisma/client";

export interface TherapistProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  specialty: SpecialtyType | null;
  avatarUrl: string | null;
  biography: string | null;
  nationalId: string | null;
  address: string | null;
  dateOfBirth: Date | null;
  acceptWhatsApp: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  schedule: TherapistSchedule | null;
  appointments: TherapistAppointment[];
  // Active therapist-patient relations for quick patients count in admin
  therapistPatients?: { id: string }[];
}

export interface TherapistSchedule {
  id: string;
  therapistId: string;
  isActive: boolean;
  timeZone: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  breakBetween: number;
  createdAt: Date;
  updatedAt: Date;
  timeSlots: TimeSlot[];
  restPeriods: RestPeriod[];
  blockedSlots: BlockedSlot[];
}

export interface TimeSlot {
  id: string;
  scheduleId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentTypes: AppointmentType[];
  maxAppointments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedSlot {
  id: string;
  scheduleId: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string | null;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TherapistAppointment {
  id: string;
  therapistId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  patientId: string | null;
  patientName: string;
  patientAge: number | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: string;
  notes: string | null;
  price: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilitySlot {
  day: string;
  time: string;
  available: boolean;
  hasAppointment: boolean;
  appointment?: TherapistAppointment;
}

export interface WeeklyAvailability {
  lunes: string[];
  martes: string[];
  miercoles: string[];
  jueves: string[];
  viernes: string[];
}

export interface RestPeriod {
  id: string;
  scheduleId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export DayOfWeek for convenience
export { DayOfWeek };
