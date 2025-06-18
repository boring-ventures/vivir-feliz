"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

export function AccountSection() {
  const { profile, user } = useCurrentUser();

  if (!profile || !user) return null;

  // Format user creation date
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "PARENT":
        return "Padre/Madre";
      case "THERAPIST":
        return "Terapeuta";
      default:
        return "Usuario";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Cuenta</CardTitle>
        <CardDescription>Detalles sobre tu cuenta y acceso.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Estado</p>
            <div>
              {profile.active ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                >
                  Activo
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200"
                >
                  Inactivo
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Rol</p>
            <p className="text-sm text-muted-foreground">
              {getRoleDisplay(profile.role as string)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Miembro desde</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>{createdAt}</span>
            </div>
          </div>

          {profile.phone && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Teléfono</p>
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium">Notificaciones WhatsApp</p>
            <div>
              {profile.acceptWhatsApp ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                >
                  Activadas
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200"
                >
                  Desactivadas
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
