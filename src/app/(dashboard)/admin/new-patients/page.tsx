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
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useProposals,
  useUpdateProposalStatus,
  useProposalsDisplayData,
} from "@/hooks/usePatients";
import {
  useProposalServices,
  useScheduleServiceAppointments,
} from "@/hooks/useProposals";
import { useCreateUser } from "@/hooks/use-admin-users";
import { useToast } from "@/components/ui/use-toast";
import {
  ProposalDisplayData,
  ProposalStatus,
  TreatmentProposalWithRelations,
} from "@/types/patients";
import { useTherapistMonthlyAppointments } from "@/hooks/use-therapist-appointments";

// Parent creation schema
const createParentSchema = z.object({
  firstName: z.string().min(1, "Nombres son requeridos"),
  lastName: z.string().min(1, "Apellidos son requeridos"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono debe tener al menos 7 dígitos"),
  nationalId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(8, "Contraseña debe tener al menos 8 caracteres"),
});

type ParentFormData = z.infer<typeof createParentSchema>;

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
  // Add state for selected payment plan
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<
    string | undefined
  >(undefined);
  // Add state for selected proposal
  const [selectedProposal, setSelectedProposal] = useState<string | undefined>(
    undefined
  );

  // Parent creation modal states
  const [showParentCreationModal, setShowParentCreationModal] = useState(false);
  const [parentCreationData, setParentCreationData] = useState<{
    patientName: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
  } | null>(null);
  const [showParentForm, setShowParentForm] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{
    email: string;
    password: string;
    parentName: string;
  } | null>(null);

  const { toast } = useToast();

  // Parent creation mutation
  const createParentMutation = useCreateUser();

  // Parent creation form
  const parentForm = useForm<ParentFormData>({
    resolver: zodResolver(createParentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nationalId: "",
      dateOfBirth: "",
      address: "",
      password: "",
    },
    mode: "onChange",
  });

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
            selectedProposal?: string | null;
            proposalData?: {
              status?: string;
              timeAvailability?: Record<
                string,
                { morning: boolean; afternoon: boolean }
              >;
              consultationRequest?: {
                childName: string;
                childDateOfBirth: string;
                motherName?: string;
                fatherName?: string;
                motherPhone?: string;
                fatherPhone?: string;
                motherEmail?: string;
                fatherEmail?: string;
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
            parentEmail:
              item.proposalData?.consultationRequest?.motherEmail ||
              item.proposalData?.consultationRequest?.fatherEmail ||
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
            timeAvailability: item.proposalData?.timeAvailability,
            selectedProposal: item.selectedProposal || undefined,
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

  // Add proposal services fetch - filter by selected proposal type
  const { data: allProposalServices } = useProposalServices(
    modalCitas?.id ?? null
  );

  // Get the selected proposal from the database
  const getSelectedProposalFromDatabase = () => {
    if (!response || !modalCitas?.id) return null;

    // If response has 'data' property, it's the transformed format
    if ("data" in response && Array.isArray(response.data)) {
      const proposal = response.data.find(
        (p: TreatmentProposalWithRelations) => p.id === modalCitas.id
      );

      return proposal?.selectedProposal || null;
    }

    // If response is an array, it's the raw format
    if (Array.isArray(response)) {
      const proposal = response.find(
        (p: TreatmentProposalWithRelations) => p.id === modalCitas.id
      );

      return proposal?.selectedProposal || null;
    }

    return null;
  };

  const databaseSelectedProposal = getSelectedProposalFromDatabase();

  // Filter services based on selected proposal type from database
  const proposalServices =
    allProposalServices?.filter(
      (service) => service.proposalType === databaseSelectedProposal
    ) || [];

  if (response && "data" in response) {
    console.log("🔍 First proposal in data:", response.data[0]);
  }

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
        selectedProposal: selectedProposal,
        selectedPaymentPlan: selectedPaymentPlan,
      });

      toast({
        title: "Pago confirmado",
        description:
          "El pago ha sido confirmado exitosamente. Se ha creado el perfil del paciente y el registro de pago automáticamente.",
      });

      // Show parent creation modal
      if (modalPago) {
        setParentCreationData({
          patientName: modalPago.patientName,
          parentName: modalPago.parentName,
          parentPhone: modalPago.parentPhone,
          parentEmail: modalPago.parentEmail,
        });
        setShowParentCreationModal(true);
      }

      setModalPago(null);
      setSelectedPaymentPlan(undefined);
      // Keep selectedProposal for appointment scheduling
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

  // Helper function to generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parentForm.setValue("password", password);
  };

  // Helper function to parse parent name into first and last name
  const parseParentName = (fullName: string) => {
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    return { firstName, lastName };
  };

  // Handle parent creation form submission
  const handleParentFormSubmit = async (data: ParentFormData) => {
    try {
      await createParentMutation.mutateAsync({
        ...data,
        role: "PARENT",
      });

      // Show credentials modal with the created user info
      setCreatedUserCredentials({
        email: data.email,
        password: data.password,
        parentName: `${data.firstName} ${data.lastName}`.trim(),
      });

      setShowParentForm(false);
      setShowParentCreationModal(false);
      setParentCreationData(null);
      parentForm.reset();
      setShowCredentialsModal(true);
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error("Error creating parent user:", error);
    }
  };

  // Handle configure parent now
  const handleConfigureParentNow = () => {
    if (!parentCreationData) return;

    const { firstName, lastName } = parseParentName(
      parentCreationData.parentName
    );

    // Pre-fill the form with available data
    parentForm.setValue("firstName", firstName);
    parentForm.setValue("lastName", lastName);
    parentForm.setValue("phone", parentCreationData.parentPhone);
    parentForm.setValue("email", parentCreationData.parentEmail || ""); // Pre-fill if available
    parentForm.setValue("nationalId", ""); // Leave empty
    parentForm.setValue("dateOfBirth", ""); // Leave empty
    parentForm.setValue("address", ""); // Leave empty
    parentForm.setValue("password", ""); // Will be generated

    setShowParentForm(true);
  };

  // Handle configure later
  const handleConfigureLater = () => {
    setShowParentCreationModal(false);
    setParentCreationData(null);
    setShowParentForm(false);
    parentForm.reset();
  };

  // Handle close credentials modal
  const handleCloseCredentialsModal = () => {
    setShowCredentialsModal(false);
    setCreatedUserCredentials(null);
  };

  // Helper function to get payment plans from raw proposal data
  const getPaymentPlans = (proposalId: string) => {
    // First try to find in rawProposals (direct array format)
    let rawProposal = rawProposals.find((p) => p.id === proposalId);

    // If not found in rawProposals, try to find in the transformed data format
    if (
      !rawProposal &&
      response &&
      "data" in response &&
      Array.isArray(response.data)
    ) {
      rawProposal = response.data.find(
        (p: TreatmentProposalWithRelations) => p.id === proposalId
      );
    }

    if (!rawProposal?.paymentPlan) {
      console.log("❌ No payment plan found for proposal:", proposalId);
      return null;
    }

    try {
      const paymentPlan =
        typeof rawProposal.paymentPlan === "string"
          ? JSON.parse(rawProposal.paymentPlan)
          : rawProposal.paymentPlan;

      console.log("✅ Parsed payment plan:", paymentPlan);
      return paymentPlan;
    } catch (error) {
      console.error("Error parsing payment plan:", error);
      return null;
    }
  };

  // Helper function to format payment amount
  const formatPaymentAmount = (amount: number) => {
    return `Bs. ${amount.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
                          title="Programar citas"
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
          <Card className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Confirmar Pago</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModalPago(null);
                    setSelectedPaymentPlan(undefined);
                    setSelectedProposal(undefined);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Paciente:</p>
                  <p className="font-medium">{modalPago.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Monto de la propuesta:
                  </p>
                  <p className="font-medium text-lg">{modalPago.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Padre/Madre:</p>
                  <p className="font-medium">{modalPago.parentName}</p>
                </div>
              </div>

              {/* Payment Plans Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Planes de Pago Disponibles
                </h3>
                <p className="text-sm text-gray-600">
                  Selecciona el plan de pago que el padre/madre ha elegido:
                </p>

                {(() => {
                  const paymentPlans = getPaymentPlans(modalPago.id);
                  if (!paymentPlans) {
                    return (
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <p className="text-sm text-yellow-800">
                          No hay planes de pago disponibles para esta propuesta.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Proposal A Payment Plans */}
                      <div className="border rounded-lg p-4 bg-blue-50">
                        <h4 className="font-semibold text-blue-900 mb-3">
                          Propuesta A
                        </h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setSelectedProposal("A");
                              setSelectedPaymentPlan("single");
                            }}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${
                              selectedProposal === "A" &&
                              selectedPaymentPlan === "single"
                                ? "bg-blue-100 border-blue-300"
                                : "bg-white border-gray-200 hover:bg-blue-50"
                            }`}
                          >
                            <div className="font-medium">Pago Único</div>
                            <div className="text-lg font-bold text-blue-900">
                              {formatPaymentAmount(paymentPlans.A?.single || 0)}
                            </div>
                            <div className="text-xs text-gray-600">
                              5% de descuento
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProposal("A");
                              setSelectedPaymentPlan("monthly");
                            }}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${
                              selectedProposal === "A" &&
                              selectedPaymentPlan === "monthly"
                                ? "bg-blue-100 border-blue-300"
                                : "bg-white border-gray-200 hover:bg-blue-50"
                            }`}
                          >
                            <div className="font-medium">Pago Mensual</div>
                            <div className="text-lg font-bold text-blue-900">
                              {formatPaymentAmount(
                                paymentPlans.A?.monthly || 0
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              6 cuotas mensuales
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Proposal B Payment Plans */}
                      <div className="border rounded-lg p-4 bg-green-50">
                        <h4 className="font-semibold text-green-900 mb-3">
                          Propuesta B
                        </h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setSelectedProposal("B");
                              setSelectedPaymentPlan("single");
                            }}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${
                              selectedProposal === "B" &&
                              selectedPaymentPlan === "single"
                                ? "bg-green-100 border-green-300"
                                : "bg-white border-gray-200 hover:bg-green-50"
                            }`}
                          >
                            <div className="font-medium">Pago Único</div>
                            <div className="text-lg font-bold text-green-900">
                              {formatPaymentAmount(paymentPlans.B?.single || 0)}
                            </div>
                            <div className="text-xs text-gray-600">
                              5% de descuento
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProposal("B");
                              setSelectedPaymentPlan("monthly");
                            }}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${
                              selectedProposal === "B" &&
                              selectedPaymentPlan === "monthly"
                                ? "bg-green-100 border-green-300"
                                : "bg-white border-gray-200 hover:bg-green-50"
                            }`}
                          >
                            <div className="font-medium">Pago Mensual</div>
                            <div className="text-lg font-bold text-green-900">
                              {formatPaymentAmount(
                                paymentPlans.B?.monthly || 0
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              6 cuotas mensuales
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-sm text-yellow-800">
                  ¿Confirmas que el padre/madre ha realizado el pago completo
                  del plan seleccionado?
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => confirmarPago(modalPago.id)}
                  disabled={
                    updateProposalStatus.isPending ||
                    !selectedProposal ||
                    !selectedPaymentPlan
                  }
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
                  onClick={() => {
                    setModalPago(null);
                    setSelectedPaymentPlan(undefined);
                    setSelectedProposal(undefined);
                  }}
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
                  onClick={() => {
                    setModalCitas(null);
                    setCitasSeleccionadasPorServicio({});
                    setCurrentServiceIndex(0);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <div className="grid grid-cols-[450px_1fr] h-[calc(90vh-80px)]">
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

                {/* Selected Proposal Display */}
                {databaseSelectedProposal ? (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium mb-3">Propuesta Confirmada</h4>
                    <div className="p-3 bg-white rounded-md border">
                      <div className="font-medium text-blue-900">
                        Propuesta {databaseSelectedProposal}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {allProposalServices?.filter(
                          (s) => s.proposalType === databaseSelectedProposal
                        ).length || 0}{" "}
                        servicios configurados
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Esta propuesta fue seleccionada durante la confirmación
                      del pago.
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>No hay propuesta seleccionada</strong>
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Primero debe confirmar el pago y seleccionar una
                      propuesta.
                    </p>
                  </div>
                )}

                {/* Time Availability Section */}
                {modalCitas.timeAvailability && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium mb-2 text-sm">
                      Disponibilidad del Paciente
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(() => {
                        // Handle both array format (new) and object format (old)
                        let timeAvailabilityData = modalCitas.timeAvailability;

                        // If it's an array, convert to object format for display
                        if (Array.isArray(timeAvailabilityData)) {
                          const objectFormat: Record<
                            string,
                            { morning: boolean; afternoon: boolean }
                          > = {};
                          timeAvailabilityData.forEach(
                            ({ day, morning, afternoon }) => {
                              objectFormat[day] = { morning, afternoon };
                            }
                          );
                          timeAvailabilityData = objectFormat;
                        }

                        // Define the correct order for days
                        const dayOrder = [
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                        ];

                        return dayOrder.map((day) => {
                          const availability = timeAvailabilityData[day];
                          if (!availability) return null;

                          const dayLabels = {
                            monday: "Lunes",
                            tuesday: "Martes",
                            wednesday: "Miércoles",
                            thursday: "Jueves",
                            friday: "Viernes",
                          };

                          return (
                            <div
                              key={day}
                              className="flex justify-between items-center"
                            >
                              <span className="capitalize font-medium">
                                {dayLabels[day as keyof typeof dayLabels]}
                              </span>
                              <div className="flex gap-1">
                                <Badge
                                  variant={
                                    availability.morning
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs px-1 py-0.5"
                                >
                                  Mañana
                                </Badge>
                                <Badge
                                  variant={
                                    availability.afternoon
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs px-1 py-0.5"
                                >
                                  Tarde
                                </Badge>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Services display with current service highlight */}
                {databaseSelectedProposal ? (
                  proposalServices.length > 0 ? (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">
                          Servicios a Programar - Propuesta{" "}
                          {databaseSelectedProposal}
                        </h4>
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
                              currentServiceIndex ===
                              proposalServices.length - 1
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
                          const isCurrentService =
                            index === currentServiceIndex;
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
                                  {serviceAppointments.length}/
                                  {service.sessions} sesiones
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
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <p className="text-sm text-yellow-800">
                        No se encontraron servicios para la Propuesta{" "}
                        {databaseSelectedProposal}.
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Verifica que la propuesta tenga servicios configurados.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">
                      No hay propuesta seleccionada. Primero confirma el pago.
                    </p>
                  </div>
                )}

                {databaseSelectedProposal && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">
                      Progreso de Programación - Propuesta{" "}
                      {databaseSelectedProposal}
                    </h4>
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
                          {proposalServices?.[currentServiceIndex]?.sessions ||
                            0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-green-50 p-3 rounded-md space-y-2">
                  <p className="text-sm text-green-800">
                    Selecciona las citas para{" "}
                    {proposalServices?.[currentServiceIndex]?.service}{" "}
                    (Propuesta {databaseSelectedProposal}). Necesitas{" "}
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
                      scheduleAppointments.isPending ||
                      !databaseSelectedProposal
                    }
                    className="flex-1"
                  >
                    {scheduleAppointments.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Programando...
                      </>
                    ) : (
                      `Programar Citas - Propuesta ${databaseSelectedProposal} (${getTotalScheduledAppointments()}/${getTotalRequiredAppointments()})`
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setModalCitas(null);
                      setCitasSeleccionadasPorServicio({});
                      setCurrentServiceIndex(0);
                    }}
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

      {/* Parent Creation Modal */}
      {showParentCreationModal && parentCreationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Configurar Usuario Padre</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleConfigureLater}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  Se ha creado automáticamente un perfil para el padre/madre de{" "}
                  <strong>{parentCreationData.patientName}</strong>.
                </p>
                <p className="text-sm text-blue-800">
                  ¿Deseas configurar la cuenta del padre/madre ahora o hacerlo
                  más tarde?
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Paciente:</p>
                  <p className="font-medium">
                    {parentCreationData.patientName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Padre/Madre:</p>
                  <p className="font-medium">{parentCreationData.parentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono:</p>
                  <p className="font-medium">
                    {parentCreationData.parentPhone}
                  </p>
                </div>
                {parentCreationData.parentEmail && (
                  <div>
                    <p className="text-sm text-gray-600">Email:</p>
                    <p className="font-medium">
                      {parentCreationData.parentEmail}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleConfigureParentNow} className="flex-1">
                  Configurar Ahora
                </Button>
                <Button
                  variant="outline"
                  onClick={handleConfigureLater}
                  className="flex-1"
                >
                  Más Tarde
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Parent Creation Form Modal */}
      {showParentForm && parentCreationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Crear Usuario Padre</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleConfigureLater}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={parentForm.handleSubmit(handleParentFormSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Información Personal */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold mb-3">
                      Información Personal
                    </h3>
                  </div>
                  <div>
                    <Label htmlFor="firstName">Nombres *</Label>
                    <Input
                      {...parentForm.register("firstName")}
                      className={
                        parentForm.formState.errors.firstName
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {parentForm.formState.errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {parentForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellidos *</Label>
                    <Input
                      {...parentForm.register("lastName")}
                      className={
                        parentForm.formState.errors.lastName
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {parentForm.formState.errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">
                        {parentForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      type="email"
                      {...parentForm.register("email")}
                      placeholder="usuario@vivirfeliz.bo"
                      className={
                        parentForm.formState.errors.email
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {parentForm.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">
                        {parentForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      {...parentForm.register("phone")}
                      placeholder="+591-7-123-4567"
                      className={
                        parentForm.formState.errors.phone
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {parentForm.formState.errors.phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {parentForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="nationalId">Cédula de Identidad</Label>
                    <Input
                      {...parentForm.register("nationalId")}
                      placeholder="Dejar vacío para completar después"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                    <Input
                      type="date"
                      {...parentForm.register("dateOfBirth")}
                      placeholder="Dejar vacío para completar después"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      {...parentForm.register("address")}
                      placeholder="Dejar vacío para completar después"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="password"
                        {...parentForm.register("password")}
                        className={
                          parentForm.formState.errors.password
                            ? "border-red-500"
                            : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePassword}
                      >
                        Generar
                      </Button>
                    </div>
                    {parentForm.formState.errors.password && (
                      <p className="text-sm text-red-500 mt-1">
                        {parentForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Los campos marcados con * son obligatorios. Los demás campos
                    pueden ser completados por el padre/madre más tarde.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={createParentMutation.isPending}
                    className="flex-1"
                  >
                    {createParentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creando...
                      </>
                    ) : (
                      "Crear Usuario Padre"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConfigureLater}
                    disabled={createParentMutation.isPending}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Credentials Modal */}
      {showCredentialsModal && createdUserCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Usuario Padre Creado</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseCredentialsModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-green-800">
                  El usuario padre ha sido creado exitosamente. Guarda estas
                  credenciales de forma segura.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre:</p>
                  <p className="font-medium">
                    {createdUserCredentials.parentName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-medium">{createdUserCredentials.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contraseña:</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium font-mono bg-gray-100 px-2 py-1 rounded">
                      {createdUserCredentials.password}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          createdUserCredentials.password
                        );
                        toast({
                          title: "Contraseña copiada",
                          description:
                            "La contraseña ha sido copiada al portapapeles.",
                        });
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Estas credenciales solo se
                  mostrarán una vez. Asegúrate de guardarlas de forma segura o
                  compartirlas con el padre/madre.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    const credentialsText = `Usuario Padre Creado\n\nNombre: ${createdUserCredentials.parentName}\nEmail: ${createdUserCredentials.email}\nContraseña: ${createdUserCredentials.password}\n\nGuarda estas credenciales de forma segura.`;
                    navigator.clipboard.writeText(credentialsText);
                    toast({
                      title: "Credenciales copiadas",
                      description:
                        "Todas las credenciales han sido copiadas al portapapeles.",
                    });
                  }}
                  className="flex-1"
                >
                  Copiar Todo
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseCredentialsModal}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
