"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  User,
  Phone,
  Mail,
  School,
  Clock,
  UserCheck,
  MoreHorizontal,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  useInterviewRequests,
  useUpdateInterviewRequest,
  type InterviewRequest,
} from "@/hooks/use-interview-requests";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminInterviewRequestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<InterviewRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const pageSize = 10;

  const { data, isLoading, error } = useInterviewRequests({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateInterviewRequest = useUpdateInterviewRequest();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "SCHEDULED":
        return "Programada";
      case "COMPLETED":
        return "Completada";
      case "CANCELLED":
        return "Cancelada";
      default:
        return status;
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateInterviewRequest.mutateAsync({
        id,
        updates: { status: newStatus as InterviewRequest["status"] },
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleViewDetails = (request: InterviewRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const filteredRequests =
    data?.data?.filter(
      (request) =>
        request.childFirstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.childLastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const totalPages = data?.pagination?.totalPages || 1;

  // Calculate statistics
  const totalRequests = data?.pagination?.total || 0;
  const pendingRequests =
    data?.data?.filter((r) => r.status === "PENDING").length || 0;
  const scheduledRequests =
    data?.data?.filter((r) => r.status === "SCHEDULED").length || 0;
  const completedRequests =
    data?.data?.filter((r) => r.status === "COMPLETED").length || 0;

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="space-y-6 p-6">
          <div className="text-center py-8 text-red-600">
            Error al cargar las solicitudes
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Solicitudes de Entrevista</h1>
            <p className="text-gray-600">
              Gestiona las solicitudes de entrevista con derivación escolar
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Solicitudes
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                Solicitudes registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <div className="h-4 w-4 bg-yellow-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                Esperando revisión
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programadas</CardTitle>
              <div className="h-4 w-4 bg-blue-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledRequests}</div>
              <p className="text-xs text-muted-foreground">Citas programadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedRequests}</div>
              <p className="text-xs text-muted-foreground">
                Entrevistas realizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interview Requests Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Solicitudes</CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="SCHEDULED">Programada</SelectItem>
                    <SelectItem value="COMPLETED">Completada</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar solicitudes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Niño/a</TableHead>
                    <TableHead>Padre/Madre</TableHead>
                    <TableHead>Colegio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Solicitud</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">
                            No se encontraron solicitudes
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Intenta con otros términos de búsqueda"
                              : "No hay solicitudes de entrevista disponibles"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.childFirstName} {request.childLastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {calculateAge(request.childDateOfBirth)} años •{" "}
                              {request.childGender}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.parentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.parentPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {request.schoolName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(request.createdAt), "dd/MM/yyyy", {
                              locale: es,
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(request.createdAt), "HH:mm", {
                              locale: es,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(request)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalles
                              </DropdownMenuItem>
                              {request.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(
                                        request.id,
                                        "SCHEDULED"
                                      )
                                    }
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Programar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(
                                        request.id,
                                        "CANCELLED"
                                      )
                                    }
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancelar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                    {Math.min(
                      currentPage * pageSize,
                      data?.pagination?.total || 0
                    )}{" "}
                    de {data?.pagination?.total || 0} solicitudes
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles de la Solicitud de Entrevista</DialogTitle>
              <DialogDescription>
                Información completa de la solicitud de entrevista
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Child Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Información del Niño/a
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Nombre Completo
                      </label>
                      <p className="text-lg font-medium">
                        {selectedRequest.childFirstName}{" "}
                        {selectedRequest.childLastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Fecha de Nacimiento
                      </label>
                      <p>
                        {format(
                          new Date(selectedRequest.childDateOfBirth),
                          "dd/MM/yyyy",
                          {
                            locale: es,
                          }
                        )}{" "}
                        ({calculateAge(selectedRequest.childDateOfBirth)} años)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Sexo
                      </label>
                      <p className="capitalize">
                        {selectedRequest.childGender}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Información del Padre/Madre
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Nombre Completo
                      </label>
                      <p className="text-lg font-medium">
                        {selectedRequest.parentName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Teléfono
                      </label>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedRequest.parentPhone}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedRequest.parentEmail}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* School Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-5 w-5" />
                      Derivación del Colegio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Nombre del Colegio
                      </label>
                      <p className="text-lg font-medium">
                        {selectedRequest.schoolName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Descripción del Motivo
                      </label>
                      <p className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                        {selectedRequest.derivationDescription}
                      </p>
                    </div>
                    {selectedRequest.derivationFileUrl && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Archivo de Derivación
                        </label>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Archivo
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Request Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Estado de la Solicitud
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Estado Actual
                        </label>
                        <div className="mt-1">
                          <Badge
                            className={getStatusColor(selectedRequest.status)}
                          >
                            {getStatusLabel(selectedRequest.status)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Fecha de Solicitud
                        </label>
                        <p>
                          {format(
                            new Date(selectedRequest.createdAt),
                            "dd/MM/yyyy 'a las' HH:mm",
                            {
                              locale: es,
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {selectedRequest.assignedTherapist && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Terapeuta Asignado
                        </label>
                        <p className="text-lg font-medium">
                          {selectedRequest.assignedTherapist.firstName}{" "}
                          {selectedRequest.assignedTherapist.lastName}
                        </p>
                        {selectedRequest.assignedTherapist.specialty && (
                          <p className="text-sm text-gray-600">
                            {selectedRequest.assignedTherapist.specialty}
                          </p>
                        )}
                      </div>
                    )}

                    {(selectedRequest.scheduledDate ||
                      selectedRequest.scheduledTime) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Fecha y Hora Programada
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {selectedRequest.scheduledDate &&
                              format(
                                new Date(selectedRequest.scheduledDate),
                                "dd/MM/yyyy",
                                {
                                  locale: es,
                                }
                              )}
                            {selectedRequest.scheduledTime &&
                              ` a las ${selectedRequest.scheduledTime}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedRequest.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Notas Adicionales
                        </label>
                        <p className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                          {selectedRequest.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
