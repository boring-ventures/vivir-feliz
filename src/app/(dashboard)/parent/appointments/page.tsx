"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";

import {
  Calendar as CalendarIcon,
  User,
  Search,
  Eye,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useParentAppointments } from "@/hooks/use-parent-appointments";
import type { ParentAppointment } from "@/hooks/use-parent-appointments";

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasAppointment: boolean;
  appointments: ParentAppointment[];
}

export default function ParentAppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "scheduled" | "completed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<ParentAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch all appointments once, no filtering on the server
  const { data, isLoading, error } = useParentAppointments({
    status: "all", // Always fetch all appointments
    limit: 1000, // Increase limit to get all appointments
  });

  // Wrap allAppointments in useMemo to prevent dependency changes
  const allAppointments = useMemo(() => {
    return data?.appointments || [];
  }, [data?.appointments]);

  // Client-side filtering and statistics calculation
  const { filteredAppointments, stats } = useMemo(() => {
    // First filter by status
    let statusFiltered = allAppointments;
    if (statusFilter === "scheduled") {
      statusFiltered = allAppointments.filter(
        (appointment) =>
          appointment.status === "SCHEDULED" ||
          appointment.status === "CONFIRMED"
      );
    } else if (statusFilter === "completed") {
      statusFiltered = allAppointments.filter(
        (appointment) => appointment.status === "COMPLETED"
      );
    }

    // Then filter by search query
    const searchFiltered = statusFiltered.filter(
      (appointment) =>
        appointment.patientName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        appointment.therapistName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        appointment.proposalTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    // Calculate statistics from all appointments
    const total = allAppointments.length;
    const scheduled = allAppointments.filter(
      (appointment) =>
        appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED"
    ).length;
    const completed = allAppointments.filter(
      (appointment) => appointment.status === "COMPLETED"
    ).length;

    // Calculate upcoming appointments (scheduled appointments with future dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = allAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return (
        (appointment.status === "SCHEDULED" ||
          appointment.status === "CONFIRMED") &&
        appointmentDate >= today
      );
    }).length;

    return {
      filteredAppointments: searchFiltered,
      stats: {
        total,
        scheduled,
        completed,
        upcoming,
      },
    };
  }, [allAppointments, statusFilter, searchQuery]);

  // Calendar utility functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  // Parse date from DD/MM/YYYY format
  const parseAppointmentDate = (dateStr: string): Date => {
    try {
      const [day, month, year] = dateStr.split("/").map(Number);

      // Validate the parsed values
      if (
        !day ||
        !month ||
        !year ||
        isNaN(day) ||
        isNaN(month) ||
        isNaN(year)
      ) {
        console.error("Invalid date format:", dateStr);
        return new Date(); // Return today as fallback
      }

      return new Date(year, month - 1, day);
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return new Date(); // Return today as fallback
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  }, []);

  const hasAppointment = useCallback(
    (date: Date) => {
      return allAppointments.some((appointment) => {
        const appointmentDate = parseAppointmentDate(
          appointment.appointmentDate
        );
        return isSameDay(appointmentDate, date);
      });
    },
    [allAppointments]
  );

  const getAppointmentsForDate = useCallback(
    (date: Date) => {
      return allAppointments.filter((appointment) => {
        const appointmentDate = parseAppointmentDate(
          appointment.appointmentDate
        );
        return isSameDay(appointmentDate, date);
      });
    },
    [allAppointments]
  );

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Prepare data for calendar view
  const { planTratamiento, proximasCitas, calendarDays } = useMemo(() => {
    // Get scheduled appointments dates
    const scheduledDates = allAppointments
      .filter(
        (appointment) =>
          appointment.status === "SCHEDULED" ||
          appointment.status === "CONFIRMED"
      )
      .map((appointment) => new Date(appointment.appointmentDate));

    // Generate calendar days for current month
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const calendarDays: CalendarDay[] = [];

    // Add days from previous month
    const prevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      0
    );
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        day
      );
      calendarDays.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: isToday(date),
        hasAppointment: hasAppointment(date),
        appointments: getAppointmentsForDate(date),
      });
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      calendarDays.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: isToday(date),
        hasAppointment: hasAppointment(date),
        appointments: getAppointmentsForDate(date),
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        day
      );
      calendarDays.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: isToday(date),
        hasAppointment: hasAppointment(date),
        appointments: getAppointmentsForDate(date),
      });
    }

    // Get treatment plan info
    const firstAppointment = allAppointments[0];
    const lastAppointment = allAppointments[allAppointments.length - 1];

    // Calculate scheduled count directly
    const scheduledCount = allAppointments.filter(
      (appointment) =>
        appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED"
    ).length;

    const planTratamiento = {
      paciente: firstAppointment?.patientName || "Paciente",
      terapeuta: firstAppointment?.therapistName || "Terapeuta",
      fechaInicio: firstAppointment?.appointmentDate || "N/A",
      fechaFin: lastAppointment?.appointmentDate || "N/A",
      frecuencia: allAppointments.length > 1 ? "Semanal" : "No especificada",
      sesionesPendientes: scheduledCount,
    };

    // Get upcoming appointments for the list
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First filter by status only - only SCHEDULED and CONFIRMED
    const scheduledAppointments = allAppointments.filter(
      (appointment) =>
        appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED"
    );

    // Then filter by future dates
    const upcoming = scheduledAppointments
      .filter((appointment) => {
        const appointmentDate = parseAppointmentDate(
          appointment.appointmentDate
        );
        const isFuture = appointmentDate >= today;
        return isFuture;
      })
      .sort(
        (a, b) =>
          parseAppointmentDate(a.appointmentDate).getTime() -
          parseAppointmentDate(b.appointmentDate).getTime()
      )
      .slice(0, 14); // Show next 14 appointments

    const proximasCitas = upcoming.map((appointment) => ({
      fecha: parseAppointmentDate(
        appointment.appointmentDate
      ).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      hora: appointment.appointmentTime,
      tipo:
        appointment.type === "CONSULTA"
          ? "Consulta Inicial"
          : appointment.type === "SEGUIMIENTO"
            ? "Seguimiento"
            : appointment.type === "TERAPIA"
              ? "Terapia Psicológica"
              : appointment.type === "ENTREVISTA"
                ? "Entrevista"
                : appointment.type,
    }));

    return {
      citasAgendadas: scheduledDates,
      planTratamiento,
      proximasCitas,
      calendarDays,
    };
  }, [
    allAppointments,
    currentDate,
    getAppointmentsForDate,
    hasAppointment,
    isToday,
  ]);

  const openAppointmentModal = (appointment: ParentAppointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeAppointmentModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleCalendarDayClick = (day: CalendarDay) => {
    if (day.hasAppointment && day.appointments.length > 0) {
      // Show the first appointment for this day
      setSelectedAppointment(day.appointments[0]);
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["PARENT"]}>
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8" />
          </div>
        </main>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard allowedRoles={["PARENT"]}>
        <main className="p-6">
          <div className="text-center">
            <p className="text-red-600">Error al cargar las citas</p>
          </div>
        </main>
      </RoleGuard>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-800">Programada</Badge>;
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800">Completada</Badge>
        );
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case "NO_SHOW":
        return (
          <Badge className="bg-orange-100 text-orange-800">No asistió</Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CONSULTA":
        return <Badge variant="outline">Consulta</Badge>;
      case "ENTREVISTA":
        return <Badge variant="outline">Entrevista</Badge>;
      case "SEGUIMIENTO":
        return <Badge variant="outline">Seguimiento</Badge>;
      case "TERAPIA":
        return <Badge variant="outline">Terapia</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <RoleGuard allowedRoles={["PARENT"]}>
      <main className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Citas</h1>
            <p className="text-muted-foreground">
              Gestiona las citas de terapia de tus hijos
            </p>
          </div>
          <Button
            onClick={() => setShowCalendarView(true)}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Ver Citas
          </Button>
        </div>

        {/* Treatment Plan Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              Plan de Tratamiento -{" "}
              {allAppointments[0]?.patientName || "Paciente"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Sesiones Totales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Sesiones Tomadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Sesiones Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.scheduled}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Progreso</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Progreso del Tratamiento</span>
                <span>
                  {stats.completed}/{stats.total} sesiones
                </span>
              </div>
              <Progress
                value={
                  stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                }
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Período de Tratamiento:</span>
                <p className="font-medium">
                  {allAppointments.length > 0
                    ? `${allAppointments[allAppointments.length - 1]?.appointmentDate || "N/A"} - ${allAppointments[0]?.appointmentDate || "N/A"}`
                    : "No disponible"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Frecuencia:</span>
                <p className="font-medium">
                  {allAppointments.length > 1 ? "Semanal" : "No especificada"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar citas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                >
                  Todas
                </Button>
                <Button
                  variant={statusFilter === "scheduled" ? "default" : "outline"}
                  onClick={() => setStatusFilter("scheduled")}
                >
                  Programadas
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("completed")}
                >
                  Completadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Citas</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {appointment.patientName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.appointmentDate} at{" "}
                            {appointment.appointmentTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(appointment.status)}
                        {getTypeBadge(appointment.type)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Terapeuta
                        </p>
                        <p className="text-sm">{appointment.therapistName}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.therapistSpecialty}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Tratamiento
                        </p>
                        <p className="text-sm">
                          {appointment.proposalTitle || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sesión{" "}
                          {appointment.totalSessions > 0
                            ? `${appointment.totalSessions} sesiones`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Duración
                        </p>
                        <p className="text-sm">
                          {appointment.appointmentTime} - {appointment.endTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.price
                            ? `Bs. ${appointment.price}`
                            : "Sin precio establecido"}
                        </p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Notas
                        </p>
                        <p className="text-sm">{appointment.notes}</p>
                      </div>
                    )}

                    {appointment.sessionNotes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Notas de Sesión
                        </p>
                        <p className="text-sm">{appointment.sessionNotes}</p>
                      </div>
                    )}

                    {appointment.homework && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Tarea
                        </p>
                        <p className="text-sm">{appointment.homework}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAppointmentModal(appointment)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron citas</p>
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? "Intenta ajustar tus criterios de búsqueda"
                    : "Aún no tienes citas programadas"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Details Modal */}
        {isModalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Detalles de la Cita</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={closeAppointmentModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-600" />
                        Información del Paciente
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Nombre</p>
                          <p className="font-medium">
                            {selectedAppointment.patientName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Edad</p>
                          <p className="font-medium">
                            {selectedAppointment.patientAge} años
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
                        Información de la Cita
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Fecha</p>
                          <p className="font-medium">
                            {selectedAppointment.appointmentDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Hora</p>
                          <p className="font-medium">
                            {selectedAppointment.appointmentTime} -{" "}
                            {selectedAppointment.endTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tipo</p>
                          <div className="mt-1">
                            {getTypeBadge(selectedAppointment.type)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estado</p>
                          <div className="mt-1">
                            {getStatusBadge(selectedAppointment.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <User className="h-5 w-5 mr-2 text-purple-600" />
                        Información del Terapeuta
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Nombre</p>
                          <p className="font-medium">
                            {selectedAppointment.therapistName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Especialidad</p>
                          <p className="font-medium">
                            {selectedAppointment.therapistSpecialty}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-orange-600" />
                        Información del Tratamiento
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Tratamiento</p>
                          <p className="font-medium">
                            {selectedAppointment.proposalTitle ||
                              "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Sesiones</p>
                          <p className="font-medium">
                            {selectedAppointment.totalSessions > 0
                              ? `${selectedAppointment.totalSessions} sesiones`
                              : "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Precio</p>
                          <p className="font-medium">
                            {selectedAppointment.price
                              ? `Bs. ${selectedAppointment.price}`
                              : "Sin precio establecido"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes and Additional Information */}
                <div className="space-y-4">
                  {selectedAppointment.notes && (
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Notas
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm">{selectedAppointment.notes}</p>
                      </div>
                    </div>
                  )}

                  {selectedAppointment.sessionNotes && (
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-green-600" />
                        Notas de Sesión
                      </h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm">
                          {selectedAppointment.sessionNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedAppointment.homework && (
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-purple-600" />
                        Tarea
                      </h4>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm">
                          {selectedAppointment.homework}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedAppointment.nextSessionPlan && (
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-orange-600" />
                        Plan para la Próxima Sesión
                      </h4>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm">
                          {selectedAppointment.nextSessionPlan}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={closeAppointmentModal}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar View Modal */}
        {showCalendarView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Calendario de Citas - {planTratamiento.paciente}
                  </h2>
                  <p className="text-gray-600">
                    Período de tratamiento: {planTratamiento.fechaInicio} -{" "}
                    {planTratamiento.fechaFin}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCalendarView(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendario */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Calendario de Citas</h3>
                  <div className="border rounded-lg p-4">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToPreviousMonth}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium">
                          {formatMonthYear(currentDate)}
                        </h4>
                        <Button variant="outline" size="sm" onClick={goToToday}>
                          Hoy
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {/* Day headers */}
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-gray-600 py-2"
                        >
                          {day}
                        </div>
                      ))}

                      {/* Calendar dates */}
                      {calendarDays.map((day, index) => (
                        <div
                          key={index}
                          className={`text-center py-2 text-sm cursor-pointer hover:bg-gray-50 rounded ${
                            day.isCurrentMonth
                              ? "text-gray-900"
                              : "text-gray-400"
                          } ${
                            day.isToday
                              ? "bg-gray-100 border border-gray-300"
                              : ""
                          } ${day.hasAppointment ? "bg-blue-50 border border-blue-200" : ""}`}
                          onClick={() => handleCalendarDayClick(day)}
                          title={
                            day.hasAppointment
                              ? `${day.appointments.length} cita${day.appointments.length > 1 ? "s" : ""} programada${day.appointments.length > 1 ? "s" : ""}`
                              : ""
                          }
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-medium">
                              {day.day}
                            </span>
                            {day.hasAppointment && (
                              <div className="flex items-center justify-center mt-1">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                {day.appointments.length > 1 && (
                                  <span className="text-xs text-blue-600 ml-1 font-medium">
                                    {day.appointments.length}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span>Días con citas programadas</span>
                    </div>
                  </div>
                </div>

                {/* Lista de próximas citas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Próximas Citas</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {proximasCitas.length > 0 ? (
                      proximasCitas.map((cita, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-blue-900">
                                {cita.tipo}
                              </p>
                              <p className="text-sm text-blue-700">
                                {cita.fecha}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-800">
                                {cita.hora}
                              </p>
                              <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                                Confirmada
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                        <p>No hay citas próximas programadas</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-4">
                  Información del Tratamiento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <span className="text-gray-600">Terapeuta:</span>
                    <p className="font-medium">{planTratamiento.terapeuta}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Frecuencia:</span>
                    <p className="font-medium">{planTratamiento.frecuencia}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Sesiones Restantes:</span>
                    <p className="font-medium text-orange-600">
                      {planTratamiento.sesionesPendientes}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowCalendarView(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </RoleGuard>
  );
}
