"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useEditUser,
  type AdminUser,
  type UpdateUserData,
} from "@/hooks/use-admin-users";

// Available specialties with Spanish labels for UI
const specialties = [
  { value: "SPEECH_THERAPIST", label: "Fonoaudiólogo" },
  { value: "OCCUPATIONAL_THERAPIST", label: "Terapeuta Ocupacional" },
  { value: "PSYCHOPEDAGOGUE", label: "Psicopedagogo" },
  { value: "ASD_THERAPIST", label: "Terapeuta TEA" },
  { value: "NEUROPSYCHOLOGIST", label: "Neuropsicólogo" },
  { value: "COORDINATOR", label: "Coordinador o Asistente" },
  { value: "PSYCHOMOTRICIAN", label: "Psicomotricista" },
  { value: "PEDIATRIC_KINESIOLOGIST", label: "Kinesiólogo Infantil" },
  { value: "PSYCHOLOGIST", label: "Psicólogo" },
  { value: "COORDINATION_ASSISTANT", label: "Asistente de Coordinación" },
  { value: "BEHAVIORAL_THERAPIST", label: "Terapeuta Conductual" },
] as const;

// Enhanced validation schema
const editUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(50, "Nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
  lastName: z
    .string()
    .min(2, "Apellidos deben tener al menos 2 caracteres")
    .max(50, "Apellidos no pueden exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
  phone: z
    .string()
    .min(7, "Teléfono debe tener al menos 7 dígitos")
    .max(15, "Teléfono no puede exceder 15 dígitos")
    .regex(/^[\+]?[0-9\-\s]+$/, "Formato de teléfono inválido"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "THERAPIST", "PARENT"]),
  nationalId: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]+$/.test(val), {
      message: "CI debe contener solo números",
    }),
  address: z
    .string()
    .max(200, "Dirección no puede exceder 200 caracteres")
    .optional(),
  dateOfBirth: z.string().optional(),
  biography: z
    .string()
    .max(1000, "Biografía no puede exceder 1000 caracteres")
    .optional(),
  specialty: z
    .enum([
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
    ])
    .optional(),
  active: z.boolean(),
});

type FormData = z.infer<typeof editUserSchema>;

interface UserEditModalProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditModal({
  user,
  open,
  onOpenChange,
}: UserEditModalProps) {
  const editUserMutation = useEditUser();

  const form = useForm<FormData>({
    resolver: zodResolver(editUserSchema),
    mode: "onChange",
  });

  // Watch for role changes to conditionally show specialty field
  const selectedRole = form.watch("role");
  const watchedFields = form.watch();

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (user && open) {
      const formattedDateOfBirth = user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "";

      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        role: user.role,
        nationalId: user.nationalId || "",
        address: user.address || "",
        dateOfBirth: formattedDateOfBirth,
        biography: user.biography || "",
        specialty: user.specialty || undefined,
        active: user.active,
      });
    }
  }, [user, open, form]);

  // Handle form submission
  const onSubmit = (data: FormData) => {
    if (!user) return;

    const updateData: UpdateUserData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
      nationalId: data.nationalId || undefined,
      address: data.address || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      biography: data.biography || undefined,
      specialty: data.role === "THERAPIST" ? data.specialty : undefined,
      active: data.active,
    };

    editUserMutation.mutate(
      { userId: user.userId, userData: updateData },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  // Field error component
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center mt-1 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica la información del usuario {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                {...form.register("firstName")}
                className={`${
                  form.formState.errors.firstName ? "border-red-500" : ""
                } capitalize`}
              />
              <FieldError error={form.formState.errors.firstName?.message} />
            </div>
            <div>
              <Label htmlFor="lastName">Apellidos *</Label>
              <Input
                {...form.register("lastName")}
                className={`${
                  form.formState.errors.lastName ? "border-red-500" : ""
                } capitalize`}
              />
              <FieldError error={form.formState.errors.lastName?.message} />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                {...form.register("phone")}
                placeholder="+591-7-123-4567"
                className={form.formState.errors.phone ? "border-red-500" : ""}
              />
              <FieldError error={form.formState.errors.phone?.message} />
            </div>
            <div>
              <Label htmlFor="nationalId">Cédula de Identidad</Label>
              <Input
                {...form.register("nationalId")}
                className={
                  form.formState.errors.nationalId ? "border-red-500" : ""
                }
              />
              <FieldError error={form.formState.errors.nationalId?.message} />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <Input type="date" {...form.register("dateOfBirth")} />
            </div>
            <div>
              <Label htmlFor="active">Estado</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("active", value === "true")
                }
                value={watchedFields.active?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                {...form.register("address")}
                className={
                  form.formState.errors.address ? "border-red-500" : ""
                }
              />
              <FieldError error={form.formState.errors.address?.message} />
            </div>

            {/* Información Profesional */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-3">
                Información Profesional
              </h3>
            </div>
            <div>
              <Label htmlFor="role">Rol *</Label>
              <Select
                onValueChange={(
                  value: "SUPER_ADMIN" | "ADMIN" | "THERAPIST" | "PARENT"
                ) => {
                  form.setValue("role", value);
                  // Reset specialty when role changes
                  if (value !== "THERAPIST") {
                    form.setValue("specialty", undefined);
                  }
                }}
                value={watchedFields.role}
              >
                <SelectTrigger
                  className={form.formState.errors.role ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">
                    Super Administrador
                  </SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="THERAPIST">Terapeuta</SelectItem>
                  <SelectItem value="PARENT">Padre</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={form.formState.errors.role?.message} />
            </div>

            {/* Conditionally show specialty field only for therapists */}
            {selectedRole === "THERAPIST" && (
              <div>
                <Label htmlFor="specialty">Especialidad *</Label>
                <Select
                  onValueChange={(
                    value:
                      | "SPEECH_THERAPIST"
                      | "OCCUPATIONAL_THERAPIST"
                      | "PSYCHOPEDAGOGUE"
                      | "ASD_THERAPIST"
                      | "NEUROPSYCHOLOGIST"
                      | "COORDINATOR"
                      | "PSYCHOMOTRICIAN"
                      | "PEDIATRIC_KINESIOLOGIST"
                      | "PSYCHOLOGIST"
                      | "COORDINATION_ASSISTANT"
                      | "BEHAVIORAL_THERAPIST"
                  ) => form.setValue("specialty", value)}
                  value={watchedFields.specialty}
                >
                  <SelectTrigger
                    className={
                      form.formState.errors.specialty ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError error={form.formState.errors.specialty?.message} />
              </div>
            )}

            {selectedRole === "THERAPIST" && (
              <div className="col-span-2">
                <Label htmlFor="biography">Biografía Profesional</Label>
                <Textarea
                  {...form.register("biography")}
                  placeholder="Describe la experiencia y formación profesional..."
                  rows={3}
                  className={
                    form.formState.errors.biography ? "border-red-500" : ""
                  }
                />
                <FieldError error={form.formState.errors.biography?.message} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={editUserMutation.isPending || !form.formState.isValid}
            >
              {editUserMutation.isPending
                ? "Actualizando..."
                : "Actualizar Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
