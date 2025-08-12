"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Info,
  Loader2,
  Users,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useTherapistsWithSchedule } from "@/hooks/useTherapists";
import {
  TherapistProfile,
  WeeklyAvailability,
  DayOfWeek,
  TherapistAppointment,
} from "@/types/therapists";
import { SpecialtyType } from "@prisma/client";

// Utility functions
const getSpecialtyDisplay = (specialty: SpecialtyType | null): string => {
  const specialtyMap: Record<SpecialtyType, string> = {
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
  return specialty ? specialtyMap[specialty] : "Sin especialidad";
};

const getTherapistColor = (index: number): string => {
  const colors = [
    "#4f46e5",
    "#10b981",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#06b6d4",
  ];
  return colors[index % colors.length];
};

const getFullName = (therapist: TherapistProfile): string => {
  return (
    `${therapist.firstName || ""} ${therapist.lastName || ""}`.trim() ||
    "Sin nombre"
  );
};

// Convert HH:mm to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to get rest periods for a therapist
const getTherapistRestPeriods = (therapist: TherapistProfile): string => {
  if (
    !therapist.schedule?.restPeriods ||
    therapist.schedule.restPeriods.length === 0
  ) {
    return "Sin períodos de descanso";
  }

  const restPeriodsByDay = therapist.schedule.restPeriods.reduce(
    (acc, period) => {
      const dayName = reverseDayMapping[period.dayOfWeek];
      if (dayName) {
        if (!acc[dayName]) {
          acc[dayName] = [];
        }
        acc[dayName].push(`${period.startTime}-${period.endTime}`);
      }
      return acc;
    },
    {} as Record<string, string[]>
  );

  const dayNames = ["lunes", "martes", "miercoles", "jueves", "viernes"];
  const restDays = dayNames.filter((day) => restPeriodsByDay[day]?.length > 0);

  if (restDays.length === 0) {
    return "Sin períodos de descanso";
  }

  // If all work days have the same rest period, show it in a compact format
  const firstDayPeriods = restPeriodsByDay[restDays[0]];
  const allSamePeriods = restDays.every(
    (day) =>
      restPeriodsByDay[day].length === firstDayPeriods.length &&
      restPeriodsByDay[day].every(
        (period, index) => period === firstDayPeriods[index]
      )
  );

  if (allSamePeriods && restDays.length > 1) {
    return `L-V: ${firstDayPeriods.join(", ")}`;
  }

  // Otherwise show detailed format
  return restDays
    .map((day) => {
      const dayDisplay = day.charAt(0).toUpperCase();
      return `${dayDisplay}: ${restPeriodsByDay[day].join(", ")}`;
    })
    .join(" | ");
};

// Day mapping
const dayMapping: Record<string, DayOfWeek> = {
  lunes: "MONDAY",
  martes: "TUESDAY",
  miercoles: "WEDNESDAY",
  jueves: "THURSDAY",
  viernes: "FRIDAY",
};

const reverseDayMapping: Record<DayOfWeek, string> = {
  MONDAY: "lunes",
  TUESDAY: "martes",
  WEDNESDAY: "miercoles",
  THURSDAY: "jueves",
  FRIDAY: "viernes",
  SATURDAY: "sabado",
  SUNDAY: "domingo",
};

// Time slots and days
const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes"];
const diasSemanaDisplay = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

// Helper: return Monday of the week for a given date
const getMondayOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Helper: get all dates for current week (Mon-Fri)
const getWeekDates = (base: Date): Date[] => {
  const monday = getMondayOfWeek(base);
  return [0, 1, 2, 3, 4].map((offset) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + offset);
    dt.setHours(0, 0, 0, 0);
    return dt;
  });
};

export default function TherapistsPage() {
  const [selectedDate, setSelectedDate] = useState<string>("Semana Actual");
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [selectedTherapist, setSelectedTherapist] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    startTime: string;
    endTime?: string;
    patientName?: string;
    type?: string;
    status?: string;
    date?: string;
    parentPhone?: string;
    therapistInfo?: TherapistProfile;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("calendario");

  // Fetch therapists data
  const {
    data: therapists = [],
    isLoading,
    error,
  } = useTherapistsWithSchedule();

  // Generate dynamic time slots based on therapists' actual schedules
  const getAvailableTimeSlots = useCallback((): string[] => {
    if (therapists.length === 0) return [];

    const allTimeSlots = new Set<string>();

    // Collect all time intervals from all therapists' schedules
    therapists.forEach((therapist) => {
      if (therapist.schedule?.timeSlots) {
        therapist.schedule.timeSlots.forEach((slot) => {
          // Generate all 30-minute intervals between startTime and endTime
          const startMinutes = timeToMinutes(slot.startTime);
          const endMinutes = timeToMinutes(slot.endTime);

          for (
            let minutes = startMinutes;
            minutes < endMinutes;
            minutes += 30
          ) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeSlot = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
            allTimeSlots.add(timeSlot);
          }
        });
      }
    });

    // Also include rest period times to ensure they're visible
    therapists.forEach((therapist) => {
      if (therapist.schedule?.restPeriods) {
        therapist.schedule.restPeriods.forEach((period) => {
          // Add time slots during rest periods so they show up
          const startMinutes = timeToMinutes(period.startTime);
          const endMinutes = timeToMinutes(period.endTime);

          for (
            let minutes = startMinutes;
            minutes < endMinutes;
            minutes += 30
          ) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeSlot = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
            allTimeSlots.add(timeSlot);
          }
        });
      }
    });

    // Also include appointment times to ensure they're visible
    therapists.forEach((therapist) => {
      therapist.appointments.forEach((appointment) => {
        allTimeSlots.add(appointment.startTime);
        // Also add slots until end time if appointment is longer than 30 minutes
        const startMinutes = timeToMinutes(appointment.startTime);
        const endMinutes = timeToMinutes(appointment.endTime);

        for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const timeSlot = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
          allTimeSlots.add(timeSlot);
        }
      });
    });

    // Convert to sorted array
    const sortedSlots = Array.from(allTimeSlots).sort((a, b) => {
      return timeToMinutes(a) - timeToMinutes(b);
    });

    return sortedSlots;
  }, [therapists]);

  // Get the dynamic time slots (recompute when therapists or week changes)
  const horarios = useMemo(() => getAvailableTimeSlots(), [weekStart, getAvailableTimeSlots]);

  // Convert database schedule to weekly availability format
  const getTherapistAvailability = (
    therapist: TherapistProfile
  ): WeeklyAvailability => {
    const availability: WeeklyAvailability = {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
    };

    if (therapist.schedule?.timeSlots) {
      therapist.schedule.timeSlots.forEach((slot) => {
        const dayName = reverseDayMapping[slot.dayOfWeek];
        if (dayName && availability[dayName as keyof WeeklyAvailability]) {
          availability[dayName as keyof WeeklyAvailability].push(
            slot.startTime
          );
        }
      });
    }

    return availability;
  };

  // Filter therapists based on search
  const filteredTherapists = useMemo(() => {
    if (!searchQuery) return therapists;

    return therapists.filter((therapist) => {
      const fullName = getFullName(therapist).toLowerCase();
      const specialty = getSpecialtyDisplay(therapist.specialty).toLowerCase();
      const query = searchQuery.toLowerCase();

      return fullName.includes(query) || specialty.includes(query);
    });
  }, [therapists, searchQuery]);

  // Get therapist by ID
  const getTherapistById = (id: string) => {
    return therapists.find((t) => t.id === id);
  };

  // Check if therapist has any available slots at all
  const hasAnyAvailability = (therapist: TherapistProfile): boolean => {
    return (
      therapist.schedule?.timeSlots?.some((slot) => slot.isAvailable) || false
    );
  };

  // Get time slot duration for a therapist (in minutes)
  const getSlotDuration = (therapist: TherapistProfile): number => {
    return therapist.schedule?.slotDuration || 30;
  };

  // Map JS getDay (0..6) to DayOfWeek enum
  const jsDayToPrismaDay: Record<number, DayOfWeek> = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
  };

  // (helpers defined at module scope)

  // Get all dates for current month
  const getMonthDates = (base: Date): Date[] => {
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const dates: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      dates.push(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  // Week dates Mon-Fri for current selection
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  // Format dd/MM for headers
  const formatShortDate = (date: Date): string =>
    date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });

  // Minutes overlap for [aStart,aEnd) and [bStart,bEnd)
  const minutesOverlap = (
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string
  ): number => {
    const sA = timeToMinutes(aStart);
    const eA = timeToMinutes(aEnd);
    const sB = timeToMinutes(bStart);
    const eB = timeToMinutes(bEnd);
    const start = Math.max(sA, sB);
    const end = Math.min(eA, eB);
    return Math.max(0, end - start);
  };

  // Compute available minutes for a specific date (considers timeSlots of that weekday, minus rest periods and blocked slots on that date)
  const computeAvailableMinutesForDate = (
    therapist: TherapistProfile,
    date: Date
  ): number => {
    if (!therapist.schedule) return 0;

    const schedule = therapist.schedule;
    const dow: DayOfWeek = jsDayToPrismaDay[date.getDay()];

    // Sum minutes for time slots of this day
    let minutes = 0;
    const daySlots = schedule.timeSlots?.filter(
      (s) => s.dayOfWeek === dow && s.isAvailable
    );
    for (const slot of daySlots || []) {
      minutes += timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
    }

    if (minutes === 0) return 0;

    // Subtract rest periods that match this day
    const rests =
      schedule.restPeriods?.filter((r) => r.dayOfWeek === dow) || [];
    for (const slot of daySlots || []) {
      for (const rest of rests) {
        minutes -= minutesOverlap(
          slot.startTime,
          slot.endTime,
          rest.startTime,
          rest.endTime
        );
      }
    }

    // Subtract blocked slots for this exact date
    const dateStr = date.toDateString();
    const blocked = schedule.blockedSlots?.filter(
      (b) => new Date(b.date).toDateString() === dateStr
    );
    for (const slot of daySlots || []) {
      for (const b of blocked || []) {
        minutes -= minutesOverlap(
          slot.startTime,
          slot.endTime,
          b.startTime,
          b.endTime
        );
      }
    }

    return Math.max(0, minutes);
  };

  // Check if a time slot is blocked
  const isTimeSlotBlocked = (
    therapist: TherapistProfile,
    day: string,
    time: string
  ): boolean => {
    if (!therapist.schedule?.blockedSlots) return false;

    const dayOfWeek = dayMapping[day];
    if (!dayOfWeek) return false;

    // Use selected week's Monday to calculate the actual date
    const currentWeekStart = new Date(weekStart);

    const dayIndex = diasSemana.indexOf(day);
    if (dayIndex === -1) return false;

    const targetDate = new Date(currentWeekStart);
    targetDate.setDate(currentWeekStart.getDate() + dayIndex);

    const timeMinutes = timeToMinutes(time);

    return therapist.schedule.blockedSlots.some((blockedSlot) => {
      const blockedDate = new Date(blockedSlot.date);
      const isSameDate =
        blockedDate.toDateString() === targetDate.toDateString();

      if (!isSameDate) return false;

      const blockedStartMinutes = timeToMinutes(blockedSlot.startTime);
      const blockedEndMinutes = timeToMinutes(blockedSlot.endTime);

      return (
        timeMinutes >= blockedStartMinutes && timeMinutes < blockedEndMinutes
      );
    });
  };

  // Helper function to check if a time slot is during a rest period
  const isRestPeriod = (
    therapist: TherapistProfile,
    day: string,
    time: string
  ): boolean => {
    if (!therapist.schedule?.restPeriods) return false;

    const dayOfWeek = dayMapping[day];
    if (!dayOfWeek) return false;

    return therapist.schedule.restPeriods.some((period) => {
      if (period.dayOfWeek !== dayOfWeek) return false;

      const timeMinutes = timeToMinutes(time);
      const startMinutes = timeToMinutes(period.startTime);
      const endMinutes = timeToMinutes(period.endTime);

      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    });
  };

  // Check if therapist is available at specific time
  const isTherapistAvailable = (
    therapist: TherapistProfile,
    day: string,
    time: string
  ): boolean => {
    if (!therapist.schedule?.timeSlots) return false;

    const dayOfWeek = dayMapping[day];
    if (!dayOfWeek) return false;

    const timeMinutes = timeToMinutes(time);

    return therapist.schedule.timeSlots.some((slot) => {
      if (slot.dayOfWeek !== dayOfWeek || !slot.isAvailable) return false;

      const slotStartMinutes = timeToMinutes(slot.startTime);
      const slotEndMinutes = timeToMinutes(slot.endTime);

      // Check if the time falls within this time slot
      return timeMinutes >= slotStartMinutes && timeMinutes < slotEndMinutes;
    });
  };

  // Get appointment for specific time slot
  const getAppointmentForSlot = (
    therapistId: string,
    day: string,
    time: string
  ) => {
    const therapist = getTherapistById(therapistId);
    if (!therapist) return null;

    // Use selected week's Monday to calculate the actual date
    const currentWeekStart = new Date(weekStart); // Monday

    // Calculate the actual date for the given day
    const dayIndex = diasSemana.indexOf(day);
    if (dayIndex === -1) return null;

    const targetDate = new Date(currentWeekStart);
    targetDate.setDate(currentWeekStart.getDate() + dayIndex);

    const timeMinutes = timeToMinutes(time);

    // Find appointment that matches the date and time
    return therapist.appointments.find((appointment) => {
      const appointmentDate = new Date(appointment.date);
      const appointmentStartMinutes = timeToMinutes(appointment.startTime);
      const appointmentEndMinutes = timeToMinutes(appointment.endTime);

      // Check if appointment is on the same date
      const isSameDate =
        appointmentDate.toDateString() === targetDate.toDateString();

      // Check if the current time slot overlaps with the appointment
      const timeOverlaps =
        timeMinutes >= appointmentStartMinutes &&
        timeMinutes < appointmentEndMinutes;

      return isSameDate && timeOverlaps;
    });
  };

  // Open appointment modal
  const openAppointmentModal = (
    appointment: TherapistAppointment,
    therapist: TherapistProfile
  ) => {
    const parsedDate = new Date(String(appointment.date));
    setSelectedAppointment({
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientName: appointment.patientName,
      type: appointment.type,
      status: appointment.status,
      date: parsedDate.toISOString(),
      parentPhone: appointment.parentPhone,
      therapistInfo: therapist,
    });
    setIsModalOpen(true);
  };

  // Open calendar for editing
  const openCalendar = (therapist: TherapistProfile) => {
    // Set the selected therapist to show only their schedule
    setSelectedTherapist(therapist.id);
    // Switch to calendar tab
    setActiveTab("calendario");
  };

  // Calculate statistics
  const totalTherapists = therapists.length;
  const activeTherapists = therapists.filter((t) => t.active).length;
  const totalAppointments = therapists.reduce(
    (sum, t) => sum + t.appointments.length,
    0
  );
  const availableTherapists = therapists.filter((t) =>
    hasAnyAvailability(t)
  ).length;

  // Render calendar cell
  const renderCalendarCell = (
    therapistId: string,
    dia: string,
    hora: string
  ) => {
    if (therapistId === "todos") {
      // Show all therapists view
      const availableTherapists: TherapistProfile[] = [];
      const appointmentsAtTime: Array<{
        appointment: TherapistAppointment;
        therapist: TherapistProfile;
      }> = [];

      therapists.forEach((therapist) => {
        const appointment = getAppointmentForSlot(therapist.id, dia, hora);
        if (appointment) {
          appointmentsAtTime.push({ appointment, therapist });
        } else if (
          isTherapistAvailable(therapist, dia, hora) &&
          !isRestPeriod(therapist, dia, hora)
        ) {
          availableTherapists.push(therapist);
        }
      });

      // Show appointments first
      if (appointmentsAtTime.length > 0) {
        return (
          <div className="h-full flex flex-col gap-1 p-1">
            {appointmentsAtTime
              .slice(0, 2)
              .map(({ appointment, therapist }) => (
                <div
                  key={appointment.id}
                  className="text-xs p-1 rounded-md flex items-center justify-between cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: `${getTherapistColor(therapists.indexOf(therapist))}20`,
                    borderLeft: `3px solid ${getTherapistColor(therapists.indexOf(therapist))}`,
                  }}
                  onClick={() => openAppointmentModal(appointment, therapist)}
                >
                  <span className="font-medium truncate">
                    {appointment.patientName}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {getFullName(therapist).split(" ")[0]}
                  </span>
                </div>
              ))}
            {appointmentsAtTime.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{appointmentsAtTime.length - 2} más
              </div>
            )}
          </div>
        );
      }

      // Show available therapists
      if (availableTherapists.length > 0) {
        return (
          <div className="h-full flex items-center justify-center">
            <Badge
              variant="outline"
              className="text-xs bg-green-50 text-green-700 border-green-200"
            >
              {availableTherapists.length} disponible
              {availableTherapists.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        );
      }

      // Check if any therapist has rest period at this time
      const hasRestPeriod = therapists.some((therapist) =>
        isRestPeriod(therapist, dia, hora)
      );
      if (hasRestPeriod) {
        return (
          <div className="h-full bg-orange-50 border border-dashed border-orange-200 text-orange-600 text-xs flex items-center justify-center">
            <span>Descanso</span>
          </div>
        );
      }

      return (
        <div className="h-full bg-gray-50 text-gray-400 text-xs flex items-center justify-center">
          No disponible
        </div>
      );
    }

    // Single therapist view
    const therapist = getTherapistById(therapistId);
    if (!therapist) return null;

    // Check for appointment first
    const appointment = getAppointmentForSlot(therapistId, dia, hora);
    if (appointment) {
      return (
        <div
          className="h-full p-1 rounded-md flex flex-col justify-between cursor-pointer hover:opacity-80"
          style={{
            backgroundColor: `${getTherapistColor(therapists.indexOf(therapist))}20`,
            borderLeft: `3px solid ${getTherapistColor(therapists.indexOf(therapist))}`,
          }}
          onClick={() => openAppointmentModal(appointment, therapist)}
        >
          <div className="font-medium text-sm truncate">
            {appointment.patientName}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">{appointment.type}</span>
            <Badge
              variant={
                ["CONFIRMED", "COMPLETED", "IN_PROGRESS"].includes(
                  appointment.status
                )
                  ? "default"
                  : "outline"
              }
              className="text-xs"
            >
              {["CONFIRMED", "COMPLETED", "IN_PROGRESS"].includes(
                appointment.status
              )
                ? "Confirmada"
                : "Pendiente"}
            </Badge>
          </div>
        </div>
      );
    }

    // Check if time slot is blocked
    if (isTimeSlotBlocked(therapist, dia, hora)) {
      return (
        <div className="h-full bg-red-50 border border-dashed border-red-200 text-red-600 text-xs flex items-center justify-center">
          <div className="flex flex-col items-center">
            <span>Bloqueado</span>
          </div>
        </div>
      );
    }

    // Check if this time slot is during a rest period
    if (isRestPeriod(therapist, dia, hora)) {
      return (
        <div className="h-full bg-orange-50 border border-dashed border-orange-200 text-orange-600 text-xs flex items-center justify-center">
          <div className="flex flex-col items-center">
            <span>Descanso</span>
          </div>
        </div>
      );
    }

    // Check if therapist is available
    if (isTherapistAvailable(therapist, dia, hora)) {
      return (
        <div className="h-full bg-green-50 border border-dashed border-green-200 text-green-600 text-xs flex items-center justify-center">
          Disponible
        </div>
      );
    }

    return (
      <div className="h-full bg-gray-50 text-gray-400 text-xs flex items-center justify-center">
        No disponible
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando terapeutas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error al cargar terapeutas
          </h2>
          <p className="text-gray-600">
            Por favor, intenta recargar la página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Terapeutas</h1>
          <p className="text-gray-600">
            Administra los horarios y citas de los terapeutas
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Terapeutas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTherapists}</div>
            <p className="text-xs text-muted-foreground">
              Personal terapéutico
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Terapeutas Activos
            </CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTherapists}</div>
            <p className="text-xs text-muted-foreground">En servicio activo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Horarios</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTherapists}</div>
            <p className="text-xs text-muted-foreground">
              Horarios configurados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Citas Esta Semana
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Citas programadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        defaultValue="calendario"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="lista">Lista de Terapeutas</TabsTrigger>
          <TabsTrigger value="reporte">Reporte</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="space-y-4">
          {/* Calendar Component - Shows real-time therapist availability
              Features:
              - Real schedule data from database (30-minute slots)
              - Live appointment display with proper date matching
              - Rest periods (orange, dashed border)
              - Blocked slots (red, dashed border)
              - Available slots (green, dashed border)
              - All therapists view vs individual therapist view
              - Click on appointments to see details
          */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Calendario de Terapeutas</CardTitle>

                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const prev = new Date(weekStart);
                        prev.setDate(prev.getDate() - 7);
                        setWeekStart(prev);
                        setSelectedDate("Semana Anterior");
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Select
                      value={selectedDate}
                      onValueChange={(val) => {
                        setSelectedDate(val);
                        if (val === "Semana Actual") {
                          const today = new Date();
                          const day = today.getDay();
                          const diff =
                            today.getDate() - day + (day === 0 ? -6 : 1);
                          const monday = new Date(today.setDate(diff));
                          monday.setHours(0, 0, 0, 0);
                          setWeekStart(monday);
                        }
                        if (val === "Semana Anterior") {
                          const prev = new Date(weekStart);
                          prev.setDate(prev.getDate() - 7);
                          setWeekStart(prev);
                        }
                        if (val === "Próxima Semana") {
                          const next = new Date(weekStart);
                          next.setDate(next.getDate() + 7);
                          setWeekStart(next);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[220px] h-8 mx-2">
                        <SelectValue placeholder="Seleccionar semana" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semana Anterior">
                          Semana Anterior
                        </SelectItem>
                        <SelectItem value="Semana Actual">
                          Semana Actual
                        </SelectItem>
                        <SelectItem value="Próxima Semana">
                          Próxima Semana
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const next = new Date(weekStart);
                        next.setDate(next.getDate() + 7);
                        setWeekStart(next);
                        setSelectedDate("Próxima Semana");
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <Select
                    value={selectedTherapist}
                    onValueChange={setSelectedTherapist}
                  >
                    <SelectTrigger className="w-[200px] h-8">
                      <SelectValue placeholder="Seleccionar terapeuta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">
                        Todos los terapeutas
                      </SelectItem>
                      {filteredTherapists.map((therapist) => (
                        <SelectItem key={therapist.id} value={therapist.id}>
                          {getFullName(therapist)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              {showLegend && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-blue-800 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Leyenda del Calendario
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-blue-600 hover:text-blue-800"
                      onClick={() => setShowLegend(false)}
                    >
                      Ocultar
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-50 border border-dashed border-green-300 mr-2"></div>
                      <span className="text-sm">Horario disponible</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-100 border-l-2 border-blue-500 mr-2"></div>
                      <span className="text-sm">Cita programada</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-orange-50 border border-dashed border-orange-300 mr-2"></div>
                      <span className="text-sm">Período de descanso</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-50 border border-dashed border-red-300 mr-2"></div>
                      <span className="text-sm">Horario bloqueado</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-50 mr-2"></div>
                      <span className="text-sm">No disponible</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-700">
                    * Haz clic en &quot;Ver agenda&quot; para configurar la
                    disponibilidad de cada terapeuta
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-50 w-20">Hora</th>
                      {diasSemanaDisplay.map((dia, idx) => (
                        <th key={dia} className="border p-2 bg-gray-50">
                          <div className="flex flex-col items-center">
                            <span>{dia}</span>
                            <span className="text-xs text-gray-500">
                              {formatShortDate(weekDates[idx])}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.map((hora) => (
                      <tr key={hora}>
                        <td className="border p-2 text-center font-medium bg-gray-50">
                          {hora}
                        </td>
                        {diasSemana.map((dia) => (
                          <td
                            key={`${dia}-${hora}`}
                            className="border p-0 h-16"
                          >
                            {renderCalendarCell(selectedTherapist, dia, hora)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lista">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <CardTitle>Lista de Terapeutas</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Buscar terapeuta..."
                      className="pl-8 h-9 md:w-[200px] lg:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Nombre</th>
                      <th className="text-left p-3">Especialidad</th>
                      <th className="text-left p-3">Pacientes</th>
                      <th className="text-left p-3">Disponibilidad</th>
                      <th className="text-left p-3">Períodos de Descanso</th>
                      <th className="text-left p-3">Citas esta semana</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTherapists.map((therapist, index) => {
                      const availability = getTherapistAvailability(therapist);
                      const availableDays = diasSemana.filter(
                        (day) =>
                          availability[day as keyof WeeklyAvailability].length >
                          0
                      ).length;

                      // Calculate total available hours per week
                      const totalAvailableSlots = Object.values(
                        availability
                      ).reduce((total, dayHours) => total + dayHours.length, 0);
                      const slotDuration = getSlotDuration(therapist);
                      const totalHoursPerWeek =
                        (totalAvailableSlots * slotDuration) / 60;

                      return (
                        <tr
                          key={therapist.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <div className="flex items-center">
                              <div
                                className="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white text-sm font-medium"
                                style={{
                                  backgroundColor: getTherapistColor(index),
                                }}
                              >
                                {getFullName(therapist).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium">
                                  {getFullName(therapist)}
                                </span>
                                {!therapist.active && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                  >
                                    Inactivo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {getSpecialtyDisplay(therapist.specialty)}
                          </td>
                          <td className="p-3">
                            {therapist.therapistPatients?.length ?? 0}
                          </td>
                          <td className="p-3">
                            {hasAnyAvailability(therapist) ? (
                              <div className="flex flex-col">
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 mb-1 w-fit"
                                >
                                  {availableDays} días / semana
                                </Badge>
                                <span className="text-xs text-gray-600">
                                  {totalHoursPerWeek.toFixed(1)} horas/semana
                                </span>
                              </div>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-gray-50 text-gray-600"
                              >
                                Sin horarios
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="text-sm">
                              {getTherapistRestPeriods(therapist)}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{therapist.appointments.length} citas</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCalendar(therapist)}
                                disabled={!therapist.active}
                              >
                                Ver agenda
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!therapist.active}
                              >
                                Editar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporte">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <CardTitle>Reporte Consolidado</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                  >
                    Imprimir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Nombre</th>
                      <th className="text-left p-3">Pacientes</th>
                      <th className="text-left p-3">Horas/semana</th>
                      <th className="text-left p-3">Horas/mes</th>
                      <th className="text-left p-3">Vacíos/semana</th>
                      <th className="text-left p-3">Vacíos/mes</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTherapists.map((therapist, index) => {
                      const availability = getTherapistAvailability(therapist);
                      const slotDuration = getSlotDuration(therapist);

                      // Total slots per week from availability (capacity)
                      const totalSlotsPerWeek = Object.values(
                        availability
                      ).reduce((total, dayHours) => total + dayHours.length, 0);
                      const hoursPerWeekCapacity =
                        (totalSlotsPerWeek * slotDuration) / 60;

                      // Occupied slots per week (appointments within Monday-Friday)
                      const now = new Date();
                      const weekDates = getWeekDates(now);

                      // Capacity by week using schedule, rest and blocked
                      const minutesCapacityWeek = weekDates.reduce(
                        (sum, date) =>
                          sum + computeAvailableMinutesForDate(therapist, date),
                        0
                      );

                      // Occupied minutes by week: appointments that fall on these dates
                      const dateSet = new Set(
                        weekDates.map((d) => d.toDateString())
                      );
                      const minutesOccupiedWeek = therapist.appointments.reduce(
                        (sum, apt) => {
                          const d = new Date(apt.date);
                          if (!dateSet.has(d.toDateString())) return sum;
                          const start = timeToMinutes(apt.startTime);
                          const end = timeToMinutes(apt.endTime);
                          return sum + Math.max(0, end - start);
                        },
                        0
                      );
                      const hoursPerWeekOccupied = minutesOccupiedWeek / 60;

                      // Empty slots per week (capacity minus occupied time, approximated to slots)
                      const emptySlotsPerWeek = Math.max(
                        0,
                        Math.floor(
                          (minutesCapacityWeek - minutesOccupiedWeek) /
                            slotDuration
                        )
                      );

                      // Month range (current month)

                      const monthDates = getMonthDates(now);
                      const monthDateSet = new Set(
                        monthDates.map((d) => d.toDateString())
                      );
                      const minutesCapacityMonth = monthDates.reduce(
                        (sum, date) =>
                          sum + computeAvailableMinutesForDate(therapist, date),
                        0
                      );
                      const minutesOccupiedMonth =
                        therapist.appointments.reduce((sum, apt) => {
                          const d = new Date(apt.date);
                          if (!monthDateSet.has(d.toDateString())) return sum;
                          const start = timeToMinutes(apt.startTime);
                          const end = timeToMinutes(apt.endTime);
                          return sum + Math.max(0, end - start);
                        }, 0);
                      const hoursPerMonthOccupied = minutesOccupiedMonth / 60;

                      // Estimate capacity per month: number of weekdays in month that match availability days times average daily capacity
                      const hoursPerMonthCapacity = minutesCapacityMonth / 60;

                      const emptySlotsPerMonth = Math.max(
                        0,
                        Math.floor(
                          (minutesCapacityMonth - minutesOccupiedMonth) /
                            slotDuration
                        )
                      );

                      const patientsCount =
                        therapist.therapistPatients?.length || 0;

                      return (
                        <tr
                          key={therapist.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <div className="flex items-center">
                              <div
                                className="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white text-sm font-medium"
                                style={{
                                  backgroundColor: getTherapistColor(index),
                                }}
                              >
                                {getFullName(therapist).charAt(0).toUpperCase()}
                              </div>
                              <div className="font-medium">
                                {getFullName(therapist)}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">{patientsCount}</td>
                          <td className="p-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">
                                    {hoursPerWeekCapacity.toFixed(1)} (
                                    {hoursPerWeekOccupied.toFixed(1)})
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>Capacidad (Ocupadas) horas/semana</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="p-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">
                                    {hoursPerMonthCapacity.toFixed(1)} (
                                    {hoursPerMonthOccupied.toFixed(1)})
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>Capacidad (Ocupadas) horas/mes</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="p-3">{emptySlotsPerWeek}</td>
                          <td className="p-3">{emptySlotsPerMonth}</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCalendar(therapist)}
                              >
                                Ver agenda
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appointment Details Modal */}
      {isModalOpen &&
        selectedAppointment &&
        selectedAppointment.therapistInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Detalles de la Cita</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-md">
                  <div
                    className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white"
                    style={{
                      backgroundColor: getTherapistColor(
                        therapists.indexOf(selectedAppointment.therapistInfo)
                      ),
                    }}
                  >
                    {getFullName(selectedAppointment.therapistInfo)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">
                      {getFullName(selectedAppointment.therapistInfo)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getSpecialtyDisplay(
                        selectedAppointment.therapistInfo.specialty
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Paciente</p>
                    <p className="font-medium">
                      {selectedAppointment.patientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Cita</p>
                    <p className="font-medium">{selectedAppointment.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-medium">
                      {selectedAppointment.date
                        ? new Date(
                            selectedAppointment.date
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hora</p>
                    <p className="font-medium">
                      {selectedAppointment.startTime} -{" "}
                      {selectedAppointment.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge
                      variant={
                        selectedAppointment.status === "CONFIRMED"
                          ? "default"
                          : "outline"
                      }
                      className={
                        selectedAppointment.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : ""
                      }
                    >
                      {selectedAppointment.status === "CONFIRMED"
                        ? "Confirmada"
                        : "Pendiente"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contacto</p>
                    <p className="font-medium">
                      {selectedAppointment.parentPhone}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                  <Button variant="outline">Editar Cita</Button>
                  <Button>Ver Expediente</Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
