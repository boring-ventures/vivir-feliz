"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  UserPlus,
  Users,
  Check,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useProposals,
  useConfirmPayment,
  useScheduleAppointments,
  useProposalsDisplayData,
} from "@/hooks/usePatients";
import { ProposalDisplayData } from "@/types/patients";

export default function PatientsPage() {
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalPago, setModalPago] = useState<ProposalDisplayData | null>(null);
  const [modalCitas, setModalCitas] = useState<ProposalDisplayData | null>(
    null
  );
  const [mesActual, setMesActual] = useState(new Date(2025, 0)); // Enero 2025
  const [citasSeleccionadas, setCitasSeleccionadas] = useState<string[]>([]);

  // Fetch proposals data
  const { data: response, isLoading, error } = useProposals();
  const confirmPaymentMutation = useConfirmPayment();
  const scheduleAppointmentsMutation = useScheduleAppointments();

  // Extract proposals data from response
  const proposals =
    response && "data" in response ? response.data : response || [];

  // Convert proposals to display format
  const proposalsDisplayData = useProposalsDisplayData(proposals);

  // Filter proposals
  const proposalsFiltradas = proposalsDisplayData.filter((proposal) => {
    const coincideBusqueda =
      proposal.patientName.toLowerCase().includes(busqueda.toLowerCase()) ||
      proposal.parentName.toLowerCase().includes(busqueda.toLowerCase()) ||
      proposal.therapistName.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado =
      filtro === "Todos" || proposal.statusDisplay === filtro;

    return coincideBusqueda && coincideEstado;
  });

  const confirmarPago = async (proposalId: string) => {
    if (!modalPago) return;

    try {
      await confirmPaymentMutation.mutateAsync({
        proposalId,
        amount: parseFloat(
          modalPago.totalAmount.replace("Bs. ", "").replace(",", "")
        ),
        paymentMethod: "TRANSFER", // Default method
        notes: "Pago confirmado desde panel administrativo",
      });
      setModalPago(null);
    } catch (error) {
      console.error("Error confirming payment:", error);
      // TODO: Show error toast
    }
  };

  const programarCitas = async (proposalId: string) => {
    if (!modalCitas || citasSeleccionadas.length !== 24) return;

    try {
      const appointments = citasSeleccionadas.map((cita) => {
        const [dateStr, time] = cita.split("-");
        const date = new Date(dateStr);
        const endTime = `${(parseInt(time.split(":")[0]) + 1).toString().padStart(2, "0")}:${time.split(":")[1]}`;

        return {
          date,
          startTime: time,
          endTime,
          type: "TERAPIA" as const,
        };
      });

      await scheduleAppointmentsMutation.mutateAsync({
        proposalId,
        appointments,
      });

      setModalCitas(null);
      setCitasSeleccionadas([]);
    } catch (error) {
      console.error("Error scheduling appointments:", error);
      // TODO: Show error toast
    }
  };

  // Calendar functions
  const getDiasDelMes = (fecha: Date) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];

    // Días del mes anterior para completar la primera semana
    for (let i = primerDiaSemana; i > 0; i--) {
      const diaAnterior = new Date(año, mes, 1 - i);
      dias.push({
        fecha: diaAnterior,
        esDelMes: false,
        dia: diaAnterior.getDate(),
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(año, mes, dia);
      dias.push({
        fecha: fechaDia,
        esDelMes: true,
        dia: dia,
      });
    }

    // Días del mes siguiente para completar la última semana
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 días
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fechaSiguiente = new Date(año, mes + 1, dia);
      dias.push({
        fecha: fechaSiguiente,
        esDelMes: false,
        dia: dia,
      });
    }

    return dias;
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toISOString().split("T")[0];
  };

  const toggleCita = (fecha: Date, hora: string) => {
    const fechaHora = `${formatearFecha(fecha)}-${hora}`;
    setCitasSeleccionadas((prev) => {
      if (prev.includes(fechaHora)) {
        return prev.filter((c) => c !== fechaHora);
      } else if (prev.length < 24) {
        // Máximo 24 citas
        return [...prev, fechaHora];
      }
      return prev;
    });
  };

  const esDiaSeleccionado = (fecha: Date) => {
    const fechaStr = formatearFecha(fecha);
    return citasSeleccionadas.some((cita) => cita.startsWith(fechaStr));
  };

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const horarios = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  // Calculate statistics
  const totalProposals = proposalsDisplayData.length;
  const paymentsPending = proposalsDisplayData.filter(
    (p) => p.status === "PAYMENT_PENDING"
  ).length;
  const paymentsConfirmed = proposalsDisplayData.filter(
    (p) => p.paymentConfirmed
  ).length;
  const appointmentsScheduled = proposalsDisplayData.filter(
    (p) => p.appointmentsScheduled
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando pacientes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error al cargar pacientes
          </h2>
          <p className="text-gray-600">
            Por favor, intenta recargar la página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Nuevos Pacientes</h1>
          <p className="text-gray-600">
            Gestiona las propuestas de tratamiento y programación de citas
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Propuestas Enviadas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProposals}</div>
            <p className="text-xs text-muted-foreground">Total de propuestas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pagos Pendientes
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentsPending}</div>
            <p className="text-xs text-muted-foreground">
              Esperando confirmación
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pagos Confirmados
            </CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentsConfirmed}</div>
            <p className="text-xs text-muted-foreground">Listos para citas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Citas Programadas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsScheduled}</div>
            <p className="text-xs text-muted-foreground">
              Tratamientos activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar paciente, padre o terapeuta..."
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Filtrar:</span>
              <div className="flex space-x-1">
                {[
                  "Todos",
                  "Pago Pendiente",
                  "Pago Confirmado",
                  "Citas Programadas",
                ].map((estado) => (
                  <Button
                    key={estado}
                    variant={filtro === estado ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltro(estado)}
                  >
                    {estado}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Padre/Madre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terapeuta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Propuesta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado Pago
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proposalsFiltradas.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {proposal.patientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {proposal.patientAge} años
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {proposal.parentName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {proposal.parentPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {proposal.therapistName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposal.proposalDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposal.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={proposal.statusColor}>
                        {proposal.statusDisplay}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModalPago(proposal)}
                          disabled={!proposal.canConfirmPayment}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModalCitas(proposal)}
                          disabled={!proposal.canScheduleAppointments}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment confirmation modal */}
      {modalPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Confirmar Pago</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalPago(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Paciente:</p>
                <p className="font-medium">{modalPago.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto de la propuesta:</p>
                <p className="font-medium text-lg">{modalPago.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Padre/Madre:</p>
                <p className="font-medium">{modalPago.parentName}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-sm text-yellow-800">
                  ¿Confirmas que el padre/madre ha realizado el pago completo de
                  la propuesta?
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => confirmarPago(modalPago.id)}
                  disabled={confirmPaymentMutation.isPending}
                  className="flex-1"
                >
                  {confirmPaymentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Confirmar Pago
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModalPago(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appointment scheduling modal with calendar */}
      {modalCitas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Programar Citas - {modalCitas.patientName}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalCitas(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Paciente:</p>
                  <p className="font-medium">{modalCitas.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terapeuta:</p>
                  <p className="font-medium">{modalCitas.therapistName}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Plan de Tratamiento</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Sesiones totales:</p>
                    <p className="font-medium">24 sesiones</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Frecuencia:</p>
                    <p className="font-medium">2 veces por semana</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Citas seleccionadas:</p>
                    <p className="font-medium">
                      {citasSeleccionadas.length}/24
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tipo de terapia:</p>
                    <p className="font-medium">Psicología Infantil</p>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMesActual(
                          new Date(
                            mesActual.getFullYear(),
                            mesActual.getMonth() - 1
                          )
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">
                      {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMesActual(
                          new Date(
                            mesActual.getFullYear(),
                            mesActual.getMonth() + 1
                          )
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-7 gap-0">
                    {diasSemana.map((dia) => (
                      <div
                        key={dia}
                        className="p-2 text-center text-sm font-medium text-gray-500 border-b"
                      >
                        {dia}
                      </div>
                    ))}

                    {getDiasDelMes(mesActual).map((diaInfo, index) => (
                      <div
                        key={index}
                        className={`min-h-[80px] border-r border-b p-1 ${
                          !diaInfo.esDelMes ? "bg-gray-50 text-gray-400" : ""
                        } ${esDiaSeleccionado(diaInfo.fecha) ? "bg-blue-50" : ""}`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {diaInfo.dia}
                        </div>
                        {diaInfo.esDelMes && (
                          <div className="space-y-1">
                            {horarios.map((hora) => {
                              const fechaHora = `${formatearFecha(diaInfo.fecha)}-${hora}`;
                              const isSelected =
                                citasSeleccionadas.includes(fechaHora);
                              return (
                                <Button
                                  key={hora}
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={() =>
                                    toggleCita(diaInfo.fecha, hora)
                                  }
                                  disabled={
                                    citasSeleccionadas.length >= 24 &&
                                    !isSelected
                                  }
                                  className="w-full text-xs p-1 h-6"
                                >
                                  {hora}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-800">
                  Haz clic en los horarios disponibles para seleccionar las 24
                  citas necesarias. Actualmente tienes{" "}
                  {citasSeleccionadas.length} citas seleccionadas.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => programarCitas(modalCitas.id)}
                  disabled={
                    citasSeleccionadas.length !== 24 ||
                    scheduleAppointmentsMutation.isPending
                  }
                  className="flex-1"
                >
                  {scheduleAppointmentsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Programar Todas las Citas ({citasSeleccionadas.length}/24)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModalCitas(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
