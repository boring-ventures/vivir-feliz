"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, X } from "lucide-react";
import {
  Service,
  CreateServiceData,
  UpdateServiceData,
} from "@/hooks/useServices";

const serviceSchema = z.object({
  code: z.string().min(1, "Code is required"),
  serviceName: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  sessions: z.number().int().positive("Sessions must be a positive integer"),
  costPerSession: z.number().positive("Cost per session must be positive"),
  type: z.enum(["EVALUATION", "TREATMENT"]),
  specialty: z.enum([
    "SPEECH_THERAPIST",
    "OCCUPATIONAL_THERAPIST",
    "PSYCHOPEDAGOGUE",
    "ASD_THERAPIST",
    "NEUROPSYCHOLOGIST",
    "COORDINATOR",
    "PSYCHOMOTRICIAN",
    "PEDIATRIC_KINESIOLOGIST",
    "PSYCHOLOGIST",
    "COORDINATION_ASSISTANT",
    "BEHAVIORAL_THERAPIST",
  ]),
  status: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;
type SpecialtyType = ServiceFormData["specialty"];

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: CreateServiceData | UpdateServiceData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ServiceForm({
  service,
  onSubmit,
  onCancel,
  isLoading,
}: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          code: service.code,
          serviceName: service.serviceName,
          description: service.description || "",
          sessions: service.sessions,
          costPerSession: service.costPerSession,
          type: service.type,
          specialty: service.specialty,
          status: service.status,
        }
      : {
          code: "",
          serviceName: "",
          description: "",
          sessions: 1,
          costPerSession: 0,
          type: "EVALUATION",
          specialty: "PSYCHOLOGIST",
          status: true,
        },
  });

  const watchedType = watch("type");
  const watchedSpecialty = watch("specialty");
  const watchedStatus = watch("status");

  const handleFormSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {service ? "Editar Servicio" : "Crear Nuevo Servicio"}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código del Servicio *</Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="ej., EV-INT, TRAT-PSI"
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceName">Nombre del Servicio *</Label>
              <Input
                id="serviceName"
                {...register("serviceName")}
                placeholder="ej., Evaluación Integral"
                className={errors.serviceName ? "border-red-500" : ""}
              />
              {errors.serviceName && (
                <p className="text-sm text-red-500">
                  {errors.serviceName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descripción del servicio..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessions">Sesiones *</Label>
              <Input
                id="sessions"
                type="number"
                {...register("sessions", { valueAsNumber: true })}
                min="1"
                className={errors.sessions ? "border-red-500" : ""}
              />
              {errors.sessions && (
                <p className="text-sm text-red-500">
                  {errors.sessions.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPerSession">Costo por Sesión *</Label>
              <Input
                id="costPerSession"
                type="number"
                step="0.01"
                {...register("costPerSession", { valueAsNumber: true })}
                min="0"
                className={errors.costPerSession ? "border-red-500" : ""}
              />
              {errors.costPerSession && (
                <p className="text-sm text-red-500">
                  {errors.costPerSession.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={watchedType}
                onValueChange={(value) =>
                  setValue("type", value as "EVALUATION" | "TREATMENT")
                }
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVALUATION">Evaluación</SelectItem>
                  <SelectItem value="TREATMENT">Tratamiento</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad *</Label>
              <Select
                value={watchedSpecialty}
                onValueChange={(value) =>
                  setValue("specialty", value as SpecialtyType)
                }
              >
                <SelectTrigger
                  className={errors.specialty ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPEECH_THERAPIST">
                    Fonoaudiólogo
                  </SelectItem>
                  <SelectItem value="OCCUPATIONAL_THERAPIST">
                    Terapeuta Ocupacional
                  </SelectItem>
                  <SelectItem value="PSYCHOPEDAGOGUE">Psicopedagogo</SelectItem>
                  <SelectItem value="ASD_THERAPIST">Terapeuta TEA</SelectItem>
                  <SelectItem value="NEUROPSYCHOLOGIST">
                    Neuropsicólogo
                  </SelectItem>
                  <SelectItem value="COORDINATOR">Coordinador</SelectItem>
                  <SelectItem value="PSYCHOMOTRICIAN">
                    Psicomotricista
                  </SelectItem>
                  <SelectItem value="PEDIATRIC_KINESIOLOGIST">
                    Kinesiólogo Pediátrico
                  </SelectItem>
                  <SelectItem value="PSYCHOLOGIST">Psicólogo</SelectItem>
                  <SelectItem value="COORDINATION_ASSISTANT">
                    Asistente de Coordinación
                  </SelectItem>
                  <SelectItem value="BEHAVIORAL_THERAPIST">
                    Terapeuta Conductual
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.specialty && (
                <p className="text-sm text-red-500">
                  {errors.specialty.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={watchedStatus}
              onCheckedChange={(checked) => setValue("status", checked)}
            />
            <Label htmlFor="status">Servicio Activo</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {(isSubmitting || isLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              {service ? "Actualizar Servicio" : "Crear Servicio"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
