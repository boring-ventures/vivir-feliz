"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Shield,
  Activity,
} from "lucide-react";
import { useSuperAdminDashboard } from "@/hooks/use-super-admin-dashboard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function SuperAdminDashboardPage() {
  const { data: dashboardData, isLoading, error } = useSuperAdminDashboard();

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
                    Ingresos del Mes
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

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Pagos Totales</p>
              <p className="text-2xl font-bold">
                {formatCurrency(dashboardData?.financial.totalPaid || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                Recaudación histórica
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Pendiente</p>
              <p className="text-2xl font-bold">
                {formatCurrency(dashboardData?.financial.pending || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                Mora: {formatCurrency(dashboardData?.financial.overdue || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Tasa de Cobranza</p>
              <p
                className={`text-2xl font-bold ${getGrowthColor((dashboardData?.financial.collectionRate || 0) - 80)}`}
              >
                {formatPercentage(dashboardData?.financial.collectionRate || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Objetivo: 80%</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium mb-3">Métodos de Pago (Mes)</p>
              <div className="space-y-2">
                {Object.entries(
                  dashboardData?.financial.byMethod.monthly || {}
                ).map(([method, amount]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {method}
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Total histórico por método
              </p>
              <div className="mt-2 space-y-2">
                {Object.entries(
                  dashboardData?.financial.byMethod.total || {}
                ).map(([method, amount]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-muted-foreground">
                      {method}
                    </span>
                    <span className="text-xs">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend */}
        <div className="grid grid-cols-1 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium mb-3">
                Tendencia de Ingresos (6 meses)
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData?.financial.revenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(Number(v))}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Monto",
                      ]}
                      labelFormatter={(label) => `Mes: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Therapist Performance */}
        <div className="grid grid-cols-1 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium mb-3">
                Rendimiento de Terapeutas (Mes)
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Terapeuta</TableHead>
                      <TableHead className="text-right">Programadas</TableHead>
                      <TableHead className="text-right">Completadas</TableHead>
                      <TableHead className="text-right">Canceladas</TableHead>
                      <TableHead className="text-right">No Show</TableHead>
                      <TableHead className="text-right">
                        Tasa Cumplimiento
                      </TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(
                      dashboardData?.financial.monthlyTherapistPerformance || []
                    )
                      .slice(0, 10)
                      .map((t) => (
                        <TableRow key={t.therapistId}>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {t.therapistName}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {t.scheduled}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {t.completed}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {t.cancelled}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {t.noShow}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-32">
                                <Progress value={t.completionRate || 0} />
                              </div>
                              <span
                                className={`text-sm font-medium ${getGrowthColor((t.completionRate || 0) - 70)}`}
                              >
                                {formatPercentage(t.completionRate || 0)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(t.revenue || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGuard>
  );
}
