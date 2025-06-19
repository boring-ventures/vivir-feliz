"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  User,
  Calendar,
  FileText,
  Bell,
  Eye,
  Download,
  MessageSquare,
  CheckCircle,
  Heart,
  CreditCard,
  Upload,
} from "lucide-react";
import Link from "next/link";

export default function ParentDashboardPage() {
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
        <div className="mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">Próxima Cita</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Miércoles, 17 Enero 2025</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>10:00 AM - 11:00 AM</span>
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
                  <h4 className="font-semibold text-lg">Juan Pérez González</h4>
                  <p className="text-muted-foreground">
                    Sesión de Terapia del Lenguaje - Sesión 8/24
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Con Dr. Carlos Mendoza
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

        {/* Documentos Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Documentos Recientes</CardTitle>
                <Link href="/parent/documentos">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Informe de Progreso - Diciembre
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Subido el 02 Enero 2025
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      Nuevo
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Plan de Tratamiento Actualizado
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Subido el 28 Diciembre 2024
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      Nuevo
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Evaluación Inicial</p>
                      <p className="text-sm text-muted-foreground">
                        Subido el 15 Diciembre 2024
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Upload className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Documento subido</p>
                    <p className="text-xs text-muted-foreground">
                      Informe de progreso mensual - Hace 3 días
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cita confirmada</p>
                    <p className="text-xs text-muted-foreground">
                      Sesión para el 17 de Enero - Hace 5 días
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pago procesado</p>
                    <p className="text-xs text-muted-foreground">
                      Bs. 450 - Sesión del 10 Enero - Hace 1 semana
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Comentario de sesión</p>
                    <p className="text-xs text-muted-foreground">
                      "Excelente progreso en pronunciación" - Hace 1 semana
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acceso Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/parent/citas">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Mis Citas</h3>
                <p className="text-sm text-muted-foreground">
                  Ver y gestionar citas programadas
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/parent/documentos">
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

          <Link href="/parent/pagos">
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

          <Link href="/parent/progreso">
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
