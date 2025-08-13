"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";

export default function AdminDashboardPage() {
  const { data: dashboardData, isLoading, error } = useAdminDashboard();
  const SPECIALTY_LABELS: Record<string, string> = {
    SPEECH_THERAPIST: "Terapia de Lenguaje",
    OCCUPATIONAL_THERAPIST: "Terapia Ocupacional",
    PSYCHOPEDAGOGUE: "Psicopedagogía",
    ASD_THERAPIST: "Terapeuta TEA",
    NEUROPSYCHOLOGIST: "Neuropsicología",
    COORDINATOR: "Coordinación",
    PSYCHOMOTRICIAN: "Psicomotricidad",
    PEDIATRIC_KINESIOLOGIST: "Kinesiología Pediátrica",
    PSYCHOLOGIST: "Psicología",
    COORDINATION_ASSISTANT: "Asistente de Coordinación",
    BEHAVIORAL_THERAPIST: "Terapia Conductual",
    UNKNOWN: "Otro",
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-3 w-3 mr-1" />
    ) : (
      <TrendingDown className="h-3 w-3 mr-1" />
    );
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <main className="p-6">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <main className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Error al cargar datos
            </h2>
            <p className="text-muted-foreground mb-4">
              No se pudieron cargar los datos del dashboard
            </p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </main>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <TooltipProvider>
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground">
              Resumen general del centro de terapia infantil
            </p>
          </div>

          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pacientes Activos
                    </p>
                    <p className="text-2xl font-bold">
                      {dashboardData?.kpis.activePatients || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Activos en los últimos 30 días
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Citas del Mes
                    </p>
                    <p className="text-2xl font-bold">
                      {dashboardData?.kpis.monthlyAppointments || 0}
                    </p>
                    <div
                      className={`text-sm flex items-center ${getGrowthColor(dashboardData?.kpis.appointmentGrowth || 0)}`}
                    >
                      {getGrowthIcon(
                        dashboardData?.kpis.appointmentGrowth || 0
                      )}
                      {formatPercentage(
                        dashboardData?.kpis.appointmentGrowth || 0
                      )}
                      <span className="ml-1">vs mes anterior</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            aria-label="Cómo se calcula la variación"
                            className="ml-2 inline-flex rounded p-0.5 text-muted-foreground hover:text-foreground"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          ((mes actual − mes anterior) / mes anterior) × 100
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Retención</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        dashboardData?.metrics.retention.retentionRate || 0
                      )}
                      %
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={
                          dashboardData?.metrics.retention.retentionRate || 0
                        }
                      />
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <span>
                        Retenidos:{" "}
                        {dashboardData?.metrics.retention.retained || 0}
                      </span>
                      <span>
                        Perdidos: {dashboardData?.metrics.retention.lost || 0}
                      </span>
                      <span>
                        Nuevos: {dashboardData?.metrics.retention.new || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access to Requests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Solicitudes de Consulta
                  </CardTitle>
                  <Badge variant="secondary">
                    {dashboardData?.requests.consultationRequests.pending || 0}{" "}
                    nuevas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Gestiona las solicitudes de consulta inicial recibidas desde
                    el sitio web.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pendientes</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {dashboardData?.requests.consultationRequests.pending ||
                        0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Programadas</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {dashboardData?.requests.consultationRequests.scheduled ||
                        0}
                    </Badge>
                  </div>
                  <Link href="/admin/consultation-requests">
                    <Button className="w-full mt-2">
                      Ver Solicitudes de Consulta
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Solicitudes de Entrevista
                  </CardTitle>
                  <Badge variant="secondary">
                    {dashboardData?.requests.interviewRequests.pending || 0}{" "}
                    derivaciones
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Gestiona las entrevistas con derivación de colegios e
                    instituciones.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pendientes</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {dashboardData?.requests.interviewRequests.pending || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Programadas</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {dashboardData?.requests.interviewRequests.scheduled || 0}
                    </Badge>
                  </div>
                  <Link href="/admin/interview-requests">
                    <Button variant="outline" className="w-full mt-2">
                      Ver Solicitudes de Entrevista
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Secundarias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Estado de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Activos</span>
                    <Badge className="bg-green-100 text-green-800">
                      {dashboardData?.patients.active || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">En Evaluación</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {dashboardData?.patients.inEvaluation || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completados</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {dashboardData?.patients.completed || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Consultas y Evaluaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Consultas (mes)</span>
                    <Badge className="bg-green-100 text-green-800">
                      {dashboardData?.metrics.consultas.monthly || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Consultas (YTD)</span>
                    <Badge className="bg-green-100 text-green-800">
                      {dashboardData?.metrics.consultas.ytd || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Evaluaciones (mes)</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {dashboardData?.metrics.evaluaciones.monthly.total || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Evaluaciones (YTD)</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {dashboardData?.metrics.evaluaciones.ytd.total || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tratamientos activos por área (Therapist-Patient) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Tratamientos activos por área
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    Consolidado total
                  </p>
                  <p className="text-xl font-semibold">
                    {dashboardData?.metrics.tratamientosPorArea.activeTotal ||
                      0}
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.entries(
                    dashboardData?.metrics.tratamientosPorArea
                      .activeBySpecialty || {}
                  ).map(([spec, count]) => (
                    <div
                      key={spec}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-muted-foreground">
                        {SPECIALTY_LABELS[spec as string] ?? spec}
                      </span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                  {Object.keys(
                    dashboardData?.metrics.tratamientosPorArea
                      .activeBySpecialty || {}
                  ).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No hay tratamientos activos por área
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Terapeutas por área */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Terapeutas por área</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponibilidad para consultas
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Activos</span>
                  <span className="text-xl font-semibold">
                    {dashboardData?.staff.activeTherapists || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(dashboardData?.staff.bySpecialty || {}).map(
                    ([spec, { active, available }]) => (
                      <div
                        key={spec}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-muted-foreground">
                          {SPECIALTY_LABELS[spec as string] ?? spec}
                        </span>
                        <span className="text-sm">
                          <Badge className="bg-zinc-100 text-zinc-800 mr-2">
                            {active} activos
                          </Badge>
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {available} disponibles
                          </Badge>
                        </span>
                      </div>
                    )
                  )}
                  {Object.keys(dashboardData?.staff.bySpecialty || {})
                    .length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No hay terapeutas activos por área
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actividad Reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Actividad de Hoy</CardTitle>
                  <Link href="/admin/appointments">
                    <Button variant="outline" size="sm">
                      Ver Todo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {dashboardData?.today.appointments || 0} citas
                        programadas
                      </p>
                      <p className="text-xs text-muted-foreground">Para hoy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {dashboardData?.requests.consultationRequests.pending ||
                          0}{" "}
                        nuevas solicitudes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Esperando revisión
                      </p>
                    </div>
                  </div>
                  {/* Removed financial quick item */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Alertas Importantes</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {(dashboardData?.requests.consultationRequests.pending ||
                      0) +
                      (dashboardData?.requests.interviewRequests.pending || 0) +
                      (dashboardData?.patients.inEvaluation || 0)}{" "}
                    pendientes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.requests.consultationRequests.pending || 0) >
                    0 && (
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-700">
                          {dashboardData?.requests.consultationRequests
                            .pending || 0}{" "}
                          solicitudes de consulta pendientes
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requieren revisión y programación
                        </p>
                        <Link href="/admin/consultation-requests">
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                          >
                            Revisar solicitudes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {(dashboardData?.requests.interviewRequests.pending || 0) >
                    0 && (
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-700">
                          {dashboardData?.requests.interviewRequests.pending ||
                            0}{" "}
                          solicitudes de entrevista pendientes
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Derivaciones de colegios e instituciones
                        </p>
                        <Link href="/admin/interview-requests">
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                          >
                            Revisar entrevistas
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Removed financial alert block */}

                  {(dashboardData?.patients.inEvaluation || 0) > 0 && (
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-700">
                          {dashboardData?.patients.inEvaluation || 0} pacientes
                          en evaluación
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Listos para asignar terapeutas
                        </p>
                        <Link href="/admin/patients">
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                          >
                            Ver pacientes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {!(
                    dashboardData?.requests.consultationRequests.pending || 0
                  ) &&
                    !(dashboardData?.requests.interviewRequests.pending || 0) &&
                    // financial condition removed
                    !(dashboardData?.patients.inEvaluation || 0) && (
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700">
                            Todo bajo control
                          </p>
                          <p className="text-xs text-muted-foreground">
                            No hay alertas pendientes
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </TooltipProvider>
    </RoleGuard>
  );
}
