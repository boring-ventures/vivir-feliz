"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Key,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoleGuard } from "@/components/auth/role-guard";
import { CredentialCard } from "@/components/admin/credential-card";
import { UserEditModal } from "@/components/admin/user-edit-modal";
import { UserDeleteModal } from "@/components/admin/user-delete-modal";
import { UserPasswordResetModal } from "@/components/admin/user-password-reset-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAdminUsers,
  useCreateUser,
  type CreateUserData,
  type AdminUser,
} from "@/hooks/use-admin-users";
import {
  useCreateSchedule,
  useSchedule,
  useUpdateSchedule,
  type ScheduleFormData,
} from "@/hooks/use-schedule";

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

// Enhanced validation schema with more comprehensive rules
const createUserSchema = z.object({
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
  email: z
    .string()
    .email("Email inválido")
    .max(100, "Email no puede exceder 100 caracteres"),
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
  canTakeConsultations: z.boolean().optional(),
  password: z
    .string()
    .min(8, "Contraseña debe tener al menos 8 caracteres")
    .max(50, "Contraseña no puede exceder 50 caracteres"),
});

// Schedule creation schema
const scheduleSchema = z.object({
  slotDuration: z.number().min(15).max(120),
  breakBetween: z.number().min(0).max(60),
  dailySchedules: z
    .array(
      z.object({
        day: z.enum([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ]),
        enabled: z.boolean(),
        startTime: z
          .string()
          .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Formato de hora inválido"
          ),
        endTime: z
          .string()
          .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Formato de hora inválido"
          ),
      })
    )
    .refine((schedules) => schedules.some((schedule) => schedule.enabled), {
      message: "Debe seleccionar al menos un día de trabajo",
    }),
  restPeriods: z.array(
    z.object({
      day: z.enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ]),
      enabled: z.boolean(),
      startTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
      endTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
    })
  ),
});

type FormData = z.infer<typeof createUserSchema>;

// Types for schedule data
type TimeSlot = {
  id: string;
  scheduleId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentTypes: string[];
};

type ScheduleData = {
  id: string;
  therapistId: string;
  slotDuration: number;
  breakBetween: number;
  timeSlots: TimeSlot[];
  restPeriods?: Array<{
    id: string;
    scheduleId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string | null;
  };
};

// Days of the week in Spanish
const daysOfWeek = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
] as const;

export default function AdminUsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreateUserData | null>(null);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Schedule creation states
  const [showScheduleCreation, setShowScheduleCreation] = useState(false);
  const [createdTherapistId, setCreatedTherapistId] = useState<string | null>(
    null
  );
  const [scheduleStep, setScheduleStep] = useState<"confirm" | "create">(
    "confirm"
  );

  // Schedule management states
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedTherapistForSchedule, setSelectedTherapistForSchedule] =
    useState<AdminUser | null>(null);
  const [scheduleViewMode, setScheduleViewMode] = useState<"view" | "edit">(
    "view"
  );

  const pageSize = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // React Query hooks
  const {
    data: response,
    isLoading,
    error,
  } = useAdminUsers(roleFilter, currentPage, pageSize, debouncedSearchTerm);
  const users = response?.users || [];
  const pagination = response?.pagination;

  const createUserMutation = useCreateUser();
  const createScheduleMutation = useCreateSchedule();
  const updateScheduleMutation = useUpdateSchedule();

  // Fetch schedule data for the selected therapist
  const {
    data: existingSchedule,
    isLoading: isLoadingSchedule,
    error: scheduleError,
  } = useSchedule(selectedTherapistForSchedule?.id || null) as {
    data: ScheduleData | null;
    isLoading: boolean;
    error: Error | null;
  };

  // Edit schedule form handling
  const editScheduleForm = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      slotDuration: 60,
      breakBetween: 15,
      dailySchedules: [
        {
          day: "MONDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "TUESDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "WEDNESDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "THURSDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "FRIDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "SATURDAY",
          enabled: false,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "SUNDAY",
          enabled: false,
          startTime: "08:00",
          endTime: "18:00",
        },
      ],
      restPeriods: [
        {
          day: "MONDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "TUESDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "WEDNESDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "THURSDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "FRIDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "SATURDAY",
          enabled: false,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "SUNDAY",
          enabled: false,
          startTime: "12:00",
          endTime: "13:00",
        },
      ],
    },
  });

  // Load existing schedule data into edit form when data changes
  useEffect(() => {
    if (existingSchedule && scheduleViewMode === "edit") {
      const timeSlotsByDay = existingSchedule.timeSlots.reduce(
        (acc: Record<string, TimeSlot>, slot: TimeSlot) => {
          acc[slot.dayOfWeek] = slot;
          return acc;
        },
        {}
      );

      const restPeriodsByDay =
        existingSchedule.restPeriods?.reduce(
          (
            acc: Record<
              string,
              {
                id: string;
                scheduleId: string;
                dayOfWeek: string;
                startTime: string;
                endTime: string;
              }
            >,
            period: {
              id: string;
              scheduleId: string;
              dayOfWeek: string;
              startTime: string;
              endTime: string;
            }
          ) => {
            acc[period.dayOfWeek] = period;
            return acc;
          },
          {}
        ) || {};

      const dailySchedules = daysOfWeek.map((day) => {
        const timeSlot = timeSlotsByDay[day.value];
        return {
          day: day.value as
            | "MONDAY"
            | "TUESDAY"
            | "WEDNESDAY"
            | "THURSDAY"
            | "FRIDAY"
            | "SATURDAY"
            | "SUNDAY",
          enabled: !!timeSlot,
          startTime: timeSlot?.startTime || "08:00",
          endTime: timeSlot?.endTime || "18:00",
        };
      });

      const restPeriods = daysOfWeek.map((day) => {
        const restPeriod = restPeriodsByDay[day.value];
        return {
          day: day.value as
            | "MONDAY"
            | "TUESDAY"
            | "WEDNESDAY"
            | "THURSDAY"
            | "FRIDAY"
            | "SATURDAY"
            | "SUNDAY",
          enabled: !!restPeriod,
          startTime: restPeriod?.startTime || "12:00",
          endTime: restPeriod?.endTime || "13:00",
        };
      });

      editScheduleForm.reset({
        slotDuration: existingSchedule.slotDuration,
        breakBetween: existingSchedule.breakBetween,
        dailySchedules,
        restPeriods,
      });
    }
  }, [existingSchedule, scheduleViewMode, editScheduleForm]);

  // Form handling
  const form = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "THERAPIST",
      nationalId: "",
      address: "",
      dateOfBirth: "",
      biography: "",
      specialty: undefined,
      canTakeConsultations: true, // Default to true for therapists
      password: "",
    },
    mode: "onChange",
  });

  // Schedule form handling
  const scheduleForm = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      slotDuration: 60,
      breakBetween: 15,
      dailySchedules: [
        {
          day: "MONDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "TUESDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "WEDNESDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "THURSDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "FRIDAY",
          enabled: true,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "SATURDAY",
          enabled: false,
          startTime: "08:00",
          endTime: "18:00",
        },
        {
          day: "SUNDAY",
          enabled: false,
          startTime: "08:00",
          endTime: "18:00",
        },
      ],
      restPeriods: [
        {
          day: "MONDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "TUESDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "WEDNESDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "THURSDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "FRIDAY",
          enabled: true,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "SATURDAY",
          enabled: false,
          startTime: "12:00",
          endTime: "13:00",
        },
        {
          day: "SUNDAY",
          enabled: false,
          startTime: "12:00",
          endTime: "13:00",
        },
      ],
    },
  });

  // Watch for role changes to conditionally show specialty field
  const selectedRole = form.watch("role");
  const watchedFields = form.watch();

  // Generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("password", password);
  };

  // Handle form submission
  const onSubmit = (data: FormData) => {
    console.log("Form data received:", data);
    console.log("canTakeConsultations value:", data.canTakeConsultations);

    // Don't send specialty if user is not a therapist
    const userData: CreateUserData = {
      ...data,
      specialty: data.role === "THERAPIST" ? data.specialty : undefined,
      canTakeConsultations:
        data.role === "THERAPIST" ? data.canTakeConsultations : undefined,
    };

    console.log("User data to be sent:", userData);

    createUserMutation.mutate(userData, {
      onSuccess: (response) => {
        const createdUserData = {
          ...userData,
          password: data.password, // Keep the original password for display
        };

        setCreatedUser(createdUserData);

        // If creating a therapist, show schedule creation flow
        if (data.role === "THERAPIST") {
          setCreatedTherapistId(response.user.id); // Use response.user.id instead of response.profileId
          setShowScheduleCreation(true);
          setScheduleStep("confirm");
        } else {
          // For non-therapists, show credentials directly
          setShowCredentials(true);
        }

        setIsDialogOpen(false);
        form.reset();
      },
    });
  };

  // Modal handlers
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleResetPassword = (user: AdminUser) => {
    setSelectedUser(user);
    setResetPasswordModalOpen(true);
    // Clear search term to prevent any form interference
    setSearchTerm("");
  };

  // Schedule creation handlers
  const handleCreateSchedule = (scheduleData: ScheduleFormData) => {
    console.log("handleCreateSchedule called with data:", scheduleData);

    if (!createdTherapistId) {
      console.error("No createdTherapistId found");
      return;
    }

    console.log("Calling createScheduleMutation.mutate...");
    createScheduleMutation.mutate(
      { therapistId: createdTherapistId, scheduleData },
      {
        onSuccess: () => {
          console.log("Schedule creation successful, closing modal...");
          setShowScheduleCreation(false);
          setShowCredentials(true);
          scheduleForm.reset();
        },
        onError: (error) => {
          console.error("Error creating schedule:", error);
        },
      }
    );
  };

  const handleSkipSchedule = () => {
    setShowScheduleCreation(false);
    setShowCredentials(true);
  };

  const handleConfirmScheduleCreation = () => {
    setScheduleStep("create");
  };

  const handleBackToConfirmation = () => {
    setScheduleStep("confirm");
  };

  // Schedule update handler
  const handleUpdateSchedule = (scheduleData: ScheduleFormData) => {
    console.log("handleUpdateSchedule called with data:", scheduleData);
    console.log("selectedTherapistForSchedule:", selectedTherapistForSchedule);

    if (!selectedTherapistForSchedule) {
      console.error("No selectedTherapistForSchedule found");
      return;
    }

    console.log("Calling updateScheduleMutation.mutate...");
    updateScheduleMutation.mutate(
      { therapistId: selectedTherapistForSchedule.id, scheduleData },
      {
        onSuccess: () => {
          console.log("Schedule update successful, switching to view mode...");
          setScheduleViewMode("view");
        },
        onError: (error) => {
          console.error("Error updating schedule:", error);
        },
      }
    );
  };

  // Helper function to format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function to get day schedule from existing data
  const getDaySchedule = (dayValue: string): TimeSlot | undefined => {
    if (!existingSchedule) return undefined;

    return existingSchedule.timeSlots.find(
      (slot: TimeSlot) => slot.dayOfWeek === dayValue
    );
  };

  // Schedule management handlers
  const handleViewSchedule = (user: AdminUser) => {
    setSelectedTherapistForSchedule(user);
    setScheduleViewMode("view");
    setScheduleModalOpen(true);
  };

  const handleEditSchedule = (user: AdminUser) => {
    setSelectedTherapistForSchedule(user);
    setScheduleViewMode("edit");
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setSelectedTherapistForSchedule(null);
    setScheduleViewMode("view");
  };

  // Get specialty label
  const getSpecialtyLabel = (value: string | null) => {
    if (!value) return "-";
    return specialties.find((spec) => spec.value === value)?.label || value;
  };

  // Get role label and color
  const getRoleInfo = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Administrador", color: "bg-red-100 text-red-800" };
      case "THERAPIST":
        return { label: "Terapeuta", color: "bg-blue-100 text-blue-800" };
      case "PARENT":
        return { label: "Padre", color: "bg-green-100 text-green-800" };
      default:
        return { label: role, color: "bg-gray-100 text-gray-800" };
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Page reset is handled by debounce effect
  };

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
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

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-gray-600">
              Administra los terapeutas y personal del centro
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Completa la información para crear un nuevo usuario
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
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
                      {...form.register("firstName")}
                      className={`capitalize ${
                        form.formState.errors.firstName ? "border-red-500" : ""
                      }`}
                    />
                    <FieldError
                      error={form.formState.errors.firstName?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellidos *</Label>
                    <Input
                      {...form.register("lastName")}
                      className={`capitalize ${
                        form.formState.errors.lastName ? "border-red-500" : ""
                      }`}
                    />
                    <FieldError
                      error={form.formState.errors.lastName?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      type="email"
                      {...form.register("email")}
                      placeholder="usuario@vivirfeliz.bo"
                      className={
                        form.formState.errors.email ? "border-red-500" : ""
                      }
                    />
                    <FieldError error={form.formState.errors.email?.message} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      {...form.register("phone")}
                      placeholder="+591-7-123-4567"
                      className={
                        form.formState.errors.phone ? "border-red-500" : ""
                      }
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
                    <FieldError
                      error={form.formState.errors.nationalId?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                    <Input type="date" {...form.register("dateOfBirth")} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      {...form.register("address")}
                      className={
                        form.formState.errors.address ? "border-red-500" : ""
                      }
                    />
                    <FieldError
                      error={form.formState.errors.address?.message}
                    />
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
                        // Reset specialty and canTakeConsultations when role changes
                        if (value !== "THERAPIST") {
                          form.setValue("specialty", undefined);
                          form.setValue("canTakeConsultations", undefined);
                        } else {
                          form.setValue("canTakeConsultations", true);
                        }
                      }}
                      value={watchedFields.role}
                    >
                      <SelectTrigger
                        className={
                          form.formState.errors.role ? "border-red-500" : ""
                        }
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
                            form.formState.errors.specialty
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Selecciona una especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem
                              key={specialty.value}
                              value={specialty.value}
                            >
                              {specialty.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError
                        error={form.formState.errors.specialty?.message}
                      />
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
                          form.formState.errors.biography
                            ? "border-red-500"
                            : ""
                        }
                      />
                      <FieldError
                        error={form.formState.errors.biography?.message}
                      />
                    </div>
                  )}

                  {selectedRole === "THERAPIST" && (
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="canTakeConsultations"
                          checked={form.watch("canTakeConsultations") || false}
                          onChange={(e) =>
                            form.setValue(
                              "canTakeConsultations",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300"
                        />
                        <Label
                          htmlFor="canTakeConsultations"
                          className="text-sm font-medium"
                        >
                          Puede tomar consultas
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Si está desactivado, el terapeuta no aparecerá en el
                        calendario de consultas para nuevos pacientes
                      </p>
                    </div>
                  )}

                  {/* Credenciales de Acceso */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Credenciales de Acceso
                    </h3>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...form.register("password")}
                          className={
                            form.formState.errors.password
                              ? "border-red-500"
                              : ""
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePassword}
                      >
                        Generar
                      </Button>
                    </div>
                    <FieldError
                      error={form.formState.errors.password?.message}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={
                      createUserMutation.isPending || !form.formState.isValid
                    }
                  >
                    {createUserMutation.isPending
                      ? "Creando..."
                      : "Crear Usuario"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Credentials Display Dialog */}
        <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Usuario Creado Exitosamente</DialogTitle>
              <DialogDescription>
                Guarde estas credenciales de forma segura. Esta información no
                se volverá a mostrar.
              </DialogDescription>
            </DialogHeader>
            {createdUser && (
              <CredentialCard
                user={createdUser}
                onClose={() => setShowCredentials(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Schedule Creation Dialog */}
        <Dialog
          open={showScheduleCreation}
          onOpenChange={setShowScheduleCreation}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {scheduleStep === "confirm"
                  ? "Configurar Horario"
                  : "Horario del Terapeuta"}
              </DialogTitle>
              <DialogDescription>
                {scheduleStep === "confirm"
                  ? "El terapeuta ha sido creado exitosamente. ¿Deseas configurar su horario de atención ahora?"
                  : "Configura el horario de trabajo del terapeuta"}
              </DialogDescription>
            </DialogHeader>

            {scheduleStep === "confirm" ? (
              <div className="space-y-6 py-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Configuración de Horario
                      </h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Configura los días y horarios de trabajo del terapeuta
                        para que los pacientes puedan agendar citas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium">Configuración predeterminada:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Lunes a Viernes: 8:00 AM - 6:00 PM</li>
                    <li>• Sábado y Domingo: No disponible</li>
                    <li>• Duración de citas: 60 minutos</li>
                    <li>• Descanso entre citas: 15 minutos</li>
                    <li>• Tiempo de descanso: 12:00 PM - 1:00 PM</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    Podrás personalizar horarios específicos para cada día,
                    incluyendo períodos de descanso, en el siguiente paso.
                  </p>
                </div>
              </div>
            ) : (
              <form
                id="schedule-form"
                onSubmit={scheduleForm.handleSubmit(handleCreateSchedule)}
                className="space-y-6 py-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slotDuration">
                      Duración de Cita (minutos)
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        scheduleForm.setValue("slotDuration", parseInt(value))
                      }
                      value={scheduleForm.watch("slotDuration").toString()}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                        <SelectItem value="120">120 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="breakBetween">
                      Descanso entre Citas (minutos)
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        scheduleForm.setValue("breakBetween", parseInt(value))
                      }
                      value={scheduleForm.watch("breakBetween").toString()}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin descanso</SelectItem>
                        <SelectItem value="10">10 minutos</SelectItem>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    Horarios por Día
                  </Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Configura los horarios específicos para cada día de la
                    semana
                  </p>

                  <div className="space-y-3">
                    {daysOfWeek.map((day) => {
                      const daySchedule = scheduleForm
                        .watch("dailySchedules")
                        .find((s) => s.day === day.value);
                      const isEnabled = daySchedule?.enabled || false;

                      return (
                        <div
                          key={day.value}
                          className="flex items-center space-x-4 p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-2 min-w-[100px]">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                const currentSchedules =
                                  scheduleForm.watch("dailySchedules");
                                const updatedSchedules = currentSchedules.map(
                                  (schedule) =>
                                    schedule.day === day.value
                                      ? {
                                          ...schedule,
                                          enabled: e.target.checked,
                                        }
                                      : schedule
                                );

                                // If day doesn't exist, add it
                                if (
                                  !currentSchedules.find(
                                    (s) => s.day === day.value
                                  )
                                ) {
                                  updatedSchedules.push({
                                    day: day.value as
                                      | "MONDAY"
                                      | "TUESDAY"
                                      | "WEDNESDAY"
                                      | "THURSDAY"
                                      | "FRIDAY"
                                      | "SATURDAY"
                                      | "SUNDAY",
                                    enabled: e.target.checked,
                                    startTime: "08:00",
                                    endTime: "18:00",
                                  });
                                }

                                scheduleForm.setValue(
                                  "dailySchedules",
                                  updatedSchedules
                                );
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium">
                              {day.label}
                            </span>
                          </div>

                          {isEnabled && (
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Label className="text-xs text-gray-600">
                                    Desde:
                                  </Label>
                                  <Input
                                    type="time"
                                    value={daySchedule?.startTime || "08:00"}
                                    onChange={(e) => {
                                      const currentSchedules =
                                        scheduleForm.watch("dailySchedules");
                                      const updatedSchedules =
                                        currentSchedules.map((schedule) =>
                                          schedule.day === day.value
                                            ? {
                                                ...schedule,
                                                startTime: e.target.value,
                                              }
                                            : schedule
                                        );
                                      scheduleForm.setValue(
                                        "dailySchedules",
                                        updatedSchedules
                                      );
                                    }}
                                    className="w-32 text-sm"
                                  />
                                </div>

                                <div className="flex items-center space-x-1">
                                  <Label className="text-xs text-gray-600">
                                    Hasta:
                                  </Label>
                                  <Input
                                    type="time"
                                    value={daySchedule?.endTime || "18:00"}
                                    onChange={(e) => {
                                      const currentSchedules =
                                        scheduleForm.watch("dailySchedules");
                                      const updatedSchedules =
                                        currentSchedules.map((schedule) =>
                                          schedule.day === day.value
                                            ? {
                                                ...schedule,
                                                endTime: e.target.value,
                                              }
                                            : schedule
                                        );
                                      scheduleForm.setValue(
                                        "dailySchedules",
                                        updatedSchedules
                                      );
                                    }}
                                    className="w-32 text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {!isEnabled && (
                            <div className="flex-1 text-sm text-gray-400">
                              No disponible
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <FieldError
                    error={
                      scheduleForm.formState.errors.dailySchedules?.message
                    }
                  />
                </div>

                {/* Rest Periods Configuration */}
                <div>
                  <Label className="text-base font-medium">
                    Períodos de Descanso
                  </Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Configura los períodos de descanso para cada día de la
                    semana
                  </p>

                  <div className="space-y-3">
                    {daysOfWeek.map((day) => {
                      const restPeriod = scheduleForm
                        .watch("restPeriods")
                        .find((r) => r.day === day.value);
                      const isEnabled = restPeriod?.enabled || false;

                      return (
                        <div
                          key={`rest-${day.value}`}
                          className="flex items-center space-x-4 p-3 border rounded-lg bg-orange-50"
                        >
                          <div className="flex items-center space-x-2 min-w-[100px]">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                const currentRestPeriods =
                                  scheduleForm.watch("restPeriods");
                                const updatedRestPeriods =
                                  currentRestPeriods.map((period) =>
                                    period.day === day.value
                                      ? {
                                          ...period,
                                          enabled: e.target.checked,
                                        }
                                      : period
                                  );

                                // If day doesn't exist, add it
                                if (
                                  !currentRestPeriods.find(
                                    (r) => r.day === day.value
                                  )
                                ) {
                                  updatedRestPeriods.push({
                                    day: day.value as
                                      | "MONDAY"
                                      | "TUESDAY"
                                      | "WEDNESDAY"
                                      | "THURSDAY"
                                      | "FRIDAY"
                                      | "SATURDAY"
                                      | "SUNDAY",
                                    enabled: e.target.checked,
                                    startTime: "12:00",
                                    endTime: "13:00",
                                  });
                                }

                                scheduleForm.setValue(
                                  "restPeriods",
                                  updatedRestPeriods
                                );
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium">
                              {day.label}
                            </span>
                          </div>

                          {isEnabled && (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Label className="text-xs text-gray-600">
                                  Desde:
                                </Label>
                                <Input
                                  type="time"
                                  value={restPeriod?.startTime || "12:00"}
                                  onChange={(e) => {
                                    const currentRestPeriods =
                                      scheduleForm.watch("restPeriods");
                                    const updatedRestPeriods =
                                      currentRestPeriods.map((period) =>
                                        period.day === day.value
                                          ? {
                                              ...period,
                                              startTime: e.target.value,
                                            }
                                          : period
                                      );
                                    scheduleForm.setValue(
                                      "restPeriods",
                                      updatedRestPeriods
                                    );
                                  }}
                                  className="w-32 text-sm"
                                />
                              </div>

                              <div className="flex items-center space-x-1">
                                <Label className="text-xs text-gray-600">
                                  Hasta:
                                </Label>
                                <Input
                                  type="time"
                                  value={restPeriod?.endTime || "13:00"}
                                  onChange={(e) => {
                                    const currentRestPeriods =
                                      scheduleForm.watch("restPeriods");
                                    const updatedRestPeriods =
                                      currentRestPeriods.map((period) =>
                                        period.day === day.value
                                          ? {
                                              ...period,
                                              endTime: e.target.value,
                                            }
                                          : period
                                      );
                                    scheduleForm.setValue(
                                      "restPeriods",
                                      updatedRestPeriods
                                    );
                                  }}
                                  className="w-32 text-sm"
                                />
                              </div>
                            </div>
                          )}

                          {!isEnabled && (
                            <div className="flex-1 text-sm text-gray-400">
                              Sin descanso
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </form>
            )}

            <DialogFooter>
              {scheduleStep === "confirm" ? (
                <>
                  <Button variant="outline" onClick={handleSkipSchedule}>
                    Configurar Después
                  </Button>
                  <Button
                    onClick={handleConfirmScheduleCreation}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Configurar Ahora
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleBackToConfirmation}>
                    Atrás
                  </Button>
                  <Button variant="outline" onClick={handleSkipSchedule}>
                    Omitir
                  </Button>
                  <Button
                    type="submit"
                    form="schedule-form"
                    disabled={createScheduleMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createScheduleMutation.isPending
                      ? "Creando..."
                      : "Crear Horario"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Usuarios
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pagination?.totalUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Personal registrado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios Activos
              </CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                En servicio activo
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terapeutas</CardTitle>
              <div className="h-4 w-4 bg-blue-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "THERAPIST").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Personal terapéutico
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administradores
              </CardTitle>
              <div className="h-4 w-4 bg-red-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "ADMIN").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Personal administrativo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Usuarios */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Usuarios</CardTitle>
              <div className="flex items-center space-x-2">
                <Select
                  value={roleFilter}
                  onValueChange={handleRoleFilterChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="SUPER_ADMIN">
                      Super Administradores
                    </SelectItem>
                    <SelectItem value="ADMIN">Administradores</SelectItem>
                    <SelectItem value="THERAPIST">Terapeutas</SelectItem>
                    <SelectItem value="PARENT">Padres</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <form onSubmit={(e) => e.preventDefault()}>
                    <Input
                      placeholder="Buscar usuarios..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8 w-64"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      name="user-search-input"
                      id="user-search-input"
                      type="search"
                      data-form-type="search"
                      data-lpignore="true"
                    />
                  </form>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Error al cargar usuarios
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const roleInfo = getRoleInfo(user.role);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={roleInfo.color}>
                              {roleInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline">
                                {getSpecialtyLabel(user.specialty)}
                              </Badge>
                              {user.role === "THERAPIST" && (
                                <div className="text-xs">
                                  <Badge
                                    variant={
                                      user.canTakeConsultations
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={
                                      user.canTakeConsultations
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-600"
                                    }
                                  >
                                    {user.canTakeConsultations
                                      ? "Acepta consultas"
                                      : "No acepta consultas"}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{user.phone}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {user.active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  {user.role === "THERAPIST" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleViewSchedule(user)}
                                      >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Ver Horario
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleEditSchedule(user)}
                                      >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Editar Horario
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleResetPassword(user)}
                                  >
                                    <Key className="w-4 h-4 mr-2" />
                                    Restablecer Contraseña
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                      {Math.min(currentPage * pageSize, pagination.totalUsers)}{" "}
                      de {pagination.totalUsers} usuarios
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPreviousPage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>

                      <div className="flex items-center space-x-1">
                        {/* First page */}
                        {currentPage > 3 && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                            >
                              1
                            </Button>
                            {currentPage > 4 && (
                              <span className="px-2 text-muted-foreground">
                                ...
                              </span>
                            )}
                          </>
                        )}

                        {/* Pages around current page */}
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            const page = Math.max(1, currentPage - 2) + i;
                            if (page > pagination.totalPages) return null;
                            return (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            );
                          }
                        )}

                        {/* Last page */}
                        {currentPage < pagination.totalPages - 2 && (
                          <>
                            {currentPage < pagination.totalPages - 3 && (
                              <span className="px-2 text-muted-foreground">
                                ...
                              </span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage(pagination.totalPages)
                              }
                            >
                              {pagination.totalPages}
                            </Button>
                          </>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      <UserEditModal
        user={selectedUser}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      {/* Delete User Modal */}
      <UserDeleteModal
        user={selectedUser}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />

      {/* Reset Password Modal */}
      <UserPasswordResetModal
        user={selectedUser}
        open={resetPasswordModalOpen}
        onOpenChange={setResetPasswordModalOpen}
      />

      {/* Schedule Management Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {scheduleViewMode === "view"
                ? "Horario del Terapeuta"
                : "Editar Horario"}
            </DialogTitle>
            <DialogDescription>
              {selectedTherapistForSchedule && (
                <>
                  {scheduleViewMode === "view"
                    ? `Visualiza el horario de ${selectedTherapistForSchedule.firstName} ${selectedTherapistForSchedule.lastName}`
                    : `Modifica el horario de trabajo de ${selectedTherapistForSchedule.firstName} ${selectedTherapistForSchedule.lastName}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedTherapistForSchedule && (
            <div className="space-y-6 py-4">
              {/* Therapist Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">
                      {selectedTherapistForSchedule.firstName}{" "}
                      {selectedTherapistForSchedule.lastName}
                    </h4>
                    <p className="text-sm text-blue-800">
                      {getSpecialtyLabel(
                        selectedTherapistForSchedule.specialty
                      )}{" "}
                      • {selectedTherapistForSchedule.email}
                    </p>
                  </div>
                  {scheduleViewMode === "view" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScheduleViewMode("edit")}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>

              {scheduleViewMode === "view" ? (
                /* Schedule View Mode */
                <div className="space-y-4">
                  <h5 className="font-medium">Horario de Trabajo</h5>

                  {isLoadingSchedule ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">
                        Cargando horario...
                      </span>
                    </div>
                  ) : scheduleError ? (
                    <div className="text-center py-8 text-red-600">
                      <p>Error al cargar el horario</p>
                    </div>
                  ) : !existingSchedule ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay horario configurado para este terapeuta</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScheduleViewMode("edit")}
                        className="mt-4"
                      >
                        Crear Horario
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Show actual schedule data */}
                      <div className="space-y-3">
                        {daysOfWeek.map((day) => {
                          const daySchedule = getDaySchedule(day.value);
                          return (
                            <div
                              key={day.value}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <span className="font-medium text-sm">
                                {day.label}
                              </span>
                              <div className="text-sm text-gray-600">
                                {daySchedule ? (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    {formatTime(daySchedule.startTime)} -{" "}
                                    {formatTime(daySchedule.endTime)}
                                  </span>
                                ) : (
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                    No disponible
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {existingSchedule.slotDuration}
                          </div>
                          <div className="text-sm text-gray-600">
                            min por cita
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {existingSchedule.breakBetween}
                          </div>
                          <div className="text-sm text-gray-600">
                            min de descanso
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Schedule Edit Mode */
                <form
                  id="edit-schedule-form"
                  onSubmit={editScheduleForm.handleSubmit(
                    handleUpdateSchedule,
                    (errors) => {
                      console.log("Form validation errors:", errors);
                    }
                  )}
                  className="space-y-6"
                >
                  {isLoadingSchedule ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">
                        Cargando datos del horario...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="slotDuration">
                            Duración de Cita (minutos)
                          </Label>
                          <Select
                            onValueChange={(value) =>
                              editScheduleForm.setValue(
                                "slotDuration",
                                parseInt(value)
                              )
                            }
                            value={editScheduleForm
                              .watch("slotDuration")
                              .toString()}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 minutos</SelectItem>
                              <SelectItem value="45">45 minutos</SelectItem>
                              <SelectItem value="60">60 minutos</SelectItem>
                              <SelectItem value="90">90 minutos</SelectItem>
                              <SelectItem value="120">120 minutos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="breakBetween">
                            Descanso entre Citas (minutos)
                          </Label>
                          <Select
                            onValueChange={(value) =>
                              editScheduleForm.setValue(
                                "breakBetween",
                                parseInt(value)
                              )
                            }
                            value={editScheduleForm
                              .watch("breakBetween")
                              .toString()}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Sin descanso</SelectItem>
                              <SelectItem value="10">10 minutos</SelectItem>
                              <SelectItem value="15">15 minutos</SelectItem>
                              <SelectItem value="30">30 minutos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium">
                          Horarios por Día
                        </Label>
                        <p className="text-sm text-gray-600 mb-4">
                          Configura los horarios específicos para cada día de la
                          semana
                        </p>

                        <div className="space-y-3">
                          {daysOfWeek.map((day) => {
                            const daySchedule = editScheduleForm
                              .watch("dailySchedules")
                              .find((s) => s.day === day.value);
                            const isEnabled = daySchedule?.enabled || false;

                            return (
                              <div
                                key={day.value}
                                className="flex items-center space-x-4 p-3 border rounded-lg"
                              >
                                <div className="flex items-center space-x-2 min-w-[100px]">
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => {
                                      const currentSchedules =
                                        editScheduleForm.watch(
                                          "dailySchedules"
                                        );
                                      const updatedSchedules =
                                        currentSchedules.map((schedule) =>
                                          schedule.day === day.value
                                            ? {
                                                ...schedule,
                                                enabled: e.target.checked,
                                              }
                                            : schedule
                                        );

                                      editScheduleForm.setValue(
                                        "dailySchedules",
                                        updatedSchedules
                                      );
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <span className="text-sm font-medium">
                                    {day.label}
                                  </span>
                                </div>

                                {isEnabled && (
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center space-x-2">
                                      <div className="flex items-center space-x-1">
                                        <Label className="text-xs text-gray-600">
                                          Desde:
                                        </Label>
                                        <Input
                                          type="time"
                                          value={
                                            daySchedule?.startTime || "08:00"
                                          }
                                          onChange={(e) => {
                                            const currentSchedules =
                                              editScheduleForm.watch(
                                                "dailySchedules"
                                              );
                                            const updatedSchedules =
                                              currentSchedules.map(
                                                (schedule) =>
                                                  schedule.day === day.value
                                                    ? {
                                                        ...schedule,
                                                        startTime:
                                                          e.target.value,
                                                      }
                                                    : schedule
                                              );
                                            editScheduleForm.setValue(
                                              "dailySchedules",
                                              updatedSchedules
                                            );
                                          }}
                                          className="w-32 text-sm"
                                        />
                                      </div>

                                      <div className="flex items-center space-x-1">
                                        <Label className="text-xs text-gray-600">
                                          Hasta:
                                        </Label>
                                        <Input
                                          type="time"
                                          value={
                                            daySchedule?.endTime || "18:00"
                                          }
                                          onChange={(e) => {
                                            const currentSchedules =
                                              editScheduleForm.watch(
                                                "dailySchedules"
                                              );
                                            const updatedSchedules =
                                              currentSchedules.map(
                                                (schedule) =>
                                                  schedule.day === day.value
                                                    ? {
                                                        ...schedule,
                                                        endTime: e.target.value,
                                                      }
                                                    : schedule
                                              );
                                            editScheduleForm.setValue(
                                              "dailySchedules",
                                              updatedSchedules
                                            );
                                          }}
                                          className="w-32 text-sm"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {!isEnabled && (
                                  <div className="flex-1 text-sm text-gray-400">
                                    No disponible
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <FieldError
                          error={
                            editScheduleForm.formState.errors.dailySchedules
                              ?.message
                          }
                        />
                      </div>

                      {/* Rest Periods Configuration for Edit Form */}
                      <div>
                        <Label className="text-base font-medium">
                          Períodos de Descanso
                        </Label>
                        <p className="text-sm text-gray-600 mb-4">
                          Configura los períodos de descanso para cada día de la
                          semana
                        </p>

                        <div className="space-y-3">
                          {daysOfWeek.map((day) => {
                            const restPeriod = editScheduleForm
                              .watch("restPeriods")
                              .find((r) => r.day === day.value);
                            const isEnabled = restPeriod?.enabled || false;

                            return (
                              <div
                                key={`edit-rest-${day.value}`}
                                className="flex items-center space-x-4 p-3 border rounded-lg bg-orange-50"
                              >
                                <div className="flex items-center space-x-2 min-w-[100px]">
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => {
                                      const currentRestPeriods =
                                        editScheduleForm.watch("restPeriods");
                                      const updatedRestPeriods =
                                        currentRestPeriods.map((period) =>
                                          period.day === day.value
                                            ? {
                                                ...period,
                                                enabled: e.target.checked,
                                              }
                                            : period
                                        );

                                      editScheduleForm.setValue(
                                        "restPeriods",
                                        updatedRestPeriods
                                      );
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <span className="text-sm font-medium">
                                    {day.label}
                                  </span>
                                </div>

                                {isEnabled && (
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                      <Label className="text-xs text-gray-600">
                                        Desde:
                                      </Label>
                                      <Input
                                        type="time"
                                        value={restPeriod?.startTime || "12:00"}
                                        onChange={(e) => {
                                          const currentRestPeriods =
                                            editScheduleForm.watch(
                                              "restPeriods"
                                            );
                                          const updatedRestPeriods =
                                            currentRestPeriods.map((period) =>
                                              period.day === day.value
                                                ? {
                                                    ...period,
                                                    startTime: e.target.value,
                                                  }
                                                : period
                                            );
                                          editScheduleForm.setValue(
                                            "restPeriods",
                                            updatedRestPeriods
                                          );
                                        }}
                                        className="w-32 text-sm"
                                      />
                                    </div>

                                    <div className="flex items-center space-x-1">
                                      <Label className="text-xs text-gray-600">
                                        Hasta:
                                      </Label>
                                      <Input
                                        type="time"
                                        value={restPeriod?.endTime || "13:00"}
                                        onChange={(e) => {
                                          const currentRestPeriods =
                                            editScheduleForm.watch(
                                              "restPeriods"
                                            );
                                          const updatedRestPeriods =
                                            currentRestPeriods.map((period) =>
                                              period.day === day.value
                                                ? {
                                                    ...period,
                                                    endTime: e.target.value,
                                                  }
                                                : period
                                            );
                                          editScheduleForm.setValue(
                                            "restPeriods",
                                            updatedRestPeriods
                                          );
                                        }}
                                        className="w-32 text-sm"
                                      />
                                    </div>
                                  </div>
                                )}

                                {!isEnabled && (
                                  <div className="flex-1 text-sm text-gray-400">
                                    Sin descanso
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          )}

          <DialogFooter>
            {scheduleViewMode === "view" ? (
              <Button variant="outline" onClick={handleCloseScheduleModal}>
                Cerrar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setScheduleViewMode("view")}
                  disabled={updateScheduleMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="edit-schedule-form"
                  disabled={
                    updateScheduleMutation.isPending || isLoadingSchedule
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    console.log("Submit button clicked");
                    console.log("Form state:", editScheduleForm.formState);
                    console.log("Form values:", editScheduleForm.getValues());
                  }}
                >
                  {updateScheduleMutation.isPending
                    ? "Guardando..."
                    : "Guardar Cambios"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
