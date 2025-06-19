"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Stethoscope } from "lucide-react";
import Link from "next/link";

export default function TherapistDashboardPage() {
  return (
    <main className="p-6">
      <div className="mb-6 flex items-center space-x-2">
        <Stethoscope className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido/a, Dr. María Fernández
          </h1>
          <p className="text-muted-foreground">
            Mi panel de trabajo profesional
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pacientes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">3 nuevos este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">citas programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Reportes Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 urgentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Próximas Citas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Próximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Sofía Rodríguez</p>
                  <p className="text-sm text-gray-600">Terapia Ocupacional</p>
                  <p className="text-sm text-blue-600">10:00 AM - 11:00 AM</p>
                </div>
                <Badge>Ahora</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Luis Martín</p>
                  <p className="text-sm text-gray-600">Fisioterapia</p>
                  <p className="text-sm text-gray-600">11:30 AM - 12:30 PM</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Emma Silva</p>
                  <p className="text-sm text-gray-600">Fonoaudiología</p>
                  <p className="text-sm text-gray-600">2:00 PM - 3:00 PM</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/therapist/agenda">
                <Button variant="outline" className="w-full">
                  Ver Agenda Completa
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Actividad Reciente
              </CardTitle>
              <Badge>3 nuevas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Reporte completado</p>
                  <p className="text-sm text-gray-600">
                    Evaluación inicial - Sofía R.
                  </p>
                </div>
                <span className="text-sm text-gray-500">10:30 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Sesión completada</p>
                  <p className="text-sm text-gray-600">
                    Terapia física - Luis M.
                  </p>
                </div>
                <span className="text-sm text-gray-500">9:00 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Nuevo paciente asignado</p>
                  <p className="text-sm text-gray-600">
                    Emma Silva - Fonoaudiología
                  </p>
                </div>
                <span className="text-sm text-gray-500">Ayer</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/therapist/sesiones">
                <Button variant="outline" className="w-full">
                  Ver Todas las Sesiones
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tareas Pendientes */}
      <h2 className="text-xl font-semibold mb-4">Tareas Pendientes</h2>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Completar reporte de progreso</p>
                  <p className="text-sm text-gray-600">
                    Paciente: Carlos Méndez - Vence mañana
                  </p>
                </div>
                <div className="flex items-center">
                  <Badge variant="destructive">Urgente</Badge>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                </div>
              </div>
            </li>
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Actualizar plan de tratamiento</p>
                  <p className="text-sm text-gray-600">
                    Paciente: Ana López - Revisión semanal
                  </p>
                </div>
                <div className="flex items-center">
                  <Badge variant="secondary">Pendiente</Badge>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                </div>
              </div>
            </li>
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Revisar disponibilidad</p>
                  <p className="text-sm text-gray-600">
                    Solicitudes de citas para la próxima semana
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    5 solicitudes
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
