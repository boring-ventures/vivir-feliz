"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Save,
  Bell,
  User,
  Info,
  Loader2,
  Sun,
  Trash2,
  Calendar,
  X,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useTherapistsWithSchedule,
  useUpdateTherapistSchedule,
} from "@/hooks/useTherapists";
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
  };
  return specialty ? specialtyMap[specialty] : "Sin especialidad";
};

// Day mapping
const dayMapping: Record<string, DayOfWeek> = {
  lunes: "MONDAY",
  martes: "TUESDAY",
  miercoles: "WEDNESDAY",
  jueves: "THURSDAY",
  viernes: "FRIDAY",
  sabado: "SATURDAY",
  domingo: "SUNDAY",
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
const diasSemana = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];
const diasSemanaDisplay = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function TherapistAgendaPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [configurationMode, setConfigurationMode] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    startTime: string;
    endTime?: string;
    patientName?: string;
    type?: string;
    status?: string;
    date?: string;
    parentPhone?: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { profile, isLoading: authLoading } = useCurrentUser();

  // Fetch therapists data (to get current therapist's data)
  const {
    data: therapists = [],
    isLoading,
    error,
  } = useTherapistsWithSchedule();
  const updateScheduleMutation = useUpdateTherapistSchedule();

  // Find current therapist's profile
  const currentTherapist = useMemo(() => {
    if (!profile?.id || !therapists.length) return null;
    return therapists.find((t) => t.id === profile.id) || null;
  }, [profile?.id, therapists]);

  // Helper function to convert time string to minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // State for editable availability
  const [editableAvailability, setEditableAvailability] =
    useState<WeeklyAvailability>({
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
    });

  // Initialize current week to Monday
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const mondayDate = getMonday(currentWeek);

  // Generate dynamic time slots based on therapist's actual schedule
  const getAvailableTimeSlots = (): string[] => {
    if (!currentTherapist) return [];

    const allTimeSlots = new Set<string>();

    // Collect all time intervals from therapist's schedule
    if (currentTherapist.schedule?.timeSlots) {
      currentTherapist.schedule.timeSlots.forEach((slot) => {
        // Generate all 30-minute intervals between startTime and endTime
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);

        for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const timeSlot = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
          allTimeSlots.add(timeSlot);
        }
      });
    }

    // Also include rest period times to ensure they're visible
    if (currentTherapist.schedule?.restPeriods) {
      currentTherapist.schedule.restPeriods.forEach((period) => {
        const startMinutes = timeToMinutes(period.startTime);
        const endMinutes = timeToMinutes(period.endTime);

        for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const timeSlot = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
          allTimeSlots.add(timeSlot);
        }
      });
    }

    // Also include appointment times
    currentTherapist.appointments.forEach((appointment) => {
      allTimeSlots.add(appointment.startTime);
      const startMinutes = timeToMinutes(appointment.startTime);
      const endMinutes = timeToMinutes(appointment.endTime);

      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeSlot = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
        allTimeSlots.add(timeSlot);
      }
    });

    // Convert to sorted array
    const sortedSlots = Array.from(allTimeSlots).sort((a, b) => {
      return timeToMinutes(a) - timeToMinutes(b);
    });

    return sortedSlots;
  };

  // Get the dynamic time slots
  const horarios = getAvailableTimeSlots();

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

  // Check if a time slot is blocked
  const isTimeSlotBlocked = (
    therapist: TherapistProfile,
    day: string,
    time: string
  ): boolean => {
    if (!therapist.schedule?.blockedSlots) return false;

    const dayOfWeek = dayMapping[day];
    if (!dayOfWeek) return false;

    const dayIndex = diasSemana.indexOf(day);
    if (dayIndex === -1) return false;

    const targetDate = new Date(mondayDate);
    targetDate.setDate(mondayDate.getDate() + dayIndex);

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

      return timeMinutes >= slotStartMinutes && timeMinutes < slotEndMinutes;
    });
  };

  // Get appointment for specific time slot
  const getAppointmentForSlot = (day: string, time: string) => {
    if (!currentTherapist) return null;

    const dayIndex = diasSemana.indexOf(day);
    if (dayIndex === -1) return null;

    const targetDate = new Date(mondayDate);
    targetDate.setDate(mondayDate.getDate() + dayIndex);

    const timeMinutes = timeToMinutes(time);

    return currentTherapist.appointments.find((appointment) => {
      const appointmentDate = new Date(appointment.date);
      const appointmentStartMinutes = timeToMinutes(appointment.startTime);
      const appointmentEndMinutes = timeToMinutes(appointment.endTime);

      const isSameDate =
        appointmentDate.toDateString() === targetDate.toDateString();

      const timeOverlaps =
        timeMinutes >= appointmentStartMinutes &&
        timeMinutes < appointmentEndMinutes;

      return isSameDate && timeOverlaps;
    });
  };

  // Open appointment modal
  const openAppointmentModal = (appointment: TherapistAppointment) => {
    setSelectedAppointment({
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientName: appointment.patientName,
      type: appointment.type,
      status: appointment.status,
      date: appointment.date.toISOString(),
      parentPhone: appointment.parentPhone,
    });
    setIsModalOpen(true);
  };

  // Toggle availability for a time slot
  const toggleAvailability = (day: string, time: string) => {
    setEditableAvailability((prev) => {
      const dayAvailability = [
        ...(prev[day as keyof WeeklyAvailability] || []),
      ];
      const index = dayAvailability.indexOf(time);

      if (index >= 0) {
        dayAvailability.splice(index, 1);
      } else {
        dayAvailability.push(time);
        dayAvailability.sort();
      }

      return {
        ...prev,
        [day]: dayAvailability,
      };
    });
  };

  // Template functions
  const applyMorningTemplate = () => {
    const morningHours = [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
    ];
    const newAvailability = {} as WeeklyAvailability;

    diasSemana.slice(0, 5).forEach((day) => {
      // Only weekdays for morning template
      newAvailability[day as keyof WeeklyAvailability] = [...morningHours];
    });

    setEditableAvailability(newAvailability);
  };

  const applyAfternoonTemplate = () => {
    const afternoonHours = [
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
    ];
    const newAvailability = {} as WeeklyAvailability;

    diasSemana.slice(0, 5).forEach((day) => {
      // Only weekdays for afternoon template
      newAvailability[day as keyof WeeklyAvailability] = [...afternoonHours];
    });

    setEditableAvailability(newAvailability);
  };

  const applyFullDayTemplate = () => {
    const fullDayHours = [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
    ];
    const newAvailability = {} as WeeklyAvailability;

    diasSemana.slice(0, 5).forEach((day) => {
      // Only weekdays for full day template
      newAvailability[day as keyof WeeklyAvailability] = [...fullDayHours];
    });

    setEditableAvailability(newAvailability);
  };

  const clearAllAvailability = () => {
    const emptyAvailability = {} as WeeklyAvailability;

    diasSemana.forEach((day) => {
      emptyAvailability[day as keyof WeeklyAvailability] = [];
    });

    setEditableAvailability(emptyAvailability);
  };

  // Save availability changes
  const saveAvailabilityChanges = async () => {
    if (!currentTherapist) return;

    try {
      await updateScheduleMutation.mutateAsync({
        therapistId: currentTherapist.id,
        availability: editableAvailability,
      });

      toast({
        title: "Éxito",
        description: "Horario actualizado correctamente",
      });
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el horario",
        variant: "destructive",
      });
    }
  };

  // Navigation functions
  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const formatWeekRange = (date: Date) => {
    const monday = getMonday(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return `${monday.getDate()} - ${sunday.getDate()} ${sunday.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`;
  };

  const getDayOfWeek = (offset: number) => {
    const date = new Date(mondayDate);
    date.setDate(date.getDate() + offset);
    return date.getDate();
  };

  const getNextAppointment = () => {
    if (!currentTherapist?.appointments) return null;

    const now = new Date();
    const upcomingAppointments = currentTherapist.appointments
      .filter(
        (apt) =>
          new Date(apt.date + "T" + apt.startTime) > now &&
          apt.status !== "CANCELLED"
      )
      .sort(
        (a, b) =>
          new Date(a.date + "T" + a.startTime).getTime() -
          new Date(b.date + "T" + b.startTime).getTime()
      );

    return upcomingAppointments[0] || null;
  };

  // Initialize editable availability when currentTherapist changes
  useState(() => {
    if (currentTherapist) {
      const currentAvailability = getTherapistAvailability(currentTherapist);
      setEditableAvailability(currentAvailability);
    }
  });

  const nextAppointment = getNextAppointment();

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error al cargar datos
          </h2>
          <p className="text-gray-600">
            Por favor, intenta recargar la página.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Por favor inicia sesión para continuar
      </div>
    );
  }

  if (!currentTherapist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Perfil de terapeuta no encontrado
          </h2>
          <p className="text-gray-600">
            No se pudo cargar tu información de terapeuta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="w-full">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Mi Agenda</h1>
              {currentTherapist.specialty && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600">
                    Especialidad:{" "}
                    <strong>
                      {getSpecialtyDisplay(currentTherapist.specialty)}
                    </strong>
                  </span>
                </div>
              )}
              {nextAppointment && (
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    Próxima cita:{" "}
                    <strong>
                      {nextAppointment.patientName || "Desconocido"}
                    </strong>{" "}
                    -{" "}
                    {new Date(nextAppointment.date).toLocaleDateString(
                      "es-ES",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }
                    )}{" "}
                    {nextAppointment.startTime}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Navigation Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={previousWeek}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Semana Anterior
              </Button>
              <h2 className="text-2xl font-bold">
                {formatWeekRange(currentWeek)}
              </h2>
              <Button variant="outline" onClick={nextWeek}>
                Semana Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={configurationMode}
                  onCheckedChange={setConfigurationMode}
                  id="config-mode"
                />
                <label htmlFor="config-mode" className="text-sm font-medium">
                  Configurar Horarios
                </label>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveAvailabilityChanges}
                disabled={updateScheduleMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateScheduleMutation.isPending
                  ? "Guardando..."
                  : "Guardar Cambios"}
              </Button>
            </div>
          </div>

          {/* Schedule Configuration */}
          {configurationMode && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Configuración de Horarios de Trabajo
                </h3>

                {/* Quick Templates */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    onClick={applyMorningTemplate}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mañanas (8-12)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    onClick={applyAfternoonTemplate}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Tardes (14-18)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    onClick={applyFullDayTemplate}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Día Completo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    onClick={clearAllAvailability}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                </div>

                <p className="text-sm text-blue-700 mb-3">
                  Haz clic en los espacios del calendario para marcar o
                  desmarcar horarios disponibles. También puedes usar las
                  plantillas rápidas para configurar horarios comunes.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          {showLegend && (
            <Card className="mb-4">
              <CardContent className="p-3">
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-50 border border-dashed border-green-300 mr-2"></div>
                    <span className="text-sm">Disponible</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-100 border-l-2 border-blue-500 mr-2"></div>
                    <span className="text-sm">Cita programada</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-50 border border-dashed border-orange-300 mr-2"></div>
                    <span className="text-sm">Descanso</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-50 border border-dashed border-red-300 mr-2"></div>
                    <span className="text-sm">Bloqueado</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-50 mr-2"></div>
                    <span className="text-sm">No disponible</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calendar Grid */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-50 w-20">Hora</th>
                      {diasSemanaDisplay.map((dia, index) => (
                        <th key={dia} className="border p-2 bg-gray-50">
                          <div>{dia}</div>
                          <div className="text-xs text-gray-500">
                            {getDayOfWeek(index)}
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
                        {diasSemana.map((dia) => {
                          const appointment = getAppointmentForSlot(dia, hora);
                          const isAvailable =
                            editableAvailability[
                              dia as keyof WeeklyAvailability
                            ]?.includes(hora);
                          const isBlocked = isTimeSlotBlocked(
                            currentTherapist,
                            dia,
                            hora
                          );
                          const isRest = isRestPeriod(
                            currentTherapist,
                            dia,
                            hora
                          );
                          const isWorkingTime = isTherapistAvailable(
                            currentTherapist,
                            dia,
                            hora
                          );

                          return (
                            <td
                              key={`${dia}-${hora}`}
                              className="border p-0 h-16"
                            >
                              {appointment ? (
                                // Scheduled appointment
                                <div
                                  className="h-full p-1 rounded-md flex flex-col justify-between cursor-pointer hover:opacity-80"
                                  style={{
                                    backgroundColor: "#4f46e520",
                                    borderLeft: "3px solid #4f46e5",
                                  }}
                                  onClick={() =>
                                    openAppointmentModal(appointment)
                                  }
                                >
                                  <div className="font-medium text-sm truncate">
                                    {appointment.patientName}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs">
                                      {appointment.type}
                                    </span>
                                    <Badge
                                      variant={
                                        appointment.status === "CONFIRMED"
                                          ? "default"
                                          : "outline"
                                      }
                                      className="text-xs"
                                    >
                                      {appointment.status === "CONFIRMED"
                                        ? "Confirmada"
                                        : "Pendiente"}
                                    </Badge>
                                  </div>
                                </div>
                              ) : configurationMode ? (
                                // Configuration mode - clickable availability
                                <div
                                  className={`h-full cursor-pointer flex items-center justify-center transition-colors ${
                                    appointment
                                      ? "cursor-not-allowed"
                                      : "hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    if (!appointment) {
                                      toggleAvailability(dia, hora);
                                    }
                                  }}
                                >
                                  {isAvailable && (
                                    <div className="w-full h-full bg-green-500 flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">
                                        Disponible
                                      </span>
                                    </div>
                                  )}
                                  {!isAvailable && (
                                    <div className="w-full h-full border-2 border-dashed border-blue-400 flex items-center justify-center opacity-0 hover:opacity-100">
                                      <span className="text-blue-600 text-xs">
                                        Click para activar
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : isBlocked ? (
                                // Blocked time slot
                                <div className="h-full bg-red-50 border border-dashed border-red-200 text-red-600 text-xs flex items-center justify-center">
                                  <span>Bloqueado</span>
                                </div>
                              ) : isRest ? (
                                // Rest period
                                <div className="h-full bg-orange-50 border border-dashed border-orange-200 text-orange-600 text-xs flex items-center justify-center">
                                  <span>Descanso</span>
                                </div>
                              ) : isWorkingTime ? (
                                // Available time slot
                                <div className="h-full bg-green-50 border border-dashed border-green-200 text-green-600 text-xs flex items-center justify-center">
                                  Disponible
                                </div>
                              ) : (
                                // Unavailable time slot
                                <div className="h-full bg-gray-50 text-gray-400 text-xs flex items-center justify-center">
                                  No disponible
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
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
                      ? new Date(selectedAppointment.date).toLocaleDateString()
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
