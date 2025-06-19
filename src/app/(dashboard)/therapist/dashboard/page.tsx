"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Calendar,
  Bell,
  Clock,
  Users,
  TrendingUp,
  Eye,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TherapistDashboardPage() {
  const proximasCitas = [
    {
      id: 1,
      hora: "10:00 AM",
      paciente: "Juan Pérez González",
      edad: 8,
      tipo: "Consulta Inicial",
      estado: "confirmada",
      duracion: "60 min",
      notas: "Primera evaluación - Déficit de atención",
    },
    {
      id: 2,
      hora: "2:00 PM",
      paciente: "Ana García López",
      edad: 6,
      tipo: "Seguimiento",
      estado: "confirmada",
      duracion: "45 min",
      notas: "Sesión 8/24 - Terapia del lenguaje",
    },
    {
      id: 3,
      hora: "4:30 PM",
      paciente: "Pedro Mamani Flores",
      edad: 7,
      tipo: "Evaluación",
      estado: "pendiente",
      duracion: "90 min",
      notas: "Evaluación neuropsicológica",
    },
  ];

  const estadisticasRapidas = [
    {
      titulo: "Pacientes Activos",
      valor: "12",
      cambio: "+2",
      tendencia: "up",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: <Users className="h-6 w-6 text-blue-600" />,
    },
    {
      titulo: "Citas Esta Semana",
      valor: "18",
      cambio: "+3",
      tendencia: "up",
      color: "text-green-700",
      bgColor: "bg-green-50",
      icon: <Calendar className="h-6 w-6 text-green-600" />,
    },
    {
      titulo: "Tasa de Asistencia",
      valor: "92%",
      cambio: "+5%",
      tendencia: "up",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      icon: <TrendingUp className="h-6 w-6 text-amber-600" />,
    },
    {
      titulo: "Evaluaciones Completadas",
      valor: "8",
      cambio: "+1",
      tendencia: "up",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      icon: <Clock className="h-6 w-6 text-purple-600" />,
    },
  ];

  const pacientesRecientes = [
    {
      id: 1,
      nombre: "Juan Pérez González",
      edad: 8,
      diagnostico: "Déficit de Atención",
      estado: "En tratamiento",
      progreso: 75,
      proximaCita: "Hoy 10:00 AM",
      sesiones: "8/24",
      estadoColor: "bg-green-100 text-green-800",
    },
    {
      id: 2,
      nombre: "Ana García López",
      edad: 6,
      diagnostico: "Retraso del Lenguaje",
      estado: "En tratamiento",
      progreso: 60,
      proximaCita: "Hoy 2:00 PM",
      sesiones: "12/24",
      estadoColor: "bg-green-100 text-green-800",
    },
    {
      id: 3,
      nombre: "Pedro Mamani Flores",
      edad: 7,
      diagnostico: "Evaluación Pendiente",
      estado: "En evaluación",
      progreso: 25,
      proximaCita: "Hoy 4:30 PM",
      sesiones: "2/4",
      estadoColor: "bg-amber-100 text-amber-800",
    },
  ];

  const [open, setOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<string | null>(null);

  const handleOpenModal = (paciente: string) => {
    setSelectedPaciente(paciente);
    setOpen(true);
  };

  return (
    <RoleGuard allowedRoles={["THERAPIST"]}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">
              Bienvenido/a, Dr. Carlos Mendoza
            </h1>
            <p className="text-gray-600">HOY - Miércoles, 15 Enero 2025</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {estadisticasRapidas.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.titulo}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.valor}
                      </p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.cambio}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Próximas Citas */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">
                      Próximas Citas
                    </CardTitle>
                    <Link href="/therapist/agenda">
                      <Button variant="outline" size="sm">
                        Ver Agenda Completa
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {proximasCitas.map((cita) => (
                      <div
                        key={cita.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <Clock className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-lg">
                                  {cita.hora}
                                </p>
                                <p className="text-gray-600">{cita.duracion}</p>
                              </div>
                            </div>
                            <div className="ml-11">
                              <h4 className="font-medium">{cita.paciente}</h4>
                              <p className="text-sm text-gray-600">
                                {cita.edad} años - {cita.tipo}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {cita.notas}
                              </p>
                              <Badge
                                className={
                                  cita.estado === "confirmada"
                                    ? "bg-green-100 text-green-800 mt-2"
                                    : "bg-yellow-100 text-yellow-800 mt-2"
                                }
                              >
                                {cita.estado === "confirmada"
                                  ? "✅ Confirmada"
                                  : "⏳ Pendiente"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(cita.paciente)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Paciente
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pacientes Recientes */}
          <div className="grid grid-cols-1">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    Pacientes Recientes
                  </CardTitle>
                  <Link href="/therapist/pacientes">
                    <Button variant="outline" size="sm">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {pacientesRecientes.map((paciente) => (
                    <div
                      key={paciente.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{paciente.nombre}</h4>
                          <p className="text-sm text-gray-600">
                            {paciente.edad} años - {paciente.diagnostico}
                          </p>
                        </div>
                        <Badge className={paciente.estadoColor}>
                          {paciente.estado}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso del tratamiento</span>
                          <span>{paciente.sesiones} sesiones</span>
                        </div>
                        <Progress value={paciente.progreso} className="h-2" />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Próxima: {paciente.proximaCita}
                          </p>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Detalles del Paciente</DialogTitle>
              <DialogDescription>
                Información detallada del paciente seleccionado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-gray-900">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  value={selectedPaciente || ""}
                  className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Nombre del paciente"
                  disabled
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
