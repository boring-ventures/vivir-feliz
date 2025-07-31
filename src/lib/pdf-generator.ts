import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { FinalReport } from "@/types/reports";

export async function generateReportPDFFromTemplate(
  report: FinalReport,
  templateElement: HTMLElement
): Promise<jsPDF> {
  try {
    // Create a temporary container for PDF generation
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

    // Clone the template content
    const contentClone = templateElement.cloneNode(true) as HTMLElement;
    tempContainer.appendChild(contentClone);

    // Add page break styles
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

    // Add to DOM temporarily
    document.body.appendChild(tempContainer);

    // Wait for styles to be applied
    await new Promise((resolve) => setTimeout(resolve, 100));

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
      pdf.text("Informe Final", 10, 18);

      // Patient name and date (right aligned)
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray-500
      const patientText = `Paciente: ${report.patientName}`;
      const dateText = `Fecha: ${format(new Date(report.createdAt), "dd/MM/yyyy")}`;

      pdf.text(patientText, pageWidth - 10 - pdf.getTextWidth(patientText), 12);
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
    console.error("Error generating PDF from template:", error);
    throw error;
  }
}

export function downloadPDF(pdf: jsPDF, fileName: string): void {
  pdf.save(fileName);
}

export function printPDF(pdf: jsPDF): void {
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const printWindow = window.open(pdfUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
