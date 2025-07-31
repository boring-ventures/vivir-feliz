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
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { useCurrentUser } from "@/hooks/use-current-user";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ReportPDFTemplate } from "@/components/admin/report-pdf-template";
import { createRoot } from "react-dom/client";

interface FinalReport {
  id: string;
  patientId: string;
  coordinatorId: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  reportDate: string;
  generalObjective: string | null;
  generalBackground: string | null;
  generalConclusions: string | null;
  otherObjectives: any | null;
  therapistBackgrounds: any | null;
  therapistProgress: any | null;
  therapistConclusions: any | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  coordinator: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

export default function AdminReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openReports, setOpenReports] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinalReport | null>(
    null
  );
  const [reports, setReports] = useState<FinalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useCurrentUser();

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

  // Fetch all final reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/admin/final-reports");
        if (response.ok) {
          const data = await response.json();
          setReports(data.finalReports || []);
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los informes",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description: "Error de conexión",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const toggleReport = (reportId: string) => {
    setOpenReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const handleOpenReportModal = (report: FinalReport) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generateReportPDF = async (report: FinalReport) => {
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
      root.render(<ReportPDFTemplate report={report} />);

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
        pdf.text("Informe Final", 10, 18);

        // Patient name and date (right aligned)
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128); // Gray-500
        const patientText = `Paciente: ${report.patientName}`;
        const dateText = `Fecha: ${format(new Date(report.createdAt), "dd/MM/yyyy")}`;

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

  const handleDownloadReport = async (report: FinalReport) => {
    try {
      // Small delay to ensure modal is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      const pdf = await generateReportPDF(report);
      const fileName = `Informe_Final_${report.patientName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
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

  const handlePrintReport = async (report: FinalReport) => {
    try {
      // Small delay to ensure modal is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      const pdf = await generateReportPDF(report);
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

  // Filter reports based on search and status
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.patientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && report.isPublished) ||
      (statusFilter === "draft" && !report.isPublished);
    return matchesSearch && matchesStatus;
  });

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

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Informes Finales
          </h1>
          <p className="text-gray-600">
            Gestiona y visualiza todos los informes finales del centro
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
                <SelectItem value="all">Todos los informes</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron informes
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Aún no hay informes finales registrados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Collapsible
                key={report.id}
                open={openReports.has(report.id)}
                onOpenChange={() => toggleReport(report.id)}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">
                                {report.patientName}
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                Coordinador: {report.coordinator.firstName}{" "}
                                {report.coordinator.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                report.isPublished
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {report.isPublished ? "Publicado" : "Borrador"}
                            </span>
                            {openReports.has(report.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReportModal(report);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadReport(report);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintReport(report);
                            }}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">
                            Edad:
                          </span>
                          <p className="text-gray-600">{report.patientAge}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Fecha del informe:
                          </span>
                          <p className="text-gray-600">
                            {format(new Date(report.reportDate), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Última actualización:
                          </span>
                          <p className="text-gray-600">
                            {format(
                              new Date(report.updatedAt),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </p>
                        </div>
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
                <span>Informe Final - {selectedReport?.patientName}</span>
              </DialogTitle>
              <DialogDescription>
                Vista detallada del informe final del paciente
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
                          {selectedReport.patientName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Edad
                        </Label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedReport.patientAge}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Coordinador
                        </Label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedReport.coordinator.firstName}{" "}
                          {selectedReport.coordinator.lastName}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Combined Objectives */}
                {(selectedReport.generalObjective ||
                  selectedReport.otherObjectives) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Objetivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* General Objective */}
                        {selectedReport.generalObjective && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Objetivo General
                            </h4>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {selectedReport.generalObjective}
                            </p>
                          </div>
                        )}

                        {/* Therapist Objectives */}
                        {selectedReport.otherObjectives &&
                          selectedReport.otherObjectives.map(
                            (therapistData: any, index: number) => (
                              <div
                                key={index}
                                className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                              >
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Objetivo de{" "}
                                  {translateSpecialty(therapistData.specialty)}
                                </h4>
                                {therapistData.objectives && (
                                  <div className="space-y-2">
                                    {therapistData.objectives.map(
                                      (objective: string, objIndex: number) => (
                                        <div
                                          key={objIndex}
                                          className="text-sm text-gray-700"
                                        >
                                          <span className="font-medium">•</span>{" "}
                                          {objective}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Combined Backgrounds */}
                {(selectedReport.generalBackground ||
                  selectedReport.therapistBackgrounds) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Antecedentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* General Background */}
                        {selectedReport.generalBackground && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Antecedentes Generales
                            </h4>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {selectedReport.generalBackground}
                            </p>
                          </div>
                        )}

                        {/* Therapist Backgrounds */}
                        {selectedReport.therapistBackgrounds &&
                          selectedReport.therapistBackgrounds.map(
                            (therapistData: any, index: number) => (
                              <div
                                key={index}
                                className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500"
                              >
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Antecedentes de{" "}
                                  {translateSpecialty(therapistData.specialty)}
                                </h4>
                                <div className="text-sm text-gray-700">
                                  {therapistData.background}
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Therapist Progress */}
                {selectedReport.therapistProgress && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Indicadores y Avances
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedReport.therapistProgress.length > 0 ? (
                          <div className="space-y-4">
                            {selectedReport.therapistProgress.map(
                              (therapistData: any, index: number) => (
                                <div
                                  key={index}
                                  className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500"
                                >
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Avances en el área de{" "}
                                    {translateSpecialty(
                                      therapistData.specialty
                                    )}
                                  </h4>
                                  {therapistData.indicators &&
                                  Array.isArray(therapistData.indicators) &&
                                  therapistData.indicators.length > 0 ? (
                                    <div className="space-y-4">
                                      {therapistData.indicators.map(
                                        (indicator: any, indIndex: number) => (
                                          <div
                                            key={indIndex}
                                            className="space-y-2 p-4 border rounded-lg"
                                          >
                                            <div className="flex gap-2">
                                              <Input
                                                value={indicator.name}
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
                                                    indicator.newStatus ===
                                                    status.value;
                                                  const isPrevious =
                                                    indicator.initialStatus ===
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
                                      {therapistData.indicatorsComment && (
                                        <div className="mt-4">
                                          <Label className="text-sm font-medium">
                                            Comentarios sobre los Indicadores
                                          </Label>
                                          <Textarea
                                            placeholder="Agrega comentarios generales sobre los indicadores evaluados..."
                                            value={
                                              therapistData.indicatorsComment
                                            }
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
                              )
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 italic">
                              No hay contribuciones de terapeutas disponibles
                              para mostrar.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Combined Conclusions */}
                {(selectedReport.generalConclusions ||
                  selectedReport.therapistConclusions) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Conclusiones y Recomendaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* General Conclusions */}
                        {selectedReport.generalConclusions && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Conclusiones Generales
                            </h4>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {selectedReport.generalConclusions}
                            </p>
                          </div>
                        )}

                        {/* Therapist Conclusions */}
                        {selectedReport.therapistConclusions &&
                          selectedReport.therapistConclusions.map(
                            (therapistData: any, index: number) => (
                              <div
                                key={index}
                                className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500"
                              >
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Desde{" "}
                                  {translateSpecialty(therapistData.specialty)}
                                </h4>
                                <div className="text-sm text-gray-700">
                                  {therapistData.conclusions}
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                    onClick={() => handleDownloadReport(selectedReport)}
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
                    onClick={() => handlePrintReport(selectedReport)}
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
