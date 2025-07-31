import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// Types for the user management
export type AdminUser = {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "THERAPIST" | "PARENT";
  nationalId: string | null;
  address: string | null;
  dateOfBirth: Date | null;
  biography: string | null;
  specialty:
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
    | null;
  canTakeConsultations: boolean | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "ADMIN" | "THERAPIST" | "PARENT";
  nationalId?: string;
  address?: string;
  dateOfBirth?: string;
  biography?: string;
  specialty?:
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
    | "BEHAVIORAL_THERAPIST";
  canTakeConsultations?: boolean | null;
  password: string;
};

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: "SUPER_ADMIN" | "ADMIN" | "THERAPIST" | "PARENT";
  nationalId?: string;
  address?: string;
  dateOfBirth?: string;
  biography?: string;
  specialty?:
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
    | null;
  canTakeConsultations?: boolean | null;
  active?: boolean;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type UsersResponse = {
  users: AdminUser[];
  pagination: PaginationInfo;
};

// Fetch all users with pagination
export function useAdminUsers(
  role?: string,
  page = 1,
  limit = 10,
  search = ""
) {
  return useQuery({
    queryKey: ["admin-users", role, page, limit, search],
    queryFn: async (): Promise<UsersResponse> => {
      const params = new URLSearchParams();
      if (role && role !== "all") {
        params.append("role", role);
      }
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      return data;
    },
  });
}

// Create new user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Edit user
export function useEditUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: string;
      userData: UpdateUserData;
    }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Reset user password
export function useResetUserPassword() {
  return useMutation({
    mutationFn: async ({
      userId,
      newPassword,
    }: {
      userId: string;
      newPassword: string;
    }) => {
      const response = await fetch(
        `/api/admin/users/${userId}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset password");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contraseña restablecida",
        description: "La contraseña ha sido restablecida exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update user status
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      active,
    }: {
      userId: string;
      active: boolean;
    }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Estado actualizado",
        description: "El estado del usuario ha sido actualizado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
