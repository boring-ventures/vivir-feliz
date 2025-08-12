"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Key,
  MoreHorizontal,
  Shield,
  Users,
  Activity,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoleGuard } from "@/components/auth/role-guard";
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
    .email("Email debe ser válido")
    .min(5, "Email debe tener al menos 5 caracteres")
    .max(100, "Email no puede exceder 100 caracteres"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "THERAPIST", "PARENT"]),
  specialty: z.string().optional(),
  phone: z
    .string()
    .min(7, "Teléfono debe tener al menos 7 dígitos")
    .max(15, "Teléfono no puede exceder 15 dígitos")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Solo se permiten números y caracteres de teléfono"
    ),
  canTakeConsultations: z.boolean().default(false),
});

type FormData = z.infer<typeof createUserSchema>;

export default function SuperAdminUsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Fix: Pass proper parameters to useAdminUsers hook
  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useAdminUsers(
    roleFilter === "all" ? undefined : roleFilter,
    1,
    1000,
    searchTerm
  );

  // Debug logging to understand what's happening
  console.log("Super Admin Users Debug:", {
    roleFilter,
    searchTerm,
    usersResponse,
    usersCount: usersResponse?.users?.length || 0,
    userRoles:
      usersResponse?.users?.map((u) => ({
        id: u.id,
        role: u.role,
        name: `${u.firstName} ${u.lastName}`,
      })) || [],
  });

  const createUserMutation = useCreateUser();

  const form = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "PARENT",
      specialty: "",
      phone: "",
      canTakeConsultations: false,
    },
  });

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
  };

  const onSubmit = (data: FormData) => {
    const userData: CreateUserData = {
      ...data,
      password: generatedPassword || "tempPassword123!",
      specialty: data.specialty as CreateUserData["specialty"],
    };

    createUserMutation.mutate(userData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        form.reset();
        setGeneratedPassword("");
        refetch();
      },
    });
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: AdminUser) => {
    setSelectedUser(user);
    setIsPasswordResetDialogOpen(true);
  };

  const getSpecialtyLabel = (value: string | null) => {
    if (!value) return "Sin especialidad";
    const specialty = specialties.find((s) => s.value === value);
    return specialty ? specialty.label : value;
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          label: "Super Administrador",
          color: "bg-purple-100 text-purple-800",
        };
      case "ADMIN":
        return { label: "Administrador", color: "bg-blue-100 text-blue-800" };
      case "THERAPIST":
        return { label: "Terapeuta", color: "bg-green-100 text-green-800" };
      case "PARENT":
        return { label: "Padre/Madre", color: "bg-orange-100 text-orange-800" };
      default:
        return { label: role, color: "bg-gray-100 text-gray-800" };
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
  };

  const FieldError = ({ error }: { error?: string }) => {
    return error ? <p className="text-sm text-red-600 mt-1">{error}</p> : null;
  };

  const users = usersResponse?.users || [];
  const filteredUsers = users; // API handles filtering

  const roleStats = {
    SUPER_ADMIN: users.filter((u) => u.role === "SUPER_ADMIN").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    THERAPIST: users.filter((u) => u.role === "THERAPIST").length,
    PARENT: users.filter((u) => u.role === "PARENT").length,
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <main className="p-6">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
      <main className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          </div>
          <p className="text-muted-foreground">
            Administración completa de usuarios del sistema - Super Admin
          </p>
        </div>

        {/* Role Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Super Admins</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {roleStats.SUPER_ADMIN}
                  </p>
                </div>
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Administradores
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {roleStats.ADMIN}
                  </p>
                </div>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terapeutas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {roleStats.THERAPIST}
                  </p>
                </div>
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Padres/Madres</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {roleStats.PARENT}
                  </p>
                </div>
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">
                  Super Administradores
                </SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
                <SelectItem value="THERAPIST">Terapeutas</SelectItem>
                <SelectItem value="PARENT">Padres/Madres</SelectItem>
              </SelectContent>
            </Select>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Complete la información del nuevo usuario del sistema.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        {...form.register("firstName")}
                        placeholder="Nombre"
                        className="capitalize"
                      />
                      <FieldError
                        error={form.formState.errors.firstName?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellidos</Label>
                      <Input
                        id="lastName"
                        {...form.register("lastName")}
                        placeholder="Apellidos"
                        className="capitalize"
                      />
                      <FieldError
                        error={form.formState.errors.lastName?.message}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="email@ejemplo.com"
                    />
                    <FieldError error={form.formState.errors.email?.message} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="+591 70000000"
                    />
                    <FieldError error={form.formState.errors.phone?.message} />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={form.watch("role")}
                      onValueChange={(
                        value: "SUPER_ADMIN" | "ADMIN" | "THERAPIST" | "PARENT"
                      ) => form.setValue("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPER_ADMIN">
                          Super Administrador
                        </SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="THERAPIST">Terapeuta</SelectItem>
                        <SelectItem value="PARENT">Padre/Madre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError error={form.formState.errors.role?.message} />
                  </div>
                  {form.watch("role") === "THERAPIST" && (
                    <div>
                      <Label htmlFor="specialty">Especialidad</Label>
                      <Select
                        value={form.watch("specialty") || ""}
                        onValueChange={(value) =>
                          form.setValue("specialty", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar especialidad" />
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
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="canTakeConsultations"
                      {...form.register("canTakeConsultations")}
                      className="rounded"
                    />
                    <Label htmlFor="canTakeConsultations">
                      Puede tomar consultas
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={generatedPassword}
                          onChange={(e) => setGeneratedPassword(e.target.value)}
                          placeholder="Contraseña generada"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePassword}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createUserMutation.isPending}
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
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-muted-foreground">
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleInfo.color}>
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === "THERAPIST" && user.specialty
                            ? getSpecialtyLabel(user.specialty)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Activo</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResetPassword(user)}
                              >
                                <Key className="h-4 w-4 mr-2" />
                                Resetear Contraseña
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        {selectedUser && (
          <>
            <UserEditModal
              user={selectedUser}
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
            />
            <UserDeleteModal
              user={selectedUser}
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            />
            <UserPasswordResetModal
              user={selectedUser}
              open={isPasswordResetDialogOpen}
              onOpenChange={setIsPasswordResetDialogOpen}
            />
          </>
        )}
      </main>
    </RoleGuard>
  );
}
