"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Users,
  Clock,
  Calendar,
  X,
  Loader2,
  User,
  Phone,
  FileText,
  Target,
  DollarSign,
  CheckCircle,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAllPatients } from "@/hooks/usePatients";
import { PatientWithRelations } from "@/types/patients";

interface PatientDisplayData {
  id: string;
  nombre: string;
  edad: number;
  genero: string;
  diagnostico: string;
  fechaIngreso: string;
  fechaUltimaCita: string;
  padre: string;
  telefono: string;
  email: string;
  terapeuta: string;
  tipoTerapia: string;
  sesionesCompletadas: number;
  sesionesTotales: number;
  estadoTratamiento: string;
  estadoPago: string;
  montoTotal: string;
  montoPagado: string;
  proximaCita: string;
  rawData: PatientWithRelations;
}

export default function PatientsPage() {
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalInfo, setModalInfo] = useState<PatientDisplayData | null>(null);

  // Fetch all patients data
  const { data: patients, isLoading, error } = useAllPatients();

  // Transform patients data for display
  const transformPatientData = (
    patient: PatientWithRelations
  ): PatientDisplayData => {
    const latestProposal = patient.treatmentProposals[0];
    const latestAppointment = patient.appointments[0];
    const completedAppointments = patient.appointments.filter(
      (apt) => apt.status === "COMPLETED"
    );
    const totalPayments =
      latestProposal?.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      ) || 0;

    const getEstadoTratamiento = () => {
      if (!latestProposal) return "Sin propuesta";
      if (latestProposal.status === "NEW_PROPOSAL") return "Nueva propuesta";
      if (latestProposal.status === "PAYMENT_PENDING") return "Pago pendiente";
      if (latestProposal.status === "PAYMENT_CONFIRMED")
        return "Pago confirmado";
      if (latestProposal.status === "APPOINTMENTS_SCHEDULED")
        return "Citas programadas";
      if (latestProposal.status === "TREATMENT_ACTIVE") return "Activo";
      if (latestProposal.status === "TREATMENT_COMPLETED") return "Completado";
      if (latestProposal.status === "CANCELLED") return "Cancelado";
      return "Desconocido";
    };

    const getEstadoPago = () => {
      if (!latestProposal) return "Sin propuesta";

      // Calculate total amount from JSON structure
      let totalAmount = 0;
      if (latestProposal.totalAmount) {
        if (
          typeof latestProposal.totalAmount === "object" &&
          latestProposal.totalAmount !== null
        ) {
          const totalAmountObj = latestProposal.totalAmount as {
            A?: number;
            B?: number;
          };
          if (latestProposal.selectedProposal === "A") {
            totalAmount = totalAmountObj.A || 0;
          } else if (latestProposal.selectedProposal === "B") {
            totalAmount = totalAmountObj.B || 0;
          } else {
            // If no proposal selected, use the higher value
            totalAmount = Math.max(
              totalAmountObj.A || 0,
              totalAmountObj.B || 0
            );
          }
        } else {
          totalAmount = Number(latestProposal.totalAmount) || 0;
        }
      }

      if (totalPayments >= totalAmount) return "Pagado";
      if (totalPayments > 0) return "Pago parcial";
      return "Pendiente";
    };

    const getProximaCita = () => {
      const upcomingAppointment = patient.appointments
        .filter(
          (apt) => apt.status === "SCHEDULED" && new Date(apt.date) > new Date()
        )
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0];

      return upcomingAppointment
        ? new Date(upcomingAppointment.date).toLocaleDateString("es-ES")
        : "Sin programar";
    };

    return {
      id: patient.id,
      nombre: `${patient.firstName} ${patient.lastName}`,
      edad: calculateAge(patient.dateOfBirth),
      genero: patient.gender || "No especificado",
      diagnostico: latestProposal?.description || "Sin diagnóstico",
      fechaIngreso: new Date(patient.createdAt).toLocaleDateString("es-ES"),
      fechaUltimaCita: latestAppointment
        ? new Date(latestAppointment.date).toLocaleDateString("es-ES")
        : "Sin citas",
      padre:
        `${patient.parent.firstName || ""} ${patient.parent.lastName || ""}`.trim() ||
        "No especificado",
      telefono: patient.parent.phone || "No especificado",
      email: patient.email || "No especificado",
      terapeuta: latestProposal?.therapist
        ? `${latestProposal.therapist.firstName || ""} ${latestProposal.therapist.lastName || ""}`.trim()
        : "Sin asignar",
      tipoTerapia: latestProposal?.title || "Sin especificar",
      sesionesCompletadas: completedAppointments.length,
      sesionesTotales: (() => {
        if (!latestProposal?.totalSessions) return 0;

        // Handle JSON structure for dual proposals
        if (
          typeof latestProposal.totalSessions === "object" &&
          latestProposal.totalSessions !== null
        ) {
          const totalSessionsObj = latestProposal.totalSessions as {
            A?: number;
            B?: number;
          };
          // Use the selected proposal or the higher value if none selected
          if (latestProposal.selectedProposal === "A") {
            return totalSessionsObj.A || 0;
          } else if (latestProposal.selectedProposal === "B") {
            return totalSessionsObj.B || 0;
          } else {
            // If no proposal selected, use the higher value
            return Math.max(totalSessionsObj.A || 0, totalSessionsObj.B || 0);
          }
        }

        // Handle legacy number format
        return Number(latestProposal.totalSessions) || 0;
      })(),
      estadoTratamiento: getEstadoTratamiento(),
      estadoPago: getEstadoPago(),
      montoTotal: (() => {
        if (!latestProposal?.totalAmount) return "Bs. 0";

        // Handle JSON structure for dual proposals
        if (
          typeof latestProposal.totalAmount === "object" &&
          latestProposal.totalAmount !== null
        ) {
          const totalAmountObj = latestProposal.totalAmount as {
            A?: number;
            B?: number;
          };

          if (latestProposal.selectedProposal === "A") {
            return `Bs. ${(totalAmountObj.A || 0).toLocaleString()}`;
          } else if (latestProposal.selectedProposal === "B") {
            return `Bs. ${(totalAmountObj.B || 0).toLocaleString()}`;
          } else {
            // If no proposal selected, show both amounts
            const amountA = totalAmountObj.A || 0;
            const amountB = totalAmountObj.B || 0;

            if (amountA > 0 && amountB > 0) {
              return `A: Bs. ${amountA.toLocaleString()} | B: Bs. ${amountB.toLocaleString()}`;
            } else if (amountA > 0) {
              return `Bs. ${amountA.toLocaleString()}`;
            } else if (amountB > 0) {
              return `Bs. ${amountB.toLocaleString()}`;
            } else {
              return "Bs. 0";
            }
          }
        }

        // Handle legacy number format
        const amount = Number(latestProposal.totalAmount) || 0;
        return `Bs. ${amount.toLocaleString()}`;
      })(),
      montoPagado: `Bs. ${totalPayments.toLocaleString()}`,
      proximaCita: getProximaCita(),
      rawData: patient,
    };
  };

  const calculateAge = (dateOfBirth: Date): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const calcularProgreso = (completadas: number, totales: number): number => {
    if (totales === 0) return 0;
    return Math.round((completadas / totales) * 100);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "completado":
        return "bg-blue-100 text-blue-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      case "sin propuesta":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPagoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pagado":
        return "bg-green-100 text-green-800";
      case "pago parcial":
        return "bg-yellow-100 text-yellow-800";
      case "pendiente":
        return "bg-red-100 text-red-800";
      case "sin propuesta":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Transform and filter patients
  const pacientesFiltrados =
    patients?.map(transformPatientData).filter((paciente) => {
      const coincideBusqueda =
        paciente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        paciente.padre.toLowerCase().includes(busqueda.toLowerCase()) ||
        paciente.terapeuta.toLowerCase().includes(busqueda.toLowerCase()) ||
        paciente.diagnostico.toLowerCase().includes(busqueda.toLowerCase());

      const coincideEstado =
        filtro === "Todos" || paciente.estadoTratamiento === filtro;

      return coincideBusqueda && coincideEstado;
    }) || [];

  // Calculate statistics
  const totalPacientes = pacientesFiltrados.length;
  const pacientesActivos = pacientesFiltrados.filter(
    (p) => p.estadoTratamiento === "Activo"
  ).length;
  const pagosPendientes = pacientesFiltrados.filter(
    (p) => p.estadoPago === "Pendiente" || p.estadoPago === "Pago parcial"
  ).length;
  const pagosCompletados = pacientesFiltrados.filter(
    (p) => p.estadoPago === "Pagado"
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
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-gray-600">
            Gestiona toda la información de los pacientes del sistema
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pacientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPacientes}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tratamientos Activos
            </CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pacientesActivos}</div>
            <p className="text-xs text-muted-foreground">
              En tratamiento actual
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pagos Pendientes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagosPendientes}</div>
            <p className="text-xs text-muted-foreground">
              Esperando confirmación
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pagos Completados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagosCompletados}</div>
            <p className="text-xs text-muted-foreground">Pagos confirmados</p>
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
                placeholder="Buscar paciente, padre, terapeuta o diagnóstico..."
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
                  "Activo",
                  "Pago pendiente",
                  "Pago confirmado",
                  "Citas programadas",
                  "Completado",
                  "Cancelado",
                  "Sin propuesta",
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
                    Fecha Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado Tratamiento
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
                {pacientesFiltrados.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {paciente.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {paciente.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {paciente.edad} años
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paciente.padre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {paciente.telefono}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paciente.terapeuta}
                      </div>
                      <div className="text-sm text-gray-500">
                        {paciente.tipoTerapia}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paciente.fechaIngreso}
                      </div>
                      <div className="text-sm text-gray-500">
                        <Clock className="inline w-3 h-3 mr-1" />
                        {paciente.fechaUltimaCita}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paciente.sesionesCompletadas}/
                        {paciente.sesionesTotales} sesiones
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${calcularProgreso(paciente.sesionesCompletadas, paciente.sesionesTotales)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {calcularProgreso(
                          paciente.sesionesCompletadas,
                          paciente.sesionesTotales
                        )}
                        %
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(paciente.estadoTratamiento)}`}
                      >
                        {paciente.estadoTratamiento}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPagoColor(paciente.estadoPago)}`}
                      >
                        {paciente.estadoPago}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {paciente.montoPagado} / {paciente.montoTotal}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => setModalInfo(paciente)}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Patient Information Modal */}
      {modalInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Información Completa del Paciente
              </h3>
              <button
                onClick={() => setModalInfo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Patient Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Datos del Paciente
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre:</span>
                      <span>{modalInfo.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Edad:</span>
                      <span>{modalInfo.edad} años</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Género:</span>
                      <span>{modalInfo.genero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Diagnóstico:</span>
                      <span className="text-right max-w-xs">
                        {modalInfo.diagnostico}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Fecha de Ingreso:</span>
                      <span>{modalInfo.fechaIngreso}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Información de Contacto
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Padre/Madre:</span>
                      <span>{modalInfo.padre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Teléfono:</span>
                      <span>{modalInfo.telefono}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{modalInfo.email}</span>
                    </div>
                  </div>
                </div>

                {/* Treatment Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Información del Tratamiento
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Terapeuta:</span>
                      <span>{modalInfo.terapeuta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tipo de Terapia:</span>
                      <span className="text-right max-w-xs">
                        {modalInfo.tipoTerapia}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(modalInfo.estadoTratamiento)}`}
                      >
                        {modalInfo.estadoTratamiento}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Última Cita:</span>
                      <span>{modalInfo.fechaUltimaCita}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Próxima Cita:</span>
                      <span>{modalInfo.proximaCita}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Progress and Sessions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Progreso y Sesiones
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Sesiones:</span>
                      <span>
                        {modalInfo.sesionesCompletadas}/
                        {modalInfo.sesionesTotales}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{
                          width: `${calcularProgreso(modalInfo.sesionesCompletadas, modalInfo.sesionesTotales)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-center text-xs text-gray-500">
                      {calcularProgreso(
                        modalInfo.sesionesCompletadas,
                        modalInfo.sesionesTotales
                      )}
                      % completado
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Información de Pagos
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Monto Total:</span>
                      <span>{modalInfo.montoTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Monto Pagado:</span>
                      <span>{modalInfo.montoPagado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estado Pago:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getPagoColor(modalInfo.estadoPago)}`}
                      >
                        {modalInfo.estadoPago}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Treatment Proposals */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Propuestas de Tratamiento
                  </h4>
                  <div className="space-y-2 text-sm">
                    {modalInfo.rawData.treatmentProposals.length > 0 ? (
                      modalInfo.rawData.treatmentProposals
                        .slice(0, 3)
                        .map((proposal) => (
                          <div
                            key={proposal.id}
                            className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded"
                          >
                            <div className="font-medium">{proposal.title}</div>
                            <div className="text-gray-600">
                              {new Date(proposal.createdAt).toLocaleDateString(
                                "es-ES"
                              )}{" "}
                              •
                              <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs ${getEstadoColor(proposal.status)}`}
                              >
                                {proposal.status}
                              </span>
                            </div>
                            <div className="text-gray-500 text-xs">
                              Bs. {proposal.totalAmount?.toLocaleString()}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-gray-500 italic">
                        No hay propuestas de tratamiento
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Appointments */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Citas Recientes
                  </h4>
                  <div className="space-y-2 text-sm">
                    {modalInfo.rawData.appointments.length > 0 ? (
                      modalInfo.rawData.appointments
                        .slice(0, 3)
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="border-l-4 border-green-500 pl-3 py-2 bg-gray-50 rounded"
                          >
                            <div className="font-medium">
                              {new Date(appointment.date).toLocaleDateString(
                                "es-ES"
                              )}
                            </div>
                            <div className="text-gray-600">
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {appointment.status} • {appointment.type}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-gray-500 italic">
                        No hay citas registradas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={() => setModalInfo(null)}>
                Cerrar
              </Button>
              <Button>Editar Paciente</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
