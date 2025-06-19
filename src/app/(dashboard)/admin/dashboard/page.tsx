"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Shield } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="p-6">
      <div className="mb-6 flex items-center space-x-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestión integral del sistema Vivir Feliz
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Terapeutas Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">6 pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. 45,200</div>
            <p className="text-xs text-muted-foreground">+8% vs mes anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Usuarios Recientes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Usuarios Recientes
              </CardTitle>
              <Badge>5 nuevos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Ana García</p>
                  <p className="text-sm text-gray-600">
                    Padre - Registrado hoy
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Dr. Carlos Ruiz</p>
                  <p className="text-sm text-gray-600">
                    Terapeuta - Registrado ayer
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/usuarios">
                <Button variant="outline" className="w-full">
                  Ver Todos los Usuarios
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Alertas del Sistema */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Backup pendiente</p>
                  <p className="text-sm text-gray-600">
                    Último backup: hace 2 días
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Sistema actualizado</p>
                  <p className="text-sm text-gray-600">
                    Versión 2.1.0 instalada
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/configuracion">
                <Button variant="outline" className="w-full">
                  Ver Configuración
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <h2 className="text-xl font-semibold mb-4">
        Actividad Reciente del Sistema
      </h2>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Nuevo registro de usuario</p>
                  <p className="text-sm text-gray-600">
                    Ana García se registró como padre
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    Hace 1 hora
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </li>
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Cita completada</p>
                  <p className="text-sm text-gray-600">
                    Dr. Martínez - Sesión de fisioterapia
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    Hace 2 horas
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </li>
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Pago procesado</p>
                  <p className="text-sm text-gray-600">
                    Familia González - Bs. 350
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    Hace 3 horas
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
