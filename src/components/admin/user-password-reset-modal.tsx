"use client";

import { useState } from "react";
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
import { Eye, EyeOff, Key, RefreshCw } from "lucide-react";
import { useResetUserPassword, type AdminUser } from "@/hooks/use-admin-users";
import { CredentialCard } from "@/components/admin/credential-card";

interface UserPasswordResetModalProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserPasswordResetModal({
  user,
  open,
  onOpenChange,
}: UserPasswordResetModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [resetData, setResetData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    specialty?: string;
  } | null>(null);

  const resetPasswordMutation = useResetUserPassword();

  // Generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handleReset = () => {
    if (!user || !newPassword) return;

    resetPasswordMutation.mutate(
      { userId: user.userId, newPassword },
      {
        onSuccess: () => {
          // Prepare data for credentials display
          setResetData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            password: newPassword,
            role: user.role,
            specialty: user.specialty || undefined,
          });
          setShowCredentials(true);
          setNewPassword("");
        },
      }
    );
  };

  const handleClose = () => {
    setNewPassword("");
    setShowPassword(false);
    setShowCredentials(false);
    setResetData(null);
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open && !showCredentials} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Restablecer Contraseña
            </DialogTitle>
            <DialogDescription>
              Genera una nueva contraseña para{" "}
              <span className="font-semibold">
                {user.firstName} {user.lastName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> El usuario deberá usar esta nueva
                contraseña para acceder al sistema. Guarda las credenciales de
                forma segura.
              </p>
            </div>

            <div>
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa o genera una contraseña"
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
                  className="shrink-0"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Generar
                </Button>
              </div>
              {newPassword && (
                <p className="text-sm text-gray-600 mt-1">
                  Longitud: {newPassword.length} caracteres
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleReset}
              disabled={!newPassword || resetPasswordMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {resetPasswordMutation.isPending
                ? "Restableciendo..."
                : "Restablecer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Display Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contraseña Restablecida</DialogTitle>
            <DialogDescription>
              La contraseña ha sido restablecida exitosamente. Guarda estas
              credenciales.
            </DialogDescription>
          </DialogHeader>
          {resetData && (
            <CredentialCard user={resetData} onClose={handleClose} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
