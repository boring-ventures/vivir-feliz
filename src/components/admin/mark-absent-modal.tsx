"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Calendar, Clock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMarkAbsent } from "@/hooks/use-mark-absent";

// Validation schema
const markAbsentSchema = z.object({
  reason: z
    .string()
    .min(1, "Debe proporcionar una razón")
    .max(500, "La razón es demasiado larga"),
});

type FormData = z.infer<typeof markAbsentSchema>;

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  patientName?: string;
  parentName?: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
  therapist?: {
    firstName: string;
    lastName: string;
  };
}

interface MarkAbsentModalProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarkAbsentModal({
  appointment,
  open,
  onOpenChange,
}: MarkAbsentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const markAbsentMutation = useMarkAbsent();

  const form = useForm<FormData>({
    resolver: zodResolver(markAbsentSchema),
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!appointment) return;

    setIsSubmitting(true);
    try {
      await markAbsentMutation.mutateAsync({
        appointmentId: appointment.id,
        data: { reason: data.reason },
      });

      // Close modal and reset form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error marking appointment as absent:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      form.reset();
    }
  };

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

  const patientName = appointment.patient
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
    : appointment.patientName || "N/A";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Marcar como Ausente
          </DialogTitle>
          <DialogDescription>
            Marca esta cita como ausente. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Paciente:</span>
              <span>{patientName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Fecha:</span>
              <span>{formatDate(appointment.date)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Horario:</span>
              <span>
                {formatTime(appointment.startTime)} -{" "}
                {formatTime(appointment.endTime)}
              </span>
            </div>

            {appointment.therapist && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Terapeuta:</span>
                <span>
                  {appointment.therapist.firstName}{" "}
                  {appointment.therapist.lastName}
                </span>
              </div>
            )}
          </div>

          {/* Reason Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Razón de la ausencia *
              </Label>
              <Textarea
                id="reason"
                {...form.register("reason")}
                placeholder="Ej: Padre llamó para reportar que el niño está enfermo..."
                rows={3}
                className={`mt-1 ${
                  form.formState.errors.reason ? "border-red-500" : ""
                }`}
              />
              {form.formState.errors.reason && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {form.formState.errors.reason.message}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? "Marcando..." : "Marcar como Ausente"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
