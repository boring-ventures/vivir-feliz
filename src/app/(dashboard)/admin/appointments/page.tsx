"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Calendar,
  Clock,
  User,
  MoreHorizontal,
  CheckCircle,
  UserX,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { MarkAbsentModal } from "@/components/admin/mark-absent-modal";
import { AppointmentDetailsModal } from "@/components/admin/appointment-details-modal";
import { RescheduleAppointmentModal } from "@/components/admin/reschedule-appointment-modal";
import { useQuery } from "@tanstack/react-query";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  patientName?: string;
  patientAge?: number;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  notes?: string;
  price?: number;
  absenceReason?: string;
  markedAbsentBy?: string;
  markedAbsentAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  homework?: string;
  nextSessionPlan?: string;
  sessionNotes?: string;
  originalDate?: string; // For rescheduled appointments
  isRescheduled?: boolean; // Flag to indicate if appointment was rescheduled
  patientId?: string; // Patient ID for fetching patient appointments
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    allergies?: string;
    medications?: string;
    medicalHistory?: string;
    specialNeeds?: string;
  };
  therapist?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
    phone?: string;
    email?: string;
  };
  proposal?: {
    id: string;
    timeAvailability?: Record<string, { morning: boolean; afternoon: boolean }>;
    title?: string;
    description?: string;
    status?: string;
  };
}

// Fetch appointments for admin with server-side filters
const fetchAdminAppointments = async (params: {
  search?: string;
  status?: string;
  date?: string;
  patientId?: string;
  therapistId?: string;
}): Promise<Appointment[]> => {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all")
    query.set("status", params.status);
  if (params.date) query.set("date", params.date);
  if (params.patientId && params.patientId !== "all")
    query.set("patientId", params.patientId);
  if (params.therapistId && params.therapistId !== "all")
    query.set("therapistId", params.therapistId);

  const url = `/api/admin/appointments${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }
  return response.json();
};

// Fetch minimal therapist options
const fetchTherapistOptions = async (): Promise<
  Array<{ id: string; name: string }>
> => {
  const res = await fetch("/api/admin/therapists");
  if (!res.ok) throw new Error("Failed to fetch therapists");
  type TherapistMinimal = {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  const data: TherapistMinimal[] = await res.json();
  return (data || []).map((t) => ({
    id: t.id,
    name: (`${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || "Sin nombre"),
  }));
};

// Fetch minimal patient options (paginated endpoint, large limit)
const fetchPatientOptions = async (): Promise<
  Array<{ id: string; name: string }>
> => {
  const res = await fetch("/api/admin/patients?limit=1000&page=1");
  if (!res.ok) throw new Error("Failed to fetch patients");
  type PatientMinimal = { id: string; firstName: string; lastName: string };
  const data: { patients?: PatientMinimal[] } = await res.json();
  const list: PatientMinimal[] = data?.patients || [];
  return list.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
  }));
};

// Get status badge info
const getStatusInfo = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return { label: "Programada", color: "bg-blue-100 text-blue-800" };
    case "CONFIRMED":
      return { label: "Confirmada", color: "bg-green-100 text-green-800" };
    case "IN_PROGRESS":
      return { label: "En Progreso", color: "bg-yellow-100 text-yellow-800" };
    case "COMPLETED":
      return { label: "Completada", color: "bg-green-100 text-green-800" };
    case "CANCELLED":
      return { label: "Cancelada", color: "bg-red-100 text-red-800" };
    case "NO_SHOW":
      return { label: "Ausente", color: "bg-red-100 text-red-800" };
    case "RESCHEDULED":
      return { label: "Reprogramada", color: "bg-purple-100 text-purple-800" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

// Get appointment type label
const getTypeLabel = (type: string) => {
  switch (type) {
    case "CONSULTA":
      return "Consulta";
    case "ENTREVISTA":
      return "Entrevista";
    case "SEGUIMIENTO":
      return "Seguimiento";
    case "TERAPIA":
      return "Terapia";
    default:
      return type;
  }
};

export default function AdminAppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("all");
  const [therapistFilter, setTherapistFilter] = useState("all");
  const [markAbsentModalOpen, setMarkAbsentModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch appointments
  const {
    data: appointments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "admin-appointments",
      debouncedSearchTerm,
      statusFilter,
      dateFilter,
      patientFilter,
      therapistFilter,
    ],
    queryFn: () =>
      fetchAdminAppointments({
        search: debouncedSearchTerm,
        status: statusFilter,
        date: dateFilter,
        patientId: patientFilter,
        therapistId: therapistFilter,
      }),
  });

  // Options for selects
  const { data: therapistOptions = [] } = useQuery({
    queryKey: ["admin-therapist-options"],
    queryFn: fetchTherapistOptions,
  });
  const { data: patientOptions = [] } = useQuery({
    queryKey: ["admin-patient-options"],
    queryFn: fetchPatientOptions,
  });

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      appointment.parentName
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      appointment.parentPhone?.includes(debouncedSearchTerm) ||
      (appointment.patient &&
        `${appointment.patient.firstName} ${appointment.patient.lastName}`
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())) ||
      (appointment.therapist &&
        `${appointment.therapist.firstName} ${appointment.therapist.lastName}`
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;

    const matchesDate = !dateFilter || appointment.date.startsWith(dateFilter);

    const matchesPatient =
      patientFilter === "all" ||
      appointment.patient?.id === patientFilter ||
      appointment.patientId === patientFilter;

    const matchesTherapist =
      therapistFilter === "all" ||
      appointment.therapist?.id === therapistFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDate &&
      matchesPatient &&
      matchesTherapist
    );
  });

  // Handle mark absent
  const handleMarkAbsent = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setMarkAbsentModalOpen(true);
  };

  // Handle view details
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsModalOpen(true);
  };

  // Handle reschedule
  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModalOpen(true);
  };

  // Format date and time - timezone safe
  const formatDate = (dateString: string) => {
    try {
      // Handle different date formats
      let date: Date;

      if (dateString.includes("T")) {
        // ISO string format (e.g., "2025-07-16T00:00:00.000Z")
        const isoDate = new Date(dateString);
        // Extract just the date part to avoid timezone issues
        const [year, month, day] = isoDate
          .toISOString()
          .split("T")[0]
          .split("-")
          .map(Number);
        date = new Date(year, month - 1, day);
      } else if (dateString.includes("-")) {
        // YYYY-MM-DD format
        const [year, month, day] = dateString.split("-").map(Number);
        date = new Date(year, month - 1, day);
      } else {
        // Fallback to regular Date constructor
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "Fecha inválida";
      }

      return date.toLocaleDateString("es-ES", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Fecha inválida";
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getPatientName = (appointment: Appointment) => {
    if (appointment.patient) {
      return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    }
    return appointment.patientName || "N/A";
  };

  const getTherapistName = (appointment: Appointment) => {
    if (appointment.therapist) {
      return `${appointment.therapist.firstName} ${appointment.therapist.lastName}`;
    }
    return "N/A";
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Citas</h1>
            <p className="text-gray-600">
              Administra todas las citas del centro
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Citas
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Programadas
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      appointments.filter((a) => a.status === "SCHEDULED")
                        .length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completadas
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      appointments.filter((a) => a.status === "COMPLETED")
                        .length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ausentes</p>
                  <p className="text-2xl font-bold text-red-600">
                    {appointments.filter((a) => a.status === "NO_SHOW").length}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, padre o terapeuta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="SCHEDULED">Programada</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  <SelectItem value="NO_SHOW">Ausente</SelectItem>
                  <SelectItem value="RESCHEDULED">Reprogramada</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filtrar por fecha"
              />

              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pacientes</SelectItem>
                  {patientOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={therapistFilter}
                onValueChange={setTherapistFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por terapeuta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los terapeutas</SelectItem>
                  {therapistOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Citas ({filteredAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Error al cargar las citas
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron citas
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Terapeuta</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => {
                    const statusInfo = getStatusInfo(appointment.status);
                    const canMarkAbsent =
                      appointment.status === "SCHEDULED" ||
                      appointment.status === "CONFIRMED";

                    return (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {getPatientName(appointment)}
                            </div>
                            {appointment.parentName && (
                              <div className="text-sm text-gray-500">
                                Padre: {appointment.parentName}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {getTherapistName(appointment)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              {formatDate(appointment.date)}
                              {appointment.isRescheduled &&
                                appointment.originalDate && (
                                  <div className="text-xs text-gray-500">
                                    <span className="text-orange-600">
                                      Reprogramada desde:{" "}
                                    </span>
                                    {formatDate(appointment.originalDate)}
                                  </div>
                                )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <div>
                              {formatTime(appointment.startTime)} -{" "}
                              {formatTime(appointment.endTime)}
                              {appointment.isRescheduled && (
                                <div className="text-xs text-orange-600">
                                  (Nueva fecha)
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getTypeLabel(appointment.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {appointment.parentPhone || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canMarkAbsent && (
                                <DropdownMenuItem
                                  onClick={() => handleMarkAbsent(appointment)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Marcar como Ausente
                                </DropdownMenuItem>
                              )}
                              {(appointment.status === "SCHEDULED" ||
                                appointment.status === "NO_SHOW") && (
                                <DropdownMenuItem
                                  onClick={() => handleReschedule(appointment)}
                                  className="text-blue-600 focus:text-blue-600"
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Reprogramar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(appointment)}
                              >
                                <User className="w-4 h-4 mr-2" />
                                Ver Detalles
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Mark Absent Modal */}
        <MarkAbsentModal
          appointment={selectedAppointment}
          open={markAbsentModalOpen}
          onOpenChange={setMarkAbsentModalOpen}
        />

        {/* Appointment Details Modal */}
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
        />

        {/* Reschedule Appointment Modal */}
        <RescheduleAppointmentModal
          appointment={selectedAppointment}
          open={rescheduleModalOpen}
          onOpenChange={setRescheduleModalOpen}
        />
      </div>
    </RoleGuard>
  );
}
