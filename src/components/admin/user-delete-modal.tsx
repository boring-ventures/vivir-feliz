"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useDeleteUser, type AdminUser } from "@/hooks/use-admin-users";

interface UserDeleteModalProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDeleteModal({
  user,
  open,
  onOpenChange,
}: UserDeleteModalProps) {
  const deleteUserMutation = useDeleteUser();

  const handleDelete = () => {
    if (!user) return;

    deleteUserMutation.mutate(user.userId, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription className="pt-2">
            ¿Estás seguro de que deseas eliminar al usuario{" "}
            <span className="font-semibold">
              {user.firstName} {user.lastName}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>Esta acción no se puede deshacer.</strong> Se eliminará
              permanentemente:
            </p>
            <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
              <li>Toda la información del usuario</li>
              <li>Su cuenta de acceso al sistema</li>
              <li>Historial de actividades relacionadas</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteUserMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending
              ? "Eliminando..."
              : "Eliminar Usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
