"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import {
  User,
  Bell,
  Search,
  ClipboardList,
  ArrowRight,
  CheckCircle,
  Calendar,
  CalendarDays,
  Clock4,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  useTherapistAppointments,
  useSendAnalysisToAdmin,
} from "@/hooks/use-therapist-appointments";
import { toast } from "@/components/ui/use-toast";

export default function TherapistAnalysisPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"all" | "scheduled" | "completed">(
    "scheduled"
  );

  // Fetch appointments based on current filter
  const { data, isLoading, error, refetch } = useTherapistAppointments({
    status: filtro,
    limit: 50,
  });

  const sendAnalysisToAdmin = useSendAnalysisToAdmin();

  // Filter appointments based on search (API now only returns CONSULTA appointments)
  const filteredAppointments =
    data?.appointments?.filter(
      (appointment) =>
        appointment.patientName
          .toLowerCase()
          .includes(busqueda.toLowerCase()) ||
        appointment.parentName.toLowerCase().includes(busqueda.toLowerCase()) ||
        appointment.notes.toLowerCase().includes(busqueda.toLowerCase())
    ) || [];

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-800";
      case "media":
        return "bg-yellow-100 text-yellow-800";
      case "baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CONSULTA":
        return "bg-blue-100 text-blue-800";
      case "ENTREVISTA":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    // Parse date as local date to avoid timezone issues
    const parts = dateString.split("T")[0].split("-"); // Get YYYY-MM-DD part
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[2]);
    const date = new Date(year, month, day);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Format HH:MM
  };

  const handleEnviarAdmin = async (appointmentId: string) => {
    try {
      await sendAnalysisToAdmin.mutateAsync(appointmentId);
      toast({
        title: "Análisis enviado",
        description:
          "El análisis ha sido enviado al administrador exitosamente.",
      });
      refetch();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo enviar el análisis al administrador.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="flex-1">
          <header className="bg-white shadow-sm border-b p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Análisis de Consultas
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona y analiza las consultas programadas
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Nuevo:</strong> Las consultas ahora incluyen
                    formularios médicos detallados completados por los padres,
                    proporcionando información completa sobre desarrollo,
                    historia médica y contexto familiar.
                  </p>
                </div>
              </div>
            </div>
          </header>
          <div className="p-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error al cargar las citas
                </h3>
                <p className="text-gray-500 mb-4">
                  No se pudieron cargar las citas programadas
                </p>
                <Button onClick={() => refetch()}>Intentar de nuevo</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Análisis de Consultas
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona y analiza las consultas programadas
              </p>
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
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Consultas Programadas
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {data?.stats?.scheduled || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Análisis Completados
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {data?.stats?.completed || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Consultas Alta Prioridad
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {data?.stats?.highPriority || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <ClipboardList className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Consultas Filtradas
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {filteredAppointments.length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={filtro === "scheduled" ? "default" : "ghost"}
                onClick={() => setFiltro("scheduled")}
                className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                  filtro === "scheduled"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Programadas ({data?.stats?.scheduled || 0})
              </Button>
              <Button
                variant={filtro === "completed" ? "default" : "ghost"}
                onClick={() => setFiltro("completed")}
                className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                  filtro === "completed"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Completadas ({data?.stats?.completed || 0})
              </Button>
              <Button
                variant={filtro === "all" ? "default" : "ghost"}
                onClick={() => setFiltro("all")}
                className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                  filtro === "all"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Todas
              </Button>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre del niño, padre o tipo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lista de Consultas */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Cargando citas...
                  </h3>
                  <p className="text-gray-500">
                    Por favor espera mientras cargamos las citas programadas
                  </p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {busqueda
                      ? "No se encontraron citas"
                      : filtro === "scheduled"
                        ? "No hay citas programadas"
                        : filtro === "completed"
                          ? "No hay análisis completados"
                          : "No hay citas disponibles"}
                  </h3>
                  <p className="text-gray-500">
                    {busqueda
                      ? "Intenta con otros términos de búsqueda"
                      : "Las nuevas citas aparecerán aquí cuando se programen"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {appointment.patientName}
                                </h3>
                                {appointment.patientAge !== null &&
                                  appointment.patientAge !== undefined && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {appointment.patientAge} años
                                    </Badge>
                                  )}
                                <Badge
                                  className={`text-xs ${getTypeColor(appointment.type)}`}
                                >
                                  {appointment.type === "CONSULTA"
                                    ? "CONSULTA"
                                    : "ENTREVISTA"}
                                </Badge>
                                {appointment.type === "CONSULTA" && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-green-100 text-green-800"
                                  >
                                    📋 Formulario médico
                                  </Badge>
                                )}
                                <Badge
                                  className={`text-xs ${getPrioridadColor(appointment.priority)}`}
                                >
                                  {appointment.priority.toUpperCase()}
                                </Badge>
                                {appointment.status === "COMPLETED" && (
                                  <Badge
                                    className={`text-xs ${
                                      appointment.sentToAdmin
                                        ? "bg-green-100 text-green-800"
                                        : "bg-orange-100 text-orange-800"
                                    }`}
                                  >
                                    {appointment.sentToAdmin
                                      ? "ENVIADO"
                                      : "PENDIENTE ENVÍO"}
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    Padre/Madre:
                                  </span>
                                  <p>{appointment.parentName}</p>
                                  <p className="text-xs text-gray-500">
                                    {appointment.parentPhone}
                                  </p>
                                </div>

                                <div>
                                  <span className="font-medium text-gray-900">
                                    Cita programada:
                                  </span>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <CalendarDays className="h-4 w-4 text-blue-500" />
                                    <span>
                                      {formatDate(appointment.appointmentDate)}
                                    </span>
                                    <Clock4 className="h-4 w-4 text-blue-500 ml-2" />
                                    <span>
                                      {formatTime(appointment.appointmentTime)}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-medium text-gray-900">
                                    Estado:
                                  </span>
                                  <div className="mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {appointment.status === "SCHEDULED"
                                        ? "PROGRAMADA"
                                        : appointment.status === "CONFIRMED"
                                          ? "CONFIRMADA"
                                          : appointment.status === "COMPLETED"
                                            ? "COMPLETADA"
                                            : appointment.status}
                                    </Badge>
                                  </div>
                                  {appointment.analysisDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Análisis:{" "}
                                      {formatDate(appointment.analysisDate)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {appointment.notes && (
                                <div className="mt-4">
                                  <span className="text-sm font-medium text-gray-900">
                                    Notas:
                                  </span>
                                  <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                                    {appointment.notes}
                                  </p>
                                </div>
                              )}

                              {appointment.status === "COMPLETED" &&
                                appointment.diagnosis && (
                                  <div className="mt-4 space-y-2">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                      <span className="text-sm font-medium text-blue-800">
                                        Diagnóstico:
                                      </span>
                                      <p className="text-sm text-blue-700 mt-1">
                                        {appointment.diagnosis}
                                      </p>
                                    </div>
                                    {appointment.recommendations && (
                                      <div className="p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm font-medium text-green-800">
                                          Recomendaciones:
                                        </span>
                                        <p className="text-sm text-green-700 mt-1">
                                          {appointment.recommendations}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>

                            <div className="ml-6 flex-shrink-0">
                              {appointment.status !== "COMPLETED" && (
                                <Link
                                  href={`/therapist/analysis/${appointment.id}`}
                                >
                                  <Button className="bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all">
                                    Iniciar Análisis
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                  </Button>
                                </Link>
                              )}

                              {appointment.status === "COMPLETED" && (
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <Link
                                      href={`/therapist/analysis/${appointment.id}`}
                                    >
                                      <Button
                                        variant="outline"
                                        className="border-gray-200 hover:border-gray-300"
                                      >
                                        Ver Análisis
                                      </Button>
                                    </Link>
                                    {!appointment.sentToAdmin && (
                                      <>
                                        <Link
                                          href={`/therapist/analysis/${appointment.id}/proposal`}
                                        >
                                          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Generar Propuesta Técnica
                                          </Button>
                                        </Link>
                                        <Button
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                          onClick={() =>
                                            handleEnviarAdmin(appointment.id)
                                          }
                                          disabled={
                                            sendAnalysisToAdmin.isPending
                                          }
                                        >
                                          {sendAnalysisToAdmin.isPending ? (
                                            <Loader className="h-4 w-4 mr-2" />
                                          ) : (
                                            <>
                                              Enviar a Admin
                                              <ArrowRight className="h-4 w-4 ml-2" />
                                            </>
                                          )}
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
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
      </main>
    </div>
  );
}
