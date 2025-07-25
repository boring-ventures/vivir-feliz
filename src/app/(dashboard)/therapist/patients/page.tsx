"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Search,
  Eye,
  MoreVertical,
  MessageSquare,
  Upload,
  Target,
  Plus,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import type {
  PatientWithSessions,
  PatientEvaluation,
  PatientObjective,
  AppointmentWithRelations,
} from "@/types/patients";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/documents";
import { useTherapistPatients } from "@/hooks/use-therapist-patients";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateSessionNote } from "@/hooks/use-session-notes";
import {
  usePatientObjectives,
  useCreateObjective,
  useUpdateObjective,
  useDeleteObjective,
  useUpdateObjectiveProgress,
} from "@/hooks/use-patient-objectives";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useDocumentUpload } from "@/hooks/use-document-upload";
import { usePatientDocuments } from "@/hooks/use-patient-documents";
import { FileUpload } from "@/components/ui/file-upload";

export default function TerapeutaPacientesPage() {
  const { profile, isLoading: userLoading } = useCurrentUser();
  const [filtro, setFiltro] = useState("activos");
  const [busqueda, setBusqueda] = useState("");
  const [selectedPaciente, setSelectedPaciente] = useState<
    PatientWithSessions | PatientEvaluation | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    "expediente" | "comentario" | "documento" | "objetivos"
  >("expediente");

  // Estados para formularios
  const [comentarioSesion, setComentarioSesion] = useState("");
  const [comentarioPadre, setComentarioPadre] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [tituloDocumento, setTituloDocumento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [nuevoObjetivo, setNuevoObjetivo] = useState("");
  const [tipoObjetivo, setTipoObjetivo] = useState("");
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(
    null
  );
  const [editingObjectiveName, setEditingObjectiveName] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressComment, setProgressComment] = useState("");
  const [selectedObjectiveForProgress, setSelectedObjectiveForProgress] =
    useState<string | null>(null);
  const [showCreateObjectiveForm, setShowCreateObjectiveForm] = useState(false);

  // Session notes mutation
  const createSessionNoteMutation = useCreateSessionNote();

  // Objectives mutations
  const createObjectiveMutation = useCreateObjective();
  const updateObjectiveMutation = useUpdateObjective();
  const deleteObjectiveMutation = useDeleteObjective();
  const updateProgressMutation = useUpdateObjectiveProgress();
  const { uploadDocument, isUploading } = useDocumentUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [descripcionDocumento, setDescripcionDocumento] = useState("");

  // Get current patient objectives
  const selectedPatientId =
    (selectedPaciente as PatientWithSessions)?.rawData?.patient?.id || null;
  const { data: objectivesData, isLoading: objectivesLoading } =
    usePatientObjectives(selectedPatientId);

  // Get current patient documents
  const {
    documents: patientDocuments,
    isLoading: documentsLoading,
    refetch: refetchDocuments,
    deleteDocument,
    isDeleting: isDeletingDocument,
  } = usePatientDocuments({
    patientId: selectedPatientId || "",
    therapistId: profile?.id,
    enabled: !!selectedPatientId && showModal && modalType === "expediente",
  });

  // Fetch patients data
  const {
    data: patientsData,
    isLoading: patientsLoading,
    error: patientsError,
  } = useTherapistPatients({
    query: busqueda,
    status:
      filtro === "activos"
        ? "active"
        : filtro === "completados"
          ? "inactive"
          : "all",
    enabled: !userLoading && profile?.role === "THERAPIST",
  });

  const pacientesActivos = patientsData?.patients || [];

  const pacientesEvaluacion: PatientEvaluation[] = [];

  const getGenderIcon = (genero: string) => {
    return genero === "masculino" ? "👦" : "👧";
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "completado":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "en progreso":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "pendiente":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "completado":
        return "bg-green-100 text-green-800";
      case "en progreso":
        return "bg-yellow-100 text-yellow-800";
      case "pendiente":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Show loading state
  if (userLoading || patientsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mis Pacientes</h1>
            <p className="text-gray-600">
              Gestiona la información y progreso de tus pacientes
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (patientsError) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mis Pacientes</h1>
            <p className="text-gray-600">
              Gestiona la información y progreso de tus pacientes
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Error al cargar los pacientes</p>
            <p className="text-gray-600 text-sm">
              {patientsError instanceof Error
                ? patientsError.message
                : "Error desconocido"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredPacientes = pacientesActivos.filter((paciente) =>
    paciente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleOpenModal = (
    paciente: PatientWithSessions | PatientEvaluation,
    type: "expediente" | "comentario" | "documento" | "objetivos",
    appointmentId?: string
  ) => {
    setSelectedPaciente(paciente);
    setModalType(type);
    setSelectedAppointmentId(appointmentId || null);
    setShowModal(true);
  };

  const handleGuardarComentario = async () => {
    if (!selectedAppointmentId || !comentarioSesion.trim()) {
      toast({
        title: "Error",
        description: "Por favor complete el comentario de la sesión",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSessionNoteMutation.mutateAsync({
        appointmentId: selectedAppointmentId,
        sessionComment: comentarioSesion.trim(),
        parentMessage: comentarioPadre.trim() || undefined,
      });

      toast({
        title: "¡Comentario guardado!",
        description: "El comentario de la sesión se ha guardado exitosamente",
      });

      // Clear form but keep modal open
      setComentarioSesion("");
      setComentarioPadre("");
      setSelectedAppointmentId(null);
      setModalType("expediente"); // Switch back to expediente tab
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al guardar el comentario",
        variant: "destructive",
      });
    }
  };

  const handleSubirDocumento = async () => {
    if (
      !selectedFile ||
      !tituloDocumento ||
      !tipoDocumento ||
      !selectedPaciente
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    // Map the string value to DocumentType enum
    const documentTypeMap: Record<string, DocumentType> = {
      evaluacion: DocumentType.EVALUATION,
      examen: DocumentType.MEDICAL_REPORT,
      informe: DocumentType.SCHOOL_REPORT,
      reporte: DocumentType.PROGRESS_REPORT,
      otro: DocumentType.OTHER,
    };

    const mappedDocumentType =
      documentTypeMap[tipoDocumento] || DocumentType.OTHER;

    try {
      const result = await uploadDocument({
        patientId: selectedPatientId || "",
        therapistId: profile?.id || "",
        title: tituloDocumento,
        description: descripcionDocumento,
        documentType: mappedDocumentType,
        file: selectedFile,
      });

      if (result.success) {
        // After successful upload to storage, save to database
        try {
          const dbResponse = await fetch("/api/patient-documents/save-record", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              patientId: selectedPatientId,
              therapistId: profile?.id || "",
              title: tituloDocumento,
              description: descripcionDocumento,
              documentType: tipoDocumento,
              fileName: selectedFile.name,
              fileUrl: result.url,
              fileSize: selectedFile.size,
              fileType: selectedFile.type,
            }),
          });

          if (dbResponse.ok) {
            toast({
              title: "¡Documento subido exitosamente!",
              description:
                "El documento se ha subido correctamente al almacenamiento y guardado en la base de datos",
            });

            // Reset form
            setTituloDocumento("");
            setTipoDocumento("");
            setDescripcionDocumento("");
            setSelectedFile(null);
            setShowModal(false);

            // Refresh documents list
            refetchDocuments();
          } else {
            toast({
              title: "Documento subido pero error al guardar en base de datos",
              description:
                "El archivo se subió pero no se pudo guardar la información",
              variant: "destructive",
            });
          }
        } catch (dbError) {
          console.error("Database save error:", dbError);
          toast({
            title: "Documento subido pero error al guardar en base de datos",
            description:
              "El archivo se subió pero no se pudo guardar la información",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error al subir documento",
          description: result.error || "Error desconocido",
          variant: "destructive",
        });
      }

      // Reset form
      setTituloDocumento("");
      setTipoDocumento("");
      setDescripcionDocumento("");
      setSelectedFile(null);
      setShowModal(false);

      // Optionally refresh documents list
      // await refetchDocuments()
    } catch (error) {
      // Error is handled in the hook
      console.error("Upload error:", error);
    }
  };

  const handleGuardarObjetivo = async () => {
    if (!nuevoObjetivo.trim() || !selectedPatientId) {
      toast({
        title: "Error",
        description: "Por favor complete el nombre del objetivo",
        variant: "destructive",
      });
      return;
    }

    // Get the proposal ID from the selected patient
    const proposalId = (selectedPaciente as PatientWithSessions)?.rawData
      ?.latestProposal?.id;

    if (!proposalId) {
      toast({
        title: "Error",
        description:
          "No se encontró la propuesta de tratamiento para este paciente",
        variant: "destructive",
      });
      return;
    }

    try {
      await createObjectiveMutation.mutateAsync({
        patientId: selectedPatientId,
        name: nuevoObjetivo.trim(),
        type: tipoObjetivo.trim() || undefined,
        proposalId: proposalId,
      });

      toast({
        title: "¡Objetivo creado!",
        description: "El objetivo se ha creado exitosamente",
      });

      // Clear form and hide it
      setNuevoObjetivo("");
      setTipoObjetivo("");
      setShowCreateObjectiveForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al crear el objetivo",
        variant: "destructive",
      });
    }
  };

  const handleEditObjective = async (objectiveId: string, name: string) => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del objetivo no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateObjectiveMutation.mutateAsync({
        objectiveId,
        data: { name: name.trim() },
      });

      toast({
        title: "¡Objetivo actualizado!",
        description: "El objetivo se ha actualizado exitosamente",
      });

      setEditingObjectiveId(null);
      setEditingObjectiveName("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar el objetivo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este objetivo?")) {
      return;
    }

    try {
      await deleteObjectiveMutation.mutateAsync(objectiveId);

      toast({
        title: "¡Objetivo eliminado!",
        description: "El objetivo se ha eliminado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al eliminar el objetivo",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProgress = async (objectiveId: string) => {
    try {
      await updateProgressMutation.mutateAsync({
        objectiveId,
        percentage: progressPercentage,
        comment: progressComment.trim() || undefined,
      });

      toast({
        title: "¡Progreso actualizado!",
        description: "El progreso del objetivo se ha actualizado exitosamente",
      });

      // Clear form
      setProgressPercentage(0);
      setProgressComment("");
      setSelectedObjectiveForProgress(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar el progreso",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mis Pacientes</h1>
          <p className="text-gray-600">
            Gestiona la información y progreso de tus pacientes
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

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex space-x-2">
          <Button
            variant={filtro === "activos" ? "default" : "outline"}
            onClick={() => setFiltro("activos")}
            size="sm"
          >
            Activos
          </Button>
          <Button
            variant={filtro === "evaluacion" ? "default" : "outline"}
            onClick={() => setFiltro("evaluacion")}
            size="sm"
          >
            En evaluación
          </Button>
          <Button
            variant={filtro === "completados" ? "default" : "outline"}
            onClick={() => setFiltro("completados")}
            size="sm"
          >
            Completados
          </Button>
        </div>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar paciente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Pacientes Activos */}
      {filtro === "activos" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Pacientes Activos ({filteredPacientes.length})
          </h2>

          {filteredPacientes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <User className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600 mb-2">No hay pacientes activos</p>
                <p className="text-sm text-gray-500">
                  Los pacientes aparecerán aquí cuando tengan tratamientos
                  activos
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-600">
                          Paciente
                        </th>
                        <th className="text-left p-4 font-medium text-gray-600">
                          Diagnóstico
                        </th>
                        <th className="text-left p-4 font-medium text-gray-600">
                          Progreso
                        </th>
                        <th className="text-left p-4 font-medium text-gray-600">
                          Próxima Cita
                        </th>
                        <th className="text-left p-4 font-medium text-gray-600">
                          Estado
                        </th>
                        <th className="text-center p-4 font-medium text-gray-600">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredPacientes.map((paciente) => (
                        <tr key={paciente.id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {getGenderIcon(paciente.genero)}
                              </div>
                              <div>
                                <p className="font-medium">{paciente.nombre}</p>
                                <p className="text-sm text-gray-600">
                                  {paciente.edad} años
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{paciente.diagnostico}</p>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>
                                  {paciente.sesiones.completadas}/
                                  {paciente.sesiones.totales}
                                </span>
                                <span>{paciente.progreso}%</span>
                              </div>
                              <Progress
                                value={paciente.progreso}
                                className="h-2 w-24"
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{paciente.proximaCita}</p>
                          </td>
                          <td className="p-4">
                            <Badge className={paciente.estadoColor}>
                              {paciente.estado}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Link
                                href={`/therapist/patients/${(paciente as PatientWithSessions).rawData?.patient?.id}`}
                              >
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver Historial
                                </Button>
                              </Link>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleOpenModal(paciente, "expediente")
                                }
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Ver Expediente
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenModal(paciente, "comentario")
                                    }
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Comentar Sesión
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenModal(paciente, "documento")
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Subir Documento
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenModal(paciente, "objetivos")
                                    }
                                  >
                                    <Target className="h-4 w-4 mr-2" />
                                    Gestionar Objetivos
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pacientes en Evaluación */}
      {filtro === "evaluacion" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            En Evaluación ({pacientesEvaluacion.length})
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Paciente
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Tipo de Evaluación
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Fecha
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Estado
                      </th>
                      <th className="text-center p-4 font-medium text-gray-600">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pacientesEvaluacion.map((paciente) => (
                      <tr key={paciente.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {getGenderIcon(paciente.genero)}
                            </div>
                            <div>
                              <p className="font-medium">{paciente.nombre}</p>
                              <p className="text-sm text-gray-600">
                                {paciente.edad} años
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{paciente.tipo}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{paciente.fechaConsulta}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={paciente.estadoColor}>
                            {paciente.estado}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pacientes Completados */}
      {filtro === "completados" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Tratamientos Completados
          </h2>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <User className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600">
                No hay tratamientos completados aún
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Universal - Part 1 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {/* Modal de Expediente */}
          {modalType === "expediente" && selectedPaciente && (
            <>
              <DialogHeader>
                <DialogTitle>Expediente del Paciente</DialogTitle>
                <DialogDescription>
                  Información detallada del paciente y su tratamiento
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="informacion" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="informacion">Información</TabsTrigger>
                  <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
                </TabsList>

                <TabsContent value="informacion" className="space-y-6">
                  {/* Información Personal */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Información Personal
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Nombre completo
                        </label>
                        <p className="text-sm">{selectedPaciente.nombre}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Edad
                        </label>
                        <p className="text-sm">{selectedPaciente.edad} años</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Padre/Madre
                        </label>
                        <p className="text-sm">{selectedPaciente.padre}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Teléfono
                        </label>
                        <p className="text-sm">{selectedPaciente.telefono}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Email
                        </label>
                        <p className="text-sm">{selectedPaciente.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Colegio
                        </label>
                        <p className="text-sm">{selectedPaciente.colegio}</p>
                      </div>
                    </div>
                  </div>

                  {/* Información del Tratamiento */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tratamiento</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Diagnóstico
                        </label>
                        <p className="text-sm">
                          {selectedPaciente.diagnostico}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Fecha de inicio
                        </label>
                        <p className="text-sm">
                          {selectedPaciente.fechaInicio}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Sesiones
                        </label>
                        <p className="text-sm">
                          {selectedPaciente.sesiones?.completadas || 0}/
                          {selectedPaciente.sesiones?.totales || 0}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Próxima cita
                        </label>
                        <p className="text-sm">
                          {selectedPaciente.proximaCita}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600">
                        Progreso del tratamiento
                      </label>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso</span>
                          <span>{selectedPaciente.progreso}%</span>
                        </div>
                        <Progress
                          value={selectedPaciente.progreso}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Observaciones
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700">
                        {selectedPaciente.observaciones}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comentarios" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Comentarios de Sesiones
                    </h3>
                  </div>

                  {(selectedPaciente as PatientWithSessions).rawData?.patient
                    ?.appointments ? (
                    <div className="space-y-3">
                      {selectedPaciente &&
                        (
                          selectedPaciente as PatientWithSessions
                        ).rawData?.patient?.appointments
                          ?.filter(
                            (apt: AppointmentWithRelations) =>
                              apt.status === "COMPLETED"
                          )
                          .sort(
                            (
                              a: AppointmentWithRelations,
                              b: AppointmentWithRelations
                            ) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          )
                          .map((appointment: AppointmentWithRelations) => {
                            const hasComments = appointment.sessionNote;
                            const appointmentDate = new Date(
                              appointment.date
                            ).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            });

                            return (
                              <Card
                                key={appointment.id}
                                className={
                                  hasComments
                                    ? "border-green-200"
                                    : "border-yellow-200"
                                }
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm font-medium">
                                        Sesión del {appointmentDate}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {appointment.startTime} -{" "}
                                        {appointment.endTime}
                                      </span>
                                      {hasComments ? (
                                        <Badge className="bg-green-100 text-green-800">
                                          Con comentarios
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                          Sin comentarios
                                        </Badge>
                                      )}
                                    </div>
                                    {!hasComments && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleOpenModal(
                                            selectedPaciente,
                                            "comentario",
                                            appointment.id
                                          )
                                        }
                                      >
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        Agregar
                                      </Button>
                                    )}
                                  </div>

                                  {hasComments ? (
                                    <div className="space-y-3">
                                      <div className="bg-gray-50 p-3 rounded-md">
                                        <label className="text-xs font-medium text-gray-600 block mb-1">
                                          Comentario de la sesión:
                                        </label>
                                        <p className="text-sm text-gray-800">
                                          {appointment.sessionNote
                                            ?.sessionComment ||
                                            "Sin comentario específico"}
                                        </p>
                                        {appointment.sessionNote
                                          ?.parentMessage && (
                                          <div className="mt-3 pt-3 border-t border-gray-200">
                                            <label className="text-xs font-medium text-gray-600 block mb-1">
                                              Mensaje para el padre:
                                            </label>
                                            <p className="text-sm text-gray-800 italic">
                                              {
                                                appointment.sessionNote
                                                  .parentMessage
                                              }
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500">
                                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                      <p className="text-sm">
                                        Esta sesión aún no tiene comentarios
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        Agrega comentarios sobre lo trabajado en
                                        esta sesión
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}

                      {selectedPaciente &&
                        (
                          selectedPaciente! as PatientWithSessions
                        ).rawData?.patient?.appointments?.filter(
                          (apt: AppointmentWithRelations) =>
                            apt.status === "COMPLETED"
                        ).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No hay sesiones completadas aún</p>
                            <p className="text-sm text-gray-400">
                              Las sesiones aparecerán aquí cuando sean marcadas
                              como completadas
                            </p>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No se pudieron cargar las sesiones</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documentos" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Documentos</h3>
                    <Button
                      onClick={() =>
                        handleOpenModal(selectedPaciente, "documento")
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Subir Documento
                    </Button>
                  </div>

                  {documentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : patientDocuments && patientDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {patientDocuments.map((documento) => (
                        <Card key={documento.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-8 w-8 text-blue-600" />
                                <div>
                                  <p className="font-medium">
                                    {documento.title}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {
                                      DOCUMENT_TYPE_LABELS[
                                        documento.documentType
                                      ]
                                    }{" "}
                                    •{" "}
                                    {new Date(
                                      documento.createdAt
                                    ).toLocaleDateString("es-ES")}
                                  </p>
                                  {documento.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {documento.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(documento.fileUrl, "_blank")
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "¿Estás seguro de que quieres eliminar este documento?"
                                      )
                                    ) {
                                      deleteDocument({
                                        documentId: documento.id,
                                      });
                                    }
                                  }}
                                  disabled={isDeletingDocument}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay documentos subidos aún</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="objetivos" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Objetivos Terapéuticos
                    </h3>
                    <Button
                      onClick={() => setShowCreateObjectiveForm(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Objetivo
                    </Button>
                  </div>

                  {/* New Objective Form - Only show when requested */}
                  {showCreateObjectiveForm && (
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            Crear Nuevo Objetivo
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowCreateObjectiveForm(false);
                              setNuevoObjetivo("");
                              setTipoObjetivo("");
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nuevo-objetivo">
                              Nombre del objetivo *
                            </Label>
                            <Input
                              id="nuevo-objetivo"
                              placeholder="Ej: Mejorar atención sostenida, Desarrollar habilidades sociales..."
                              value={nuevoObjetivo}
                              onChange={(e) => setNuevoObjetivo(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="tipo-objetivo">
                              Tipo de objetivo (opcional)
                            </Label>
                            <Input
                              id="tipo-objetivo"
                              placeholder="Ej: Comunicación, Comportamental, Cognitivo..."
                              value={tipoObjetivo}
                              onChange={(e) => setTipoObjetivo(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleGuardarObjetivo}
                            disabled={createObjectiveMutation.isPending}
                            className="flex-1"
                          >
                            {createObjectiveMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creando...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Objetivo
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowCreateObjectiveForm(false);
                              setNuevoObjetivo("");
                              setTipoObjetivo("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Objectives List */}
                  {objectivesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : objectivesData?.objectives &&
                    objectivesData.objectives.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Objetivos Activos</h4>
                      {objectivesData.objectives.map(
                        (objective: {
                          id: string;
                          patientId: string;
                          therapistId: string;
                          proposalId: string | null;
                          name: string;
                          status:
                            | "COMPLETED"
                            | "IN_PROGRESS"
                            | "PAUSED"
                            | "CANCELLED"
                            | "PENDING";
                          type: string | null;
                          createdAt: string;
                          updatedAt: string;
                          progressEntries: {
                            id: string;
                            objectiveId: string;
                            appointmentId: string;
                            therapistId: string;
                            percentage: number;
                            comment: string | null;
                            createdAt: string;
                            updatedAt: string;
                            appointment: {
                              id: string;
                              date: string;
                              startTime: string;
                              endTime: string;
                            };
                          }[];
                        }) => {
                          const latestProgress = objective.progressEntries[0];
                          const currentProgress =
                            latestProgress?.percentage || 0;

                          return (
                            <Card key={objective.id} className="relative">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2 flex-1">
                                    {getEstadoIcon(
                                      objective.status.toLowerCase()
                                    )}
                                    {editingObjectiveId === objective.id ? (
                                      <div className="flex items-center space-x-2 flex-1">
                                        <Input
                                          value={editingObjectiveName}
                                          onChange={(e) =>
                                            setEditingObjectiveName(
                                              e.target.value
                                            )
                                          }
                                          className="flex-1"
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              handleEditObjective(
                                                objective.id,
                                                editingObjectiveName
                                              );
                                            } else if (e.key === "Escape") {
                                              setEditingObjectiveId(null);
                                              setEditingObjectiveName("");
                                            }
                                          }}
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleEditObjective(
                                              objective.id,
                                              editingObjectiveName
                                            )
                                          }
                                          disabled={
                                            updateObjectiveMutation.isPending
                                          }
                                        >
                                          Guardar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditingObjectiveId(null);
                                            setEditingObjectiveName("");
                                          }}
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    ) : (
                                      <span className="font-medium flex-1">
                                        {objective.name}
                                        {objective.type && (
                                          <span className="text-sm text-gray-500 ml-2">
                                            ({objective.type})
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      className={getEstadoColor(
                                        objective.status.toLowerCase()
                                      )}
                                    >
                                      {objective.status.replace("_", " ")}
                                    </Badge>
                                    {editingObjectiveId !== objective.id && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingObjectiveId(objective.id);
                                            setEditingObjectiveName(
                                              objective.name
                                            );
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteObjective(objective.id)
                                          }
                                          disabled={
                                            deleteObjectiveMutation.isPending
                                          }
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm">
                                    <span>Progreso Actual</span>
                                    <span>{currentProgress}%</span>
                                  </div>
                                  <Progress
                                    value={currentProgress}
                                    className="h-2"
                                  />

                                  {latestProgress && (
                                    <div className="text-xs text-gray-500">
                                      Última actualización:{" "}
                                      {new Date(
                                        latestProgress.createdAt
                                      ).toLocaleDateString("es-ES")}
                                      {latestProgress.appointment && (
                                        <span>
                                          {" "}
                                          - Sesión del{" "}
                                          {new Date(
                                            latestProgress.appointment.date
                                          ).toLocaleDateString("es-ES")}
                                        </span>
                                      )}
                                      {latestProgress.comment && (
                                        <div className="mt-1 text-gray-600 italic">
                                          {`"${latestProgress.comment}"`}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Progress Update Section */}
                                  {selectedObjectiveForProgress ===
                                  objective.id ? (
                                    <div className="border-t pt-3 space-y-3">
                                      <Label className="text-sm font-medium">
                                        Actualizar Progreso
                                      </Label>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <Label className="text-xs">
                                            Porcentaje (0-100)
                                          </Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={progressPercentage}
                                            onChange={(e) =>
                                              setProgressPercentage(
                                                Number(e.target.value)
                                              )
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">
                                            Comentario (opcional)
                                          </Label>
                                          <Input
                                            placeholder="Observaciones sobre el progreso..."
                                            value={progressComment}
                                            onChange={(e) =>
                                              setProgressComment(e.target.value)
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleUpdateProgress(objective.id)
                                          }
                                          disabled={
                                            updateProgressMutation.isPending
                                          }
                                        >
                                          {updateProgressMutation.isPending
                                            ? "Guardando..."
                                            : "Guardar Progreso"}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setSelectedObjectiveForProgress(
                                              null
                                            );
                                            setProgressPercentage(0);
                                            setProgressComment("");
                                          }}
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedObjectiveForProgress(
                                          objective.id
                                        );
                                        setProgressPercentage(currentProgress);
                                      }}
                                      className="w-full"
                                    >
                                      <Target className="h-4 w-4 mr-2" />
                                      Actualizar Progreso
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay objetivos definidos aún</p>
                      <p className="text-sm">
                        Crea el primer objetivo para este paciente
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cerrar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Editar Expediente
                </Button>
              </div>
            </>
          )}

          {/* Modal de Comentario de Sesión */}
          {modalType === "comentario" && selectedPaciente && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Comentar Sesión - {selectedPaciente.nombre}
                </DialogTitle>
                <DialogDescription>
                  Agrega comentarios sobre la sesión y un mensaje para el padre
                  {selectedAppointmentId && (
                    <span className="block mt-1 text-blue-600 font-medium">
                      Sesión seleccionada:{" "}
                      {(() => {
                        const appointment = (
                          selectedPaciente as PatientWithSessions
                        ).rawData?.patient?.appointments?.find(
                          (apt: AppointmentWithRelations) =>
                            apt.id === selectedAppointmentId
                        );
                        return appointment
                          ? new Date(appointment.date).toLocaleDateString(
                              "es-ES",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            ) +
                              ` (${appointment.startTime} - ${appointment.endTime})`
                          : "Sesión no encontrada";
                      })()}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="comentario-sesion">
                    Comentario de la sesión *
                  </Label>
                  <Textarea
                    id="comentario-sesion"
                    placeholder="Describe cómo fue la sesión, actividades realizadas, comportamiento del paciente..."
                    value={comentarioSesion}
                    onChange={(e) => setComentarioSesion(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="comentario-padre">
                    Mensaje para el padre (opcional)
                  </Label>
                  <Textarea
                    id="comentario-padre"
                    placeholder="Mensaje que verá el padre sobre el progreso y recomendaciones..."
                    value={comentarioPadre}
                    onChange={(e) => setComentarioPadre(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setComentarioSesion("");
                      setComentarioPadre("");
                      setSelectedAppointmentId(null);
                      setModalType("expediente");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleGuardarComentario}
                    disabled={createSessionNoteMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createSessionNoteMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Comentario"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Modal de Subir Documento */}
          {modalType === "documento" && selectedPaciente && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Subir Documento - {selectedPaciente.nombre}
                </DialogTitle>
                <DialogDescription>
                  Sube evaluaciones, exámenes u otros documentos importantes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo-documento">Título del documento</Label>
                  <Input
                    id="titulo-documento"
                    placeholder="Ej: Evaluación neuropsicológica, Examen médico..."
                    value={tituloDocumento}
                    onChange={(e) => setTituloDocumento(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion-documento">
                    Descripción (opcional)
                  </Label>
                  <textarea
                    id="descripcion-documento"
                    placeholder="Describe el contenido del documento..."
                    value={descripcionDocumento}
                    onChange={(e) => setDescripcionDocumento(e.target.value)}
                    className="mt-1 w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="tipo-documento">Tipo de documento</Label>
                  <Select
                    value={tipoDocumento}
                    onValueChange={setTipoDocumento}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona el tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evaluacion">
                        Evaluación Psicológica
                      </SelectItem>
                      <SelectItem value="examen">Reporte Médico</SelectItem>
                      <SelectItem value="informe">Reporte Escolar</SelectItem>
                      <SelectItem value="reporte">
                        Reporte de Progreso
                      </SelectItem>
                      <SelectItem value="otro">Otro Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="archivo">Archivo</Label>
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    disabled={isUploading}
                    className="mt-1"
                    selectedFile={selectedFile}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={isUploading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubirDocumento}
                    disabled={isUploading || !selectedFile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? "Subiendo..." : "Subir Documento"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Modal de Gestionar Objetivos */}
          {modalType === "objetivos" && selectedPaciente && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Gestionar Objetivos - {selectedPaciente.nombre}
                </DialogTitle>
                <DialogDescription>
                  Crea y edita objetivos terapéuticos para el paciente
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Formulario para nuevo objetivo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nuevo Objetivo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nuevo-objetivo">
                        Descripción del objetivo
                      </Label>
                      <Input
                        id="nuevo-objetivo"
                        placeholder="Ej: Mejorar atención sostenida, Desarrollar habilidades sociales..."
                        value={nuevoObjetivo}
                        onChange={(e) => setNuevoObjetivo(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="progreso-objetivo">
                        Progreso inicial (%)
                      </Label>
                      <div className="mt-1 space-y-2">
                        <Input
                          id="progreso-objetivo"
                          type="number"
                          min="0"
                          max="100"
                          value={progressPercentage}
                          onChange={(e) =>
                            setProgressPercentage(Number(e.target.value))
                          }
                        />
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    </div>

                    <Button onClick={handleGuardarObjetivo} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Objetivo
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de objetivos existentes */}
                <div>
                  <h4 className="font-semibold mb-3">Objetivos Actuales</h4>
                  {selectedPaciente.objetivos &&
                  selectedPaciente.objetivos.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPaciente.objetivos.map(
                        (objetivo: PatientObjective) => (
                          <Card key={objetivo.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  {getEstadoIcon(objetivo.estado)}
                                  <span className="font-medium">
                                    {objetivo.titulo}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    className={getEstadoColor(objetivo.estado)}
                                  >
                                    {objetivo.estado}
                                  </Badge>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Progreso</span>
                                  <span>{objetivo.progreso}%</span>
                                </div>
                                <Progress
                                  value={objetivo.progreso}
                                  className="h-2"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay objetivos definidos aún</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
