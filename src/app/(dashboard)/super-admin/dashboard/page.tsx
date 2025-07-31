"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  CheckCircle,
  Shield,
  Settings,
  Database,
  Activity,
  BarChart3,
  Globe,
  HardDrive,
} from "lucide-react";
import Link from "next/link";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";

export default function SuperAdminDashboardPage() {
  const { data: dashboardData, isLoading, error } = useAdminDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
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
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
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
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
      <main className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Panel de control del sistema completo - Gestión administrativa
            avanzada
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Usuarios del Sistema
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData?.kpis.totalPatients || 0}
                  </p>
                  <p
                    className={`text-sm flex items-center ${getGrowthColor(dashboardData?.kpis.patientGrowth || 0)}`}
                  >
                    {getGrowthIcon(dashboardData?.kpis.patientGrowth || 0)}
                    {formatPercentage(
                      dashboardData?.kpis.patientGrowth || 0
                    )}{" "}
                    vs mes anterior
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Actividad del Sistema
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData?.kpis.monthlyAppointments || 0}
                  </p>
                  <p
                    className={`text-sm flex items-center ${getGrowthColor(dashboardData?.kpis.appointmentGrowth || 0)}`}
                  >
                    {getGrowthIcon(dashboardData?.kpis.appointmentGrowth || 0)}
                    {formatPercentage(
                      dashboardData?.kpis.appointmentGrowth || 0
                    )}{" "}
                    vs mes anterior
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ingresos Totales
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(dashboardData?.kpis.monthlyRevenue || 0)}
                  </p>
                  <p
                    className={`text-sm flex items-center ${getGrowthColor(dashboardData?.kpis.revenueGrowth || 0)}`}
                  >
                    {getGrowthIcon(dashboardData?.kpis.revenueGrowth || 0)}
                    {formatPercentage(
                      dashboardData?.kpis.revenueGrowth || 0
                    )}{" "}
                    vs mes anterior
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGuard>
  );
}
