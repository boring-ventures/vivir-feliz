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
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useProposals,
  useUpdateProposalStatus,
  useProposalsDisplayData,
} from "@/hooks/usePatients";
import {
  useProposalServices,
  useScheduleServiceAppointments,
} from "@/hooks/useProposals";
import { useToast } from "@/components/ui/use-toast";
import { ProposalDisplayData, ProposalStatus } from "@/types/patients";
import { useTherapistMonthlyAppointments } from "@/hooks/use-therapist-appointments";

export default function AdminNuevosPacientesPage() {
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalPago, setModalPago] = useState<ProposalDisplayData | null>(null);
  const [modalCitas, setModalCitas] = useState<ProposalDisplayData | null>(
    null
  );
  const [mesActual, setMesActual] = useState(new Date());
  // Replace citasSeleccionadas with a map to track dates per service
  const [citasSeleccionadasPorServicio, setCitasSeleccionadasPorServicio] =
    useState<Record<string, string[]>>({});
  // Add state for current service index
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  const { toast } = useToast();

  // Fetch treatment proposals data
  const {
    data: response,
    isLoading,
    error,
  } = useProposals(undefined, undefined, true);

  // Get raw proposals data for hook usage
  const rawProposals = Array.isArray(response) ? response : [];
  const rawProposalsData = useProposalsDisplayData(rawProposals);

  // Handle the transformed data format from the API
  const pacientes = (() => {
    if (!response) return [];

    try {
      // If response has 'data' property, it's the transformed format
      if ("data" in response && Array.isArray(response.data)) {
        return response.data.map(
          (item: {
            id?: string;
            nombre?: string;
            edad?: number;
            padre?: string;
            telefono?: string;
            terapeuta?: string;
            fechaPropuesta?: string;
            montoPropuesta?: string;
            estadoPropuesta?: string;
            pagoConfirmado?: boolean;
            citasProgramadas?: boolean;
            proposalData?: {
              status?: string;
              consultationRequest?: {
                childName: string;
                childDateOfBirth: string;
                motherName?: string;
                fatherName?: string;
                motherPhone?: string;
                fatherPhone?: string;
              };
            };
          }) => ({
            id: item.id || "",
            patientName:
              item.nombre ||
              item.proposalData?.consultationRequest?.childName ||
              "Paciente",
            patientAge:
              item.edad ||
              (item.proposalData?.consultationRequest?.childDateOfBirth
                ? Math.floor(
                    (Date.now() -
                      new Date(
                        item.proposalData.consultationRequest.childDateOfBirth
                      ).getTime()) /
                      (365.25 * 24 * 60 * 60 * 1000)
                  )
                : 0),
            parentName:
              item.padre ||
              item.proposalData?.consultationRequest?.motherName ||
              item.proposalData?.consultationRequest?.fatherName ||
              "Padre/Madre",
            parentPhone:
              item.telefono ||
              item.proposalData?.consultationRequest?.motherPhone ||
              item.proposalData?.consultationRequest?.fatherPhone ||
              "",
            therapistName: item.terapeuta || "Terapeuta",
            proposalDate: item.fechaPropuesta || "",
            totalAmount: item.montoPropuesta || "Bs. 0",
            status:
              (item.proposalData?.status as ProposalStatus) ||
              "PAYMENT_PENDING",
            statusDisplay: item.estadoPropuesta || "Pago Pendiente",
            statusColor:
              item.estadoPropuesta === "Pago Pendiente"
                ? "bg-red-100 text-red-800"
                : item.estadoPropuesta === "Pago Confirmado"
                  ? "bg-green-100 text-green-800"
                  : item.estadoPropuesta === "Citas Programadas"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800",
            paymentConfirmed: item.pagoConfirmado || false,
            appointmentsScheduled: item.citasProgramadas || false,
            canConfirmPayment: item.proposalData?.status === "PAYMENT_PENDING",
            canScheduleAppointments:
              item.proposalData?.status === "PAYMENT_CONFIRMED" &&
              !item.citasProgramadas,
          })
        ) as ProposalDisplayData[];
      }

      // If response is an array, it's the raw format
      if (Array.isArray(response)) {
        return rawProposalsData;
      }
    } catch (error) {
      console.error("Error processing proposals data:", error);
    }

    return [] as ProposalDisplayData[];
  })();

  // Mutation for updating proposal status
  const updateProposalStatus = useUpdateProposalStatus();

  // Add mutation for scheduling appointments
  const scheduleAppointments = useScheduleServiceAppointments();

  // Add proposal services fetch
  const { data: proposalServices } = useProposalServices(
    modalCitas?.id ?? null
  );

  // Add therapist appointments fetching
  const currentService = proposalServices?.[currentServiceIndex];
  const { data: therapistAppointments = [] } = useTherapistMonthlyAppointments(
    currentService?.therapistId,
    mesActual.getFullYear(),
    mesActual.getMonth() + 1
  );

  // Add helper to check if a slot is busy
  const isSlotBusy = (fecha: Date, hora: string) => {
    if (!therapistAppointments) return false;

    const fechaStr = formatearFecha(fecha);
    return therapistAppointments.some(
      (apt) =>
        apt.date === fechaStr &&
        ((hora >= apt.start_time && hora < apt.end_time) ||
          // Also block the slot if an appointment starts during this hour
          (apt.start_time >= hora && apt.start_time < addHour(hora)))
    );
  };

  // Helper to add an hour to a time string
  const addHour = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    date.setHours(date.getHours() + 1);
    return `${date.getHours().toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const pacientesFiltrados = pacientes.filter(
    (paciente: ProposalDisplayData) => {
      const coincideBusqueda =
        paciente.patientName.toLowerCase().includes(busqueda.toLowerCase()) ||
        paciente.parentName.toLowerCase().includes(busqueda.toLowerCase()) ||
        paciente.therapistName.toLowerCase().includes(busqueda.toLowerCase());

      const coincideEstado =
        filtro === "Todos" || paciente.statusDisplay === filtro;

      return coincideBusqueda && coincideEstado;
    }
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Pago Pendiente":
        return "bg-red-100 text-red-800";
      case "Pago Confirmado":
        return "bg-green-100 text-green-800";
      case "Citas Programadas":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const confirmarPago = async (pacienteId: string) => {
    try {
      await updateProposalStatus.mutateAsync({
        proposalId: pacienteId,
        status: "PAYMENT_CONFIRMED",
        notes: `Pago confirmado el ${new Date().toLocaleDateString("es-ES")}`,
      });

      toast({
        title: "Pago confirmado",
        description:
          "El pago ha sido confirmado exitosamente. Se ha creado el perfil del paciente y el registro de pago automáticamente.",
      });

      setModalPago(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo confirmar el pago. Intenta nuevamente.",
        variant: "destructive",
      });
      console.error("Error confirming payment:", error);
    }
  };

  const programarCitas = async (pacienteId: string) => {
    if (!areAllServicesScheduled()) {
      toast({
        title: "Error",
        description: "Debes programar todas las sesiones antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Add debugging to see what's being sent
    console.log("📤 Sending appointment data:", {
      proposalId: pacienteId,
      serviceAppointments: citasSeleccionadasPorServicio,
    });

    // Log each service's appointments
    Object.entries(citasSeleccionadasPorServicio).forEach(
      ([serviceId, appointments]) => {
        console.log(`Service ${serviceId}:`, appointments);
        appointments.forEach((appointment, index) => {
          const [dateStr, timeStr] = appointment.split("-");
          console.log(
            `  Appointment ${index + 1}: date="${dateStr}", time="${timeStr}"`
          );
        });
      }
    );

    try {
      await scheduleAppointments.mutateAsync({
        proposalId: pacienteId,
        serviceAppointments: citasSeleccionadasPorServicio,
      });

      toast({
        title: "Citas programadas",
        description: "Las citas han sido programadas exitosamente.",
      });

      setModalCitas(null);
      setCitasSeleccionadasPorServicio({}); // Clear all selected dates
      setCurrentServiceIndex(0); // Reset service index
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron programar las citas. Intenta nuevamente.",
        variant: "destructive",
      });
      console.error("Error scheduling appointments:", error);
    }
  };

  // Funciones del calendario
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

  // Add helper to get selected dates for current service
  const getCitasSeleccionadas = () => {
    if (!modalCitas || !proposalServices) return [];
    const currentService = proposalServices[currentServiceIndex];
    return currentService
      ? citasSeleccionadasPorServicio[currentService.id] || []
      : [];
  };

  // Modify toggleCita to work with per-service dates
  const toggleCita = (fecha: Date, hora: string) => {
    if (!modalCitas || !proposalServices) return;

    const currentService = proposalServices[currentServiceIndex];
    if (!currentService) return;

    const fechaHora = `${formatearFecha(fecha)}-${hora}`;

    // Add debugging
    console.log("🔄 Toggle cita:", {
      fecha: fecha.toISOString(),
      hora,
      fechaHora,
      serviceId: currentService.id,
      serviceName: currentService.service,
    });

    setCitasSeleccionadasPorServicio((prev) => {
      const serviceAppointments = prev[currentService.id] || [];
      const newAppointments = serviceAppointments.includes(fechaHora)
        ? serviceAppointments.filter((c) => c !== fechaHora)
        : serviceAppointments.length < currentService.sessions
          ? [...serviceAppointments, fechaHora]
          : serviceAppointments;

      console.log("📝 Updated appointments for service:", {
        serviceId: currentService.id,
        oldAppointments: serviceAppointments,
        newAppointments,
        totalServices: Object.keys({
          ...prev,
          [currentService.id]: newAppointments,
        }).length,
      });

      return {
        ...prev,
        [currentService.id]: newAppointments,
      };
    });
  };

  // Modify esDiaSeleccionado to work with per-service dates
  const esDiaSeleccionado = (fecha: Date) => {
    const fechaStr = formatearFecha(fecha);
    return getCitasSeleccionadas().some((cita) => cita.startsWith(fechaStr));
  };

  // Add helper to check if all services are fully scheduled
  const areAllServicesScheduled = () => {
    if (!proposalServices) return false;
    return proposalServices.every((service) => {
      const serviceAppointments =
        citasSeleccionadasPorServicio[service.id] || [];
      return serviceAppointments.length === service.sessions;
    });
  };

  // Add helper to get total scheduled appointments
  const getTotalScheduledAppointments = () => {
    return Object.values(citasSeleccionadasPorServicio).reduce(
      (total, appointments) => total + appointments.length,
      0
    );
  };

  // Add helper to get total required appointments
  const getTotalRequiredAppointments = () => {
    return (
      proposalServices?.reduce(
        (total, service) => total + service.sessions,
        0
      ) || 0
    );
  };

  // Add helper to check if a date is in the past
  const canSelectDate = (fecha: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return fecha >= today;
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
            <div className="text-2xl font-bold">{pacientes.length}</div>
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
            <div className="text-2xl font-bold">
              {
                pacientes.filter(
                  (p: ProposalDisplayData) =>
                    p.statusDisplay === "Pago Pendiente"
                ).length
              }
            </div>
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
            <div className="text-2xl font-bold">
              {
                pacientes.filter(
                  (p: ProposalDisplayData) =>
                    p.statusDisplay === "Pago Confirmado"
                ).length
              }
            </div>
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
            <div className="text-2xl font-bold">
              {
                pacientes.filter(
                  (p: ProposalDisplayData) =>
                    p.statusDisplay === "Citas Programadas"
                ).length
              }
            </div>
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
                {pacientesFiltrados.map((paciente: ProposalDisplayData) => (
                  <tr key={paciente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {paciente.patientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {paciente.patientAge} años
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paciente.parentName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {paciente.parentPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paciente.therapistName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paciente.proposalDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paciente.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getEstadoColor(paciente.statusDisplay)}>
                        {paciente.statusDisplay}
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
                          onClick={() => setModalPago(paciente)}
                          disabled={paciente.paymentConfirmed}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModalCitas(paciente)}
                          disabled={
                            !paciente.paymentConfirmed ||
                            paciente.appointmentsScheduled
                          }
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
                  disabled={updateProposalStatus.isPending}
                  className="flex-1"
                >
                  {updateProposalStatus.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Confirmando...
                    </>
                  ) : (
                    "Confirmar Pago"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModalPago(null)}
                  disabled={updateProposalStatus.isPending}
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
          <Card className="w-[95vw] max-w-[1400px] h-[90vh] mx-4">
            <CardHeader className="border-b">
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
            <div className="grid grid-cols-[375px_1fr] h-[calc(90vh-80px)]">
              {/* Left side - Service info and controls */}
              <div className="p-5 border-r overflow-y-auto space-y-5">
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

                {/* Services display with current service highlight */}
                {proposalServices && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Servicios a Programar</h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentServiceIndex((prev) =>
                              Math.max(0, prev - 1)
                            )
                          }
                          disabled={currentServiceIndex === 0}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentServiceIndex((prev) =>
                              Math.min(proposalServices.length - 1, prev + 1)
                            )
                          }
                          disabled={
                            currentServiceIndex === proposalServices.length - 1
                          }
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {proposalServices.map((service, index) => {
                        const serviceAppointments =
                          citasSeleccionadasPorServicio[service.id] || [];
                        const isCurrentService = index === currentServiceIndex;
                        return (
                          <div
                            key={service.id}
                            className={`flex justify-between items-center p-2 rounded-md ${
                              isCurrentService ? "bg-blue-100" : ""
                            }`}
                            onClick={() => setCurrentServiceIndex(index)}
                            style={{ cursor: "pointer" }}
                          >
                            <span>{service.service}</span>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  serviceAppointments.length ===
                                  service.sessions
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {serviceAppointments.length}/{service.sessions}{" "}
                                sesiones
                              </Badge>
                              {isCurrentService && (
                                <Badge variant="secondary">Programando</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Progreso de Programación</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Sesiones totales:</p>
                      <p className="font-medium">
                        {getTotalRequiredAppointments()} sesiones
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Citas programadas:</p>
                      <p className="font-medium">
                        {getTotalScheduledAppointments()}/
                        {getTotalRequiredAppointments()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Servicio actual:</p>
                      <p className="font-medium">
                        {proposalServices?.[currentServiceIndex]?.service ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Progreso del servicio:</p>
                      <p className="font-medium">
                        {getCitasSeleccionadas().length}/
                        {proposalServices?.[currentServiceIndex]?.sessions || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-md space-y-2">
                  <p className="text-sm text-green-800">
                    Selecciona las citas para{" "}
                    {proposalServices?.[currentServiceIndex]?.service}.
                    Necesitas{" "}
                    {proposalServices?.[currentServiceIndex]?.sessions || 0}{" "}
                    sesiones y has seleccionado {getCitasSeleccionadas().length}
                    .
                  </p>
                  <div className="flex gap-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-destructive rounded-sm mr-1" />
                      <span>Horario ocupado</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary rounded-sm mr-1" />
                      <span>Seleccionado</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 border rounded-sm mr-1" />
                      <span>Disponible</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => programarCitas(modalCitas.id)}
                    disabled={
                      !areAllServicesScheduled() ||
                      scheduleAppointments.isPending
                    }
                    className="flex-1"
                  >
                    {scheduleAppointments.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Programando...
                      </>
                    ) : (
                      `Programar Todas las Citas (${getTotalScheduledAppointments()}/${getTotalRequiredAppointments()})`
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setModalCitas(null)}
                    disabled={scheduleAppointments.isPending}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>

              {/* Right side - Calendar */}
              <div className="p-6 overflow-y-auto">
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

                      {getDiasDelMes(mesActual).map((diaInfo, index) => {
                        const isSelectable = canSelectDate(diaInfo.fecha);
                        return (
                          <div
                            key={index}
                            className={`min-h-[60px] border-r border-b p-1 ${
                              !diaInfo.esDelMes
                                ? "bg-gray-50 text-gray-400"
                                : ""
                            } ${!isSelectable ? "bg-gray-100" : ""} ${
                              esDiaSeleccionado(diaInfo.fecha)
                                ? "bg-blue-50"
                                : ""
                            }`}
                          >
                            <div className="text-xs font-medium mb-1">
                              {diaInfo.dia}
                            </div>
                            {diaInfo.esDelMes && (
                              <div className="space-y-0.5">
                                {horarios.map((hora) => {
                                  const fechaHora = `${formatearFecha(diaInfo.fecha)}-${hora}`;
                                  const isSelected =
                                    getCitasSeleccionadas().some(
                                      (cita) => cita === fechaHora
                                    );
                                  const isBusy = isSlotBusy(
                                    diaInfo.fecha,
                                    hora
                                  );
                                  return (
                                    <Button
                                      key={hora}
                                      size="sm"
                                      variant={
                                        isBusy
                                          ? "destructive"
                                          : isSelected
                                            ? "default"
                                            : "outline"
                                      }
                                      onClick={() =>
                                        toggleCita(diaInfo.fecha, hora)
                                      }
                                      disabled={
                                        !isSelectable || // Disable if date is in the past
                                        isBusy || // Disable if slot is busy
                                        (getCitasSeleccionadas().length >=
                                          (proposalServices?.[
                                            currentServiceIndex
                                          ]?.sessions || 0) &&
                                          !isSelected)
                                      }
                                      className="w-full text-xs p-0.5 h-5"
                                    >
                                      {hora}
                                      {isBusy && (
                                        <span className="ml-1 text-[10px]">
                                          (Ocupado)
                                        </span>
                                      )}
                                    </Button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
