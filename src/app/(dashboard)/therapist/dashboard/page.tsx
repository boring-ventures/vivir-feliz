"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Calendar,
  Bell,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Send,
  Loader2,
  Receipt,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTherapistAppointments } from "@/hooks/use-therapist-appointments";
import { useTherapistPatients } from "@/hooks/use-therapist-patients";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useProposals } from "@/hooks/useProposals";

// COORDINATOR Dashboard Component
function CoordinatorDashboard() {
  const { profile } = useCurrentUser();
  const { data: proposalsData, isLoading: isLoadingProposals } = useProposals();
  const { data: appointmentsData } = useTherapistAppointments({
    status: "all",
  });

  // Get today's appointments
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments =
    appointmentsData?.appointments?.filter((apt) => {
      const appointmentDateOnly = apt.appointmentDate.split(" ")[0];
      const isToday = appointmentDateOnly === today;
      const isNotCancelled = apt.status !== "CANCELLED";
      return isToday && isNotCancelled;
    }) || [];

  // Filter proposals by status
  const newProposals =
    proposalsData?.filter((p) => p.status === "NEW_PROPOSAL") || [];
  const pendingProposals =
    proposalsData?.filter((p) => p.status === "PAYMENT_PENDING") || [];
  const confirmedProposals =
    proposalsData?.filter((p) => p.status === "PAYMENT_CONFIRMED") || [];

  const coordinatorStats = [
    {
      titulo: "Propuestas Nuevas",
      valor: newProposals.length.toString(),
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      icon: <ClipboardList className="h-6 w-6 text-yellow-600" />,
    },
    {
      titulo: "Pago Pendiente",
      valor: pendingProposals.length.toString(),
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      icon: <Receipt className="h-6 w-6 text-orange-600" />,
    },
    {
      titulo: "Pago Confirmado",
      valor: confirmedProposals.length.toString(),
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: <Receipt className="h-6 w-6 text-blue-600" />,
    },
    {
      titulo: "Citas de Hoy",
      valor: todayAppointments.length.toString(),
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      icon: <Clock className="h-6 w-6 text-purple-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            Bienvenido/a,{" "}
            {profile?.firstName && profile?.lastName
              ? `${profile.firstName} ${profile.lastName}`
              : "Coordinador/a"}
          </h1>
          <p className="text-gray-600">
            Panel de Coordinación -{" "}
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {todayAppointments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {todayAppointments.length}
              </span>
            )}
          </Button>
          <Button variant="outline" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {coordinatorStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.titulo}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.valor}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/therapist/proposals">
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Revisar Propuestas
                </Button>
              </Link>
              <Link href="/therapist/agenda">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Agenda
                </Button>
              </Link>
              <Link href="/therapist/patients">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Gestionar Pacientes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Propuestas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingProposals ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : newProposals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay propuestas nuevas para revisar
                </p>
              ) : (
                <div className="space-y-3">
                  {newProposals.slice(0, 3).map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {proposal.consultationRequest?.childName ||
                            "Paciente"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/therapist/proposals/${proposal.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Revisar
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Regular Therapist Dashboard Component
function RegularTherapistDashboard() {
  const { profile, isLoading: isLoadingUser } = useCurrentUser();
  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    useTherapistAppointments({
      status: "all",
    });
  const { data: patientsData, isLoading: isLoadingPatients } =
    useTherapistPatients({
      status: "active",
    });

  // Get today's appointments
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments =
    appointmentsData?.appointments?.filter((apt) => {
      // Extract only the date part from the datetime string (before the space)
      const appointmentDateOnly = apt.appointmentDate.split(" ")[0];
      const isToday = appointmentDateOnly === today;
      const isNotCancelled = apt.status !== "CANCELLED";
      return isToday && isNotCancelled;
    }) || [];

  // Get yesterday's appointments for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const yesterdayAppointments =
    appointmentsData?.appointments?.filter((apt) => {
      const appointmentDateOnly = apt.appointmentDate.split(" ")[0];
      const isYesterday = appointmentDateOnly === yesterdayStr;
      const isNotCancelled = apt.status !== "CANCELLED";
      return isYesterday && isNotCancelled;
    }) || [];

  // Get this week's appointments
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const getEndOfWeek = (date: Date) => {
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return endOfWeek;
  };

  const startOfWeek = getStartOfWeek(new Date()).toISOString().split("T")[0];
  const endOfWeek = getEndOfWeek(new Date()).toISOString().split("T")[0];

  const thisWeekAppointments =
    appointmentsData?.appointments?.filter((apt) => {
      // Extract only the date part from the datetime string (before the space)
      const appointmentDateOnly = apt.appointmentDate.split(" ")[0];
      const isThisWeek =
        appointmentDateOnly >= startOfWeek && appointmentDateOnly <= endOfWeek;
      const isNotCancelled = apt.status !== "CANCELLED";
      return isThisWeek && isNotCancelled;
    }) || [];

  // Get previous week's appointments for comparison
  const getPreviousWeekRange = () => {
    const today = new Date();
    const startOfThisWeek = getStartOfWeek(today);

    // Calculate previous week
    const startOfPrevWeek = new Date(startOfThisWeek);
    startOfPrevWeek.setDate(startOfThisWeek.getDate() - 7);

    const endOfPrevWeek = new Date(startOfPrevWeek);
    endOfPrevWeek.setDate(startOfPrevWeek.getDate() + 6);

    return {
      start: startOfPrevWeek.toISOString().split("T")[0],
      end: endOfPrevWeek.toISOString().split("T")[0],
    };
  };

  const prevWeekRange = getPreviousWeekRange();
  const previousWeekAppointments =
    appointmentsData?.appointments?.filter((apt) => {
      const appointmentDateOnly = apt.appointmentDate.split(" ")[0];
      const isPrevWeek =
        appointmentDateOnly >= prevWeekRange.start &&
        appointmentDateOnly <= prevWeekRange.end;
      const isNotCancelled = apt.status !== "CANCELLED";
      return isPrevWeek && isNotCancelled;
    }) || [];

  // Calculate changes
  const todayChange = todayAppointments.length - yesterdayAppointments.length;
  const weekChange =
    thisWeekAppointments.length - previousWeekAppointments.length;

  // Helper function to format change values
  const formatChange = (change: number) => {
    if (change > 0) return `+${change}`;
    if (change < 0) return `${change}`;
    return "0";
  };

  // Loading state
  const isLoading = isLoadingUser || isLoadingAppointments || isLoadingPatients;

  // Statistics from real data
  const estadisticasRapidas = [
    {
      titulo: "Pacientes Activos",
      valor: patientsData?.total?.toString() || "0",
      cambio: "", // Keep static for now as we don't have historical patient data easily accessible
      tendencia: "up",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: <Users className="h-6 w-6 text-blue-600" />,
    },
    {
      titulo: "Citas Esta Semana",
      valor: thisWeekAppointments.length.toString(),
      cambio: formatChange(weekChange),
      tendencia: weekChange >= 0 ? "up" : "down",
      color: "text-green-700",
      bgColor: "bg-green-50",
      icon: <Calendar className="h-6 w-6 text-green-600" />,
    },
    {
      titulo: "Citas Completadas",
      valor: appointmentsData?.stats?.completed?.toString() || "0",
      cambio: "", // Keep static for now as we don't have historical completed data easily accessible
      tendencia: "up",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      icon: <TrendingUp className="h-6 w-6 text-amber-600" />,
    },
    {
      titulo: "Citas de Hoy",
      valor: todayAppointments.length.toString(),
      cambio: formatChange(todayChange),
      tendencia: todayChange >= 0 ? "up" : "down",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      icon: <Clock className="h-6 w-6 text-purple-600" />,
    },
  ];

  // Transform real appointment data
  const proximasCitas = todayAppointments.slice(0, 3).map((apt) => ({
    id: apt.appointmentId,
    hora: apt.appointmentTime,
    paciente: apt.patientName,
    edad: apt.patientAge || 0,
    tipo:
      apt.type === "CONSULTA"
        ? "Consulta"
        : apt.type === "TERAPIA"
          ? "Terapia"
          : apt.type === "ENTREVISTA"
            ? "Entrevista"
            : apt.type === "SEGUIMIENTO"
              ? "Seguimiento"
              : apt.type, // fallback to original value
    estado: ["CONFIRMED", "COMPLETED", "IN_PROGRESS"].includes(apt.status)
      ? "confirmada"
      : "pendiente",
    duracion: "60 min",
    notas: apt.notes || "Sin notas adicionales",
  }));

  // Transform real patient data - using the PatientWithSessions interface structure
  const pacientesRecientes = (patientsData?.patients || [])
    .slice(0, 3)
    .map((patient) => ({
      id: patient.id,
      nombre: patient.nombre,
      edad: patient.edad,
      diagnostico: patient.diagnostico || "En evaluación",
      estado: patient.estado,
      progreso: patient.progreso,
      proximaCita: patient.proximaCita,
      sesiones: `${patient.sesiones.completadas}/${patient.sesiones.totales}`,
      estadoColor: patient.estadoColor,
    }));

  const [open, setOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<string | null>(null);

  const handleOpenModal = (paciente: string) => {
    setSelectedPaciente(paciente);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            Bienvenido/a,{" "}
            {profile?.firstName && profile?.lastName
              ? `${profile.firstName} ${profile.lastName}`
              : "Doctor/a"}
          </h1>
          <p className="text-gray-600">
            HOY -{" "}
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {todayAppointments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {todayAppointments.length}
              </span>
            )}
          </Button>
          <Button variant="outline" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {estadisticasRapidas.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.titulo}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.valor}
                    </p>
                    <p
                      className={`text-sm flex items-center ${
                        stat.tendencia === "up"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.tendencia === "up" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {stat.cambio}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Próximas Citas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    Citas de Hoy ({todayAppointments.length})
                  </CardTitle>
                  <Link href="/therapist/agenda">
                    <Button variant="outline" size="sm">
                      Ver Agenda Completa
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {proximasCitas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes citas programadas para hoy</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proximasCitas.map((cita) => (
                      <div
                        key={cita.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <Clock className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-lg">
                                  {cita.hora}
                                </p>
                                <p className="text-gray-600">{cita.duracion}</p>
                              </div>
                            </div>
                            <div className="ml-11">
                              <h4 className="font-medium">{cita.paciente}</h4>
                              <p className="text-sm text-gray-600">
                                {cita.edad} años - {cita.tipo}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {cita.notas}
                              </p>
                              <Badge
                                className={
                                  cita.estado === "confirmada"
                                    ? "bg-green-100 text-green-800 mt-2"
                                    : "bg-yellow-100 text-yellow-800 mt-2"
                                }
                              >
                                {cita.estado === "confirmada"
                                  ? "✅ Confirmada"
                                  : "⏳ Pendiente"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(cita.paciente)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Paciente
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pacientes Recientes */}
        <div className="grid grid-cols-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">
                  Pacientes Activos ({patientsData?.total || 0})
                </CardTitle>
                <Link href="/therapist/patients">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pacientesRecientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes pacientes asignados</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pacientesRecientes.map((paciente) => (
                    <div
                      key={paciente.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{paciente.nombre}</h4>
                          <p className="text-sm text-gray-600">
                            {paciente.edad} años - {paciente.diagnostico}
                          </p>
                        </div>
                        <Badge className={paciente.estadoColor}>
                          {paciente.estado}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso del tratamiento</span>
                          <span>{paciente.sesiones} sesiones</span>
                        </div>
                        <Progress value={paciente.progreso} className="h-2" />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Próxima: {paciente.proximaCita}
                          </p>
                          <div className="flex space-x-1">
                            <Link href={`/therapist/patients/${paciente.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles del Paciente</DialogTitle>
            <DialogDescription>
              Información detallada del paciente seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-gray-900">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={selectedPaciente || ""}
                className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Nombre del paciente"
                disabled
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main Dashboard Component with routing
export default function TherapistDashboardPage() {
  const { profile } = useCurrentUser();

  // Route to specialty-specific dashboard
  if (profile?.specialty === "COORDINATOR") {
    return (
      <RoleGuard allowedRoles={["THERAPIST"]}>
        <CoordinatorDashboard />
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["THERAPIST"]}>
      <RegularTherapistDashboard />
    </RoleGuard>
  );
}
