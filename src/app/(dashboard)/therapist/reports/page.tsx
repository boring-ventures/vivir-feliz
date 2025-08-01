"use client";

import { useState, useEffect } from "react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  FileText,
  Loader2,
  Eye,
  Edit,
  User,
  BookOpen,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useReports } from "@/hooks/use-reports";
import { useTherapistContributions } from "@/hooks/use-therapist-contributions";
import { useFinalReport } from "@/hooks/use-final-report";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { TherapistData } from "@/types/reports";

interface TherapistContribution {
  id: string;
  patientId: string;
  therapistId: string;
  objectives: TherapistData[] | null;
  background: string | null;
  indicators: TherapistData[] | null;
  indicatorsComment: string | null;
  conclusions: string | null;
  createdAt: string;
  updatedAt: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

interface TherapeuticPlan {
  id: string;
  patientId: string;
  therapistId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school?: string | null;
  grade?: string | null;
  objectivesDate?: string | null;
  planning?: string | null;
  treatmentArea: string;
  frequency?: string | null;
  therapyStartDate?: string | null;
  background?: string | null;
  diagnoses?: unknown;
  generalObjective?: string | null;
  specificObjectives?: unknown;
  indicators?: unknown;
  methodologies?: unknown;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

interface ProgressReport {
  id: string;
  patientId: string;
  therapistId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school?: string | null;
  grade?: string | null;
  reportDate: string;
  treatmentArea: string;
  diagnoses?: unknown;
  generalObjective?: string | null;
  specificObjectives?: unknown;
  indicators?: unknown;
  progressEntries?: unknown;
  recommendations?: unknown;
  createdAt: string;
  updatedAt: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

export default function InformesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [openPatients, setOpenPatients] = useState<Set<string>>(new Set());
  const [showFinalReportModal, setShowFinalReportModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    patientId: string;
    patientName: string;
    patientAge: string;
    patientDateOfBirth: string;
  } | null>(null);
  const { profile } = useCurrentUser();
  const { data: reportsData, isLoading, error } = useReports();

  // Get patient ID from selected patient for fetching contributions
  const selectedPatientId = selectedPatient?.patientId || null;
  const {
    data: contributionsData,
    isLoading: contributionsLoading,
    error: contributionsError,
  } = useTherapistContributions(selectedPatientId);

  // Get existing final report data
  const { finalReport: existingFinalReport, isLoading: finalReportLoading } =
    useFinalReport(selectedPatientId || undefined);

  // Final report form state
  const [finalReportData, setFinalReportData] = useState({
    generalObjective: "",
    generalBackground: "",
    generalConclusions: "",
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleReportTypeFilterChange = (value: string) => {
    setReportTypeFilter(value);
  };

  const togglePatient = (patientId: string) => {
    setOpenPatients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  const handleOpenFinalReportModal = (
    patientData: {
      patientName: string;
      patientAge: string;
      patientDateOfBirth: string;
    },
    patientId: string
  ) => {
    setSelectedPatient({ ...patientData, patientId });
    setShowFinalReportModal(true);
  };

  const handleCloseFinalReportModal = () => {
    setShowFinalReportModal(false);
    setSelectedPatient(null);
    setFinalReportData({
      generalObjective: "",
      generalBackground: "",
      generalConclusions: "",
    });
  };

  // Preload existing final report data when modal opens
  useEffect(() => {
    if (showFinalReportModal && existingFinalReport && !finalReportLoading) {
      setFinalReportData({
        generalObjective: existingFinalReport.generalObjective || "",
        generalBackground: existingFinalReport.generalBackground || "",
        generalConclusions: existingFinalReport.generalConclusions || "",
      });
    }
  }, [showFinalReportModal, existingFinalReport, finalReportLoading]);

  // Group reports by patient
  const groupReportsByPatient = () => {
    const patientGroups = new Map<
      string,
      {
        patientName: string;
        patientAge: string;
        patientDateOfBirth: string;
        therapeuticPlans: TherapeuticPlan[];
        progressReports: ProgressReport[];
      }
    >();

    // Group therapeutic plans
    therapeuticPlans.forEach((plan) => {
      if (!patientGroups.has(plan.patientId)) {
        patientGroups.set(plan.patientId, {
          patientName: plan.patientName,
          patientAge: plan.patientAge,
          patientDateOfBirth: plan.patientDateOfBirth,
          therapeuticPlans: [],
          progressReports: [],
        });
      }
      patientGroups.get(plan.patientId)!.therapeuticPlans.push(plan);
    });

    // Group progress reports
    progressReports.forEach((report) => {
      if (!patientGroups.has(report.patientId)) {
        patientGroups.set(report.patientId, {
          patientName: report.patientName,
          patientAge: report.patientAge,
          patientDateOfBirth: report.patientDateOfBirth,
          therapeuticPlans: [],
          progressReports: [],
        });
      }
      patientGroups.get(report.patientId)!.progressReports.push(report);
    });

    return patientGroups;
  };

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

  // Show loading state
  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["THERAPIST"]}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando informes...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  // Show error state
  if (error) {
    return (
      <RoleGuard allowedRoles={["THERAPIST"]}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error al cargar los informes</p>
            <p className="text-sm text-gray-500">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
            <div className="mt-4 p-4 bg-gray-200 rounded text-left text-xs">
              <p>Debug info:</p>
              <p>Profile specialty: {profile?.specialty}</p>
              <p>Profile role: {profile?.role}</p>
              <p>Error details: {JSON.stringify(error, null, 2)}</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  const therapeuticPlans = reportsData?.therapeuticPlans || [];
  const progressReports = reportsData?.progressReports || [];
  const patientGroups = groupReportsByPatient();

  // Debug information
  console.log("Reports data:", {
    therapeuticPlans: therapeuticPlans.length,
    progressReports: progressReports.length,
    reportsData,
  });

  return (
    <RoleGuard allowedRoles={["THERAPIST"]}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Informes</h1>
            <p className="text-gray-600">
              Gestiona y revisa los informes de los pacientes
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Planes Terapéuticos
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {therapeuticPlans.length}
              </div>
              <p className="text-xs text-muted-foreground">Planes creados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Informes de Progreso
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressReports.length}</div>
              <p className="text-xs text-muted-foreground">
                Informes generados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Informes
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {therapeuticPlans.length + progressReports.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Todos los informes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientGroups.size}</div>
              <p className="text-xs text-muted-foreground">
                Pacientes con informes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Informes por Paciente</CardTitle>
              <div className="flex items-center space-x-2">
                <Select
                  value={reportTypeFilter}
                  onValueChange={handleReportTypeFilterChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los informes</SelectItem>
                    <SelectItem value="therapeutic_plans">
                      Planes Terapéuticos
                    </SelectItem>
                    <SelectItem value="development_evaluations">
                      Evaluaciones de Desarrollo
                    </SelectItem>
                    <SelectItem value="progress_reports">
                      Informes de Progreso
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <form onSubmit={(e) => e.preventDefault()}>
                    <Input
                      placeholder="Buscar informes..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8 w-64"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      name="reports-search-input"
                    />
                  </form>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {patientGroups.size === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay informes disponibles
                </h3>
                <p className="text-gray-500">
                  Los informes creados por los terapeutas aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {Array.from(patientGroups.entries()).map(
                  ([patientId, patientData]) => {
                    const isOpen = openPatients.has(patientId);
                    const totalReports =
                      patientData.therapeuticPlans.length +
                      patientData.progressReports.length;

                    return (
                      <Collapsible
                        key={patientId}
                        open={isOpen}
                        onOpenChange={() => togglePatient(patientId)}
                      >
                        <CollapsibleTrigger asChild>
                          <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {isOpen ? (
                                  <ChevronDown className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-500" />
                                )}
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {patientData.patientName}
                                  </h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {patientData.patientAge} años
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {totalReports} informe
                                      {totalReports !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>
                                    {patientData.therapeuticPlans.length} plan
                                    {patientData.therapeuticPlans.length !== 1
                                      ? "es"
                                      : ""}{" "}
                                    terapéutico
                                    {patientData.therapeuticPlans.length !== 1
                                      ? "s"
                                      : ""}
                                  </span>
                                  <span>
                                    {patientData.progressReports.length} informe
                                    {patientData.progressReports.length !== 1
                                      ? "s"
                                      : ""}{" "}
                                    de progreso
                                  </span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenFinalReportModal(
                                      patientData,
                                      patientId
                                    );
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Informe Final
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t border-gray-100 bg-gray-50">
                            {/* Therapeutic Plans */}
                            {patientData.therapeuticPlans.length > 0 &&
                              (reportTypeFilter === "all" ||
                                reportTypeFilter === "therapeutic_plans") &&
                              patientData.therapeuticPlans.map((plan) => (
                                <div
                                  key={plan.id}
                                  className="p-6 hover:bg-gray-100 transition-colors border-b border-gray-100"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3 mb-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              Plan Terapéutico
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div>
                                              <span className="font-medium text-gray-900">
                                                Terapeuta:
                                              </span>
                                              <p>
                                                {plan.therapist.firstName}{" "}
                                                {plan.therapist.lastName}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                {plan.therapist.specialty}
                                              </p>
                                            </div>

                                            <div>
                                              <span className="font-medium text-gray-900">
                                                Área de Tratamiento:
                                              </span>
                                              <p className="mt-1">
                                                {plan.treatmentArea}
                                              </p>
                                            </div>

                                            <div>
                                              <span className="font-medium text-gray-900">
                                                Fecha:
                                              </span>
                                              <p className="mt-1">
                                                {format(
                                                  new Date(plan.createdAt),
                                                  "dd/MM/yyyy"
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="ml-6 flex-shrink-0">
                                          <div className="flex gap-2">
                                            <Link
                                              href={`/therapist/reports/therapeutic-plans/${plan.id}`}
                                            >
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-200 hover:border-gray-300"
                                              >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                              </Button>
                                            </Link>
                                            <Link
                                              href={`/therapist/reports/therapeutic-plans/${plan.id}/view`}
                                            >
                                              <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                              >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver
                                              </Button>
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                            {/* Progress Reports */}
                            {patientData.progressReports.length > 0 &&
                              (reportTypeFilter === "all" ||
                                reportTypeFilter === "progress_reports") &&
                              patientData.progressReports.map((report) => (
                                <div
                                  key={report.id}
                                  className="p-6 hover:bg-gray-100 transition-colors border-b border-gray-100"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3 mb-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                              Informe de Progreso
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div>
                                              <span className="font-medium text-gray-900">
                                                Terapeuta:
                                              </span>
                                              <p>
                                                {report.therapist.firstName}{" "}
                                                {report.therapist.lastName}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                {report.therapist.specialty}
                                              </p>
                                            </div>

                                            <div>
                                              <span className="font-medium text-gray-900">
                                                Área de Tratamiento:
                                              </span>
                                              <p className="mt-1">
                                                {report.treatmentArea}
                                              </p>
                                            </div>

                                            <div>
                                              <span className="font-medium text-gray-900">
                                                Fecha del Informe:
                                              </span>
                                              <p className="mt-1">
                                                {format(
                                                  new Date(report.reportDate),
                                                  "dd/MM/yyyy"
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="ml-6 flex-shrink-0">
                                          <div className="flex gap-2">
                                            <Link
                                              href={`/therapist/reports/progress-reports/${report.id}`}
                                            >
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-200 hover:border-gray-300"
                                              >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                              </Button>
                                            </Link>
                                            <Link
                                              href={`/therapist/reports/progress-reports/${report.id}/view`}
                                            >
                                              <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                              >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver
                                              </Button>
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Final Report Modal */}
        <Dialog
          open={showFinalReportModal}
          onOpenChange={setShowFinalReportModal}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Informe Final - {selectedPatient?.patientName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseFinalReportModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Complete el informe final del paciente con la información
                recopilada
              </DialogDescription>
              {existingFinalReport && (
                <div
                  className={`mt-2 p-3 border rounded-md ${
                    existingFinalReport.isPublished
                      ? "bg-green-50 border-green-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <FileText
                      className={`h-4 w-4 ${
                        existingFinalReport.isPublished
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        existingFinalReport.isPublished
                          ? "text-green-800"
                          : "text-blue-800"
                      }`}
                    >
                      {existingFinalReport.isPublished
                        ? "Informe final publicado (Solo lectura)"
                        : "Borrador existente encontrado"}
                    </span>
                  </div>
                  <p
                    className={`text-xs ${
                      existingFinalReport.isPublished
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    Última actualización:{" "}
                    {format(
                      new Date(existingFinalReport.updatedAt),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </p>
                </div>
              )}
            </DialogHeader>

            <div className="space-y-6">
              {/* Loading state for final report */}
              {finalReportLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-gray-600">
                    Cargando datos del informe...
                  </span>
                </div>
              )}

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Básica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Nombre del Paciente
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedPatient?.patientName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Edad
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedPatient?.patientAge}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Fecha de Nacimiento
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {/* This would need to be fetched from patient data */}
                        Por definir
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Fecha del Informe
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {format(new Date(), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* General Objective */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Objetivo General</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Escriba el objetivo general del tratamiento..."
                    value={finalReportData.generalObjective}
                    onChange={(e) =>
                      setFinalReportData({
                        ...finalReportData,
                        generalObjective: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                    disabled={existingFinalReport?.isPublished}
                  />
                </CardContent>
              </Card>

              {/* Objectives from Therapist Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Objetivos de los Terapeutas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Los objetivos recopilados de las contribuciones de los
                      terapeutas aparecerán aquí.
                    </p>
                    {contributionsLoading ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 italic flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Cargando contribuciones de terapeutas...
                        </p>
                      </div>
                    ) : contributionsError ? (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600">
                          Error al cargar contribuciones:{" "}
                          {contributionsError.message}
                        </p>
                      </div>
                    ) : contributionsData?.contributions &&
                      contributionsData.contributions.length > 0 ? (
                      <div className="space-y-4">
                        {contributionsData.contributions.map((contribution) => (
                          <div
                            key={contribution.id}
                            className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">
                                {contribution.therapist.firstName}{" "}
                                {contribution.therapist.lastName}
                              </h4>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {contribution.therapist.specialty}
                              </span>
                            </div>
                            {contribution.objectives &&
                            Array.isArray(contribution.objectives) &&
                            contribution.objectives.length > 0 ? (
                              <div className="space-y-2">
                                {contribution.objectives.map(
                                  (
                                    objectiveData: TherapistData,
                                    index: number
                                  ) => {
                                    return (
                                      <div
                                        key={index}
                                        className="text-sm text-gray-700"
                                      >
                                        <span className="font-medium">•</span>{" "}
                                        {objectiveData.objectives?.join(", ") ||
                                          "Objetivo sin descripción"}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                No hay objetivos registrados para este
                                terapeuta.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 italic">
                          No hay contribuciones de terapeutas disponibles para
                          mostrar.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* General Background */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Antecedentes Generales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Escriba los antecedentes generales del paciente..."
                    value={finalReportData.generalBackground}
                    onChange={(e) =>
                      setFinalReportData({
                        ...finalReportData,
                        generalBackground: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                    disabled={existingFinalReport?.isPublished}
                  />
                </CardContent>
              </Card>

              {/* Backgrounds from Therapist Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Antecedentes de los Terapeutas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Los antecedentes recopilados de las contribuciones de los
                      terapeutas aparecerán aquí.
                    </p>
                    {contributionsData?.contributions &&
                    contributionsData.contributions.length > 0 ? (
                      <div className="space-y-4">
                        {contributionsData.contributions.map((contribution) => (
                          <div
                            key={contribution.id}
                            className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">
                                {contribution.therapist.firstName}{" "}
                                {contribution.therapist.lastName}
                              </h4>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {contribution.therapist.specialty}
                              </span>
                            </div>
                            {contribution.background ? (
                              <div className="text-sm text-gray-700">
                                {contribution.background}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                No hay antecedentes registrados para este
                                terapeuta.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 italic">
                          No hay contribuciones de terapeutas disponibles para
                          mostrar.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progress from Therapist Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Indicadores y Avances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Los indicadores y avances recopilados de las
                      contribuciones de los terapeutas aparecerán aquí.
                    </p>
                    {contributionsData?.contributions &&
                    contributionsData.contributions.length > 0 ? (
                      <div className="space-y-4">
                        {contributionsData.contributions.map((contribution) => (
                          <div
                            key={contribution.id}
                            className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">
                                {contribution.therapist.firstName}{" "}
                                {contribution.therapist.lastName}
                              </h4>
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                {contribution.therapist.specialty}
                              </span>
                            </div>
                            {contribution.indicators &&
                            Array.isArray(contribution.indicators) &&
                            contribution.indicators.length > 0 ? (
                              <div className="space-y-4">
                                {contribution.indicators.map(
                                  (
                                    indicatorData: TherapistData,
                                    index: number
                                  ) => (
                                    <div
                                      key={index}
                                      className="space-y-2 p-4 border rounded-lg"
                                    >
                                      <div className="flex gap-2">
                                        <Input
                                          value={
                                            indicatorData.indicators?.[0]
                                              ?.name || ""
                                          }
                                          placeholder="Descripción del indicador..."
                                          className="flex-1"
                                          disabled
                                        />
                                      </div>

                                      <div className="space-y-3">
                                        <Label>Estado de Progreso</Label>
                                        <div className="flex gap-2">
                                          {[
                                            {
                                              value: "not_achieved",
                                              label: "No logra",
                                            },
                                            {
                                              value: "with_help",
                                              label: "Con ayuda",
                                            },
                                            {
                                              value: "in_progress",
                                              label: "En progreso",
                                            },
                                            {
                                              value: "achieved",
                                              label: "Logrado",
                                            },
                                          ].map((status) => {
                                            const isSelected =
                                              indicatorData.indicators?.[0]
                                                ?.newStatus === status.value;
                                            const isPrevious =
                                              indicatorData.indicators?.[0]
                                                ?.initialStatus ===
                                              status.value;

                                            const getStatusColor = (
                                              statusValue: string
                                            ) => {
                                              switch (statusValue) {
                                                case "not_achieved":
                                                  return isSelected
                                                    ? "border-red-500 bg-red-50 text-red-700"
                                                    : isPrevious
                                                      ? "border-red-300 bg-red-25 text-red-500"
                                                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                                                case "with_help":
                                                  return isSelected
                                                    ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                                                    : isPrevious
                                                      ? "border-yellow-300 bg-yellow-25 text-yellow-500"
                                                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                                                case "in_progress":
                                                  return isSelected
                                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                                    : isPrevious
                                                      ? "border-blue-300 bg-blue-25 text-blue-500"
                                                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                                                case "achieved":
                                                  return isSelected
                                                    ? "border-green-500 bg-green-50 text-green-700"
                                                    : isPrevious
                                                      ? "border-green-300 bg-green-25 text-green-500"
                                                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                                                default:
                                                  return "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                                              }
                                            };

                                            return (
                                              <div
                                                key={status.value}
                                                className={`p-3 rounded-lg border-2 transition-all flex-1 ${getStatusColor(status.value)}`}
                                              >
                                                <div className="text-sm font-medium">
                                                  {status.label}
                                                </div>

                                                {isPrevious && (
                                                  <div className="text-xs mt-1 text-gray-500">
                                                    (Estado inicial)
                                                  </div>
                                                )}
                                                {isSelected && (
                                                  <div className="text-xs mt-1 text-gray-500">
                                                    (Estado actual)
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}

                                {/* Indicators Comment */}
                                {contribution.indicatorsComment && (
                                  <div className="mt-4">
                                    <Label className="text-sm font-medium">
                                      Comentarios sobre los Indicadores
                                    </Label>
                                    <Textarea
                                      placeholder="Agrega comentarios generales sobre los indicadores evaluados..."
                                      value={contribution.indicatorsComment}
                                      rows={3}
                                      disabled
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                No hay indicadores registrados para este
                                terapeuta.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 italic">
                          No hay contribuciones de terapeutas disponibles para
                          mostrar.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Conclusions and Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Conclusiones y Recomendaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Escriba las conclusiones y recomendaciones generales..."
                    value={finalReportData.generalConclusions}
                    onChange={(e) =>
                      setFinalReportData({
                        ...finalReportData,
                        generalConclusions: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                    disabled={existingFinalReport?.isPublished}
                  />
                </CardContent>
              </Card>

              {/* Conclusions from Therapist Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Conclusiones de los Terapeutas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Las conclusiones recopiladas de las contribuciones de los
                      terapeutas aparecerán aquí.
                    </p>
                    {contributionsData?.contributions &&
                    contributionsData.contributions.length > 0 ? (
                      <div className="space-y-4">
                        {contributionsData.contributions.map((contribution) => (
                          <div
                            key={contribution.id}
                            className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">
                                {contribution.therapist.firstName}{" "}
                                {contribution.therapist.lastName}
                              </h4>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                {contribution.therapist.specialty}
                              </span>
                            </div>
                            {contribution.conclusions ? (
                              <div className="text-sm text-gray-700">
                                {contribution.conclusions}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                No hay conclusiones registradas para este
                                terapeuta.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 italic">
                          No hay contribuciones de terapeutas disponibles para
                          mostrar.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2 pt-6">
              <Button variant="outline" onClick={handleCloseFinalReportModal}>
                Cancelar
              </Button>
              {!existingFinalReport?.isPublished && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      // Process therapist contributions data
                      const contributions =
                        contributionsData?.contributions || [];
                      const otherObjectives = contributions
                        .filter(
                          (c: TherapistContribution) =>
                            c.objectives &&
                            Array.isArray(c.objectives) &&
                            c.objectives.length > 0
                        )
                        .map((c: TherapistContribution) => ({
                          therapistName: `${c.therapist.firstName} ${c.therapist.lastName}`,
                          specialty: c.therapist.specialty,
                          objectives:
                            c.objectives
                              ?.map((objective: TherapistData) => {
                                // Extract text content from objectives
                                return objective.objectives?.join(", ") || "";
                              })
                              .filter((text: string) => text.trim() !== "") ||
                            [],
                        }));

                      const therapistBackgrounds = contributions
                        .filter((c: TherapistContribution) => c.background)
                        .map((c: TherapistContribution) => ({
                          therapistName: `${c.therapist.firstName} ${c.therapist.lastName}`,
                          specialty: c.therapist.specialty,
                          background: c.background,
                        }));

                      const therapistProgress = contributions
                        .filter((c: TherapistContribution) => c.indicators)
                        .map((c: TherapistContribution) => ({
                          therapistName: `${c.therapist.firstName} ${c.therapist.lastName}`,
                          specialty: c.therapist.specialty,
                          indicators: c.indicators,
                          indicatorsComment: c.indicatorsComment,
                        }));

                      const therapistConclusions = contributions
                        .filter((c: TherapistContribution) => c.conclusions)
                        .map((c: TherapistContribution) => ({
                          therapistName: `${c.therapist.firstName} ${c.therapist.lastName}`,
                          specialty: c.therapist.specialty,
                          conclusions: c.conclusions,
                        }));

                      const response = await fetch(
                        "/api/therapist/final-reports",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            patientId: selectedPatient?.patientId || "",
                            patientName: selectedPatient?.patientName || "",
                            patientDateOfBirth:
                              selectedPatient?.patientDateOfBirth || "",
                            patientAge: selectedPatient?.patientAge || "",
                            reportDate: new Date().toISOString(),
                            generalObjective: finalReportData.generalObjective,
                            generalBackground:
                              finalReportData.generalBackground,
                            generalConclusions:
                              finalReportData.generalConclusions,
                            otherObjectives:
                              otherObjectives.length > 0
                                ? otherObjectives
                                : null,
                            therapistBackgrounds:
                              therapistBackgrounds.length > 0
                                ? therapistBackgrounds
                                : null,
                            therapistProgress:
                              therapistProgress.length > 0
                                ? therapistProgress
                                : null,
                            therapistConclusions:
                              therapistConclusions.length > 0
                                ? therapistConclusions
                                : null,
                            isPublished: false,
                          }),
                        }
                      );

                      if (response.ok) {
                        const result = await response.json();
                        toast({
                          title: existingFinalReport
                            ? "Borrador actualizado"
                            : "Borrador guardado",
                          description: result.message,
                        });
                        handleCloseFinalReportModal();
                      } else {
                        const error = await response.json();
                        toast({
                          title: "Error al guardar borrador",
                          description: error.error || "Error desconocido",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      console.error("Error saving draft:", error);
                      toast({
                        title: "Error al guardar borrador",
                        description: "Error de conexión",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Guardar Borrador
                </Button>
              )}
              <Button
                disabled={existingFinalReport?.isPublished}
                onClick={async () => {
                  try {
                    // Process therapist contributions data
                    const contributions =
                      contributionsData?.contributions || [];
                    const otherObjectives = contributions
                      .filter(
                        (c: TherapistContribution) =>
                          c.objectives &&
                          Array.isArray(c.objectives) &&
                          c.objectives.length > 0
                      )
                      .map((c: TherapistContribution) => ({
                        therapistName: `${c.therapist.firstName} ${c.therapist.lastName}`,
                        specialty: c.therapist.specialty,
                        objectives:
                          c.objectives
                            ?.map((objective: TherapistData) => {
                              // Extract text content from objectives
                              return objective.objectives?.join(", ") || "";
                            })
                            .filter((text: string) => text.trim() !== "") || [],
                      }));

                    const therapistBackgrounds = contributions
                      .filter((c: TherapistContribution) => c.background)
                      .map((c: TherapistContribution) => ({
                        therapistName: `${c.therapist.firstName} ${c.therapist.lastName}`,
                        specialty: c.therapist.specialty,
                        background: c.background,
                      }));

                    const therapistProgress = contributions
                      .filter((c: TherapistContribution) => c.indicators)
                      .map((c: TherapistContribution) => ({
                        therapistName: `${c.therapist.firstName} ${c.therapist.lastName}`,
                        specialty: c.therapist.specialty,
                        indicators: c.indicators,
                        indicatorsComment: c.indicatorsComment,
                      }));

                    const therapistConclusions = contributions
                      .filter((c: TherapistContribution) => c.conclusions)
                      .map((c: TherapistContribution) => ({
                        therapistName: `${c.therapist.firstName} ${c.therapist.lastName}`,
                        specialty: c.therapist.specialty,
                        conclusions: c.conclusions,
                      }));

                    const response = await fetch(
                      "/api/therapist/final-reports",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          patientId: selectedPatient?.patientId || "",
                          patientName: selectedPatient?.patientName || "",
                          patientDateOfBirth:
                            selectedPatient?.patientDateOfBirth || "",
                          patientAge: selectedPatient?.patientAge || "",
                          reportDate: new Date().toISOString(),
                          generalObjective: finalReportData.generalObjective,
                          generalBackground: finalReportData.generalBackground,
                          generalConclusions:
                            finalReportData.generalConclusions,
                          otherObjectives:
                            otherObjectives.length > 0 ? otherObjectives : null,
                          therapistBackgrounds:
                            therapistBackgrounds.length > 0
                              ? therapistBackgrounds
                              : null,
                          therapistProgress:
                            therapistProgress.length > 0
                              ? therapistProgress
                              : null,
                          therapistConclusions:
                            therapistConclusions.length > 0
                              ? therapistConclusions
                              : null,
                          isPublished: true,
                        }),
                      }
                    );

                    if (response.ok) {
                      const result = await response.json();
                      toast({
                        title: existingFinalReport
                          ? "Informe final actualizado"
                          : "Informe final publicado",
                        description: result.message,
                      });
                      handleCloseFinalReportModal();
                    } else {
                      const error = await response.json();
                      toast({
                        title: "Error al publicar informe final",
                        description: error.error || "Error desconocido",
                        variant: "destructive",
                      });
                    }
                  } catch (error) {
                    console.error("Error publishing final report:", error);
                    toast({
                      title: "Error al publicar informe final",
                      description: "Error de conexión",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Guardar Informe Final
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
