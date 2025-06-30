"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Search,
  ClipboardList,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function TherapistAnalysisPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("pendientes");

  // Datos de ejemplo de consultas pendientes de análisis
  const consultasPendientes = [
    {
      id: 1,
      nombreNino: "Juan Pérez González",
      edad: 8,
      nombrePadre: "María González",
      fechaConsulta: "20/01/2025",
      motivoConsulta: "Dificultades de atención en el colegio",
      telefono: "+591-7-123-4567",
      email: "maria.gonzalez@email.com",
      estado: "pendiente",
      prioridad: "alta",
    },
    {
      id: 2,
      nombreNino: "Ana García López",
      edad: 6,
      nombrePadre: "Carlos García",
      fechaConsulta: "19/01/2025",
      motivoConsulta: "Retraso en el desarrollo del lenguaje",
      telefono: "+591-7-234-5678",
      email: "carlos.garcia@email.com",
      estado: "pendiente",
      prioridad: "media",
    },
    {
      id: 3,
      nombreNino: "Luis Morales Vega",
      edad: 7,
      nombrePadre: "Ana Morales",
      fechaConsulta: "18/01/2025",
      motivoConsulta: "Problemas de comportamiento y socialización",
      telefono: "+591-7-345-6789",
      email: "ana.morales@email.com",
      estado: "pendiente",
      prioridad: "alta",
    },
    {
      id: 4,
      nombreNino: "Carmen Silva Rojas",
      edad: 9,
      nombrePadre: "Roberto Silva",
      fechaConsulta: "17/01/2025",
      motivoConsulta: "Dificultades en matemáticas y lectura",
      telefono: "+591-7-456-7890",
      email: "roberto.silva@email.com",
      estado: "pendiente",
      prioridad: "media",
    },
    {
      id: 5,
      nombreNino: "Sofía Mendoza Cruz",
      edad: 5,
      nombrePadre: "Laura Cruz",
      fechaConsulta: "16/01/2025",
      motivoConsulta: "Ansiedad por separación",
      telefono: "+591-7-567-8901",
      email: "laura.cruz@email.com",
      estado: "pendiente",
      prioridad: "baja",
    },
  ];

  const consultasCompletadas = [
    {
      id: 6,
      nombreNino: "Pedro Mamani Flores",
      edad: 7,
      nombrePadre: "Elena Mamani",
      fechaConsulta: "15/01/2025",
      fechaAnalisis: "16/01/2025",
      motivoConsulta: "Evaluación neuropsicológica",
      diagnostico: "Trastorno del Espectro Autista Nivel 1",
      recomendaciones: "Terapia conductual y apoyo escolar especializado",
      telefono: "+591-7-567-8901",
      email: "elena.mamani@email.com",
      estado: "completado",
      enviado: false,
    },
    {
      id: 7,
      nombreNino: "Isabella Torres Ruiz",
      edad: 6,
      nombrePadre: "Miguel Torres",
      fechaConsulta: "14/01/2025",
      fechaAnalisis: "15/01/2025",
      motivoConsulta: "Dificultades de aprendizaje",
      diagnostico: "Dislexia del desarrollo",
      recomendaciones: "Programa de intervención en lectoescritura",
      telefono: "+591-7-678-9012",
      email: "miguel.torres@email.com",
      estado: "completado",
      enviado: true,
    },
    {
      id: 8,
      nombreNino: "Diego Vargas Soliz",
      edad: 8,
      nombrePadre: "Patricia Soliz",
      fechaConsulta: "13/01/2025",
      fechaAnalisis: "14/01/2025",
      motivoConsulta: "Problemas de conducta",
      diagnostico: "Trastorno por Déficit de Atención e Hiperactividad",
      recomendaciones: "Terapia cognitivo-conductual y manejo parental",
      telefono: "+591-7-789-0123",
      email: "patricia.soliz@email.com",
      estado: "completado",
      enviado: true,
    },
  ];

  const filteredConsultas = (
    filtro === "pendientes" ? consultasPendientes : consultasCompletadas
  ).filter(
    (consulta) =>
      consulta.nombreNino.toLowerCase().includes(busqueda.toLowerCase()) ||
      consulta.nombrePadre.toLowerCase().includes(busqueda.toLowerCase()) ||
      consulta.motivoConsulta.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-800";
      case "media":
        return "bg-yellow-100 text-yellow-800";
      case "baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEnviarAdmin = (consultaId: number) => {
    // TODO: Implementar lógica para enviar al admin
    console.log("Enviando consulta", consultaId, "al admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Análisis de Consulta
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona y analiza las consultas de tus pacientes
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Consultas Pendientes
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {consultasPendientes.length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Análisis Completados
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {consultasCompletadas.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Alta Prioridad
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {
                        consultasPendientes.filter(
                          (c) => c.prioridad === "alta"
                        ).length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <ClipboardList className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={filtro === "pendientes" ? "default" : "ghost"}
                onClick={() => setFiltro("pendientes")}
                className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                  filtro === "pendientes"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pendientes ({consultasPendientes.length})
              </Button>
              <Button
                variant={filtro === "completados" ? "default" : "ghost"}
                onClick={() => setFiltro("completados")}
                className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                  filtro === "completados"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Completados ({consultasCompletadas.length})
              </Button>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre del niño, padre o motivo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lista de Consultas */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {filteredConsultas.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {busqueda
                      ? "No se encontraron consultas"
                      : filtro === "pendientes"
                        ? "No hay consultas pendientes"
                        : "No hay análisis completados"}
                  </h3>
                  <p className="text-gray-500">
                    {busqueda
                      ? "Intenta con otros términos de búsqueda"
                      : "Las nuevas consultas aparecerán aquí"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConsultas.map((consulta) => (
                    <div
                      key={consulta.id}
                      className="p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {consulta.nombreNino}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  {consulta.edad} años
                                </Badge>
                                {filtro === "pendientes" &&
                                  "prioridad" in consulta && (
                                    <Badge
                                      className={`text-xs ${getPrioridadColor(consulta.prioridad)}`}
                                    >
                                      {consulta.prioridad.toUpperCase()}
                                    </Badge>
                                  )}
                                {filtro === "completados" &&
                                  "enviado" in consulta && (
                                    <Badge
                                      className={`text-xs ${
                                        consulta.enviado
                                          ? "bg-green-100 text-green-800"
                                          : "bg-orange-100 text-orange-800"
                                      }`}
                                    >
                                      {consulta.enviado
                                        ? "ENVIADO"
                                        : "PENDIENTE ENVÍO"}
                                    </Badge>
                                  )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    Padre/Madre:
                                  </span>
                                  <p>{consulta.nombrePadre}</p>
                                  <p className="text-xs text-gray-500">
                                    {consulta.telefono}
                                  </p>
                                </div>

                                <div>
                                  <span className="font-medium text-gray-900">
                                    Motivo de consulta:
                                  </span>
                                  <p className="mt-1">
                                    {consulta.motivoConsulta}
                                  </p>
                                </div>

                                <div>
                                  <span className="font-medium text-gray-900">
                                    Fecha:
                                  </span>
                                  <p className="mt-1">
                                    {consulta.fechaConsulta}
                                  </p>
                                  {filtro === "completados" &&
                                    "fechaAnalisis" in consulta && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Análisis: {consulta.fechaAnalisis}
                                      </p>
                                    )}
                                </div>
                              </div>

                              {filtro === "completados" &&
                                "diagnostico" in consulta && (
                                  <div className="mt-4 space-y-2">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                      <span className="text-sm font-medium text-blue-800">
                                        Diagnóstico:
                                      </span>
                                      <p className="text-sm text-blue-700 mt-1">
                                        {consulta.diagnostico}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                      <span className="text-sm font-medium text-green-800">
                                        Recomendaciones:
                                      </span>
                                      <p className="text-sm text-green-700 mt-1">
                                        {consulta.recomendaciones}
                                      </p>
                                    </div>
                                  </div>
                                )}
                            </div>

                            <div className="ml-6 flex-shrink-0">
                              {consulta.estado === "pendiente" && (
                                <Link
                                  href={`/therapist/evaluation/${consulta.id}`}
                                >
                                  <Button className="bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all">
                                    Iniciar Análisis
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                  </Button>
                                </Link>
                              )}

                              {consulta.estado === "completado" && (
                                <div className="flex gap-2">
                                  <Link
                                    href={`/therapist/evaluation/${consulta.id}`}
                                  >
                                    <Button
                                      variant="outline"
                                      className="border-gray-200 hover:border-gray-300"
                                    >
                                      Ver Análisis
                                    </Button>
                                  </Link>
                                  {"enviado" in consulta &&
                                    !consulta.enviado && (
                                      <Button
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() =>
                                          handleEnviarAdmin(consulta.id)
                                        }
                                      >
                                        Enviar a Admin
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                      </Button>
                                    )}
                                </div>
                              )}
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
        </div>
      </main>
    </div>
  );
}
