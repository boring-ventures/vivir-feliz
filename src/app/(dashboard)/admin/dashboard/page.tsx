"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <main className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Resumen general del centro de terapia infantil
          </p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pacientes Totales
                  </p>
                  <p className="text-2xl font-bold">127</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% vs mes anterior
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
                  <p className="text-sm text-muted-foreground">Citas del Mes</p>
                  <p className="text-2xl font-bold">342</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% vs mes anterior
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Ingresos Mensuales
                  </p>
                  <p className="text-2xl font-bold">Bs. 89,450</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% vs mes anterior
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Satisfacción</p>
                  <p className="text-2xl font-bold">4.8/5</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    +0.2 vs mes anterior
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
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
                  <Badge className="bg-green-100 text-green-800">89</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">En Evaluación</span>
                  <Badge className="bg-yellow-100 text-yellow-800">23</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completados</span>
                  <Badge className="bg-blue-100 text-blue-800">15</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Terapeutas Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">
                  4 Psicólogos, 2 Terapeutas del Lenguaje, 2 Terapeutas
                  Ocupacionales
                </div>
                <div className="text-sm text-green-600">Todos disponibles</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Pagado</span>
                  <span className="text-sm font-medium">Bs. 67,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pendiente</span>
                  <span className="text-sm font-medium">Bs. 22,250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tasa de Cobro</span>
                  <span className="text-sm font-medium text-green-600">
                    75%
                  </span>
                </div>
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
                <Link href="/admin/reportes">
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
                    <p className="text-sm font-medium">15 citas programadas</p>
                    <p className="text-xs text-muted-foreground">Para hoy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">3 nuevas propuestas</p>
                    <p className="text-xs text-muted-foreground">
                      Esperando aprobación
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Bs. 4,500 en pagos</p>
                    <p className="text-xs text-muted-foreground">
                      Recibidos hoy
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Alertas Importantes</CardTitle>
                <Badge variant="outline" className="text-xs">
                  3 nuevas
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700">
                      2 citas sin confirmar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Para mañana - Contactar familias
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-700">
                      Pago pendiente desde hace 15 días
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Familia García - Bs. 1,200
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                    >
                      Enviar recordatorio
                    </Button>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">
                      Evaluación completada
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Juan Pérez - Lista para terapia
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                    >
                      Programar sesiones
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGuard>
  );
}
