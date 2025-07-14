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
import { useProposals, useUpdateProposalStatus } from "@/hooks/usePatients";
import { useToast } from "@/components/ui/use-toast";

interface TransformedProposalData {
  id: string;
  nombre: string;
  edad: number;
  padre: string;
  telefono: string;
  terapeuta: string;
  estadoPropuesta: string;
  fechaPropuesta: string;
  montoPropuesta: string;
  pagoConfirmado: boolean;
  citasProgramadas: boolean;
  proposalData: {
    title: string;
    totalSessions: number;
    sessionDuration: number;
    frequency: string;
    sessionPrice: number;
    totalAmount: number;
    status: string;
  };
}

export default function AdminNuevosPacientesPage() {
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalPago, setModalPago] = useState<TransformedProposalData | null>(
    null
  );
  const [modalCitas, setModalCitas] = useState<TransformedProposalData | null>(
    null
  );
  const [mesActual, setMesActual] = useState(new Date(2025, 0)); // Enero 2025
  const [citasSeleccionadas, setCitasSeleccionadas] = useState<string[]>([]);

  const { toast } = useToast();

  // Fetch treatment proposals data
  const {
    data: response,
    isLoading,
    error,
  } = useProposals(undefined, undefined, true);
  const pacientes = response && "data" in response ? response.data : [];

  // Mutation for updating proposal status
  const updateProposalStatus = useUpdateProposalStatus();

  const pacientesFiltrados = pacientes.filter(
    (paciente: TransformedProposalData) => {
      const coincideBusqueda =
        paciente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        paciente.padre.toLowerCase().includes(busqueda.toLowerCase()) ||
        paciente.terapeuta.toLowerCase().includes(busqueda.toLowerCase());

      const coincideEstado =
        filtro === "Todos" || paciente.estadoPropuesta === filtro;

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
          "El pago ha sido confirmado exitosamente. Se ha creado el perfil del paciente automáticamente.",
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

  const programarCitas = (pacienteId: string) => {
    // TODO: Implement appointment scheduling
    console.log("Programar citas para:", pacienteId);
    setModalCitas(null);
    setCitasSeleccionadas([]);
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

  const getCitasDelDia = (fecha: Date) => {
    const fechaStr = formatearFecha(fecha);
    return citasSeleccionadas.filter((cita) => cita.startsWith(fechaStr));
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
                  (p: TransformedProposalData) =>
                    p.estadoPropuesta === "Pago Pendiente"
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
                  (p: TransformedProposalData) =>
                    p.estadoPropuesta === "Pago Confirmado"
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
                  (p: TransformedProposalData) =>
                    p.estadoPropuesta === "Citas Programadas"
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
                {pacientesFiltrados.map((paciente: TransformedProposalData) => (
                  <tr key={paciente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {paciente.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {paciente.edad} años
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paciente.fechaPropuesta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paciente.montoPropuesta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={getEstadoColor(paciente.estadoPropuesta)}
                      >
                        {paciente.estadoPropuesta}
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
                          disabled={paciente.pagoConfirmado}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModalCitas(paciente)}
                          disabled={
                            !paciente.pagoConfirmado ||
                            paciente.citasProgramadas
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
                <p className="font-medium">{modalPago.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto de la propuesta:</p>
                <p className="font-medium text-lg">
                  {modalPago.montoPropuesta}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Padre/Madre:</p>
                <p className="font-medium">{modalPago.padre}</p>
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
          <Card className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Programar Citas - {modalCitas.nombre}</CardTitle>
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
                  <p className="font-medium">{modalCitas.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terapeuta:</p>
                  <p className="font-medium">{modalCitas.terapeuta}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Plan de Tratamiento</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Sesiones totales:</p>
                    <p className="font-medium">
                      {modalCitas.proposalData.totalSessions} sesiones
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Frecuencia:</p>
                    <p className="font-medium">
                      {modalCitas.proposalData.frequency}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Citas seleccionadas:</p>
                    <p className="font-medium">
                      {citasSeleccionadas.length}/
                      {modalCitas.proposalData.totalSessions}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tipo de terapia:</p>
                    <p className="font-medium">
                      {modalCitas.proposalData.title}
                    </p>
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
                                    citasSeleccionadas.length >=
                                      modalCitas.proposalData.totalSessions &&
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
                  Haz clic en los horarios disponibles para seleccionar las{" "}
                  {modalCitas.proposalData.totalSessions} citas necesarias.
                  Actualmente tienes {citasSeleccionadas.length} citas
                  seleccionadas.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => programarCitas(modalCitas.id)}
                  disabled={
                    citasSeleccionadas.length !==
                    modalCitas.proposalData.totalSessions
                  }
                  className="flex-1"
                >
                  Programar Todas las Citas ({citasSeleccionadas.length}/
                  {modalCitas.proposalData.totalSessions})
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
