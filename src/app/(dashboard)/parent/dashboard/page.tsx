"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ParentDashboardPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenido/a, María González
        </h1>
        <p className="text-muted-foreground">
          Resumen de las actividades de tus hijos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Próxima Cita */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Próxima Cita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Niño/a:</span>
                <span className="font-medium">Juan Pérez</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">15 de Enero, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hora:</span>
                <span className="font-medium">10:00 AM</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/parent/citas">
                <Button variant="outline" className="w-full">
                  Ver Detalles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Documento Reciente */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Documento Reciente
              </CardTitle>
              <Badge>Nuevo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Niño/a:</span>
                <span className="font-medium">Juan Pérez</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">Informe de Progreso</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">12 de Enero, 2025</span>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Link href="/parent/documentos">
                <Button variant="outline" className="flex-1">
                  Ver Documentos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Documento subido</p>
                  <p className="text-sm text-gray-600">
                    Informe de Progreso - Juan Pérez
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    Hace 2 días
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </li>
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Cita confirmada</p>
                  <p className="text-sm text-gray-600">
                    Juan Pérez - 15 de Enero, 10:00 AM
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    Hace 3 días
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </li>
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Pago recibido</p>
                  <p className="text-sm text-gray-600">
                    Consulta inicial - Bs. 250
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    Hace 3 días
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </li>
            <li className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Comentario de sesión</p>
                  <p className="text-sm text-gray-600">
                    Juan Pérez - Sesión del 10/01/2025
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    Hace 1 semana
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
