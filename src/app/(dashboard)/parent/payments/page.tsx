"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  CreditCard,
  DollarSign,
  Calendar,
  Eye,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  useParentPayments,
  ParentProposal,
  ParentPayment,
} from "@/hooks/use-parent-payments";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) {
    return "Fecha no disponible";
  }

  try {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Fecha no disponible";
    }

    return format(date, "dd/MM/yyyy", { locale: es });
  } catch {
    return "Fecha no disponible";
  }
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Bs. 0.00";
  }
  return `Bs. ${Number(amount).toFixed(2)}`;
};

// const getPaymentStatusInfo = (status: string) => {
//   switch (status) {
//     case "COMPLETED":
//       return {
//         icon: <CheckCircle className="h-3 w-3" />,
//         color: "bg-green-100 text-green-800 hover:bg-green-100",
//         text: "Completado",
//       };
//     case "PENDING":
//       return {
//         icon: <Clock className="h-3 w-3" />,
//         color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
//         text: "Pendiente",
//       };
//     case "CANCELLED":
//       return {
//         icon: <AlertTriangle className="h-3 w-3" />,
//         color: "bg-red-100 text-red-800 hover:bg-red-100",
//         text: "Cancelado",
//       };
//     default:
//       return {
//         icon: <Clock className="h-3 w-3" />,
//         color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
//         text: status,
//       };
//   }
// };

// const getProposalStatusInfo = (status: string) => {
//   switch (status) {
//     case "PAYMENT_CONFIRMED":
//     case "APPOINTMENTS_SCHEDULED":
//     case "TREATMENT_ACTIVE":
//       return {
//         color: "bg-green-100 text-green-800 hover:bg-green-100",
//         text: "Activo",
//       };
//     case "PAYMENT_PENDING":
//       return {
//         color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
//         text: "Pago Pendiente",
//       };
//     case "TREATMENT_COMPLETED":
//       return {
//         color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
//         text: "Completado",
//       };
//     case "CANCELLED":
//       return {
//         color: "bg-red-100 text-red-800 hover:bg-red-100",
//         text: "Cancelado",
//       };
//     default:
//       return {
//         color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
//         text: status,
//       };
//   }
// };

export default function ParentPagosPage() {
  const { data, isLoading, error } = useParentPayments();

  const handlePagarAhora = (proposal: ParentProposal) => {
    // TODO: Implement payment flow
    console.log("Iniciando pago para propuesta:", proposal.id);
  };

  const handleVerDetalles = (proposal: ParentProposal) => {
    // TODO: Navigate to proposal details
    console.log("Ver detalles de propuesta:", proposal.id);
  };

  const handleVerRecibo = (payment: ParentPayment) => {
    // TODO: Show payment receipt
    console.log("Ver recibo de pago:", payment.id);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Pagos y Facturación</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">
            Cargando información de pagos...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Pagos y Facturación</h2>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>
                Error al cargar la información de pagos. Por favor, intenta de
                nuevo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const proposals = data?.proposals || [];

  // Ensure proposals have safe default values
  const safeProposals = proposals.map((proposal) => ({
    ...proposal,
    title: proposal.title || "Sin título",
    patientName: proposal.patientName || "Paciente no disponible",
    pendingAmount: Number(proposal.pendingAmount) || 0,
    totalAmount: Number(proposal.totalAmount) || 0,
    totalPaid: Number(proposal.totalPaid) || 0,
    payments: proposal.payments || [],
  }));
  const stats = data?.stats || {
    totalPaid: 0,
    totalPending: 0,
    totalProposals: 0,
    activeProposals: 0,
  };

  // Ensure all stats are numbers
  const safeStats = {
    totalPaid: Number(stats.totalPaid) || 0,
    totalPending: Number(stats.totalPending) || 0,
    totalProposals: Number(stats.totalProposals) || 0,
    activeProposals: Number(stats.activeProposals) || 0,
  };

  // Calculate overdue payments (proposals with pending amounts)
  const pagosVencidos = safeProposals.filter(
    (proposal) => proposal.pendingAmount > 0
  );
  const saldoAdeudado = safeStats.totalPending;

  // Get pending payments (proposals with pending amounts)
  const pagosPendientes = safeProposals
    .filter((proposal) => proposal.pendingAmount > 0)
    .map((proposal) => ({
      id: proposal.id,
      concepto: proposal.title,
      paciente: proposal.patientName,
      monto: formatCurrency(proposal.pendingAmount),
      vencimiento: formatDate(proposal.createdAt), // Using creation date as due date for now
      diasVencimiento: Math.floor(
        (Date.now() - new Date(proposal.createdAt || Date.now()).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      proposal,
    }));

  // Get payment history (all completed payments)
  const historialPagos = safeProposals
    .flatMap((proposal) =>
      proposal.payments
        .filter((payment) => payment.status === "COMPLETED")
        .map((payment) => ({
          id: payment.id,
          fecha: formatDate(payment.paymentDate),
          concepto: proposal.title,
          monto: formatCurrency(payment.amount),
          comprobante: payment.referenceNumber || "N/A",
          payment: {
            ...payment,
            amount: Number(payment.amount) || 0,
          },
        }))
    )
    .sort((a, b) => {
      const dateA = new Date(b.payment.paymentDate || Date.now()).getTime();
      const dateB = new Date(a.payment.paymentDate || Date.now()).getTime();
      return dateA - dateB;
    })
    .filter((pago) => pago.payment && pago.payment.id); // Additional safety filter

  // Get last payment info
  const ultimoPago = historialPagos[0];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Pagos y Facturación</h2>

      {/* Alertas de Saldo Adeudado */}
      {saldoAdeudado > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-red-800">
                <strong>Saldo Adeudado: {formatCurrency(saldoAdeudado)}</strong>
                <br />
                Tienes pagos pendientes. Por favor realiza el pago lo antes
                posible para evitar interrupciones en el tratamiento.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pagosVencidos.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-amber-800">
                <strong>Pagos Vencidos:</strong> Tienes {pagosVencidos.length}{" "}
                pago(s) vencido(s). Es importante regularizar tu situación para
                continuar con el tratamiento.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de Cuenta */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estado de Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Saldo Adeudado</p>
              <p
                className={`text-2xl font-bold ${saldoAdeudado > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {formatCurrency(saldoAdeudado)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Último Pago</p>
              <p className="text-lg font-semibold">
                {ultimoPago ? ultimoPago.fecha : "Sin pagos"}
              </p>
              <p className="text-sm text-gray-600">
                {ultimoPago ? ultimoPago.monto : ""}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Propuestas Activas</p>
              <p className="text-lg font-semibold">
                {safeStats.activeProposals}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagos Pendientes */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Pagos Pendientes</h3>
        {pagosPendientes.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No tienes pagos pendientes.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pagosPendientes.map((pago) => (
              <Card key={pago.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className={`p-2 rounded-full ${
                            pago.diasVencimiento < 0
                              ? "bg-red-100"
                              : "bg-yellow-100"
                          }`}
                        >
                          <CreditCard
                            className={`h-5 w-5 ${pago.diasVencimiento < 0 ? "text-red-600" : "text-yellow-600"}`}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">
                            {pago.concepto}
                          </h4>
                          <p className="text-gray-600">{pago.paciente}</p>
                          {pago.diasVencimiento < 0 && (
                            <Badge className="bg-red-100 text-red-800 mt-1">
                              Vencido hace {Math.abs(pago.diasVencimiento)} días
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Monto: {pago.monto}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              Vencimiento: {pago.vencimiento}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        className={`${
                          pago.diasVencimiento < 0
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        onClick={() => handlePagarAhora(pago.proposal)}
                      >
                        PAGAR AHORA
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerDetalles(pago.proposal)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Historial de Pagos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Historial de Pagos</h3>
        {historialPagos.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay historial de pagos disponible.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {historialPagos.map((pago) => (
                  <div
                    key={pago.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          ✅ {pago.fecha} | {pago.concepto}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pago.monto} | Comprobante: {pago.comprobante}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerRecibo(pago.payment)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Recibo
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
