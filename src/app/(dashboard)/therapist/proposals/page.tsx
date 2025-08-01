"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Edit,
  ArrowRight,
  Receipt,
  ClipboardList,
  Loader2,
  CheckCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { useTherapistProposals } from "@/hooks/useTherapistProposals";
import { useCurrentUser } from "@/hooks/use-current-user";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

interface DisplayProposal {
  id: string;
  childName: string;
  age: number;
  parentName: string;
  consultationDate: string;
  consultationReason: string;
  phone: string;
  status: string;
  analysisDate?: string;
  diagnosis?: string;
}

export default function TherapistProposalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { profile } = useCurrentUser();

  // Fetch real data from the database
  const { data: dbProposals, isLoading, refetch } = useTherapistProposals();

  // Function to send proposal to commercial or update status
  const sendToCommercial = async (
    proposalId: string | number,
    status: string = "PAYMENT_PENDING"
  ) => {
    try {
      const response = await fetch(
        `/api/admin/patients/proposals/${proposalId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de la propuesta");
      }

      const actionMessage =
        status === "PAYMENT_PENDING"
          ? "La propuesta ha sido enviada al área comercial exitosamente"
          : "El estado de la propuesta ha sido actualizado exitosamente";

      toast({
        title: "Estado actualizado",
        description: actionMessage,
      });

      // Refresh the proposals list
      refetch();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la propuesta",
        variant: "destructive",
      });
    }
  };

  // Transform database proposals to match the example data structure
  const databaseProposals: DisplayProposal[] = dbProposals
    ? dbProposals.map((proposal) => {
        // Use consultation request data for all patient information
        if (!proposal.consultationRequest) {
          console.warn(
            `Proposal ${proposal.id} has no consultation request data`
          );
          return {
            id: proposal.id,
            childName: "Información no disponible",
            age: 0,
            parentName: "Sin información",
            consultationDate: format(
              new Date(proposal.createdAt),
              "dd/MM/yyyy"
            ),
            consultationReason: proposal.title,
            phone: "Sin teléfono",
            status: proposal.status, // Keep the actual database status
            analysisDate: proposal.updatedAt
              ? format(new Date(proposal.updatedAt), "dd/MM/yyyy")
              : undefined,
            diagnosis: proposal.diagnosis,
          };
        }

        const consultationRequest = proposal.consultationRequest;

        return {
          id: proposal.id,
          childName: consultationRequest.childName,
          age: calculateAge(consultationRequest.childDateOfBirth),
          parentName:
            consultationRequest.motherName ||
            consultationRequest.fatherName ||
            "Sin nombre",
          consultationDate: format(new Date(proposal.createdAt), "dd/MM/yyyy"),
          consultationReason: proposal.title,
          phone:
            consultationRequest.motherPhone ||
            consultationRequest.fatherPhone ||
            "Sin teléfono",
          status: proposal.status, // Keep the actual database status
          analysisDate: proposal.updatedAt
            ? format(new Date(proposal.updatedAt), "dd/MM/yyyy")
            : undefined,
          diagnosis: proposal.diagnosis,
        };
      })
    : [];

  // Combine example data with database data
  const allProposals = [
    ...databaseProposals,
    // ...pendingProposals,
    // ...completedProposals,
  ];

  // Filter proposals based on search term and status
  const filteredProposals = allProposals.filter((proposal) => {
    const matchesSearch =
      proposal.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "NEW_PROPOSAL" && proposal.status === "NEW_PROPOSAL") ||
      (statusFilter === "payment_pending" &&
        proposal.status === "PAYMENT_PENDING") ||
      (statusFilter === "payment_confirmed" &&
        proposal.status === "PAYMENT_CONFIRMED") ||
      (statusFilter === "completed" &&
        (proposal.status === "TREATMENT_COMPLETED" ||
          proposal.status === "completed")) ||
      (statusFilter === "pending" &&
        (proposal.status === "pending" || proposal.status === "NEW_PROPOSAL"));

    return matchesSearch && matchesStatus;
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Helper function to calculate age
  function calculateAge(birthDate: Date | string): number {
    // Handle invalid dates
    if (!birthDate) return 0;

    // Parse birthdate properly to avoid timezone issues
    let parsedBirthDate: Date;

    if (typeof birthDate === "string") {
      // Parse string dates
      const parts = birthDate.split("T")[0].split("-"); // Get YYYY-MM-DD part
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed in JS Date
        const day = parseInt(parts[2]);
        parsedBirthDate = new Date(year, month, day);
      } else {
        parsedBirthDate = new Date(birthDate);
      }
    } else {
      parsedBirthDate = new Date(
        birthDate.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );
    }

    // Check if we got a valid date
    if (isNaN(parsedBirthDate.getTime())) {
      console.warn("Invalid birthdate:", birthDate);
      return 0;
    }

    const today = new Date();
    const todayLocal = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    let age = todayLocal.getFullYear() - parsedBirthDate.getFullYear();
    const monthDiff = todayLocal.getMonth() - parsedBirthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && todayLocal.getDate() < parsedBirthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Check if user is COORDINATOR - moved after all hooks
  if (profile?.specialty !== "COORDINATOR") {
    return (
      <RoleGuard allowedRoles={["THERAPIST"]}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Acceso no autorizado</p>
            <p className="text-sm text-gray-500">
              Solo los coordinadores pueden acceder a esta página
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["THERAPIST"]}>
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Propuestas
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  allProposals.length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Propuestas registradas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borradores</CardTitle>
              <div className="h-4 w-4 bg-yellow-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  allProposals.filter((p) => p.status === "NEW_PROPOSAL").length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Propuestas creadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pago pendiente
              </CardTitle>
              <div className="h-4 w-4 bg-orange-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  allProposals.filter((p) => p.status === "PAYMENT_PENDING")
                    .length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Enviadas a comercial
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pago Confirmado
              </CardTitle>
              <div className="h-4 w-4 bg-blue-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  allProposals.filter((p) => p.status === "PAYMENT_CONFIRMED")
                    .length
                )}
              </div>
              <p className="text-xs text-muted-foreground">Pagos confirmados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  allProposals.filter(
                    (p) =>
                      p.status === "TREATMENT_COMPLETED" ||
                      p.status === "completed"
                  ).length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Tratamientos completados
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
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  allProposals.filter((p) => p.status === "completed").length
                )}
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
                    <SelectItem value="NEW_PROPOSAL">Borrador</SelectItem>
                    <SelectItem value="payment_pending">
                      Enviada a Comercial
                    </SelectItem>
                    <SelectItem value="payment_confirmed">
                      Pago Confirmado
                    </SelectItem>
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
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-16 w-16 mx-auto animate-spin text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Cargando propuestas...
                </h3>
              </div>
            ) : filteredProposals.length === 0 ? (
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
                              {proposal.status === "NEW_PROPOSAL" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Borrador
                                </span>
                              )}
                              {proposal.status === "PAYMENT_PENDING" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Pago pendiente
                                </span>
                              )}
                              {proposal.status === "PAYMENT_CONFIRMED" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Pago Confirmado
                                </span>
                              )}
                              {(proposal.status === "TREATMENT_COMPLETED" ||
                                proposal.status === "completed") && (
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
                                {(proposal.status === "TREATMENT_COMPLETED" ||
                                  proposal.status === "completed") &&
                                  proposal.analysisDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Análisis: {proposal.analysisDate}
                                    </p>
                                  )}
                              </div>
                            </div>

                            {(proposal.status === "TREATMENT_COMPLETED" ||
                              proposal.status === "completed") &&
                              proposal.diagnosis && (
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
                            {proposal.status === "NEW_PROPOSAL" && (
                              <Link
                                href={`/therapist/proposals/${proposal.id}`}
                              >
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all">
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Crear Propuesta
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </Link>
                            )}

                            {proposal.status === "PAYMENT_PENDING" && (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    sendToCommercial(
                                      proposal.id,
                                      "NEW_PROPOSAL"
                                    )
                                  }
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  Cancelar
                                </Button>
                                <Link
                                  href={`/therapist/proposals/${proposal.id}`}
                                >
                                  <Button
                                    variant="outline"
                                    className="border-gray-200 hover:border-gray-300"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </Button>
                                </Link>
                                <Link
                                  href={`/therapist/proposals/preview/${proposal.id}`}
                                >
                                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Ver Propuesta
                                  </Button>
                                </Link>
                              </div>
                            )}

                            {proposal.status === "PAYMENT_CONFIRMED" && (
                              <Link
                                href={`/therapist/proposals/preview/${proposal.id}`}
                              >
                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Ver Propuesta
                                </Button>
                              </Link>
                            )}

                            {proposal.status === "pending" && (
                              <Link
                                href={`/therapist/proposals/${proposal.id}`}
                              >
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all">
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Crear Propuesta
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </Link>
                            )}

                            {(proposal.status === "TREATMENT_COMPLETED" ||
                              proposal.status === "completed") && (
                              <div className="flex gap-2">
                                <Link
                                  href={`/therapist/proposals/${proposal.id}`}
                                >
                                  <Button
                                    variant="outline"
                                    className="border-gray-200 hover:border-gray-300"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </Button>
                                </Link>
                                <Link
                                  href={`/therapist/proposals/preview/${proposal.id}`}
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
