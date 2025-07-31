"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Bell,
  User,
  Info,
  Loader2,
  X,
  Play,
  CheckCircle,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTherapistsWithSchedule } from "@/hooks/useTherapists";
import {
  useTherapistAppointments,
  useUpdateAppointmentStatus,
} from "@/hooks/use-therapist-appointments";
import {
  TherapistProfile,
  DayOfWeek,
  TherapistAppointment,
} from "@/types/therapists";
import { SpecialtyType } from "@prisma/client";
import { APPOINTMENT_STATUS_LABELS } from "@/types/patients";

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

// Helper function to create Date object from date string without timezone issues
const createDateFromString = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

// Helper function to format date without timezone issues
const formatDateLocal = (date: Date | string): string => {
  // Handle both Date objects and date strings
  const dateObj =
    typeof date === "string" ? createDateFromString(date.split("T")[0]) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to calculate end time from start time and duration
const calculateEndTime = (
  startTime: string,
  durationMinutes: number
): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + durationMinutes;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
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
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showLegend, setShowLegend] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    startTime: string;
    endTime?: string;
    patientName?: string;
    patientId?: string | null;
    type?: string;
    status?: string;
    date?: string;
    parentPhone?: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const { profile, isLoading: authLoading } = useCurrentUser();

  // Fetch therapist schedule data
  const {
    data: therapists = [],
    isLoading: scheduleLoading,
    error: scheduleError,
  } = useTherapistsWithSchedule();

  // Fetch therapist appointments (all appointments, not filtered by date)
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useTherapistAppointments({ status: "all", limit: 1000 });

  const updateAppointmentStatusMutation = useUpdateAppointmentStatus();

  // Find current therapist's profile and merge with appointments
  const currentTherapist = useMemo(() => {
    if (!profile?.id || !therapists.length) return null;

    const therapistSchedule = therapists.find((t) => t.id === profile.id);
    if (!therapistSchedule) return null;

    // Convert therapist appointments data to match the expected format
    const appointments =
      appointmentsData?.appointments?.map(
        (appointment: {
          id: string;
          appointmentId: string;
          patientId: string | null;
          patientName: string;
          patientAge: number | null;
          parentName: string;
          parentPhone: string;
          parentEmail: string;
          appointmentDate: string;
          appointmentTime: string;
          type: string;
          status: string;
          notes: string;
          priority: string;
          therapist: {
            id: string;
            firstName: string;
            lastName: string;
            specialty: string;
          };
          createdAt: string;
          analysisStatus: string;
          analysisDate: string | null;
          diagnosis: string | null;
          recommendations: string | null;
          sentToAdmin: boolean;
        }) => ({
          id: appointment.id,
          therapistId: profile.id,
          date: createDateFromString(appointment.appointmentDate),
          startTime: appointment.appointmentTime,
          endTime: calculateEndTime(appointment.appointmentTime, 60), // Calculate end time (60 min sessions)
          type: appointment.type as "CONSULTA" | "ENTREVISTA",
          patientId: appointment.patientId,
          patientName: appointment.patientName || "Paciente",
          patientAge: appointment.patientAge || null,
          parentName: appointment.parentName || "",
          parentPhone: appointment.parentPhone || "",
          parentEmail: appointment.parentEmail || "",
          status: appointment.status,
          notes: appointment.notes || null,
          price: null, // Not returned by this API
          createdAt: new Date(appointment.createdAt || Date.now()),
          updatedAt: new Date(appointment.createdAt || Date.now()),
        })
      ) || [];

    return {
      ...therapistSchedule,
      appointments,
    };
  }, [profile?.id, therapists, appointmentsData]);

  // Helper function to convert time string to minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

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

  // Get appointment for specific time slot - FIXED VERSION
  const getAppointmentForSlot = (day: string, time: string) => {
    if (!currentTherapist) return null;

    const dayIndex = diasSemana.indexOf(day);
    if (dayIndex === -1) return null;

    const targetDate = new Date(mondayDate);
    targetDate.setDate(mondayDate.getDate() + dayIndex);

    const timeMinutes = timeToMinutes(time);

    return currentTherapist.appointments.find((appointment) => {
      // Convert both dates to local format strings for comparison to avoid timezone issues
      const appointmentDateStr = formatDateLocal(appointment.date);
      const targetDateStr = formatDateLocal(targetDate);

      const appointmentStartMinutes = timeToMinutes(appointment.startTime);
      const appointmentEndMinutes = timeToMinutes(appointment.endTime);

      const isSameDate = appointmentDateStr === targetDateStr;

      const timeOverlaps =
        timeMinutes >= appointmentStartMinutes &&
        timeMinutes < appointmentEndMinutes;

      return isSameDate && timeOverlaps;
    });
  };

  // Open appointment modal
  const openAppointmentModal = (appointment: TherapistAppointment) => {
    console.log("Opening appointment modal with:", appointment);
    setSelectedAppointment({
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientName: appointment.patientName,
      patientId: appointment.patientId,
      type: appointment.type,
      status: appointment.status,
      date: appointment.date.toISOString(),
      parentPhone: appointment.parentPhone,
    });
    setIsModalOpen(true);
  };

  // Open status change modal
  const openStatusModal = () => {
    setIsStatusModalOpen(true);
    setIsModalOpen(false);
  };

  // Close status modal and reopen appointment modal
  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setIsModalOpen(true);
  };

  // Handle status change
  const handleStatusChange = async (newStatus: "IN_PROGRESS" | "COMPLETED") => {
    if (!selectedAppointment) return;

    try {
      await updateAppointmentStatusMutation.mutateAsync({
        appointmentId: selectedAppointment.id,
        status: newStatus,
      });

      toast({
        title: "Estado actualizado",
        description: `La cita ha sido marcada como ${newStatus === "COMPLETED" ? "completada" : "en progreso"}`,
      });

      setIsStatusModalOpen(false);
      setIsModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita",
        variant: "destructive",
      });
    }
  };

  // Navigate to patient record
  const handleViewPatientRecord = () => {
    console.log("Selected appointment:", selectedAppointment);
    console.log("Patient ID:", selectedAppointment?.patientId);

    if (!selectedAppointment?.patientId) {
      toast({
        title: "Error",
        description: "No se pudo obtener la información del paciente",
        variant: "destructive",
      });
      return;
    }

    router.push(`/therapist/patients/${selectedAppointment.patientId}`);
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

  const nextAppointment = getNextAppointment();

  if (authLoading || scheduleLoading || appointmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (scheduleError || appointmentsError) {
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
              {/* Configuration controls removed - therapists cannot modify their own schedules */}
            </div>
          </div>

          {/* Schedule Configuration removed - therapists cannot modify their own schedules */}

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
                                        appointment.status === "CONFIRMED" ||
                                        appointment.status === "COMPLETED"
                                          ? "default"
                                          : appointment.status === "IN_PROGRESS"
                                            ? "secondary"
                                            : appointment.status ===
                                                "RESCHEDULED"
                                              ? "secondary"
                                              : "outline"
                                      }
                                      className={`text-xs ${
                                        appointment.status === "COMPLETED"
                                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                                          : appointment.status === "IN_PROGRESS"
                                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                            : appointment.status ===
                                                "RESCHEDULED"
                                              ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                              : ""
                                      }`}
                                    >
                                      {APPOINTMENT_STATUS_LABELS[
                                        appointment.status as keyof typeof APPOINTMENT_STATUS_LABELS
                                      ] || appointment.status}
                                    </Badge>
                                  </div>
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
                      selectedAppointment.status === "CONFIRMED" ||
                      selectedAppointment.status === "COMPLETED"
                        ? "default"
                        : selectedAppointment.status === "IN_PROGRESS"
                          ? "secondary"
                          : selectedAppointment.status === "RESCHEDULED"
                            ? "secondary"
                            : "outline"
                    }
                    className={
                      selectedAppointment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : selectedAppointment.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          : selectedAppointment.status === "RESCHEDULED"
                            ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                            : selectedAppointment.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : ""
                    }
                  >
                    {APPOINTMENT_STATUS_LABELS[
                      selectedAppointment.status as keyof typeof APPOINTMENT_STATUS_LABELS
                    ] || selectedAppointment.status}
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
                <Button
                  variant="outline"
                  onClick={openStatusModal}
                  disabled={
                    selectedAppointment.status === "COMPLETED" ||
                    selectedAppointment.status === "CANCELLED" ||
                    selectedAppointment.status === "NO_SHOW"
                  }
                >
                  Cambiar Estado
                </Button>
                <Button
                  onClick={handleViewPatientRecord}
                  disabled={!selectedAppointment.patientId}
                  variant={
                    !selectedAppointment.patientId ? "outline" : "default"
                  }
                >
                  Ver Expediente{" "}
                  {!selectedAppointment.patientId && "(No disponible)"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Cambiar Estado de la Cita
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={closeStatusModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Paciente: <strong>{selectedAppointment.patientName}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAppointment.date
                    ? new Date(selectedAppointment.date).toLocaleDateString()
                    : "N/A"}{" "}
                  a las {selectedAppointment.startTime}
                </p>
              </div>

              <div className="space-y-3">
                {selectedAppointment.status === "SCHEDULED" ||
                selectedAppointment.status === "CONFIRMED" ||
                selectedAppointment.status === "RESCHEDULED" ? (
                  <Button
                    variant="outline"
                    className="w-full h-16 flex items-center justify-center space-x-3 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                    onClick={() => handleStatusChange("IN_PROGRESS")}
                    disabled={updateAppointmentStatusMutation.isPending}
                  >
                    <Play className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-blue-800">
                        Iniciar Sesión
                      </div>
                      <div className="text-sm text-blue-600">
                        Marcar como EN PROGRESO
                      </div>
                    </div>
                  </Button>
                ) : null}

                {selectedAppointment.status === "IN_PROGRESS" ? (
                  <Button
                    variant="outline"
                    className="w-full h-16 flex items-center justify-center space-x-3 border-2 border-green-200 hover:border-green-300 hover:bg-green-50"
                    onClick={() => handleStatusChange("COMPLETED")}
                    disabled={updateAppointmentStatusMutation.isPending}
                  >
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium text-green-800">
                        Completar Sesión
                      </div>
                      <div className="text-sm text-green-600">
                        Marcar como COMPLETADA
                      </div>
                    </div>
                  </Button>
                ) : null}

                {selectedAppointment.status === "COMPLETED" && (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">
                      Sesión Completada
                    </p>
                    <p className="text-sm text-gray-600">
                      Esta cita ya ha sido marcada como completada
                    </p>
                  </div>
                )}
              </div>

              {updateAppointmentStatusMutation.isPending && (
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Actualizando estado...</span>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end">
                <Button variant="outline" onClick={closeStatusModal}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
