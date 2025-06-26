"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserPlus, Calendar, Phone, Mail } from "lucide-react";

export default function AdminNuevosPacientesPage() {
  const [busqueda, setBusqueda] = useState("");

  // Datos de ejemplo de nuevos pacientes registrados
  const nuevosPacientes = [
    {
      id: 1,
      nombreNino: "Sofía Ramírez Castro",
      edad: 5,
      nombrePadre: "Ana Castro",
      fechaRegistro: "22/01/2025",
      telefono: "+591-7-111-2222",
      email: "ana.castro@email.com",
      motivoConsulta: "Evaluación del desarrollo del lenguaje",
      estado: "pendiente_revision",
    },
    {
      id: 2,
      nombreNino: "Diego Vargas Luna",
      edad: 7,
      nombrePadre: "Roberto Vargas",
      fechaRegistro: "21/01/2025",
      telefono: "+591-7-333-4444",
      email: "roberto.vargas@email.com",
      motivoConsulta: "Dificultades de concentración",
      estado: "pendiente_revision",
    },
    {
      id: 3,
      nombreNino: "Isabella Mendoza",
      edad: 6,
      nombrePadre: "Carmen Mendoza",
      fechaRegistro: "20/01/2025",
      telefono: "+591-7-555-6666",
      email: "carmen.mendoza@email.com",
      motivoConsulta: "Evaluación neuropsicológica",
      estado: "contactado",
    },
    {
      id: 4,
      nombreNino: "Mateo Fernández",
      edad: 8,
      nombrePadre: "Luis Fernández",
      fechaRegistro: "19/01/2025",
      telefono: "+591-7-777-8888",
      email: "luis.fernandez@email.com",
      motivoConsulta: "Problemas de comportamiento",
      estado: "primera_cita_agendada",
    },
  ];

  const filteredPacientes = nuevosPacientes.filter(
    (paciente) =>
      paciente.nombreNino.toLowerCase().includes(busqueda.toLowerCase()) ||
      paciente.nombrePadre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente_revision":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pendiente Revisión
          </span>
        );
      case "contactado":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Contactado
          </span>
        );
      case "primera_cita_agendada":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Primera Cita Agendada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Sin Estado
          </span>
        );
    }
  };

  const getAccionButton = (estado: string) => {
    switch (estado) {
      case "pendiente_revision":
        return (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Phone className="h-4 w-4 mr-2" />
            Contactar
          </Button>
        );
      case "contactado":
        return (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Cita
          </Button>
        );
      case "primera_cita_agendada":
        return (
          <Button
            variant="outline"
            size="sm"
            className="border-green-200 text-green-600 hover:bg-green-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver Cita
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevos Pacientes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y procesa las nuevas solicitudes de pacientes
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Paciente
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre del niño o padre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Pendientes (
            {
              nuevosPacientes.filter((p) => p.estado === "pendiente_revision")
                .length
            }
            )
          </Button>
          <Button variant="outline" size="sm">
            Contactados (
            {nuevosPacientes.filter((p) => p.estado === "contactado").length})
          </Button>
          <Button variant="outline" size="sm">
            Con Cita (
            {
              nuevosPacientes.filter(
                (p) => p.estado === "primera_cita_agendada"
              ).length
            }
            )
          </Button>
        </div>
      </div>

      {/* Lista de Nuevos Pacientes */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Solicitudes Recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPacientes.length === 0 ? (
            <div className="p-12 text-center">
              <UserPlus className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {busqueda
                  ? "No se encontraron pacientes"
                  : "No hay nuevos pacientes"}
              </h3>
              <p className="text-gray-500">
                {busqueda
                  ? "Intenta con otros términos de búsqueda"
                  : "Las nuevas solicitudes aparecerán aquí"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPacientes.map((paciente) => (
                <div
                  key={paciente.id}
                  className="p-6 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {paciente.nombreNino}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {paciente.edad} años
                            </span>
                            {getEstadoBadge(paciente.estado)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium text-gray-900">
                                Padre/Madre:
                              </span>
                              <p>{paciente.nombrePadre}</p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                <Phone className="h-3 w-3" />
                                <span>{paciente.telefono}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Mail className="h-3 w-3" />
                                <span>{paciente.email}</span>
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-gray-900">
                                Motivo de consulta:
                              </span>
                              <p className="mt-1">{paciente.motivoConsulta}</p>
                            </div>

                            <div>
                              <span className="font-medium text-gray-900">
                                Fecha de registro:
                              </span>
                              <p className="mt-1">{paciente.fechaRegistro}</p>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6 flex-shrink-0 flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:border-gray-300"
                          >
                            Ver Detalles
                          </Button>
                          {getAccionButton(paciente.estado)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Nuevos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {nuevosPacientes.length}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    nuevosPacientes.filter(
                      (p) => p.estado === "pendiente_revision"
                    ).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contactados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    nuevosPacientes.filter((p) => p.estado === "contactado")
                      .length
                  }
                </p>
              </div>
              <Phone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Con Cita</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    nuevosPacientes.filter(
                      (p) => p.estado === "primera_cita_agendada"
                    ).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
