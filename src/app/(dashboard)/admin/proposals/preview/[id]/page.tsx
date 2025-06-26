"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Edit, Send, Printer, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";

export default function AdminProposalPreviewPage() {
  const params = useParams();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  // Mock proposal data
  const proposalData = {
    patient: "Juan Pérez González",
    date: "15 de Enero, 2025",
    therapist: "Dr. Carlos Mendoza",
    evaluations: [
      { name: "Evaluación Integral", sessions: 4, cost: 800 },
      { name: "Evaluación Fonoaudiológica", sessions: 2, cost: 400 },
    ],
    treatments: [
      { name: "Terapia Psicológica", sessions: 16, cost: 3200 },
      { name: "Terapia Fonoaudiológica", sessions: 8, cost: 1600 },
      { name: "Taller Psicológico", sessions: 4, cost: 800 },
    ],
  };

  const totalEvaluations = proposalData.evaluations.reduce(
    (sum, item) => sum + item.cost,
    0
  );
  const totalTreatments = proposalData.treatments.reduce(
    (sum, item) => sum + item.cost,
    0
  );
  const grandTotal = totalEvaluations + totalTreatments;

  const singlePayment = grandTotal * 0.95; // 5% discount
  const monthlyPayment = grandTotal / 6;
  const bimonthlyPayment = grandTotal / 3;

  const sendToCommercial = () => {
    if (!confirmation) {
      alert("Debe confirmar que la información es correcta");
      return;
    }
    if (!paymentMethod) {
      alert("Debe seleccionar una forma de pago");
      return;
    }
    alert("Propuesta enviada al área comercial exitosamente");
    // Logic to send the proposal would go here
  };

  const printProposal = () => {
    // Hide unwanted elements before printing
    window.print();
  };

  const downloadPDF = () => {
    // Create temporary element for printing
    const printContent = document.documentElement.outerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      // Simulate PDF download
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
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
    <RoleGuard allowedRoles={["ADMIN"]}>
      <style jsx global>
        {printStyles}
      </style>
      <div className="space-y-6 p-6 print-content">
        {/* Header - Hidden on print */}
        <div className="flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-4">
            <Link href={`/admin/proposals/${params.id}`}>
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
                    Para:
                  </span>
                  <p className="text-blue-800 print:text-gray-800 font-semibold">
                    {proposalData.patient}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-900 print:text-gray-900">
                    Fecha:
                  </span>
                  <p className="text-blue-800 print:text-gray-800">
                    {proposalData.date}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-900 print:text-gray-900">
                    Terapeuta:
                  </span>
                  <p className="text-blue-800 print:text-gray-800">
                    {proposalData.therapist}
                  </p>
                </div>
              </div>
            </div>

            {/* Proposed Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Servicios Propuestos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Evaluations */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    EVALUACIONES
                  </h4>
                  <div className="space-y-3">
                    {proposalData.evaluations.map((evaluation, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-700">
                          • {evaluation.name} ({evaluation.sessions} ses.)
                        </span>
                        <span className="font-medium">
                          Bs. {evaluation.cost.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-semibold">
                      <span>Total:</span>
                      <span>Bs. {totalEvaluations.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Treatments */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    TRATAMIENTOS (6 meses)
                  </h4>
                  <div className="space-y-3">
                    {proposalData.treatments.map((treatment, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-700">
                          • {treatment.name} ({treatment.sessions} ses.)
                        </span>
                        <span className="font-medium">
                          Bs. {treatment.cost.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-semibold">
                      <span>Total:</span>
                      <span>Bs. {totalTreatments.toLocaleString()}</span>
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
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Evaluaciones:</span>
                    <span>Bs. {totalEvaluations.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tratamientos:</span>
                    <span>Bs. {totalTreatments.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>TOTAL:</span>
                      <span>Bs. {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method - Hidden on print */}
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-lg">Forma de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="font-medium">
                        Pago único (5% descuento):
                      </Label>
                    </div>
                    <span className="font-bold text-green-600">
                      Bs. {singlePayment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="font-medium">
                        Pago mensual:
                      </Label>
                    </div>
                    <span className="font-bold">
                      Bs. {Math.round(monthlyPayment).toLocaleString()} x 6
                      meses
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="bimonthly" id="bimonthly" />
                      <Label htmlFor="bimonthly" className="font-medium">
                        Pago bimestral:
                      </Label>
                    </div>
                    <span className="font-bold">
                      Bs. {Math.round(bimonthlyPayment).toLocaleString()} x 3
                      pagos
                    </span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Confirmation - Hidden on print */}
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
                    Confirmo que la información es correcta y autorizo el envío
                    de esta propuesta al área comercial
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons - Hidden on print */}
            <div className="space-y-4 pt-6 border-t border-gray-200 print:hidden">
              {/* Main buttons */}
              <div className="flex justify-between items-center">
                <Link href={`/admin/proposals/${params.id}`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>

                <Button
                  onClick={sendToCommercial}
                  disabled={!confirmation || !paymentMethod}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar a Comercial
                </Button>
              </div>

              {/* Print and download buttons */}
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
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
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
