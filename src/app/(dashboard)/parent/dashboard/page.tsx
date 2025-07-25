"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import {
  Clock,
  Calendar,
  FileText,
  Download,
  MessageSquare,
  CheckCircle,
  Heart,
  CreditCard,
  Upload,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParentDashboard } from "@/hooks/use-parent-dashboard";

export default function ParentDashboardPage() {
  const { data, isLoading, error } = useParentDashboard();

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
            <p className="text-red-600 mb-2">Error al cargar el dashboard</p>
            <p className="text-sm text-gray-600">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Reintentar
            </Button>
          </div>
        </main>
      </RoleGuard>
    );
  }

  const dashboardData = data || {
    stats: {
      totalPatients: 0,
      upcomingAppointments: 0,
      completedAppointments: 0,
      totalDocuments: 0,
      totalPaid: 0,
      totalPending: 0,
    },
    nextAppointment: null,
    recentDocuments: [],
    recentActivity: [],
  };

  // Debug logging
  console.log("Parent dashboard - Data received:", data);
  console.log("Parent dashboard - Dashboard data:", dashboardData);
  return (
    <RoleGuard allowedRoles={["PARENT"]}>
      <main className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mi Dashboard</h1>
          <p className="text-muted-foreground">
            Información sobre el progreso y citas de tu hijo/a
          </p>
        </div>

        {/* Próxima Cita */}
        {dashboardData.nextAppointment ? (
          <div className="mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">Próxima Cita</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(
                            dashboardData.nextAppointment.appointmentDate
                          ).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {dashboardData.nextAppointment.appointmentTime} -{" "}
                          {dashboardData.nextAppointment.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    ✅ Confirmada
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {dashboardData.nextAppointment.patientName}
                    </h4>
                    <p className="text-muted-foreground">
                      {dashboardData.nextAppointment.proposalTitle ||
                        "Sesión de Terapia"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Con {dashboardData.nextAppointment.therapistName}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar Terapeuta
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Reagendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-8">
            <Card className="border-l-4 border-l-gray-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl mb-2">Próxima Cita</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No tienes citas programadas próximamente.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documentos Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Documentos Recientes</CardTitle>
                <Link href="/parent/documents">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentDocuments.length > 0 ? (
                  dashboardData.recentDocuments.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{document.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {document.patientName} -{" "}
                            {new Date(document.uploadedAt).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          Nuevo
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={document.fileUrl}
                            download={document.fileName}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay documentos recientes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((activity) => {
                    const getActivityIcon = () => {
                      switch (activity.type) {
                        case "appointment":
                          return <Calendar className="h-4 w-4 text-blue-600" />;
                        case "payment":
                          return (
                            <CreditCard className="h-4 w-4 text-amber-600" />
                          );
                        case "document":
                          return <Upload className="h-4 w-4 text-green-600" />;
                        default:
                          return (
                            <CheckCircle className="h-4 w-4 text-gray-600" />
                          );
                      }
                    };

                    const getActivityColor = () => {
                      switch (activity.type) {
                        case "appointment":
                          return "bg-blue-100";
                        case "payment":
                          return "bg-amber-100";
                        case "document":
                          return "bg-green-100";
                        default:
                          return "bg-gray-100";
                      }
                    };

                    const formatTimeAgo = (dateString: string) => {
                      const date = new Date(dateString);
                      const now = new Date();
                      const diffInMs = now.getTime() - date.getTime();
                      const diffInDays = Math.floor(
                        diffInMs / (1000 * 60 * 60 * 24)
                      );

                      if (diffInDays === 0) return "Hoy";
                      if (diffInDays === 1) return "Ayer";
                      if (diffInDays < 7) return `Hace ${diffInDays} días`;
                      if (diffInDays < 30)
                        return `Hace ${Math.floor(diffInDays / 7)} semanas`;
                      return `Hace ${Math.floor(diffInDays / 30)} meses`;
                    };

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`${getActivityColor()} p-2 rounded-full`}
                        >
                          {getActivityIcon()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description} -{" "}
                            {formatTimeAgo(activity.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay actividad reciente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pacientes
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.stats.totalPatients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Citas Próximas
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.stats.upcomingAppointments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Citas Completadas
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.stats.completedAppointments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Documentos
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.stats.totalDocuments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Pagado
                  </p>
                  <p className="text-2xl font-bold">
                    Bs. {dashboardData.stats.totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pendiente
                  </p>
                  <p className="text-2xl font-bold">
                    Bs. {dashboardData.stats.totalPending.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acceso Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/parent/appointments">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Appointments</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage scheduled appointments
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/parent/documents">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  Acceder a informes y documentos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/parent/payments">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">Pagos</h3>
                <p className="text-sm text-muted-foreground">
                  Revisar estado de pagos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/parent/progress">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Progreso</h3>
                <p className="text-sm text-muted-foreground">
                  Seguimiento del desarrollo
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </RoleGuard>
  );
}
