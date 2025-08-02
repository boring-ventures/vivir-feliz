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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Search,
  FileText,
  Loader2,
  Eye,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  User,
  BookOpen,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAdminReports } from "@/hooks/use-admin-reports";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ReportPDFTemplate } from "@/components/admin/report-pdf-template";
import { createRoot } from "react-dom/client";
import {
  FinalReport,
  ProgressReport,
  TherapeuticPlan,
  TherapistReportContribution,
} from "@/types/reports";

export default function AdminReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [openPatients, setOpenPatients] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<
    | FinalReport
    | ProgressReport
    | TherapeuticPlan
    | TherapistReportContribution
    | null
  >(null);
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { profile } = useCurrentUser();
  const { data, isLoading, error } = useAdminReports();

  // Helper function to translate specialties to Spanish
  const translateSpecialty = (specialty: string): string => {
    const translations: { [key: string]: string } = {
      SPEECH_THERAPIST: "Fonoaudiología",
      OCCUPATIONAL_THERAPIST: "Terapia Ocupacional",
      PSYCHOPEDAGOGUE: "Psicopedagogía",
      ASD_THERAPIST: "Terapeuta TEA",
      NEUROPSYCHOLOGIST: "Neuropsicología",
      COORDINATOR: "Coordinación",
      PSYCHOMOTRICIAN: "Psicomotricidad",
      PEDIATRIC_KINESIOLOGIST: "Kinesiología Pediátrica",
      PSYCHOLOGIST: "Psicología",
      COORDINATION_ASSISTANT: "Asistente de Coordinación",
      BEHAVIORAL_THERAPIST: "Terapia Conductual",
    };
    return translations[specialty] || specialty;
  };

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "secondary";
      case "IN_REVIEW":
        return "outline";
      case "APPROVED":
        return "default";
      case "PUBLISHED":
        return "default";
      case "ARCHIVED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Helper function to translate status to Spanish
  const translateStatus = (status: string): string => {
    const translations: { [key: string]: string } = {
      DRAFT: "Borrador",
      IN_REVIEW: "En Revisión",
      APPROVED: "Aprobado",
      PUBLISHED: "Publicado",
      ARCHIVED: "Archivado",
    };
    return translations[status] || status;
  };

  // Helper function to get report properties safely
  const getReportProperty = (
    report:
      | FinalReport
      | ProgressReport
      | TherapeuticPlan
      | TherapistReportContribution,
    property: string,
    type: string
  ): string => {
    try {
      switch (type) {
        case "final":
          const finalReport = report as FinalReport;
          const finalValue = finalReport[property as keyof FinalReport];
          return typeof finalValue === "string" ? finalValue : "N/A";
        case "progress":
          const progressReport = report as ProgressReport;
          const progressValue =
            progressReport[property as keyof ProgressReport];
          return typeof progressValue === "string" ? progressValue : "N/A";
        case "therapeutic":
          const therapeuticPlan = report as TherapeuticPlan;
          const therapeuticValue =
            therapeuticPlan[property as keyof TherapeuticPlan];
          return typeof therapeuticValue === "string"
            ? therapeuticValue
            : "N/A";
        case "contribution":
          // For contributions, some properties might not exist
          if (property === "patientName" || property === "patientAge") {
            return "N/A"; // These properties don't exist on TherapistReportContribution
          }
          const contribution = report as TherapistReportContribution;
          const contributionValue =
            contribution[property as keyof TherapistReportContribution];
          return typeof contributionValue === "string"
            ? contributionValue
            : "N/A";
        default:
          return "N/A";
      }
    } catch {
      return "N/A";
    }
  };

  // Helper function to get therapist/coordinator name
  const getReportAuthor = (
    report:
      | FinalReport
      | ProgressReport
      | TherapeuticPlan
      | TherapistReportContribution,
    type: string
  ): string => {
    switch (type) {
      case "final":
        const finalReport = report as FinalReport;
        return finalReport.coordinator
          ? `${finalReport.coordinator.firstName} ${finalReport.coordinator.lastName}`
          : "N/A";
      case "progress":
        const progressReport = report as ProgressReport;
        return progressReport.therapist
          ? `${progressReport.therapist.firstName} ${progressReport.therapist.lastName}`
          : "N/A";
      case "therapeutic":
        const therapeuticPlan = report as TherapeuticPlan;
        return therapeuticPlan.therapist
          ? `${therapeuticPlan.therapist.firstName} ${therapeuticPlan.therapist.lastName}`
          : "N/A";
      case "contribution":
        const contribution = report as TherapistReportContribution;
        return contribution.therapist
          ? `${contribution.therapist.firstName} ${contribution.therapist.lastName}`
          : "N/A";
      default:
        return "N/A";
    }
  };

  // Helper function to get status
  const getReportStatus = (
    report:
      | FinalReport
      | ProgressReport
      | TherapeuticPlan
      | TherapistReportContribution,
    type: string
  ): string => {
    switch (type) {
      case "final":
        const finalReport = report as FinalReport;
        return finalReport.isPublished ? "Publicado" : "Borrador";
      case "progress":
        const progressReport = report as ProgressReport;
        return translateStatus(progressReport.status);
      case "therapeutic":
        const therapeuticPlan = report as TherapeuticPlan;
        return translateStatus(therapeuticPlan.status);
      case "contribution":
        return "Contribución";
      default:
        return "N/A";
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
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

  const handleOpenReportModal = (
    report:
      | FinalReport
      | ProgressReport
      | TherapeuticPlan
      | TherapistReportContribution,
    type: string
  ) => {
    setSelectedReport(report);
    setSelectedReportType(type);
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
    setSelectedReportType("");
  };

  const generateReportPDF = async (
    report:
      | FinalReport
      | ProgressReport
      | TherapeuticPlan
      | TherapistReportContribution,
    type: string
  ) => {
    try {
      setIsGeneratingPDF(true);

      // Create a temporary container for the template
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "216mm"; // Letter width
      tempContainer.style.minHeight = "279mm"; // Letter height
      tempContainer.style.backgroundColor = "white";
      tempContainer.style.padding = "20px";
      tempContainer.style.fontFamily = "Arial, sans-serif";
      tempContainer.style.fontSize = "12px";
      tempContainer.style.lineHeight = "1.4";

      // Create a React root and render the template
      const root = createRoot(tempContainer);
      root.render(<ReportPDFTemplate report={report} type={type} />);

      // Add to DOM temporarily
      document.body.appendChild(tempContainer);

      // Wait for React to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate canvas from the content
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: tempContainer.offsetWidth,
        height: tempContainer.offsetHeight,
        logging: false,
      });

      // Clean up React root
      root.unmount();
      document.body.removeChild(tempContainer);

      // Create PDF with letter size
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter", // 216 x 279 mm
      });

      // Calculate dimensions to fit letter size
      const pageWidth = 216; // Letter width in mm
      const pageHeight = 279; // Letter height in mm
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Helper function to add header to each page
      const addPageHeader = () => {
        // Header background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, 25, "F");

        // Company name
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(31, 41, 55); // Gray-900
        pdf.text("Centro Vivir Feliz", 10, 12);

        // Subtitle
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(107, 114, 128); // Gray-500
        const reportTypeText =
          type === "final"
            ? "Informe Final"
            : type === "progress"
              ? "Informe de Progreso"
              : "Contribución de Terapeuta";
        pdf.text(reportTypeText, 10, 18);

        // Patient name and date (right aligned)
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128); // Gray-500

        // Get patient name and date based on report type
        let patientName = "N/A";
        let reportDate = new Date();

        if (type === "final") {
          const finalReport = report as FinalReport;
          patientName = finalReport.patientName || "N/A";
          reportDate = new Date(finalReport.createdAt);
        } else if (type === "progress") {
          const progressReport = report as ProgressReport;
          patientName = progressReport.patientName || "N/A";
          reportDate = new Date(progressReport.createdAt);
        } else if (type === "therapeutic") {
          const therapeuticPlan = report as TherapeuticPlan;
          patientName = therapeuticPlan.patientName || "N/A";
          reportDate = new Date(therapeuticPlan.createdAt);
        } else if (type === "contribution") {
          const contribution = report as TherapistReportContribution;
          // For contributions, we might need to get patient name from a different property
          patientName = "Paciente"; // Default for contributions
          reportDate = new Date(contribution.createdAt);
        }

        const patientText = `Paciente: ${patientName}`;
        const dateText = `Fecha: ${format(reportDate, "dd/MM/yyyy")}`;

        pdf.text(
          patientText,
          pageWidth - 10 - pdf.getTextWidth(patientText),
          12
        );
        pdf.text(dateText, pageWidth - 10 - pdf.getTextWidth(dateText), 18);

        // Header separator line
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(229, 231, 235); // Gray-200
        pdf.line(10, 22, pageWidth - 10, 22);

        // Reset text color
        pdf.setTextColor(0, 0, 0);
      };

      // Helper function to add footer to each page
      const addPageFooter = () => {
        const footerY = pageHeight - 20;
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(128, 128, 128); // Gray color with opacity

        const footerLines = [
          "Centro Vivir Feliz - Terapias Especializadas",
          "Teléfono: +591-4-123-4567 | Email: info@vivirfeliz.bo",
          "Dirección: Av. Principal 123, Cochabamba, Bolivia",
        ];

        footerLines.forEach((line, index) => {
          const textWidth = pdf.getTextWidth(line);
          const centerX = (pageWidth - textWidth) / 2;
          pdf.text(line, centerX, footerY + index * 4);
        });

        // Reset text color
        pdf.setTextColor(0, 0, 0);
      };

      // If content is longer than one page, split into multiple pages
      if (imgHeight > pageHeight - 42.5) {
        const availableHeight = pageHeight - 42.5;
        const totalPages = Math.ceil(imgHeight / availableHeight);

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }

          addPageHeader();

          const sourceY = (i * availableHeight * canvas.width) / imgWidth;
          const sourceHeight = Math.min(
            (availableHeight * canvas.width) / imgWidth,
            canvas.height - sourceY
          );

          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;

          const pageCtx = pageCanvas.getContext("2d");
          if (pageCtx) {
            pageCtx.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              sourceHeight,
              0,
              0,
              canvas.width,
              sourceHeight
            );

            const pageImgData = pageCanvas.toDataURL("image/png");
            const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;

            pdf.addImage(pageImgData, "PNG", 0, 25, imgWidth, pageImgHeight);
          }

          addPageFooter();
        }
      } else {
        // Single page
        addPageHeader();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          25,
          imgWidth,
          imgHeight
        );
        addPageFooter();
      }

      return pdf;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadReport = async (
    report:
      | FinalReport
      | ProgressReport
      | TherapeuticPlan
      | TherapistReportContribution,
    type: string
  ) => {
    try {
      // Small delay to ensure modal is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      const pdf = await generateReportPDF(report, type);
      const reportTypeText =
        type === "final"
          ? "Informe_Final"
          : type === "progress"
            ? "Informe_Progreso"
            : "Contribucion_Terapeuta";

      // Get patient name based on report type
      let patientName = "Paciente";
      if (type === "final") {
        const finalReport = report as FinalReport;
        patientName =
          finalReport.patientName?.replace(/\s+/g, "_") || "Paciente";
      } else if (type === "progress") {
        const progressReport = report as ProgressReport;
        patientName =
          progressReport.patientName?.replace(/\s+/g, "_") || "Paciente";
      } else if (type === "therapeutic") {
        const therapeuticPlan = report as TherapeuticPlan;
        patientName =
          therapeuticPlan.patientName?.replace(/\s+/g, "_") || "Paciente";
      } else if (type === "contribution") {
        // For contributions, use a default name
        patientName = "Paciente";
      }

      const fileName = `${reportTypeText}_${patientName}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Informe descargado",
        description: "El informe se ha descargado correctamente.",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF del informe.",
        variant: "destructive",
      });
    }
  };

  const handlePrintReport = async (
    report:
      | FinalReport
      | ProgressReport
      | TherapeuticPlan
      | TherapistReportContribution,
    type: string
  ) => {
    try {
      // Small delay to ensure modal is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      const pdf = await generateReportPDF(report, type);
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      toast({
        title: "Impresión iniciada",
        description: "El informe se ha enviado a la impresora.",
      });
    } catch (error) {
      console.error("Error printing report:", error);
      toast({
        title: "Error",
        description: "No se pudo imprimir el informe.",
        variant: "destructive",
      });
    }
  };

  // Filter patients based on search and filters
  const filteredPatients =
    data?.patients?.filter((patient) => {
      const matchesSearch = patient.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" &&
          patient.finalReports.some((r) => r.isPublished)) ||
        (statusFilter === "draft" &&
          patient.finalReports.some((r) => !r.isPublished));

      const matchesReportType =
        reportTypeFilter === "all" ||
        (reportTypeFilter === "final" && patient.finalReports.length > 0) ||
        (reportTypeFilter === "progress" &&
          patient.progressReports.length > 0) ||
        (reportTypeFilter === "therapeutic" &&
          patient.therapeuticPlans.length > 0) ||
        (reportTypeFilter === "contributions" &&
          patient.therapistContributions.length > 0);

      return matchesSearch && matchesStatus && matchesReportType;
    }) || [];

  // Check if user is ADMIN
  if (profile?.role !== "ADMIN") {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Acceso no autorizado</p>
            <p className="text-sm text-gray-500">
              Solo los administradores pueden acceder a esta página
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
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
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Error al cargar los informes</p>
            <p className="text-sm text-gray-500">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Informes de Pacientes
          </h1>
          <p className="text-gray-600">
            Gestiona y visualiza todos los informes organizados por paciente
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre del paciente..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={reportTypeFilter}
              onValueChange={handleReportTypeFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="final">Informes Finales</SelectItem>
                <SelectItem value="progress">Informes de Progreso</SelectItem>
                <SelectItem value="therapeutic">Planes Terapéuticos</SelectItem>
                <SelectItem value="contributions">Contribuciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Patients List */}
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron pacientes
                </h3>
                <p className="text-gray-600">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  reportTypeFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Aún no hay pacientes con informes registrados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Collapsible
                key={patient.id}
                open={openPatients.has(patient.id)}
                onOpenChange={() => togglePatient(patient.id)}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">
                                {patient.name}
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                Edad: {patient.age} • {patient.totalReports}{" "}
                                informes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {patient.finalReports.length} Finales
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {patient.progressReports.length} Progreso
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {patient.therapeuticPlans.length} Planes
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {patient.therapistContributions.length}{" "}
                              Contribuciones
                            </Badge>
                            {openPatients.has(patient.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-6">
                        {/* Final Reports Section */}
                        {patient.finalReports.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-blue-600" />
                              Informes Finales
                            </h3>
                            <div className="grid gap-4">
                              {patient.finalReports.map((report) => (
                                <Card
                                  key={report.id}
                                  className="border-l-4 border-l-blue-500"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <span className="text-sm font-medium text-gray-900">
                                            Informe Final
                                          </span>
                                          <Badge
                                            variant={
                                              report.isPublished
                                                ? "default"
                                                : "secondary"
                                            }
                                            className="text-xs"
                                          >
                                            {report.isPublished
                                              ? "Publicado"
                                              : "Borrador"}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                          <p>
                                            Coordinador:{" "}
                                            {report.coordinator.firstName}{" "}
                                            {report.coordinator.lastName}
                                          </p>
                                          <p>
                                            Fecha:{" "}
                                            {format(
                                              new Date(report.reportDate),
                                              "dd/MM/yyyy"
                                            )}
                                          </p>
                                          <p>
                                            Actualizado:{" "}
                                            {format(
                                              new Date(report.updatedAt),
                                              "dd/MM/yyyy HH:mm"
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleOpenReportModal(
                                              report,
                                              "final"
                                            )
                                          }
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          Ver
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Progress Reports Section */}
                        {patient.progressReports.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                              Informes de Progreso
                            </h3>
                            <div className="grid gap-4">
                              {patient.progressReports.map((report) => (
                                <Card
                                  key={report.id}
                                  className="border-l-4 border-l-green-500"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <span className="text-sm font-medium text-gray-900">
                                            Informe de Progreso
                                          </span>
                                          <Badge
                                            variant={getStatusBadgeVariant(
                                              report.status
                                            )}
                                            className="text-xs"
                                          >
                                            {translateStatus(report.status)}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {translateSpecialty(
                                              report.therapist.specialty
                                            )}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                          <p>
                                            Terapeuta:{" "}
                                            {report.therapist.firstName}{" "}
                                            {report.therapist.lastName}
                                          </p>
                                          <p>Área: {report.treatmentArea}</p>
                                          <p>
                                            Fecha:{" "}
                                            {format(
                                              new Date(report.reportDate),
                                              "dd/MM/yyyy"
                                            )}
                                          </p>
                                          <p>
                                            Actualizado:{" "}
                                            {format(
                                              new Date(report.updatedAt),
                                              "dd/MM/yyyy HH:mm"
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleOpenReportModal(
                                              report,
                                              "progress"
                                            )
                                          }
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          Ver
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Therapeutic Plans Section */}
                        {patient.therapeuticPlans.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                              Planes Terapéuticos
                            </h3>
                            <div className="grid gap-4">
                              {patient.therapeuticPlans.map((plan) => (
                                <Card
                                  key={plan.id}
                                  className="border-l-4 border-l-purple-500"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <span className="text-sm font-medium text-gray-900">
                                            Plan Terapéutico
                                          </span>
                                          <Badge
                                            variant={getStatusBadgeVariant(
                                              plan.status
                                            )}
                                            className="text-xs"
                                          >
                                            {translateStatus(plan.status)}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {translateSpecialty(
                                              plan.therapist.specialty
                                            )}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                          <p>
                                            Terapeuta:{" "}
                                            {plan.therapist.firstName}{" "}
                                            {plan.therapist.lastName}
                                          </p>
                                          <p>Área: {plan.treatmentArea}</p>
                                          <p>
                                            Fecha:{" "}
                                            {format(
                                              new Date(plan.createdAt),
                                              "dd/MM/yyyy"
                                            )}
                                          </p>
                                          <p>
                                            Actualizado:{" "}
                                            {format(
                                              new Date(plan.updatedAt),
                                              "dd/MM/yyyy HH:mm"
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleOpenReportModal(
                                              plan,
                                              "therapeutic"
                                            )
                                          }
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          Ver
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Therapist Contributions Section */}
                        {patient.therapistContributions.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <MessageSquare className="h-5 w-5 mr-2 text-orange-600" />
                              Contribuciones de Terapeutas
                            </h3>
                            <div className="grid gap-4">
                              {patient.therapistContributions.map(
                                (contribution) => (
                                  <Card
                                    key={contribution.id}
                                    className="border-l-4 border-l-orange-500"
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-sm font-medium text-gray-900">
                                              Contribución
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {translateSpecialty(
                                                contribution.therapist.specialty
                                              )}
                                            </Badge>
                                          </div>
                                          <div className="text-sm text-gray-600 space-y-1">
                                            <p>
                                              Terapeuta:{" "}
                                              {contribution.therapist.firstName}{" "}
                                              {contribution.therapist.lastName}
                                            </p>
                                            <p>
                                              Creado:{" "}
                                              {format(
                                                new Date(
                                                  contribution.createdAt
                                                ),
                                                "dd/MM/yyyy"
                                              )}
                                            </p>
                                            <p>
                                              Actualizado:{" "}
                                              {format(
                                                new Date(
                                                  contribution.updatedAt
                                                ),
                                                "dd/MM/yyyy HH:mm"
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleOpenReportModal(
                                                contribution,
                                                "contribution"
                                              )
                                            }
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </div>

        {/* Report View Modal */}
        <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto report-modal-content">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>
                  {selectedReportType === "final" && "Informe Final"}
                  {selectedReportType === "progress" && "Informe de Progreso"}
                  {selectedReportType === "therapeutic" && "Plan Terapéutico"}
                  {selectedReportType === "contribution" &&
                    "Contribución de Terapeuta"}
                  {selectedReport &&
                    ` - ${getReportProperty(selectedReport, "patientName", selectedReportType)}`}
                </span>
              </DialogTitle>
              <DialogDescription>
                Vista detallada del informe del paciente
              </DialogDescription>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Información Básica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Nombre del Paciente
                        </Label>
                        <p className="text-sm text-gray-900 mt-1">
                          {getReportProperty(
                            selectedReport,
                            "patientName",
                            selectedReportType
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Edad
                        </Label>
                        <p className="text-sm text-gray-900 mt-1">
                          {getReportProperty(
                            selectedReport,
                            "patientAge",
                            selectedReportType
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          {selectedReportType === "final"
                            ? "Coordinador"
                            : "Terapeuta"}
                        </Label>
                        <p className="text-sm text-gray-900 mt-1">
                          {getReportAuthor(selectedReport, selectedReportType)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Estado
                        </Label>
                        <p className="text-sm text-gray-900 mt-1">
                          {getReportStatus(selectedReport, selectedReportType)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Report Content - This would need to be customized based on report type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Contenido del Informe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      <p>
                        El contenido detallado del informe se mostraría aquí.
                      </p>
                      <p className="mt-2">
                        Tipo:{" "}
                        {selectedReportType === "final"
                          ? "Informe Final"
                          : selectedReportType === "progress"
                            ? "Informe de Progreso"
                            : selectedReportType === "therapeutic"
                              ? "Plan Terapéutico"
                              : "Contribución de Terapeuta"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-6">
              <Button variant="outline" onClick={handleCloseReportModal}>
                Cerrar
              </Button>
              {selectedReport && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleDownloadReport(selectedReport, selectedReportType)
                    }
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isGeneratingPDF ? "Generando..." : "Descargar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handlePrintReport(selectedReport, selectedReportType)
                    }
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Printer className="h-4 w-4 mr-2" />
                    )}
                    {isGeneratingPDF ? "Generando..." : "Imprimir"}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
