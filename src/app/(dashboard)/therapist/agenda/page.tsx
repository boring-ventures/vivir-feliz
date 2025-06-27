"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Save,
  Bell,
  User,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useTherapistSchedule,
  useUpdateTherapistSchedule,
} from "@/hooks/use-therapist-schedule";
import { useTherapistAppointments } from "@/hooks/use-therapist-appointments";

type DayConfig = {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
};

type WeekScheduleConfig = {
  monday: DayConfig;
  tuesday: DayConfig;
  wednesday: DayConfig;
  thursday: DayConfig;
  friday: DayConfig;
  saturday: DayConfig;
  sunday: DayConfig;
};

export default function TherapistAgendaPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [configurationMode, setConfigurationMode] = useState(false);
  const { profile, isLoading: authLoading } = useCurrentUser();

  // Initialize current week to Monday
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const [mondayDate] = useState(() => getMonday(new Date()));

  // Fetch schedule and appointments
  const { data: schedule, isLoading: scheduleLoading } = useTherapistSchedule();
  const { data: appointments } = useTherapistAppointments(
    profile?.id || null,
    mondayDate
  );
  const updateSchedule = useUpdateTherapistSchedule();

  // Schedule configuration state
  const [scheduleConfig, setScheduleConfig] = useState<WeekScheduleConfig>({
    monday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "14:00",
    },
    tuesday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "14:00",
    },
    wednesday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "14:00",
    },
    thursday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "14:00",
    },
    friday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "14:00",
    },
    saturday: {
      enabled: false,
      startTime: "09:00",
      endTime: "13:00",
      breakStartTime: "",
      breakEndTime: "",
    },
    sunday: {
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
      breakStartTime: "",
      breakEndTime: "",
    },
  });

  // Initialize schedule config from loaded schedule
  useEffect(() => {
    if (schedule && schedule.timeSlots) {
      const newConfig: WeekScheduleConfig = {
        monday: {
          enabled: false,
          startTime: "09:00",
          endTime: "17:00",
          breakStartTime: "12:00",
          breakEndTime: "14:00",
        },
        tuesday: {
          enabled: false,
          startTime: "09:00",
          endTime: "17:00",
          breakStartTime: "12:00",
          breakEndTime: "14:00",
        },
        wednesday: {
          enabled: false,
          startTime: "09:00",
          endTime: "17:00",
          breakStartTime: "12:00",
          breakEndTime: "14:00",
        },
        thursday: {
          enabled: false,
          startTime: "09:00",
          endTime: "17:00",
          breakStartTime: "12:00",
          breakEndTime: "14:00",
        },
        friday: {
          enabled: false,
          startTime: "09:00",
          endTime: "17:00",
          breakStartTime: "12:00",
          breakEndTime: "14:00",
        },
        saturday: {
          enabled: false,
          startTime: "09:00",
          endTime: "13:00",
          breakStartTime: "",
          breakEndTime: "",
        },
        sunday: {
          enabled: false,
          startTime: "09:00",
          endTime: "17:00",
          breakStartTime: "",
          breakEndTime: "",
        },
      };

      const dayMap: { [key: string]: keyof WeekScheduleConfig } = {
        MONDAY: "monday",
        TUESDAY: "tuesday",
        WEDNESDAY: "wednesday",
        THURSDAY: "thursday",
        FRIDAY: "friday",
        SATURDAY: "saturday",
        SUNDAY: "sunday",
      };

      schedule.timeSlots.forEach((slot) => {
        const dayKey = dayMap[slot.dayOfWeek];
        if (dayKey) {
          newConfig[dayKey] = {
            enabled: true,
            startTime: slot.startTime,
            endTime: slot.endTime,
            breakStartTime: "12:00",
            breakEndTime: "14:00",
          };
        }
      });

      setScheduleConfig(newConfig);
    }
  }, [schedule]);

  const formatWeekRange = (date: Date) => {
    const startOfWeek = getMonday(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5); // Monday to Saturday

    const startDay = startOfWeek.getDate();
    const endDay = endOfWeek.getDate();
    const month = startOfWeek
      .toLocaleDateString("es-ES", { month: "long" })
      .toUpperCase();
    const year = startOfWeek.getFullYear();

    return `${month} ${startDay}-${endDay}, ${year}`;
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const getDayOfWeek = (offset: number) => {
    const date = getMonday(currentWeek);
    date.setDate(date.getDate() + offset);
    return date.getDate();
  };

  const timeSlots = [
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
  ];

  const getAppointment = (time: string, dayIndex: number) => {
    if (!appointments) return null;

    const targetDate = getMonday(currentWeek);
    targetDate.setDate(targetDate.getDate() + dayIndex);
    const dateStr = targetDate.toISOString().split("T")[0];

    return appointments.find(
      (apt) => apt.date.split("T")[0] === dateStr && apt.startTime === time
    );
  };

  const getAppointmentColor = (type: string, status: string) => {
    if (status === "SCHEDULED")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (status === "CANCELLED") return "bg-red-100 text-red-800 border-red-200";

    switch (type) {
      case "CONSULTA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ENTREVISTA":
        return "bg-green-100 text-green-800 border-green-200";
      case "SEGUIMIENTO":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "TERAPIA":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isWorkingTime = (time: string, dayIndex: number) => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const day = days[dayIndex] as keyof WeekScheduleConfig;
    const config = scheduleConfig[day];

    if (!config.enabled) return false;

    const [hour, minute] = time.split(":").map(Number);
    const timeMinutes = hour * 60 + minute;

    const [startHour, startMinute] = config.startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = config.endTime.split(":").map(Number);
    const endMinutes = endHour * 60 + endMinute;

    // Check if it's break time
    if (config.breakStartTime && config.breakEndTime) {
      const [breakStartHour, breakStartMinute] = config.breakStartTime
        .split(":")
        .map(Number);
      const breakStartMinutes = breakStartHour * 60 + breakStartMinute;

      const [breakEndHour, breakEndMinute] = config.breakEndTime
        .split(":")
        .map(Number);
      const breakEndMinutes = breakEndHour * 60 + breakEndMinute;

      if (timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes) {
        return false;
      }
    }

    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  };

  const updateScheduleConfig = (
    day: keyof WeekScheduleConfig,
    field: keyof DayConfig,
    value: string | boolean
  ) => {
    setScheduleConfig((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const getNextAppointment = () => {
    if (!appointments) return null;

    const now = new Date();
    const upcomingAppointments = appointments
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

  const handleSaveSchedule = async () => {
    if (!profile?.id) return;

    try {
      const scheduleData = {
        slotDuration: 60,
        breakBetween: 15,
        dailySchedules: Object.entries(scheduleConfig).map(([day, config]) => ({
          day: day.toUpperCase() as
            | "MONDAY"
            | "TUESDAY"
            | "WEDNESDAY"
            | "THURSDAY"
            | "FRIDAY"
            | "SATURDAY"
            | "SUNDAY",
          enabled: config.enabled,
          startTime: config.startTime,
          endTime: config.endTime,
        })),
        restPeriods: Object.entries(scheduleConfig).map(([day, config]) => ({
          day: day.toUpperCase() as
            | "MONDAY"
            | "TUESDAY"
            | "WEDNESDAY"
            | "THURSDAY"
            | "FRIDAY"
            | "SATURDAY"
            | "SUNDAY",
          enabled: Boolean(
            config.enabled && config.breakStartTime && config.breakEndTime
          ),
          startTime: config.breakStartTime || "12:00",
          endTime: config.breakEndTime || "13:00",
        })),
      };

      await updateSchedule.mutateAsync(scheduleData);

      toast({
        title: "Éxito",
        description: "Horario actualizado correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "Error al actualizar el horario",
        variant: "destructive",
      });
    }
  };

  const nextAppointment = getNextAppointment();

  if (authLoading || scheduleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
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

  const getSpecialtyName = (specialty: string) => {
    const specialtyMap = {
      SPEECH_THERAPIST: "Fonoaudiología",
      OCCUPATIONAL_THERAPIST: "Terapia Ocupacional",
      PSYCHOPEDAGOGUE: "Psicopedagogía",
      ASD_THERAPIST: "Especialista en TEA/Autismo",
      NEUROPSYCHOLOGIST: "Neuropsicología",
      COORDINATOR: "Coordinador",
    };
    return specialtyMap[specialty as keyof typeof specialtyMap] || specialty;
  };

  const getDayName = (dayKey: string) => {
    const dayNames = {
      monday: "lunes",
      tuesday: "martes",
      wednesday: "miércoles",
      thursday: "jueves",
      friday: "viernes",
      saturday: "sábado",
      sunday: "domingo",
    };
    return dayNames[dayKey as keyof typeof dayNames] || dayKey;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="w-full">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Mi Agenda</h1>
              {profile.specialty && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600">
                    Especialidad:{" "}
                    <strong>{getSpecialtyName(profile.specialty)}</strong>
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
                onClick={handleSaveSchedule}
                disabled={updateSchedule.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSchedule.isPending ? "Guardando..." : "Guardar Cambios"}
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
                <div className="space-y-4">
                  {Object.entries(scheduleConfig).map(([day, config]) => (
                    <div
                      key={day}
                      className="flex flex-wrap items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="min-w-24">
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) =>
                            updateScheduleConfig(
                              day as keyof WeekScheduleConfig,
                              "enabled",
                              checked
                            )
                          }
                        />
                        <Label className="capitalize font-medium ml-2">
                          {getDayName(day)}
                        </Label>
                      </div>

                      {config.enabled && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm min-w-12">Inicio:</Label>
                            <Input
                              type="time"
                              value={config.startTime}
                              onChange={(e) =>
                                updateScheduleConfig(
                                  day as keyof WeekScheduleConfig,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Label className="text-sm min-w-8">Fin:</Label>
                            <Input
                              type="time"
                              value={config.endTime}
                              onChange={(e) =>
                                updateScheduleConfig(
                                  day as keyof WeekScheduleConfig,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Label className="text-sm min-w-16">
                              Descanso:
                            </Label>
                            <Input
                              type="time"
                              value={config.breakStartTime}
                              onChange={(e) =>
                                updateScheduleConfig(
                                  day as keyof WeekScheduleConfig,
                                  "breakStartTime",
                                  e.target.value
                                )
                              }
                              className="w-32"
                              placeholder="Inicio"
                            />
                            <span className="text-sm">-</span>
                            <Input
                              type="time"
                              value={config.breakEndTime}
                              onChange={(e) =>
                                updateScheduleConfig(
                                  day as keyof WeekScheduleConfig,
                                  "breakEndTime",
                                  e.target.value
                                )
                              }
                              className="w-32"
                              placeholder="Fin"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calendar Grid */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-4 text-left font-medium text-gray-600 w-20">
                        Hora
                      </th>
                      <th className="p-4 text-center font-medium text-gray-600 min-w-32">
                        <div>L{getDayOfWeek(0)}</div>
                        <div className="text-xs text-gray-500">Lunes</div>
                      </th>
                      <th className="p-4 text-center font-medium text-gray-600 min-w-32">
                        <div>M{getDayOfWeek(1)}</div>
                        <div className="text-xs text-gray-500">Martes</div>
                      </th>
                      <th className="p-4 text-center font-medium text-gray-600 min-w-32">
                        <div>M{getDayOfWeek(2)}</div>
                        <div className="text-xs text-gray-500">Miércoles</div>
                      </th>
                      <th className="p-4 text-center font-medium text-gray-600 min-w-32">
                        <div>J{getDayOfWeek(3)}</div>
                        <div className="text-xs text-gray-500">Jueves</div>
                      </th>
                      <th className="p-4 text-center font-medium text-gray-600 min-w-32">
                        <div>V{getDayOfWeek(4)}</div>
                        <div className="text-xs text-gray-500">Viernes</div>
                      </th>
                      <th className="p-4 text-center font-medium text-gray-600 min-w-32">
                        <div>S{getDayOfWeek(5)}</div>
                        <div className="text-xs text-gray-500">Sábado</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-600 border-r">
                          {time}
                        </td>
                        {[0, 1, 2, 3, 4, 5].map((dayIndex) => {
                          const appointment = getAppointment(time, dayIndex);
                          const isWorking = isWorkingTime(time, dayIndex);

                          return (
                            <td
                              key={dayIndex}
                              className="p-2 border-r relative h-16"
                            >
                              {appointment ? (
                                // Scheduled appointment
                                <div
                                  className={`p-2 rounded-md border text-xs font-medium cursor-pointer hover:shadow-md transition-shadow ${getAppointmentColor(
                                    appointment.type,
                                    appointment.status
                                  )}`}
                                >
                                  <div className="font-semibold">
                                    {appointment.patientName || "Desconocido"}
                                  </div>
                                  <div className="capitalize">
                                    {appointment.type.toLowerCase()}
                                  </div>
                                  {appointment.status === "SCHEDULED" && (
                                    <div className="text-xs mt-1">
                                      ⏳ Pendiente
                                    </div>
                                  )}
                                </div>
                              ) : isWorking ? (
                                // Available time slot
                                <div className="h-full w-full hover:bg-blue-50 rounded-md cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-blue-600">
                                    Disponible
                                  </span>
                                </div>
                              ) : (
                                // Unavailable time slot
                                <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center">
                                  <span className="text-xs text-gray-400">
                                    No disponible
                                  </span>
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

          {/* Legend */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Leyenda</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                <span className="text-sm">Consulta</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span className="text-sm">Entrevista</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
                <span className="text-sm">Seguimiento</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-indigo-100 border border-indigo-200 rounded"></div>
                <span className="text-sm">Terapia</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                <span className="text-sm">Pendiente confirmación</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-100 rounded"></div>
                <span className="text-sm">Disponible</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-sm">No disponible</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
