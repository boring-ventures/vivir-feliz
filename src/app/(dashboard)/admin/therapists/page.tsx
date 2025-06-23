"use client";

import { useState, useMemo } from "react";
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
  Clock,
  Sun,
  Trash2,
  Save,
  X,
  Info,
  Loader2,
  Users,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  useTherapists,
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
const horarios = [
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

const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes"];
const diasSemanaDisplay = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default function TherapistsPage() {
  const [selectedDate, setSelectedDate] = useState<string>("Semana Actual");
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedTherapistForCalendar, setSelectedTherapistForCalendar] =
    useState<TherapistProfile | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Fetch therapists data
  const { data: therapists = [], isLoading, error } = useTherapists();
  const updateScheduleMutation = useUpdateTherapistSchedule();

  // State for editable availability
  const [editableAvailability, setEditableAvailability] =
    useState<WeeklyAvailability>({
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
    });

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

  // Check if therapist is available at specific time
  const isTherapistAvailable = (
    therapist: TherapistProfile,
    day: string,
    time: string
  ): boolean => {
    if (!therapist.schedule?.timeSlots) return false;

    const dayOfWeek = dayMapping[day];
    if (!dayOfWeek) return false;

    return therapist.schedule.timeSlots.some(
      (slot) =>
        slot.dayOfWeek === dayOfWeek &&
        slot.startTime === time &&
        slot.isAvailable
    );
  };

  // Get appointment for specific time slot
  const getAppointmentForSlot = (
    therapistId: string,
    day: string,
    time: string
  ) => {
    const therapist = getTherapistById(therapistId);
    if (!therapist) return null;

    // For now, we'll simulate appointments from the current day
    // In a real implementation, you'd need to match based on the actual date
    return therapist.appointments.find(
      (apt) => apt.startTime === time
      // You'd need to add logic to match the day of the week with the appointment date
    );
  };

  // Open appointment modal
  const openAppointmentModal = (
    appointment: TherapistAppointment,
    therapist: TherapistProfile
  ) => {
    setSelectedAppointment({
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientName: appointment.patientName,
      type: appointment.type,
      status: appointment.status,
      date: appointment.date.toISOString(),
      parentPhone: appointment.parentPhone,
      therapistInfo: therapist,
    });
    setIsModalOpen(true);
  };

  // Open calendar for editing
  const openCalendar = (therapist: TherapistProfile) => {
    setSelectedTherapistForCalendar(therapist);
    const currentAvailability = getTherapistAvailability(therapist);
    setEditableAvailability(currentAvailability);
    setIsCalendarOpen(true);
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

    diasSemana.forEach((day) => {
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

    diasSemana.forEach((day) => {
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

    diasSemana.forEach((day) => {
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
    if (!selectedTherapistForCalendar) return;

    try {
      await updateScheduleMutation.mutateAsync({
        therapistId: selectedTherapistForCalendar.id,
        availability: editableAvailability,
      });
      setIsCalendarOpen(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      // TODO: Show error toast
    }
  };

  // Calculate statistics
  const totalTherapists = therapists.length;
  const activeTherapists = therapists.filter((t) => t.active).length;
  const totalAppointments = therapists.reduce(
    (sum, t) => sum + t.appointments.length,
    0
  );
  const availableTherapists = therapists.filter(
    (t) => t.schedule?.timeSlots && t.schedule.timeSlots.length > 0
  ).length;

  // Render calendar cell
  const renderCalendarCell = (
    therapistId: string,
    dia: string,
    hora: string
  ) => {
    if (therapistId === "todos") {
      const appointmentsAtTime = therapists
        .map((therapist) => {
          const appointment = getAppointmentForSlot(therapist.id, dia, hora);
          return appointment ? { appointment, therapist } : null;
        })
        .filter((item) => item !== null) as Array<{
        appointment: NonNullable<ReturnType<typeof getAppointmentForSlot>>;
        therapist: TherapistProfile;
      }>;

      if (appointmentsAtTime.length > 0) {
        return (
          <div className="h-full flex flex-col gap-1">
            {appointmentsAtTime.map(({ appointment, therapist }) => (
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
          </div>
        );
      }

      const availableTherapists = therapists.filter((t) =>
        isTherapistAvailable(t, dia, hora)
      );
      if (availableTherapists.length > 0) {
        return (
          <div className="h-full flex items-center justify-center">
            <Badge variant="outline" className="text-xs bg-gray-50">
              {availableTherapists.length} disponible
              {availableTherapists.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        );
      }

      return (
        <div className="h-full bg-gray-50 text-gray-400 text-xs flex items-center justify-center">
          No disponible
        </div>
      );
    }

    const therapist = getTherapistById(therapistId);
    if (!therapist) return null;

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
          <div className="font-medium text-sm">{appointment.patientName}</div>
          <div className="flex items-center justify-between">
            <span className="text-xs">{appointment.type}</span>
            <Badge
              variant={
                appointment.status === "CONFIRMED" ? "default" : "outline"
              }
              className="text-xs"
            >
              {appointment.status === "CONFIRMED" ? "Confirmada" : "Pendiente"}
            </Badge>
          </div>
        </div>
      );
    }

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
      <Tabs defaultValue="calendario" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="lista">Lista de Terapeutas</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Calendario de Terapeutas</CardTitle>

                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex items-center">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Select
                      value={selectedDate}
                      onValueChange={setSelectedDate}
                    >
                      <SelectTrigger className="w-[180px] h-8 mx-2">
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
                    <Button variant="outline" size="icon" className="h-8 w-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-50 border border-dashed border-green-300 mr-2"></div>
                      <span className="text-sm">Horario disponible</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-100 border-l-2 border-blue-500 mr-2"></div>
                      <span className="text-sm">Cita programada</span>
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
                      {diasSemanaDisplay.map((dia) => (
                        <th key={dia} className="border p-2 bg-gray-50">
                          {dia}
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
                      <th className="text-left p-3">Disponibilidad</th>
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
                              <span className="font-medium">
                                {getFullName(therapist)}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            {getSpecialtyDisplay(therapist.specialty)}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              {availableDays} días / semana
                            </Badge>
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
                              >
                                Ver agenda
                              </Button>
                              <Button variant="outline" size="sm">
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
      </Tabs>

      {/* Calendar Modal */}
      {isCalendarOpen && selectedTherapistForCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Agenda de Disponibilidad
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {getFullName(selectedTherapistForCalendar)} -{" "}
                    {getSpecialtyDisplay(
                      selectedTherapistForCalendar.specialty
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCalendarOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center mb-2">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-800">
                  Cómo configurar la disponibilidad
                </h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Haz clic en los espacios del calendario para marcar o desmarcar
                horarios disponibles. También puedes usar las plantillas rápidas
                para configurar horarios comunes.
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white border border-gray-300 mr-2"></div>
                  <span>No disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 mr-2"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 border-l-2 border-blue-500 mr-2"></div>
                  <span>Cita programada (no editable)</span>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Semana anterior
                    </Button>
                    <Button variant="outline" size="sm">
                      Hoy
                    </Button>
                    <Button variant="outline" size="sm">
                      Semana siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    13 - 17 Enero 2025
                  </h3>
                </div>

                {/* Quick Templates */}
                <div className="flex gap-2">
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
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-full">
                {/* Days Header */}
                <div className="sticky top-0 z-10 h-12 border-b bg-white flex">
                  <div className="w-20 border-r bg-gray-50"></div>
                  {[
                    { day: "LUN", date: "13", full: "Lunes" },
                    { day: "MAR", date: "14", full: "Martes" },
                    { day: "MIÉ", date: "15", full: "Miércoles" },
                    { day: "JUE", date: "16", full: "Jueves" },
                    { day: "VIE", date: "17", full: "Viernes" },
                  ].map((dayInfo, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="flex-1 border-r border-gray-200 flex flex-col items-center justify-center"
                    >
                      <span className="text-xs text-gray-600 font-medium">
                        {dayInfo.day}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {dayInfo.date}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div>
                  {horarios.map((timeSlot) => (
                    <div
                      key={timeSlot}
                      className="flex border-b border-gray-100"
                    >
                      {/* Time Column */}
                      <div className="w-20 border-r border-gray-200 p-2 bg-gray-50 flex items-center justify-center">
                        <span className="text-xs text-gray-600 font-medium">
                          {timeSlot}
                        </span>
                      </div>

                      {/* Day Columns */}
                      {diasSemana.map((dayName) => {
                        const appointment = getAppointmentForSlot(
                          selectedTherapistForCalendar.id,
                          dayName,
                          timeSlot
                        );
                        const isAvailable =
                          editableAvailability[
                            dayName as keyof WeeklyAvailability
                          ]?.includes(timeSlot);

                        return (
                          <div
                            key={`${dayName}-${timeSlot}`}
                            className={`flex-1 h-14 border-r border-gray-200 relative ${
                              appointment
                                ? "cursor-not-allowed"
                                : "cursor-pointer hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              if (!appointment) {
                                toggleAvailability(dayName, timeSlot);
                              }
                            }}
                          >
                            {/* Existing Appointment */}
                            {appointment && (
                              <div className="absolute inset-0 m-1 rounded overflow-hidden bg-blue-100 border-l-4 border-blue-500 flex flex-col p-1">
                                <span className="text-xs font-medium truncate">
                                  {appointment.patientName}
                                </span>
                                <span className="text-xs text-gray-600 truncate">
                                  {appointment.type}
                                </span>
                              </div>
                            )}

                            {/* Available Slot */}
                            {!appointment && isAvailable && (
                              <div className="absolute inset-0 m-1 bg-green-500 rounded-sm opacity-80 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  Disponible
                                </span>
                              </div>
                            )}

                            {/* Hover Effect */}
                            {!appointment && (
                              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                                <div className="absolute inset-1 border-2 border-blue-400 rounded-sm border-dashed"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                {/* Statistics */}
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700">
                      <strong>
                        {Object.values(editableAvailability).reduce(
                          (total, dayHours) => total + dayHours.length,
                          0
                        )}
                      </strong>{" "}
                      horas disponibles
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-700">
                      <strong>
                        {selectedTherapistForCalendar.appointments.length}
                      </strong>{" "}
                      citas programadas
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCalendarOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={saveAvailabilityChanges}
                    disabled={updateScheduleMutation.isPending}
                  >
                    {updateScheduleMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
