"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ArrowRight,
  ClipboardList,
  Receipt,
  FileText,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";

export default function AdminProposalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Example data for pending and completed proposals
  const pendingProposals = [
    {
      id: 1,
      childName: "Juan Pérez González",
      age: 8,
      parentName: "María González",
      consultationDate: "20/01/2025",
      consultationReason: "Dificultades de atención en el colegio",
      phone: "+591-7-123-4567",
      email: "maria.gonzalez@email.com",
      status: "pending",
    },
    {
      id: 2,
      childName: "Ana García López",
      age: 6,
      parentName: "Carlos García",
      consultationDate: "19/01/2025",
      consultationReason: "Retraso en el desarrollo del lenguaje",
      phone: "+591-7-234-5678",
      email: "carlos.garcia@email.com",
      status: "pending",
    },
    {
      id: 3,
      childName: "Luis Morales Vega",
      age: 7,
      parentName: "Ana Morales",
      consultationDate: "18/01/2025",
      consultationReason: "Problemas de comportamiento y socialización",
      phone: "+591-7-345-6789",
      email: "ana.morales@email.com",
      status: "pending",
    },
    {
      id: 4,
      childName: "Carmen Silva Rojas",
      age: 9,
      parentName: "Roberto Silva",
      consultationDate: "17/01/2025",
      consultationReason: "Dificultades en matemáticas y lectura",
      phone: "+591-7-456-7890",
      email: "roberto.silva@email.com",
      status: "pending",
    },
  ];

  const completedProposals = [
    {
      id: 5,
      childName: "Pedro Mamani Flores",
      age: 7,
      parentName: "Elena Mamani",
      consultationDate: "15/01/2025",
      analysisDate: "16/01/2025",
      consultationReason: "Evaluación neuropsicológica",
      diagnosis: "Trastorno del Espectro Autista",
      phone: "+591-7-567-8901",
      email: "elena.mamani@email.com",
      status: "completed",
    },
  ];

  const allProposals = [...pendingProposals, ...completedProposals];

  const filteredProposals = allProposals.filter((proposal) => {
    const matchesSearch =
      proposal.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && proposal.status === "pending") ||
      (statusFilter === "completed" && proposal.status === "completed");

    return matchesSearch && matchesStatus;
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Propuestas</h1>
            <p className="text-gray-600">
              Gestiona y analiza las propuestas de los pacientes
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Propuestas
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allProposals.length}</div>
              <p className="text-xs text-muted-foreground">
                Propuestas registradas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <div className="h-4 w-4 bg-yellow-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingProposals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Esperando elaboración
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedProposals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Propuestas enviadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Económicas</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedProposals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Propuestas económicas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Proposals List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Propuestas</CardTitle>
              <div className="flex items-center space-x-2">
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="completed">Completadas</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <form onSubmit={(e) => e.preventDefault()}>
                    <Input
                      placeholder="Buscar propuestas..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8 w-64"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      name="proposal-search-input"
                    />
                  </form>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredProposals.length === 0 ? (
              <div className="p-12 text-center">
                <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== "all"
                    ? "No se encontraron propuestas"
                    : "No hay propuestas registradas"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Intenta con otros términos de búsqueda o filtros"
                    : "Las nuevas propuestas aparecerán aquí"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="p-6 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {proposal.childName}
                              </h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {proposal.age} años
                              </span>
                              {proposal.status === "pending" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pendiente
                                </span>
                              )}
                              {proposal.status === "completed" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completado
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium text-gray-900">
                                  Padre/Madre:
                                </span>
                                <p>{proposal.parentName}</p>
                                <p className="text-xs text-gray-500">
                                  {proposal.phone}
                                </p>
                              </div>

                              <div>
                                <span className="font-medium text-gray-900">
                                  Motivo de consulta:
                                </span>
                                <p className="mt-1">
                                  {proposal.consultationReason}
                                </p>
                              </div>

                              <div>
                                <span className="font-medium text-gray-900">
                                  Fecha:
                                </span>
                                <p className="mt-1">
                                  {proposal.consultationDate}
                                </p>
                                {proposal.status === "completed" &&
                                  "analysisDate" in proposal && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Análisis: {proposal.analysisDate}
                                    </p>
                                  )}
                              </div>
                            </div>

                            {proposal.status === "completed" &&
                              "diagnosis" in proposal && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                  <span className="text-sm font-medium text-green-800">
                                    Diagnóstico:
                                  </span>
                                  <p className="text-sm text-green-700 mt-1">
                                    {proposal.diagnosis}
                                  </p>
                                </div>
                              )}
                          </div>

                          <div className="ml-6 flex-shrink-0">
                            {proposal.status === "pending" && (
                              <Link href={`/admin/proposals/${proposal.id}`}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all">
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Crear Propuesta
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </Link>
                            )}

                            {proposal.status === "completed" && (
                              <div className="flex gap-2">
                                <Link href={`/admin/proposals/${proposal.id}`}>
                                  <Button
                                    variant="outline"
                                    className="border-gray-200 hover:border-gray-300"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Editar
                                  </Button>
                                </Link>
                                <Link
                                  href={`/admin/proposals/preview/${proposal.id}`}
                                >
                                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Ver Propuesta
                                  </Button>
                                </Link>
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
    </RoleGuard>
  );
}
