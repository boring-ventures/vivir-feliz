"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useRescheduleAppointment } from "@/hooks/use-reschedule-appointment";
import { useTherapistMonthlyAppointments } from "@/hooks/use-therapist-appointments";
import { usePatientAppointments } from "@/hooks/use-patient-appointments";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  patientName?: string;
  patientAge?: number;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  notes?: string;
  price?: number;
  absenceReason?: string;
  markedAbsentBy?: string;
  markedAbsentAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  homework?: string;
  nextSessionPlan?: string;
  sessionNotes?: string;
  therapistId?: string;
  patientId?: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    allergies?: string;
    medications?: string;
    medicalHistory?: string;
    specialNeeds?: string;
  };
  therapist?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
    phone?: string;
    email?: string;
  };
}

interface RescheduleAppointmentModalProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RescheduleAppointmentModal({
  appointment,
  open,
  onOpenChange,
}: RescheduleAppointmentModalProps) {
  const [mesActual, setMesActual] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const rescheduleMutation = useRescheduleAppointment();

  // Get therapist ID from appointment - try different possible fields
  const therapistId =
    appointment?.therapist?.id ||
    appointment?.therapistId ||
    appointment?.therapistId;

  // Get patient ID from appointment
  const patientId = appointment?.patientId || appointment?.patient?.id;

  // Fetch therapist appointments for the current month
  const { data: therapistAppointments = [] } = useTherapistMonthlyAppointments(
    therapistId,
    mesActual.getFullYear(),
    mesActual.getMonth() + 1
  );

  // Fetch patient appointments
  const { data: patientAppointmentsData } = usePatientAppointments(patientId);

  // Reset selections when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDate("");
      setSelectedTime("");

      // Set the current month to the appointment's month so it's visible
      if (appointment?.date) {
        const appointmentDate = new Date(appointment.date);
        setMesActual(appointmentDate);
      } else {
        setMesActual(new Date());
      }

      // Debug: Log appointment data when modal opens
      if (appointment) {
        console.log("📅 Appointment data when modal opens:", {
          appointmentId: appointment.id,
          appointmentDate: appointment.date,
          appointmentStartTime: appointment.startTime,
          appointmentEndTime: appointment.endTime,
          appointmentType: appointment.type,
          therapistId: therapistId,
          patientId: patientId,
          appointmentDateObj: new Date(appointment.date),
        });
      }
    }
  }, [open, appointment, therapistId, patientId]);

  // Handle date and time selection
  const handleDateTimeSelect = (fecha: Date, hora: string) => {
    const fechaStr = formatearFecha(fecha);

    if (selectedDate === fechaStr && selectedTime === hora) {
      // Deselect if already selected
      setSelectedDate("");
      setSelectedTime("");
    } else {
      // Select new date/time
      setSelectedDate(fechaStr);
      setSelectedTime(hora);
    }
  };

  // Handle reschedule
  const handleReschedule = async () => {
    if (!appointment || !selectedDate || !selectedTime) return;

    try {
      // Calculate end time (assuming same duration as original appointment)
      const originalStart = new Date(`2000-01-01T${appointment.startTime}`);
      const originalEnd = new Date(`2000-01-01T${appointment.endTime}`);
      const duration = originalEnd.getTime() - originalStart.getTime();

      const newStart = new Date(`2000-01-01T${selectedTime}`);
      const newEnd = new Date(newStart.getTime() + duration);

      const newEndTime = newEnd.toTimeString().slice(0, 5);

      await rescheduleMutation.mutateAsync({
        appointmentId: appointment.id,
        data: {
          newDate: selectedDate,
          newStartTime: selectedTime,
          newEndTime,
        },
      });

      // Close modal and reset
      onOpenChange(false);
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
    }
  };

  // Calendar functions (same as new patients page)
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

  // Helper to add an hour to a time string
  const addHour = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    date.setHours(date.getHours() + 1);
    return `${date.getHours().toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  // Check if a slot is busy - check for time overlaps like in new patients page
  const isSlotBusy = (fecha: Date, hora: string) => {
    if (!therapistAppointments) return false;

    const fechaStr = formatearFecha(fecha);

    return therapistAppointments.some(
      (apt) =>
        apt.date === fechaStr &&
        apt.id !== appointment?.id && // Exclude current appointment being rescheduled
        ((hora >= apt.start_time && hora < apt.end_time) ||
          // Also block the slot if an appointment starts during this hour
          (apt.start_time >= hora && apt.start_time < addHour(hora)))
    );
  };

  // Check if patient has a conflict at this time
  const hasPatientConflict = (fecha: Date, hora: string) => {
    if (!patientAppointmentsData?.appointments) return false;

    const fechaStr = formatearFecha(fecha);
    const patientAppointments = patientAppointmentsData.appointments;

    return patientAppointments.some(
      (apt) =>
        apt.id !== appointment?.id && // Exclude current appointment being rescheduled
        apt.date === fechaStr &&
        ((hora >= apt.startTime && hora < apt.endTime) ||
          // Also block if patient has an appointment that starts during this hour
          (apt.startTime >= hora && apt.startTime < addHour(hora)))
    );
  };

  // Check if a date is selected
  const esDiaSeleccionado = (fecha: Date) => {
    const fechaStr = formatearFecha(fecha);
    return selectedDate === fechaStr;
  };

  // Check if this is the original appointment date and time
  const esCitaOriginal = (fecha: Date, hora: string) => {
    if (!appointment) return false;
    const fechaStr = formatearFecha(fecha);

    // Normalize the appointment date to match the calendar format
    let appointmentDateStr = appointment.date;
    if (appointmentDateStr.includes("T")) {
      // If it's an ISO string, extract just the date part
      appointmentDateStr = appointmentDateStr.split("T")[0];
    }

    // Debug logging to see what's being compared
    console.log("🔍 Original appointment check:", {
      fechaStr,
      appointmentDate: appointment.date,
      normalizedAppointmentDate: appointmentDateStr,
      hora,
      appointmentStartTime: appointment.startTime,
      dateMatch: fechaStr === appointmentDateStr,
      timeMatch: hora === appointment.startTime,
      isOriginal:
        fechaStr === appointmentDateStr && hora === appointment.startTime,
    });

    return fechaStr === appointmentDateStr && hora === appointment.startTime;
  };

  // Check if a date can be selected (not in the past)
  const canSelectDate = (fecha: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return fecha >= today;
  };

  // Format date and time
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getPatientName = (appointment: Appointment) => {
    if (appointment.patient) {
      return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    }
    return appointment.patientName || "N/A";
  };

  const getTherapistName = (appointment: Appointment) => {
    if (appointment.therapist) {
      return `${appointment.therapist.firstName} ${appointment.therapist.lastName}`;
    }
    return "N/A";
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

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Reprogramar Cita
          </DialogTitle>
          <DialogDescription>
            Selecciona una nueva fecha y hora para la cita
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Appointment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cita Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Paciente:</span>
                  <span>{getPatientName(appointment)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Terapeuta:</span>
                  <span>{getTherapistName(appointment)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Fecha Actual:</span>
                  <span>{formatDate(new Date(appointment.date))}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Horario Actual:</span>
                  <span>
                    {formatTime(appointment.startTime)} -{" "}
                    {formatTime(appointment.endTime)}
                  </span>
                </div>

                <div>
                  <Badge variant="outline">
                    {appointment.type === "CONSULTA"
                      ? "Consulta"
                      : appointment.type === "ENTREVISTA"
                        ? "Entrevista"
                        : appointment.type === "SEGUIMIENTO"
                          ? "Seguimiento"
                          : appointment.type === "TERAPIA"
                            ? "Terapia"
                            : appointment.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

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

                {getDiasDelMes(mesActual).map((diaInfo, index) => {
                  const isSelectable = canSelectDate(diaInfo.fecha);
                  return (
                    <div
                      key={index}
                      className={`min-h-[60px] border-r border-b p-1 ${
                        !diaInfo.esDelMes ? "bg-gray-50 text-gray-400" : ""
                      } ${!isSelectable ? "bg-gray-100" : ""} ${
                        esDiaSeleccionado(diaInfo.fecha) ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {diaInfo.dia}
                      </div>
                      {diaInfo.esDelMes && (
                        <div className="space-y-0.5">
                          {horarios.map((hora) => {
                            const isSelected =
                              selectedDate === formatearFecha(diaInfo.fecha) &&
                              selectedTime === hora;
                            const isBusy = isSlotBusy(diaInfo.fecha, hora);
                            const isPatientConflict = hasPatientConflict(
                              diaInfo.fecha,
                              hora
                            );
                            const isOriginal = esCitaOriginal(
                              diaInfo.fecha,
                              hora
                            );

                            // Determine button variant and disabled state
                            let variant:
                              | "default"
                              | "destructive"
                              | "outline"
                              | "secondary" = "outline";
                            let disabled = !isSelectable || isBusy;
                            let className = "w-full text-xs p-0.5 h-5";
                            let conflictText = "";

                            if (isOriginal) {
                              variant = "secondary";
                              className +=
                                " bg-purple-100 text-purple-800 border-purple-300";
                            } else if (isBusy) {
                              variant = "destructive";
                              disabled = true;
                              conflictText = "(Ocupado)";
                            } else if (isPatientConflict) {
                              variant = "destructive";
                              disabled = true;
                              conflictText = "(Conflicto)";
                            } else if (isSelected) {
                              variant = "default";
                            }

                            return (
                              <Button
                                key={hora}
                                size="sm"
                                variant={variant}
                                onClick={() =>
                                  handleDateTimeSelect(diaInfo.fecha, hora)
                                }
                                disabled={disabled}
                                className={className}
                              >
                                {hora}
                                {isOriginal && (
                                  <span className="ml-1 text-[10px]">
                                    (Actual)
                                  </span>
                                )}
                                {conflictText && (
                                  <span className="ml-1 text-[10px]">
                                    {conflictText}
                                  </span>
                                )}
                              </Button>
                            );
                          })}

                          {/* Show patient appointments as visual blocks */}
                          {patientAppointmentsData?.appointments
                            ?.filter(
                              (apt) =>
                                apt.id !== appointment?.id && // Exclude current appointment
                                apt.date === formatearFecha(diaInfo.fecha)
                            )
                            .map((apt) => (
                              <div
                                key={apt.id}
                                className="w-full text-xs p-1 h-5 bg-orange-100 text-orange-800 border border-orange-300 rounded flex items-center justify-center cursor-default"
                                title={`${apt.therapist.firstName} ${apt.therapist.lastName} - ${apt.type} - ${formatTime(apt.startTime)}-${formatTime(apt.endTime)}`}
                              >
                                <span className="text-xs font-medium">
                                  {apt.startTime} - {apt.therapist.firstName}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="bg-green-50 p-3 rounded-md space-y-2">
            <p className="text-sm text-green-800">
              Selecciona una nueva fecha y hora para reprogramar la cita. Los
              bloques naranjas muestran las citas existentes del paciente con
              otros terapeutas.
            </p>
            <div className="flex gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded-sm mr-1" />
                <span>Cita actual</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-destructive rounded-sm mr-1" />
                <span>Horario ocupado</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-destructive rounded-sm mr-1" />
                <span>Conflicto paciente</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded-sm mr-1" />
                <span>Cita del paciente</span>
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

          {/* Selection Summary */}
          {selectedDate && selectedTime && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Nueva fecha seleccionada:</span>
                  <span>
                    {formatDate(new Date(selectedDate))} a las{" "}
                    {formatTime(selectedTime)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={
              !selectedDate || !selectedTime || rescheduleMutation.isPending
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {rescheduleMutation.isPending
              ? "Reprogramando..."
              : "Reprogramar Cita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
