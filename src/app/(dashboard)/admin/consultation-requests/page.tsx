"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Calendar,
  User,
  School,
  FileText,
  Users,
  Edit,
  CheckCircle,
  Clock,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  useConsultationRequests,
  useUpdateConsultationRequest,
  type ConsultationRequest,
} from "@/hooks/use-consultation-requests";

const statusConfig = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  SCHEDULED: {
    label: "Programada",
    color: "bg-blue-100 text-blue-800",
    icon: Calendar,
  },
  COMPLETED: {
    label: "Completada",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-800", icon: X },
};

export default function ConsultationRequestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<ConsultationRequest | null>(null);
  const [editingRequest, setEditingRequest] =
    useState<ConsultationRequest | null>(null);

  const pageSize = 10;

  const { data, isLoading, error } = useConsultationRequests({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateConsultationRequest = useUpdateConsultationRequest();

  const handleStatusUpdate = async (
    id: string,
    status: ConsultationRequest["status"],
    notes?: string
  ) => {
    try {
      await updateConsultationRequest.mutateAsync({
        id,
        data: { status, notes },
      });
      setEditingRequest(null);
    } catch (error) {
      console.error("Error updating consultation request:", error);
    }
  };

  const handleSchedule = async (
    id: string,
    scheduledDate: string,
    scheduledTime: string,
    assignedTherapistId?: string
  ) => {
    try {
      await updateConsultationRequest.mutateAsync({
        id,
        data: {
          status: "SCHEDULED",
          scheduledDate,
          scheduledTime,
          assignedTherapistId,
        },
      });
      setEditingRequest(null);
    } catch (error) {
      console.error("Error scheduling consultation:", error);
    }
  };

  const filteredRequests =
    data?.consultationRequests?.filter(
      (request: ConsultationRequest) =>
        request.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.motherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.fatherName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getSelectedReasons = (
    consultationReasons: Record<string, unknown> | object
  ) => {
    if (!consultationReasons) return [];

    const reasonLabels: { [key: string]: string } = {
      dificultadesLenguaje: "Lenguaje/comunicación",
      retrasoMotor: "Desarrollo motor",
      problemasCoordinacion: "Coordinación motora",
      dificultadesAprendizaje: "Aprendizaje escolar",
      problemasAtencion: "Atención/concentración",
      dificultadesInteraccion: "Interacción social",
      indicadoresComportamiento: "Indicadores comportamiento",
      problemasComportamiento: "Comportamiento",
      dificultadesAlimentacion: "Alimentación",
      dificultadesSueno: "Sueño",
      sensibilidadEstimulos: "Sensibilidad estímulos",
      bajaAutoestima: "Autoestima/timidez",
      dificultadesControl: "Control esfínteres",
      dificultadesAutonomia: "Autonomía",
      diagnosticoPrevio: "Diagnóstico previo",
      otro: "Otro motivo",
      necesitaOrientacion: "Orientación general",
      noSeguroDificultad: "Incertidumbre",
      quiereValoracion: "Valoración general",
      derivacionColegio: "Derivación colegio",
      evaluacionReciente: "Evaluación reciente",
      evaluacionMedica: "Evaluación médica",
    };

    const reasons: string[] = [];
    Object.entries(consultationReasons as Record<string, unknown>).forEach(
      ([key, value]) => {
        if (value === true && reasonLabels[key]) {
          reasons.push(reasonLabels[key]);
        }
      }
    );

    return reasons;
  };

  const formatLivingWith = (livesWith: string, otherLivesWith?: string) => {
    const options: { [key: string]: string } = {
      "ambos-padres": "Ambos padres",
      "solo-madre": "Solo madre",
      "solo-padre": "Solo padre",
      "padres-adoptivos": "Padres adoptivos",
      "algun-pariente": "Algún pariente",
      "padre-madrastra": "Padre y madrastra",
      "madre-padrastro": "Madre y padrastro",
      otros: `Otros: ${otherLivesWith || "No especificado"}`,
    };
    return options[livesWith] || livesWith;
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      return (age - 1).toString();
    }
    return age.toString();
  };

  // Calculate statistics
  const totalRequests = data?.pagination?.total || 0;
  const pendingRequests =
    data?.consultationRequests?.filter((r) => r.status === "PENDING").length ||
    0;
  const scheduledRequests =
    data?.consultationRequests?.filter((r) => r.status === "SCHEDULED")
      .length || 0;
  const completedRequests =
    data?.consultationRequests?.filter((r) => r.status === "COMPLETED")
      .length || 0;

  const totalPages = data?.pagination?.pages || 1;

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            Error al cargar las solicitudes de consulta
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
            <h1 className="text-3xl font-bold">Solicitudes de Consulta</h1>
            <p className="text-gray-600">
              Gestiona las solicitudes de consulta recibidas
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
                Consultas realizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Niño/a</TableHead>
                  <TableHead>Contacto Principal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Solicitud</TableHead>
                  <TableHead>Precio</TableHead>
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
                            : "No hay solicitudes de consulta disponibles"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request: ConsultationRequest) => {
                    const StatusIcon =
                      statusConfig[request.status as keyof typeof statusConfig]
                        ?.icon || Clock;
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.childName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {calculateAge(request.childDateOfBirth)} años •{" "}
                              {request.childGender}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {request.motherName && (
                              <div>
                                <div className="font-medium">
                                  {request.motherName}
                                </div>
                                {request.motherPhone && (
                                  <div className="text-sm text-gray-500">
                                    {request.motherPhone}
                                  </div>
                                )}
                              </div>
                            )}
                            {request.fatherName && !request.motherName && (
                              <div>
                                <div className="font-medium">
                                  {request.fatherName}
                                </div>
                                {request.fatherPhone && (
                                  <div className="text-sm text-gray-500">
                                    {request.fatherPhone}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              statusConfig[
                                request.status as keyof typeof statusConfig
                              ]?.color
                            }
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {
                              statusConfig[
                                request.status as keyof typeof statusConfig
                              ]?.label
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            Bs. {request.price || 250}
                          </Badge>
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
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingRequest(request)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Gestionar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles de la Solicitud</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                {/* Child Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Información del Niño/a
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <strong>Nombre:</strong> {selectedRequest.childName}
                    </p>
                    <p>
                      <strong>Género:</strong> {selectedRequest.childGender}
                    </p>
                    <p>
                      <strong>Fecha de Nacimiento:</strong>{" "}
                      {new Date(
                        selectedRequest.childDateOfBirth
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Edad:</strong>{" "}
                      {calculateAge(selectedRequest.childDateOfBirth)} años
                    </p>
                    <p>
                      <strong>Vive con:</strong>{" "}
                      {formatLivingWith(
                        selectedRequest.childLivesWith,
                        selectedRequest.childOtherLivesWith
                      )}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {selectedRequest.childAddress}
                    </p>
                  </CardContent>
                </Card>

                {/* Parents Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Información de los Padres
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequest.motherName && (
                      <div>
                        <h4 className="font-semibold text-pink-600 mb-2">
                          Madre
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Nombre:</strong>{" "}
                            {selectedRequest.motherName}
                          </p>
                          {selectedRequest.motherAge && (
                            <p>
                              <strong>Edad:</strong> {selectedRequest.motherAge}{" "}
                              años
                            </p>
                          )}
                          {selectedRequest.motherPhone && (
                            <p>
                              <strong>Teléfono:</strong>{" "}
                              {selectedRequest.motherPhone}
                            </p>
                          )}
                          {selectedRequest.motherEmail && (
                            <p>
                              <strong>Email:</strong>{" "}
                              {selectedRequest.motherEmail}
                            </p>
                          )}
                          {selectedRequest.motherEducation && (
                            <p>
                              <strong>Educación:</strong>{" "}
                              {selectedRequest.motherEducation}
                            </p>
                          )}
                          {selectedRequest.motherOccupation && (
                            <p>
                              <strong>Ocupación:</strong>{" "}
                              {selectedRequest.motherOccupation}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedRequest.fatherName && (
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">
                          Padre
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Nombre:</strong>{" "}
                            {selectedRequest.fatherName}
                          </p>
                          {selectedRequest.fatherAge && (
                            <p>
                              <strong>Edad:</strong> {selectedRequest.fatherAge}{" "}
                              años
                            </p>
                          )}
                          {selectedRequest.fatherPhone && (
                            <p>
                              <strong>Teléfono:</strong>{" "}
                              {selectedRequest.fatherPhone}
                            </p>
                          )}
                          {selectedRequest.fatherEmail && (
                            <p>
                              <strong>Email:</strong>{" "}
                              {selectedRequest.fatherEmail}
                            </p>
                          )}
                          {selectedRequest.fatherEducation && (
                            <p>
                              <strong>Educación:</strong>{" "}
                              {selectedRequest.fatherEducation}
                            </p>
                          )}
                          {selectedRequest.fatherOccupation && (
                            <p>
                              <strong>Ocupación:</strong>{" "}
                              {selectedRequest.fatherOccupation}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* School Information */}
                {selectedRequest.schoolName && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <School className="h-5 w-5 mr-2 text-blue-600" />
                        Información Escolar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>
                        <strong>Institución:</strong>{" "}
                        {selectedRequest.schoolName}
                      </p>
                      {selectedRequest.schoolLevel && (
                        <p>
                          <strong>Nivel:</strong> {selectedRequest.schoolLevel}
                        </p>
                      )}
                      {selectedRequest.teacherName && (
                        <p>
                          <strong>Maestra:</strong>{" "}
                          {selectedRequest.teacherName}
                        </p>
                      )}
                      {selectedRequest.schoolPhone && (
                        <p>
                          <strong>Teléfono:</strong>{" "}
                          {selectedRequest.schoolPhone}
                        </p>
                      )}
                      {selectedRequest.schoolAddress && (
                        <p>
                          <strong>Dirección:</strong>{" "}
                          {selectedRequest.schoolAddress}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Family History */}
                {selectedRequest.children &&
                  selectedRequest.children.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-600" />
                          Historial Familiar
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedRequest.children.map(
                            (
                              child: {
                                id: string;
                                name: string;
                                dateOfBirth: string;
                                schoolGrade: string;
                                hasProblems: boolean;
                                problemDescription?: string;
                              },
                              index: number
                            ) => (
                              <div
                                key={index}
                                className="border-l-2 border-blue-200 pl-3"
                              >
                                <p className="font-medium">{child.name}</p>
                                {child.dateOfBirth && (
                                  <p className="text-sm text-gray-600">
                                    Edad: {calculateAge(child.dateOfBirth)} años
                                  </p>
                                )}
                                {child.schoolGrade && (
                                  <p className="text-sm text-gray-600">
                                    Grado: {child.schoolGrade}
                                  </p>
                                )}
                                {child.hasProblems &&
                                  child.problemDescription && (
                                    <div className="mt-1">
                                      <Badge
                                        variant="destructive"
                                        className="text-xs mb-1"
                                      >
                                        Presenta problemas
                                      </Badge>
                                      <p className="text-sm text-gray-600">
                                        {child.problemDescription}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Consultation Reasons */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Motivos de Consulta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {getSelectedReasons(
                        selectedRequest.consultationReasons
                      ).map((reason, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">{reason}</span>
                        </div>
                      ))}
                    </div>
                    {selectedRequest.referredBy && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm">
                          <strong>Derivado por:</strong>{" "}
                          {selectedRequest.referredBy}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog
          open={!!editingRequest}
          onOpenChange={(open) => !open && setEditingRequest(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestionar Solicitud</DialogTitle>
            </DialogHeader>
            {editingRequest && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={editingRequest.status}
                    onValueChange={(value) =>
                      setEditingRequest(
                        editingRequest
                          ? {
                              ...editingRequest,
                              status: value as ConsultationRequest["status"],
                            }
                          : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="SCHEDULED">Programada</SelectItem>
                      <SelectItem value="COMPLETED">Completada</SelectItem>
                      <SelectItem value="CANCELLED">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingRequest.status === "SCHEDULED" && (
                  <>
                    <div>
                      <Label htmlFor="scheduledDate">Fecha Programada</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={editingRequest?.scheduledDate || ""}
                        onChange={(e) =>
                          setEditingRequest(
                            editingRequest
                              ? {
                                  ...editingRequest,
                                  scheduledDate: e.target.value,
                                }
                              : null
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledTime">Hora Programada</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={editingRequest?.scheduledTime || ""}
                        onChange={(e) =>
                          setEditingRequest(
                            editingRequest
                              ? {
                                  ...editingRequest,
                                  scheduledTime: e.target.value,
                                }
                              : null
                          )
                        }
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={editingRequest?.notes || ""}
                    onChange={(e) =>
                      setEditingRequest(
                        editingRequest
                          ? {
                              ...editingRequest,
                              notes: e.target.value,
                            }
                          : null
                      )
                    }
                    placeholder="Agregar notas..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingRequest(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() =>
                      editingRequest.status === "SCHEDULED"
                        ? handleSchedule(
                            editingRequest.id,
                            editingRequest.scheduledDate || "",
                            editingRequest.scheduledTime || "",
                            editingRequest.assignedTherapistId
                          )
                        : handleStatusUpdate(
                            editingRequest.id,
                            editingRequest.status,
                            editingRequest.notes
                          )
                    }
                    disabled={updateConsultationRequest.isPending}
                  >
                    {updateConsultationRequest.isPending
                      ? "Guardando..."
                      : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
