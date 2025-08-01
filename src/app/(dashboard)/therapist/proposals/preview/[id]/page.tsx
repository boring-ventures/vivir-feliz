"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Edit,
  Send,
  Printer,
  Download,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { useProposals, useProposalServices } from "@/hooks/useProposals";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/components/ui/use-toast";

export default function AdminProposalPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch real data from the cache (already loaded from previous page)
  const { data: proposals, isLoading: proposalsLoading } = useProposals();
  const { data: proposalServices, isLoading: servicesLoading } =
    useProposalServices(params.id as string);

  const currentProposal = proposals?.find((p) => p.id === params.id);

  // Helper function to calculate age
  function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Prepare proposal data from database using consultation request data
  const proposalData =
    currentProposal && proposalServices
      ? {
          patient: currentProposal.consultationRequest.childName,
          age: calculateAge(
            new Date(currentProposal.consultationRequest.childDateOfBirth)
          ),
          parentName:
            currentProposal.consultationRequest.motherName ||
            currentProposal.consultationRequest.fatherName ||
            "Sin nombre",
          phone:
            currentProposal.consultationRequest.motherPhone ||
            currentProposal.consultationRequest.fatherPhone ||
            "Sin teléfono",
          consultationDate: new Date(
            currentProposal.createdAt
          ).toLocaleDateString("es-ES"),
          consultationReason: currentProposal.title,
          date: new Date(currentProposal.createdAt).toLocaleDateString(
            "es-ES",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          ),
          therapist: `${currentProposal.therapist.firstName} ${currentProposal.therapist.lastName}`,
          observations: currentProposal.description || "",
          // Proposal A services
          evaluationsA: proposalServices
            .filter(
              (service) =>
                service.type === "EVALUATION" && service.proposalType === "A"
            )
            .map((service) => ({
              name: service.service,
              sessions: Number(service.sessions),
              cost: Number(service.cost || 0),
            })),
          treatmentsA: proposalServices
            .filter(
              (service) =>
                service.type === "TREATMENT" && service.proposalType === "A"
            )
            .map((service) => ({
              name: service.service,
              sessions: Number(service.sessions),
              cost: Number(service.cost || 0),
            })),
          // Proposal B services
          evaluationsB: proposalServices
            .filter(
              (service) =>
                service.type === "EVALUATION" && service.proposalType === "B"
            )
            .map((service) => ({
              name: service.service,
              sessions: Number(service.sessions),
              cost: Number(service.cost || 0),
            })),
          treatmentsB: proposalServices
            .filter(
              (service) =>
                service.type === "TREATMENT" && service.proposalType === "B"
            )
            .map((service) => ({
              name: service.service,
              sessions: Number(service.sessions),
              cost: Number(service.cost || 0),
            })),
        }
      : null;

  // Calculate totals for Proposal A
  const totalEvaluationsA =
    proposalData?.evaluationsA.reduce((sum, item) => sum + item.cost, 0) || 0;
  const totalTreatmentsA =
    proposalData?.treatmentsA.reduce((sum, item) => sum + item.cost, 0) || 0;
  const totalProposalA = totalEvaluationsA + totalTreatmentsA;

  // Calculate session totals for Proposal A
  const totalSessionsEvaluationsA =
    proposalData?.evaluationsA.reduce((sum, item) => sum + item.sessions, 0) ||
    0;
  const totalSessionsTreatmentsA =
    proposalData?.treatmentsA.reduce((sum, item) => sum + item.sessions, 0) ||
    0;
  const totalSessionsProposalA =
    totalSessionsEvaluationsA + totalSessionsTreatmentsA;

  // Calculate totals for Proposal B
  const totalEvaluationsB =
    proposalData?.evaluationsB.reduce((sum, item) => sum + item.cost, 0) || 0;
  const totalTreatmentsB =
    proposalData?.treatmentsB.reduce((sum, item) => sum + item.cost, 0) || 0;
  const totalProposalB = totalEvaluationsB + totalTreatmentsB;

  // Calculate session totals for Proposal B
  const totalSessionsEvaluationsB =
    proposalData?.evaluationsB.reduce((sum, item) => sum + item.sessions, 0) ||
    0;
  const totalSessionsTreatmentsB =
    proposalData?.treatmentsB.reduce((sum, item) => sum + item.sessions, 0) ||
    0;
  const totalSessionsProposalB =
    totalSessionsEvaluationsB + totalSessionsTreatmentsB;

  // Payment calculations for both proposals
  const singlePaymentA = totalProposalA * 0.95; // 5% discount
  const monthlyPaymentA = totalProposalA / 6;

  const singlePaymentB = totalProposalB * 0.95; // 5% discount
  const monthlyPaymentB = totalProposalB / 6;

  // Show loading state while data is being fetched
  if (proposalsLoading || servicesLoading || !proposalData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Cargando vista previa...
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Por favor espere mientras cargamos los datos de la propuesta
          </p>
        </div>
      </div>
    );
  }

  const sendToCommercial = async () => {
    if (!confirmation) {
      toast({
        title: "Error",
        description: "Debe confirmar que la información es correcta",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingStatus(true);
    try {
      // Prepare payment plan data
      const paymentPlanData = {
        A: {
          single: singlePaymentA,
          monthly: monthlyPaymentA,
        },
        B: {
          single: singlePaymentB,
          monthly: monthlyPaymentB,
        },
      };

      const response = await fetch(
        `/api/admin/patients/proposals/${params.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "PAYMENT_PENDING",
            paymentPlan: paymentPlanData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar propuesta a comercial");
      }

      toast({
        title: "Propuesta enviada",
        description:
          "La propuesta ha sido enviada al área comercial exitosamente",
      });

      // Redirect back to proposals page
      router.push("/therapist/proposals");
    } catch (error) {
      console.error("Error sending proposal to commercial:", error);
      toast({
        title: "Error",
        description: "Hubo un error al enviar la propuesta a comercial",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const cancelProposal = async () => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(
        `/api/admin/patients/proposals/${params.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "NEW_PROPOSAL",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al cancelar propuesta");
      }

      toast({
        title: "Propuesta cancelada",
        description: "La propuesta ha sido devuelta al estado inicial",
      });

      // Redirect back to proposals page
      router.push("/therapist/proposals");
    } catch (error) {
      console.error("Error canceling proposal:", error);
      toast({
        title: "Error",
        description: "Hubo un error al cancelar la propuesta",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const printProposal = () => {
    // Hide unwanted elements before printing
    window.print();
  };

  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Get the print content element to render as PDF
      const printContent = document.querySelector(
        ".print-content"
      ) as HTMLElement;
      if (!printContent) {
        throw new Error("No se encontró el contenido para imprimir");
      }

      // Clone the content to avoid modifying the original
      const contentClone = printContent.cloneNode(true) as HTMLElement;

      // Create a temporary container for PDF generation
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "216mm"; // Letter width
      tempContainer.style.minHeight = "279mm"; // Letter height
      tempContainer.style.backgroundColor = "transparent";
      tempContainer.style.padding = "20px";
      contentClone.style.marginTop = "0px";
      tempContainer.style.fontFamily = "Arial, sans-serif";
      tempContainer.style.fontSize = "12px";
      tempContainer.style.lineHeight = "1.4";
      tempContainer.appendChild(contentClone);

      // Remove print:hidden elements
      const hiddenElements = tempContainer.querySelectorAll(".print\\:hidden");
      hiddenElements.forEach((el) => el.remove());

      // Show print-only elements
      const printOnlyElements =
        tempContainer.querySelectorAll(".print\\:block");
      printOnlyElements.forEach((el) => {
        (el as HTMLElement).style.display = "block";
      });

      // Style the content for better PDF output
      const cardElements = tempContainer.querySelectorAll(
        ".card, [class*='card']"
      );
      cardElements.forEach((el) => {
        (el as HTMLElement).style.border = "1px solid #e5e7eb";
        (el as HTMLElement).style.borderRadius = "8px";
        (el as HTMLElement).style.marginBottom = "16px";
        (el as HTMLElement).style.padding = "16px";
        (el as HTMLElement).style.backgroundColor = "white";
        (el as HTMLElement).style.boxShadow = "none";
      });

      // Style the blue patient information section
      const patientInfoSection = tempContainer.querySelector(".bg-blue-50");
      if (patientInfoSection) {
        (patientInfoSection as HTMLElement).style.backgroundColor = "#eff6ff";
        (patientInfoSection as HTMLElement).style.border = "1px solid #bfdbfe";
        (patientInfoSection as HTMLElement).style.borderRadius = "12px";
        (patientInfoSection as HTMLElement).style.padding = "24px";
      }

      // Style the financial summary section
      const financialSection = tempContainer.querySelector(".bg-gray-50");
      if (financialSection) {
        (financialSection as HTMLElement).style.backgroundColor = "#f9fafb";
        (financialSection as HTMLElement).style.border = "1px solid #e5e7eb";
        (financialSection as HTMLElement).style.borderRadius = "8px";
        (financialSection as HTMLElement).style.padding = "16px";
      }

      // Add page break styles for better PDF rendering
      const style = document.createElement("style");
      style.textContent = `
        .page-break {
          page-break-before: always;
          break-before: page;
        }
        .avoid-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .print-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .print-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 16px 20px;
          text-align: center;
          color: #6b7280;
          font-size: 10px;
          line-height: 1.2;
        }
        .print-content {
          margin-top: 80px;
          margin-bottom: 80px;
          padding: 0 20px;
        }
        .avoid-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        @media print {
          .print-header, .print-footer {
            position: fixed;
          }
          .print-content {
            margin-top: 80px;
            margin-bottom: 80px;
          }
        }
      `;
      tempContainer.appendChild(style);

      // Remove any existing print headers to avoid duplication
      const existingHeaders = tempContainer.querySelectorAll(
        ".print-header, .hidden.print\\:block"
      );
      existingHeaders.forEach((header) => header.remove());

      // Add print footer
      const printFooter = document.createElement("div");
      printFooter.className = "print-footer";
      printFooter.innerHTML = `
        <div style="opacity: 0.6;">
          <p style="margin: 0; font-weight: 500;">Centro Vivir Feliz - Terapias Especializadas</p>
          <p style="margin: 0;">Teléfono: +591-4-123-4567 | Email: info@vivirfeliz.bo</p>
          <p style="margin: 0;">Dirección: Av. Principal 123, Cochabamba, Bolivia</p>
        </div>
      `;
      tempContainer.appendChild(printFooter);

      // Add service section styling to avoid page breaks
      const serviceRows = tempContainer.querySelectorAll(".space-y-3 > div");
      serviceRows.forEach((el) => {
        (el as HTMLElement).classList.add("avoid-break");
      });

      // Add to DOM temporarily
      document.body.appendChild(tempContainer);

      // Wait for styles to be applied
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate canvas from the content with higher quality
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: tempContainer.offsetWidth,
        height: tempContainer.offsetHeight,
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied in the clone
          const clonedContainer = clonedDoc.querySelector(
            '[style*="position: absolute"]'
          );
          if (clonedContainer) {
            (clonedContainer as HTMLElement).style.position = "relative";
            (clonedContainer as HTMLElement).style.left = "0";
            (clonedContainer as HTMLElement).style.top = "0";
          }
        },
      });

      // Remove temporary container
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
        pdf.text("Propuesta Terapéutica", 10, 18);

        // Date and therapist (right aligned)
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128); // Gray-500
        const dateText = `Fecha: ${proposalData?.date}`;
        const therapistText = `Terapeuta: ${proposalData?.therapist}`;

        pdf.text(dateText, pageWidth - 10 - pdf.getTextWidth(dateText), 12);
        pdf.text(
          therapistText,
          pageWidth - 10 - pdf.getTextWidth(therapistText),
          18
        );

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
        // Account for header and footer space with minimal section-like spacing
        const availableHeight = pageHeight - 42.5; // Space for header and footer
        const totalPages = Math.ceil(imgHeight / availableHeight);

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }

          // Add header to each page
          addPageHeader();

          const sourceY = (i * availableHeight * canvas.width) / imgWidth;
          const sourceHeight = Math.min(
            (availableHeight * canvas.width) / imgWidth,
            canvas.height - sourceY
          );

          // Create canvas for this page
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

            // Add content below header - minimal spacing like between sections
            const contentStartY = i === 0 ? 22.5 : 25;
            pdf.addImage(
              pageImgData,
              "PNG",
              0,
              contentStartY,
              imgWidth,
              pageImgHeight
            );
          }

          // Add footer to each page
          addPageFooter();
        }
      } else {
        // Single page
        addPageHeader();

        const imgData = canvas.toDataURL("image/png");
        // Add content below header - minimal spacing like between sections
        pdf.addImage(imgData, "PNG", 0, 22.5, imgWidth, imgHeight);

        addPageFooter();
      }

      // Generate filename
      const filename = `propuesta-${proposalData?.patient?.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;

      // Download PDF
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF. Por favor, intente nuevamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Global styles for printing
  const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-content, .print-content * {
      visibility: visible;
    }
    .print-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    nav, header, aside, .print:hidden {
      display: none !important;
    }
  }
`;

  return (
    <RoleGuard allowedRoles={["THERAPIST"]}>
      <style jsx global>
        {printStyles}
      </style>
      <div className="space-y-6 p-6 print-content">
        {/* Header - Hidden on print */}
        <div className="flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-4">
            <Link href={`/therapist/proposals/${params.id}`}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                Propuesta Económica - Vista Previa
              </h1>
              <p className="text-gray-600">
                Revisa y confirma la propuesta antes de enviar
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={printProposal}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Print Header - Only visible on print */}
        <div className="hidden print:block print:border-b print:pb-4 print:mb-6 print:w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Centro Vivir Feliz
                </h1>
                <p className="text-sm text-gray-600">Propuesta Terapéutica</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Fecha: {proposalData.date}</p>
              <p>Terapeuta: {proposalData.therapist}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="print:shadow-none print:border">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl">Propuesta Económica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Patient Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 print:bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-900 print:text-gray-900">
                    Paciente:
                  </span>
                  <p className="text-blue-800 print:text-gray-800 font-semibold">
                    {proposalData.patient}
                  </p>
                  <p className="text-blue-700 print:text-gray-700">
                    {proposalData.age} años
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-900 print:text-gray-900">
                    Padre/Madre:
                  </span>
                  <p className="text-blue-800 print:text-gray-800">
                    {proposalData.parentName}
                  </p>
                  <p className="text-blue-700 print:text-gray-700 text-xs">
                    {proposalData.phone}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-900 print:text-gray-900">
                    Consulta:
                  </span>
                  <p className="text-blue-800 print:text-gray-800">
                    {proposalData.consultationDate}
                  </p>
                  <p className="text-blue-700 print:text-gray-700 text-xs">
                    {proposalData.consultationReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Observations */}
            {proposalData.observations && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {proposalData.observations}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Proposed Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Servicios Propuestos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Proposal A */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    PROPUESTA A
                  </h3>

                  {/* Evaluations A */}
                  <div className="mb-6">
                    <h4 className="font-medium text-blue-800 mb-3">
                      EVALUACIONES
                    </h4>
                    <div className="space-y-2">
                      {proposalData.evaluationsA.map((evaluation, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-blue-700">
                            • {evaluation.name} ({evaluation.sessions} ses.)
                          </span>
                          <span className="font-medium text-blue-800">
                            Bs. {evaluation.cost.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-blue-200 font-semibold">
                        <span>Total Evaluaciones:</span>
                        <span>Bs. {totalEvaluationsA.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Treatments A */}
                  <div className="mb-4">
                    <h4 className="font-medium text-blue-800 mb-3">
                      TRATAMIENTOS (6 meses)
                    </h4>
                    <div className="space-y-2">
                      {proposalData.treatmentsA.map((treatment, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-blue-700">
                            • {treatment.name} ({treatment.sessions} ses.)
                          </span>
                          <span className="font-medium text-blue-800">
                            Bs. {treatment.cost.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-blue-200 font-semibold">
                        <span>Total Tratamientos:</span>
                        <span>Bs. {totalTreatmentsA.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Proposal A Summary */}
                  <div className="border-t border-blue-300 pt-3">
                    <div className="flex justify-between text-lg font-bold text-blue-900">
                      <span>TOTAL PROPUESTA A:</span>
                      <span>Bs. {totalProposalA.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-700 mt-1">
                      <span>Total Sesiones:</span>
                      <span>{totalSessionsProposalA} sesiones</span>
                    </div>
                  </div>
                </div>

                {/* Proposal B */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    PROPUESTA B
                  </h3>

                  {/* Evaluations B */}
                  <div className="mb-6">
                    <h4 className="font-medium text-green-800 mb-3">
                      EVALUACIONES
                    </h4>
                    <div className="space-y-2">
                      {proposalData.evaluationsB.map((evaluation, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-green-700">
                            • {evaluation.name} ({evaluation.sessions} ses.)
                          </span>
                          <span className="font-medium text-green-800">
                            Bs. {evaluation.cost.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-green-200 font-semibold">
                        <span>Total Evaluaciones:</span>
                        <span>Bs. {totalEvaluationsB.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Treatments B */}
                  <div className="mb-4">
                    <h4 className="font-medium text-green-800 mb-3">
                      TRATAMIENTOS (6 meses)
                    </h4>
                    <div className="space-y-2">
                      {proposalData.treatmentsB.map((treatment, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-green-700">
                            • {treatment.name} ({treatment.sessions} ses.)
                          </span>
                          <span className="font-medium text-green-800">
                            Bs. {treatment.cost.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-green-200 font-semibold">
                        <span>Total Tratamientos:</span>
                        <span>Bs. {totalTreatmentsB.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Proposal B Summary */}
                  <div className="border-t border-green-300 pt-3">
                    <div className="flex justify-between text-lg font-bold text-green-900">
                      <span>TOTAL PROPUESTA B:</span>
                      <span>Bs. {totalProposalB.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-700 mt-1">
                      <span>Total Sesiones:</span>
                      <span>{totalSessionsProposalB} sesiones</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Proposal A Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Propuesta A
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Evaluaciones:</span>
                        <span>Bs. {totalEvaluationsA.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tratamientos:</span>
                        <span>Bs. {totalTreatmentsA.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2">
                        <div className="flex justify-between font-semibold text-blue-900">
                          <span>Total Propuesta A:</span>
                          <span>Bs. {totalProposalA.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-blue-700">
                          <span>Sesiones:</span>
                          <span>{totalSessionsProposalA} sesiones</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proposal B Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">
                      Propuesta B
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Evaluaciones:</span>
                        <span>Bs. {totalEvaluationsB.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tratamientos:</span>
                        <span>Bs. {totalTreatmentsB.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-green-200 pt-2">
                        <div className="flex justify-between font-semibold text-green-900">
                          <span>Total Propuesta B:</span>
                          <span>Bs. {totalProposalB.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-green-700">
                          <span>Sesiones:</span>
                          <span>{totalSessionsProposalB} sesiones</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Note about selection */}
                  <div className="text-center text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="font-medium text-yellow-800">
                      Los padres deberán seleccionar una de las dos propuestas
                    </p>
                    <p className="text-yellow-700 mt-1">
                      Propuesta A: {totalSessionsProposalA} sesiones | Propuesta
                      B: {totalSessionsProposalB} sesiones
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formas de Pago section - remove radio buttons, display payment options for A and B as plain text/rows */}
            <div className="mt-8 print:mt-8">
              <h3 className="text-lg font-semibold mb-2">Formas de Pago</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Propuesta A */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Propuesta A</h4>
                  <ul className="space-y-1">
                    <li>
                      Pago único:{" "}
                      <span className="font-bold">
                        $
                        {singlePaymentA.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })}
                      </span>
                    </li>
                    <li>
                      Pago mensual (6 pagos):{" "}
                      <span className="font-bold">
                        $
                        {monthlyPaymentA.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })}
                      </span>
                    </li>
                  </ul>
                </div>
                {/* Propuesta B */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Propuesta B</h4>
                  <ul className="space-y-1">
                    <li>
                      Pago único:{" "}
                      <span className="font-bold">
                        $
                        {singlePaymentB.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })}
                      </span>
                    </li>
                    <li>
                      Pago mensual (6 pagos):{" "}
                      <span className="font-bold">
                        $
                        {monthlyPaymentB.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Confirmation - Only show for NEW_PROPOSAL status */}
            {currentProposal?.status === "NEW_PROPOSAL" && (
              <Card className="bg-yellow-50 border-yellow-200 print:hidden">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="confirmation"
                      checked={confirmation}
                      onCheckedChange={(checked) =>
                        setConfirmation(checked === true)
                      }
                    />
                    <Label
                      htmlFor="confirmation"
                      className="text-sm font-medium text-yellow-900"
                    >
                      Confirmo que la información es correcta y autorizo el
                      envío de esta propuesta al área comercial
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status indicator for other statuses */}
            {currentProposal?.status !== "NEW_PROPOSAL" && (
              <Card className="print:hidden">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Estado de la Propuesta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-6">
                    {currentProposal?.status === "PAYMENT_PENDING" && (
                      <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800 mb-2">
                          En Comercial
                        </div>
                        <p className="text-sm text-gray-600">
                          Esta propuesta está siendo procesada por el área
                          comercial
                        </p>
                      </div>
                    )}
                    {currentProposal?.status === "PAYMENT_CONFIRMED" && (
                      <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-2">
                          Pago Confirmado
                        </div>
                        <p className="text-sm text-gray-600">
                          El pago ha sido confirmado y la propuesta está en
                          proceso
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons - Hidden on print */}
            <div className="space-y-4 pt-6 border-t border-gray-200 print:hidden">
              {/* NEW_PROPOSAL Status Buttons */}
              {currentProposal?.status === "NEW_PROPOSAL" && (
                <div className="flex justify-between items-center">
                  <Link href={`/therapist/proposals/${params.id}`}>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>

                  <Button
                    onClick={sendToCommercial}
                    disabled={!confirmation || isUpdatingStatus}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar a Comercial
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* PAYMENT_PENDING Status Buttons */}
              {currentProposal?.status === "PAYMENT_PENDING" && (
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      onClick={cancelProposal}
                      disabled={isUpdatingStatus}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelando...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </>
                      )}
                    </Button>
                    <Link href={`/therapist/proposals/${params.id}`}>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </Link>
                  </div>
                  <div className="text-sm text-gray-600">
                    Esta propuesta está siendo procesada por el área comercial
                  </div>
                </div>
              )}

              {/* PAYMENT_CONFIRMED Status - Read-only */}
              {currentProposal?.status === "PAYMENT_CONFIRMED" && (
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-2">
                      Propuesta Confirmada
                    </div>
                    <p className="text-sm text-gray-600">
                      Esta propuesta ha sido confirmada y está en proceso
                    </p>
                  </div>
                </div>
              )}

              {/* Print and download buttons - Always visible */}
              <div className="flex justify-center items-center space-x-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={printProposal}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Propuesta
                </Button>

                <Button
                  variant="outline"
                  onClick={downloadPDF}
                  disabled={isGeneratingPDF}
                  className="border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-50"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Print Footer - Only visible on print */}
        <div className="hidden print:block print:mt-8 print:pt-4 print:border-t print:text-center print:text-sm print:text-gray-600">
          <p>Centro Vivir Feliz - Terapias Especializadas</p>
          <p>Teléfono: +591-4-123-4567 | Email: info@vivirfeliz.bo</p>
          <p>Dirección: Av. Principal 123, Cochabamba, Bolivia</p>
        </div>
      </div>
    </RoleGuard>
  );
}
