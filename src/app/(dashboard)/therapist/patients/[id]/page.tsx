"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Target,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  User,
  Heart,
  Brain,
  Activity,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePatientHistory } from "@/hooks/use-patient-history";
import { usePatientObjectives } from "@/hooks/use-patient-objectives";
import { usePatientDocuments } from "@/hooks/use-patient-documents";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDocumentUpload } from "@/hooks/use-document-upload";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/documents";
import { FileUpload } from "@/components/ui/file-upload";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Trash2 } from "lucide-react";
import { TherapeuticPlanModal } from "@/components/therapist/therapeutic-plan-modal";
import { ProgressReportModal } from "@/components/therapist/progress-report-modal";
import { TherapistReportContributionModal } from "@/components/therapist/therapist-report-contribution-modal";

// Type definitions for appointment and objective data
interface SessionNote {
  id: string;
  sessionComment: string;
  parentMessage?: string | null;
  createdAt: string;
}

interface PatientObjective {
  id: string;
  patientId: string;
  therapistId: string;
  proposalId: string | null;
  name: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PAUSED" | "CANCELLED" | "PENDING";
  type: string | null;
  createdAt: string;
  updatedAt: string;
  progressEntries: ObjectiveProgress[];
}

interface ObjectiveProgress {
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
}

type AppointmentObjectiveProgress = {
  id: string;
  percentage: number;
  comment?: string | undefined;
  createdAt: string;
  objective: {
    id: string;
    name: string;
    type?: string | undefined;
  };
};

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  sessionNote?: SessionNote | null;
  objectiveProgress?: AppointmentObjectiveProgress[];
}

export default function PatientHistoryPage() {
  const params = useParams();
  const patientId = params.id as string;
  const { profile } = useCurrentUser();

  // Document upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tituloDocumento, setTituloDocumento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [descripcionDocumento, setDescripcionDocumento] = useState("");

  // Therapeutic plan modal state
  const [showTherapeuticPlanModal, setShowTherapeuticPlanModal] =
    useState(false);

  // Progress report modal state
  const [showProgressReportModal, setShowProgressReportModal] = useState(false);

  // Therapist report contribution modal state
  const [showReportContributionModal, setShowReportContributionModal] =
    useState(false);

  const { data: patientData, isLoading, error } = usePatientHistory(patientId);
  const { data: objectivesData, isLoading: objectivesLoading } =
    usePatientObjectives(patientId);

  // Patient documents
  const {
    documents: patientDocuments,
    isLoading: documentsLoading,
    refetch: refetchDocuments,
    deleteDocument,
    isDeleting: isDeletingDocument,
  } = usePatientDocuments({
    patientId,
    therapistId: profile?.id,
    enabled: !!patientId && !!profile?.id,
  });

  // Document upload hook
  const { uploadDocument, isUploading } = useDocumentUpload();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Link href="/therapist/patients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Historial del Paciente</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Link href="/therapist/patients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">
              No se pudo cargar el historial del paciente
            </p>
            <p className="text-gray-600 text-sm">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { patient } = patientData;
  const appointments = patient.appointments || [];
  const completedSessions = appointments.filter(
    (apt: Appointment) => apt.status === "COMPLETED"
  );
  const upcomingSessions = appointments.filter(
    (apt: Appointment) => apt.status === "SCHEDULED"
  );

  // Sort sessions by date
  const sortedCompletedSessions = completedSessions.sort(
    (a: Appointment, b: Appointment) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate treatment progress
  const totalSessions = patient.treatmentProposals?.[0]?.totalSessions || 0;
  const scheduledSessions = appointments.filter(
    (apt: Appointment) =>
      apt.status === "SCHEDULED" || apt.status === "CONFIRMED"
  ).length;
  const totalScheduledSessions = completedSessions.length + scheduledSessions;

  // Use the higher value between totalSessions from proposal and totalScheduledSessions
  const finalTotalSessions = Math.max(totalSessions, totalScheduledSessions);
  const completedCount = completedSessions.length;
  const progressPercentage =
    finalTotalSessions > 0
      ? Math.round((completedCount / finalTotalSessions) * 100)
      : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSessionIcon = (appointment: Appointment) => {
    const hasComments = appointment.sessionNote;
    const hasObjectiveProgress =
      (appointment.objectiveProgress?.length || 0) > 0;

    if (hasComments && hasObjectiveProgress) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (hasComments || hasObjectiveProgress) {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getSessionBadge = (appointment: Appointment) => {
    const hasComments = appointment.sessionNote;
    const hasObjectiveProgress =
      (appointment.objectiveProgress?.length || 0) > 0;

    if (hasComments && hasObjectiveProgress) {
      return <Badge className="bg-green-100 text-green-800">Completa</Badge>;
    } else if (hasComments) {
      return (
        <Badge className="bg-blue-100 text-blue-800">Con comentarios</Badge>
      );
    } else if (hasObjectiveProgress) {
      return (
        <Badge className="bg-purple-100 text-purple-800">Con progreso</Badge>
      );
    }
    return <Badge className="bg-gray-100 text-gray-600">Básica</Badge>;
  };

  const handleSubirDocumento = async () => {
    if (!selectedFile || !tituloDocumento || !tipoDocumento) {
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
        patientId,
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
              patientId,
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
            setShowUploadModal(false);

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
      setShowUploadModal(false);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/therapist/patients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Pacientes
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{patient.user.name}</h1>
            <p className="text-gray-600">Historial completo del paciente</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowTherapeuticPlanModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Plan Terapéutico
          </Button>
          <Button
            onClick={() => setShowProgressReportModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Informe de Avances
          </Button>
          <Button
            onClick={() => setShowReportContributionModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Contribuir al Informe Final
          </Button>
        </div>
      </div>

      {/* Patient Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-gray-600">Sesiones Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{upcomingSessions.length}</p>
                <p className="text-sm text-gray-600">Sesiones Programadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{progressPercentage}%</p>
                <p className="text-sm text-gray-600">Progreso General</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {objectivesData?.objectives?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Objetivos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Historial de Sesiones</TabsTrigger>
          <TabsTrigger value="objectives">Progreso de Objetivos</TabsTrigger>
          <TabsTrigger value="patient-info">
            Información del Paciente
          </TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        {/* Sessions History Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Historial de Sesiones</h3>
            <div className="text-sm text-gray-600">
              {completedCount} de {finalTotalSessions} sesiones completadas
            </div>
          </div>

          {/* Progress Bar */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del Tratamiento</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-xs text-gray-500">
                  {completedCount} sesiones completadas de {finalTotalSessions}{" "}
                  planificadas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Timeline */}
          {sortedCompletedSessions.length > 0 ? (
            <div className="space-y-4">
              {sortedCompletedSessions.map(
                (appointment: Appointment, index: number) => (
                  <Card key={appointment.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getSessionIcon(appointment)}
                          <div>
                            <h4 className="font-semibold">
                              Sesión #{sortedCompletedSessions.length - index}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(appointment.date)} •{" "}
                              {formatTime(appointment.startTime)} -{" "}
                              {formatTime(appointment.endTime)}
                            </p>
                          </div>
                        </div>
                        {getSessionBadge(appointment)}
                      </div>

                      <div className="space-y-4">
                        {/* Session Comments */}
                        {appointment.sessionNote && (
                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                Comentarios de la Sesión
                              </span>
                            </div>
                            <p className="text-sm text-blue-900 mb-2">
                              {appointment.sessionNote.sessionComment}
                            </p>
                            {appointment.sessionNote.parentMessage && (
                              <div className="mt-3 p-3 bg-blue-100 rounded">
                                <span className="text-xs font-medium text-blue-700">
                                  Mensaje para el padre:
                                </span>
                                <p className="text-sm text-blue-800">
                                  {appointment.sessionNote.parentMessage}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Objective Progress Updates */}
                        {appointment.objectiveProgress &&
                          appointment.objectiveProgress.length > 0 && (
                            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                              <div className="flex items-center space-x-2 mb-3">
                                <Target className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">
                                  Progreso de Objetivos
                                </span>
                              </div>
                              <div className="space-y-3">
                                {appointment.objectiveProgress.map(
                                  (progress: AppointmentObjectiveProgress) => (
                                    <div
                                      key={progress.id}
                                      className="bg-white p-3 rounded border"
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-sm">
                                          {progress.objective.name}
                                        </span>
                                        <Badge variant="outline">
                                          {progress.percentage}%
                                        </Badge>
                                      </div>
                                      {progress.comment && (
                                        <p className="text-xs text-gray-600 italic">
                                          {`"${progress.comment}"`}
                                        </p>
                                      )}
                                      <Progress
                                        value={progress.percentage}
                                        className="h-1 mt-2"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Empty State for Session without Details */}
                        {!appointment.sessionNote &&
                          (!appointment.objectiveProgress ||
                            appointment.objectiveProgress.length === 0) && (
                            <div className="text-center py-4 text-gray-500">
                              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">
                                Sesión completada sin comentarios adicionales
                              </p>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No hay sesiones completadas aún</p>
                <p className="text-sm text-gray-500">
                  El historial aparecerá aquí cuando se completen las sesiones
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Objectives Progress Tab */}
        <TabsContent value="objectives" className="space-y-6">
          <h3 className="text-xl font-semibold">
            Progreso de Objetivos Terapéuticos
          </h3>

          {objectivesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : objectivesData?.objectives &&
            objectivesData.objectives.length > 0 ? (
            <div className="space-y-4">
              {objectivesData.objectives.map((objective: PatientObjective) => {
                const progressHistory = objective.progressEntries || [];
                const currentProgress = progressHistory[0]?.percentage || 0;

                return (
                  <Card key={objective.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-semibold">{objective.name}</h4>
                          {objective.type && (
                            <p className="text-sm text-gray-600">
                              {objective.type}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {currentProgress}%
                          </p>
                          <Badge
                            className={
                              currentProgress === 100
                                ? "bg-green-100 text-green-800"
                                : currentProgress > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-600"
                            }
                          >
                            {currentProgress === 100
                              ? "Completado"
                              : currentProgress > 0
                                ? "En Progreso"
                                : "Pendiente"}
                          </Badge>
                        </div>
                      </div>

                      <Progress value={currentProgress} className="h-3 mb-4" />

                      {/* Progress History */}
                      {progressHistory.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-3">
                            Historial de Progreso
                          </h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {progressHistory.map(
                              (progress: ObjectiveProgress) => (
                                <div
                                  key={progress.id}
                                  className="flex justify-between items-center p-3 bg-gray-50 rounded text-sm"
                                >
                                  <div>
                                    <span className="font-medium">
                                      {progress.percentage}%
                                    </span>
                                    {progress.comment && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {`"${progress.comment}"`}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right text-xs text-gray-500">
                                    {new Date(
                                      progress.createdAt
                                    ).toLocaleDateString("es-ES")}
                                    {progress.appointment && (
                                      <p>
                                        Sesión del{" "}
                                        {new Date(
                                          progress.appointment.date
                                        ).toLocaleDateString("es-ES")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No hay objetivos definidos aún</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Patient Information Tab */}
        <TabsContent value="patient-info" className="space-y-6">
          <h3 className="text-xl font-semibold">Información del Paciente</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Información Personal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Nombre completo
                  </label>
                  <p className="text-sm">{patient.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-sm">{patient.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Fecha de nacimiento
                  </label>
                  <p className="text-sm">
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString(
                          "es-ES"
                        )
                      : "No especificada"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Género
                  </label>
                  <p className="text-sm">
                    {patient.gender || "No especificado"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Escuela
                  </label>
                  <p className="text-sm">
                    {patient.school || "No especificada"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Información del Tratamiento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.treatmentProposals?.[0] && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Diagnóstico
                      </label>
                      <p className="text-sm">
                        {patient.treatmentProposals[0].diagnosis ||
                          "No especificado"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Fecha de inicio
                      </label>
                      <p className="text-sm">
                        {new Date(
                          patient.treatmentProposals[0].createdAt
                        ).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Sesiones totales
                      </label>
                      <p className="text-sm">
                        {patient.treatmentProposals[0].totalSessions}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Estado
                      </label>
                      <Badge className="ml-2">
                        {patient.treatmentProposals[0].status === "ACTIVE"
                          ? "Activo"
                          : patient.treatmentProposals[0].status}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Notes */}
          {patient.treatmentProposals?.[0]?.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Recomendaciones Terapéuticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {patient.treatmentProposals[0].recommendations}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Documentos del Paciente</h3>
            <Button
              onClick={() => setShowUploadModal(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
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
                          <p className="font-medium">{documento.title}</p>
                          <p className="text-sm text-gray-600">
                            {DOCUMENT_TYPE_LABELS[documento.documentType]} •{" "}
                            {new Date(documento.createdAt).toLocaleDateString(
                              "es-ES"
                            )}
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
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No hay documentos subidos aún</p>
                <p className="text-sm text-gray-500">
                  Sube evaluaciones, exámenes u otros documentos importantes
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Document Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subir Documento</DialogTitle>
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
              <Textarea
                id="descripcion-documento"
                placeholder="Describe el contenido del documento..."
                value={descripcionDocumento}
                onChange={(e) => setDescripcionDocumento(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tipo-documento">Tipo de documento</Label>
              <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona el tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evaluacion">
                    Evaluación Psicológica
                  </SelectItem>
                  <SelectItem value="examen">Reporte Médico</SelectItem>
                  <SelectItem value="informe">Reporte Escolar</SelectItem>
                  <SelectItem value="reporte">Reporte de Progreso</SelectItem>
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
                onClick={() => setShowUploadModal(false)}
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
        </DialogContent>
      </Dialog>

      {/* Therapeutic Plan Modal */}
      <TherapeuticPlanModal
        isOpen={showTherapeuticPlanModal}
        onClose={() => setShowTherapeuticPlanModal(false)}
        patientId={patientId}
        patientData={patient}
      />

      {/* Progress Report Modal */}
      <ProgressReportModal
        isOpen={showProgressReportModal}
        onClose={() => setShowProgressReportModal(false)}
        patientId={patientId}
        patientData={patient}
      />

      {/* Therapist Report Contribution Modal */}
      <TherapistReportContributionModal
        isOpen={showReportContributionModal}
        onClose={() => setShowReportContributionModal(false)}
        patientId={patientId}
        patientData={patient}
      />

      <Toaster />
    </div>
  );
}
