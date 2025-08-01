"use client";

import { Button } from "@/components/ui/button";
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
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserX,
  CreditCard,
} from "lucide-react";

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
  patient?: {
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
    firstName: string;
    lastName: string;
    specialty?: string;
    phone?: string;
    email?: string;
  };
  proposal?: {
    id: string;
    timeAvailability?:
      | Record<string, { morning: boolean; afternoon: boolean }>
      | Array<{ day: string; morning: boolean; afternoon: boolean }>;
    title?: string;
    description?: string;
    status?: string;
  };
}

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailsModal({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return {
          label: "Programada",
          color: "bg-blue-100 text-blue-800",
          icon: Calendar,
        };
      case "CONFIRMED":
        return {
          label: "Confirmada",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        };
      case "IN_PROGRESS":
        return {
          label: "En Progreso",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        };
      case "COMPLETED":
        return {
          label: "Completada",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        };
      case "CANCELLED":
        return {
          label: "Cancelada",
          color: "bg-red-100 text-red-800",
          icon: XCircle,
        };
      case "NO_SHOW":
        return {
          label: "Ausente",
          color: "bg-red-100 text-red-800",
          icon: UserX,
        };
      case "RESCHEDULED":
        return {
          label: "Reprogramada",
          color: "bg-purple-100 text-purple-800",
          icon: Calendar,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
          icon: Calendar,
        };
    }
  };

  // Get appointment type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CONSULTA":
        return "Consulta";
      case "ENTREVISTA":
        return "Entrevista";
      case "SEGUIMIENTO":
        return "Seguimiento";
      case "TERAPIA":
        return "Terapia";
      default:
        return type;
    }
  };

  // Get specialty label
  const getSpecialtyLabel = (specialty?: string) => {
    if (!specialty) return "N/A";
    switch (specialty) {
      case "SPEECH_THERAPIST":
        return "Fonoaudiólogo";
      case "OCCUPATIONAL_THERAPIST":
        return "Terapeuta Ocupacional";
      case "PSYCHOPEDAGOGUE":
        return "Psicopedagogo";
      case "ASD_THERAPIST":
        return "Terapeuta TEA";
      case "NEUROPSYCHOLOGIST":
        return "Neuropsicólogo";
      case "COORDINATOR":
        return "Coordinador";
      case "PSYCHOMOTRICIAN":
        return "Psicomotricista";
      case "PEDIATRIC_KINESIOLOGIST":
        return "Kinesiólogo Infantil";
      case "PSYCHOLOGIST":
        return "Psicólogo";
      case "COORDINATION_ASSISTANT":
        return "Asistente de Coordinación";
      case "BEHAVIORAL_THERAPIST":
        return "Terapeuta Conductual";
      default:
        return specialty;
    }
  };

  const patientName = appointment.patient
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
    : appointment.patientName || "N/A";

  const therapistName = appointment.therapist
    ? `${appointment.therapist.firstName} ${appointment.therapist.lastName}`
    : "N/A";

  const statusInfo = getStatusInfo(appointment.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Detalles de la Cita
          </DialogTitle>
          <DialogDescription>
            Información completa de la cita programada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and Basic Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <statusInfo.icon className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Estado:</span>
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              </div>
              <Badge variant="outline">{getTypeLabel(appointment.type)}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Fecha:</span>
                <span>{formatDate(appointment.date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Horario:</span>
                <span>
                  {formatTime(appointment.startTime)} -{" "}
                  {formatTime(appointment.endTime)}
                </span>
              </div>
            </div>

            {appointment.price && (
              <div className="flex items-center gap-2 mt-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Precio:</span>
                <span>
                  $
                  {typeof appointment.price === "number"
                    ? appointment.price.toFixed(2)
                    : appointment.price}
                </span>
              </div>
            )}
          </div>

          {/* Patient Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Paciente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Nombre:</span>
                <span className="ml-2">{patientName}</span>
              </div>

              {appointment.patientAge && (
                <div>
                  <span className="font-medium">Edad:</span>
                  <span className="ml-2">{appointment.patientAge} años</span>
                </div>
              )}

              {/* Time Availability Display */}
              {appointment.proposal?.timeAvailability && (
                <div className="md:col-span-2 mt-2 p-3 bg-blue-100 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Disponibilidad de Horarios:
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    {(() => {
                      // Handle both array format (new) and object format (old)
                      let timeAvailabilityData =
                        appointment.proposal?.timeAvailability;

                      // If it's an array, convert to object format for processing
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

                      const dayOrder = [
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                      ];
                      const orderedEntries = dayOrder
                        .map((day) => [day, timeAvailabilityData?.[day]])
                        .filter((entry) => {
                          const [, periods] = entry;
                          return (
                            periods &&
                            typeof periods === "object" &&
                            (periods.morning || periods.afternoon)
                          );
                        });

                      return orderedEntries.map(([day, periods]) => {
                        const dayLabels = {
                          monday: "Lunes",
                          tuesday: "Martes",
                          wednesday: "Miércoles",
                          thursday: "Jueves",
                          friday: "Viernes",
                        };
                        const dayLabel =
                          dayLabels[day as keyof typeof dayLabels] || day;

                        const availablePeriods = [];
                        if (
                          periods &&
                          typeof periods === "object" &&
                          periods.morning
                        )
                          availablePeriods.push("Mañana");
                        if (
                          periods &&
                          typeof periods === "object" &&
                          periods.afternoon
                        )
                          availablePeriods.push("Tarde");

                        return (
                          <span
                            key={day as string}
                            className="inline-block mr-3 mb-1"
                          >
                            <span className="font-medium">
                              {dayLabel as string}:
                            </span>{" "}
                            {availablePeriods.join(", ")}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {appointment.patient?.dateOfBirth && (
                <div>
                  <span className="font-medium">Fecha de Nacimiento:</span>
                  <span className="ml-2">
                    {formatDate(appointment.patient.dateOfBirth)}
                  </span>
                </div>
              )}

              {appointment.patient?.gender && (
                <div>
                  <span className="font-medium">Género:</span>
                  <span className="ml-2">{appointment.patient.gender}</span>
                </div>
              )}

              {appointment.patient?.address && (
                <div className="md:col-span-2">
                  <span className="font-medium">Dirección:</span>
                  <span className="ml-2">{appointment.patient.address}</span>
                </div>
              )}
            </div>

            {/* Medical Information */}
            {(appointment.patient?.allergies ||
              appointment.patient?.medications ||
              appointment.patient?.medicalHistory ||
              appointment.patient?.specialNeeds) && (
              <div className="mt-4 space-y-2">
                {appointment.patient?.allergies && (
                  <div>
                    <span className="font-medium text-red-600">Alergias:</span>
                    <span className="ml-2">
                      {appointment.patient.allergies}
                    </span>
                  </div>
                )}

                {appointment.patient?.medications && (
                  <div>
                    <span className="font-medium text-orange-600">
                      Medicamentos:
                    </span>
                    <span className="ml-2">
                      {appointment.patient.medications}
                    </span>
                  </div>
                )}

                {appointment.patient?.medicalHistory && (
                  <div>
                    <span className="font-medium text-purple-600">
                      Historial Médico:
                    </span>
                    <span className="ml-2">
                      {appointment.patient.medicalHistory}
                    </span>
                  </div>
                )}

                {appointment.patient?.specialNeeds && (
                  <div>
                    <span className="font-medium text-blue-600">
                      Necesidades Especiales:
                    </span>
                    <span className="ml-2">
                      {appointment.patient.specialNeeds}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Emergency Contact */}
            {(appointment.patient?.emergencyContact ||
              appointment.patient?.emergencyPhone) && (
              <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">
                  Contacto de Emergencia
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {appointment.patient?.emergencyContact && (
                    <div>
                      <span className="font-medium">Contacto:</span>
                      <span className="ml-2">
                        {appointment.patient.emergencyContact}
                      </span>
                    </div>
                  )}
                  {appointment.patient?.emergencyPhone && (
                    <div>
                      <span className="font-medium">Teléfono:</span>
                      <span className="ml-2">
                        {appointment.patient.emergencyPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Parent Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Padre/Tutor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Nombre:</span>
                <span className="ml-2">{appointment.parentName || "N/A"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Teléfono:</span>
                <span>{appointment.parentPhone || "N/A"}</span>
              </div>

              {appointment.parentEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Email:</span>
                  <span>{appointment.parentEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Therapist Information */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Terapeuta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Nombre:</span>
                <span className="ml-2">{therapistName}</span>
              </div>

              {appointment.therapist?.specialty && (
                <div>
                  <span className="font-medium">Especialidad:</span>
                  <span className="ml-2">
                    {getSpecialtyLabel(appointment.therapist.specialty)}
                  </span>
                </div>
              )}

              {/* Time Availability Display */}
              {appointment.proposal?.timeAvailability && (
                <div className="md:col-span-2 mt-2 p-3 bg-purple-100 rounded border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">
                      Disponibilidad de Horarios:
                    </span>
                  </div>
                  <div className="text-sm text-purple-700">
                    {(() => {
                      // Handle both array format (new) and object format (old)
                      let timeAvailabilityData =
                        appointment.proposal?.timeAvailability;

                      // If it's an array, convert to object format for processing
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

                      const dayOrder = [
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                      ];
                      const orderedEntries = dayOrder
                        .map((day) => [day, timeAvailabilityData?.[day]])
                        .filter(
                          ([, periods]) =>
                            periods &&
                            typeof periods === "object" &&
                            (periods.morning || periods.afternoon)
                        );

                      return orderedEntries.map(([day, periods]) => {
                        const dayLabels = {
                          monday: "Lunes",
                          tuesday: "Martes",
                          wednesday: "Miércoles",
                          thursday: "Jueves",
                          friday: "Viernes",
                        };
                        const dayLabel =
                          dayLabels[day as keyof typeof dayLabels] || day;

                        const availablePeriods = [];
                        if (
                          periods &&
                          typeof periods === "object" &&
                          periods.morning
                        )
                          availablePeriods.push("Mañana");
                        if (
                          periods &&
                          typeof periods === "object" &&
                          periods.afternoon
                        )
                          availablePeriods.push("Tarde");

                        return (
                          <span
                            key={day as string}
                            className="inline-block mr-3 mb-1"
                          >
                            <span className="font-medium">
                              {dayLabel as string}:
                            </span>{" "}
                            {availablePeriods.join(", ")}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {appointment.therapist?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Teléfono:</span>
                  <span>{appointment.therapist.phone}</span>
                </div>
              )}

              {appointment.therapist?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Email:</span>
                  <span>{appointment.therapist.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Time Availability Information */}
          {appointment.proposal?.timeAvailability && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Disponibilidad de Horarios
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  // Handle both array format (new) and object format (old)
                  let timeAvailabilityData =
                    appointment.proposal?.timeAvailability;

                  // If it's an array, convert to object format for processing
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

                  const dayOrder = [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                  ];
                  const orderedEntries = dayOrder
                    .map((day) => [day, timeAvailabilityData?.[day]])
                    .filter((entry) => {
                      const [, periods] = entry;
                      return (
                        periods &&
                        typeof periods === "object" &&
                        (periods.morning || periods.afternoon)
                      );
                    });

                  return orderedEntries.map(([day, periods]) => {
                    const dayLabels = {
                      monday: "Lunes",
                      tuesday: "Martes",
                      wednesday: "Miércoles",
                      thursday: "Jueves",
                      friday: "Viernes",
                    };
                    const dayLabel =
                      dayLabels[day as keyof typeof dayLabels] || day;

                    const availablePeriods = [];
                    if (
                      periods &&
                      typeof periods === "object" &&
                      periods.morning
                    )
                      availablePeriods.push("Mañana");
                    if (
                      periods &&
                      typeof periods === "object" &&
                      periods.afternoon
                    )
                      availablePeriods.push("Tarde");

                    return (
                      <div
                        key={day as string}
                        className="flex items-center gap-2"
                      >
                        <span className="font-medium">
                          {dayLabel as string}:
                        </span>
                        <span className="text-sm text-gray-600">
                          {availablePeriods.join(", ")}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Session Information */}
          {(appointment.notes ||
            appointment.homework ||
            appointment.nextSessionPlan ||
            appointment.sessionNotes) && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Información de la Sesión
              </h3>

              <div className="space-y-3">
                {appointment.notes && (
                  <div>
                    <span className="font-medium">Notas:</span>
                    <p className="mt-1 text-sm bg-white p-2 rounded border">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {appointment.homework && (
                  <div>
                    <span className="font-medium">Tarea:</span>
                    <p className="mt-1 text-sm bg-white p-2 rounded border">
                      {appointment.homework}
                    </p>
                  </div>
                )}

                {appointment.nextSessionPlan && (
                  <div>
                    <span className="font-medium">
                      Plan para Próxima Sesión:
                    </span>
                    <p className="mt-1 text-sm bg-white p-2 rounded border">
                      {appointment.nextSessionPlan}
                    </p>
                  </div>
                )}

                {appointment.sessionNotes && (
                  <div>
                    <span className="font-medium">Notas de Sesión:</span>
                    <p className="mt-1 text-sm bg-white p-2 rounded border">
                      {appointment.sessionNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Absence Information */}
          {appointment.status === "NO_SHOW" && appointment.absenceReason && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Información de Ausencia
              </h3>

              <div className="space-y-2">
                <div>
                  <span className="font-medium">Razón:</span>
                  <p className="mt-1 text-sm bg-white p-2 rounded border">
                    {appointment.absenceReason}
                  </p>
                </div>

                {appointment.markedAbsentAt && (
                  <div>
                    <span className="font-medium">Marcado como ausente:</span>
                    <span className="ml-2">
                      {formatDateTime(appointment.markedAbsentAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancellation Information */}
          {appointment.status === "CANCELLED" &&
            appointment.cancellationReason && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Información de Cancelación
                </h3>

                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Razón:</span>
                    <p className="mt-1 text-sm bg-white p-2 rounded border">
                      {appointment.cancellationReason}
                    </p>
                  </div>

                  {appointment.cancelledBy && (
                    <div>
                      <span className="font-medium">Cancelado por:</span>
                      <span className="ml-2">{appointment.cancelledBy}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
