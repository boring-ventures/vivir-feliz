"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, Settings } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, profile, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">
            No se pudo cargar la información del usuario
          </p>
        </div>
      </div>
    );
  }

  const getRoleSpecificContent = () => {
    switch (profile.role) {
      case "ADMIN":
        return {
          title: "Panel de Administración",
          description: "Gestiona usuarios, terapeutas y consultas",
          links: [
            { href: "/admin/users", label: "Gestionar Usuarios", icon: Users },
            {
              href: "/admin/therapists",
              label: "Gestionar Terapeutas",
              icon: Users,
            },
            {
              href: "/admin/consultation-requests",
              label: "Solicitudes de Consulta",
              icon: FileText,
            },
            { href: "/admin/proposals", label: "Propuestas", icon: FileText },
          ],
        };
      case "THERAPIST":
        return {
          title: "Panel del Terapeuta",
          description: "Gestiona tus citas y pacientes",
          links: [
            { href: "/therapist/agenda", label: "Mi Agenda", icon: Calendar },
            {
              href: "/therapist/patients",
              label: "Mis Pacientes",
              icon: Users,
            },
            {
              href: "/therapist/analysis",
              label: "Análisis Médicos",
              icon: FileText,
            },
          ],
        };
      case "PARENT":
      default:
        return {
          title: "Panel del Padre/Madre",
          description: "Gestiona las citas y progreso de tu hijo/a",
          links: [
            {
              href: "/parent/appointments",
              label: "Mis Citas",
              icon: Calendar,
            },
            { href: "/parent/documents", label: "Documentos", icon: FileText },
            { href: "/parent/progress", label: "Progreso", icon: FileText },
            { href: "/parent/payments", label: "Pagos", icon: FileText },
          ],
        };
    }
  };

  const content = getRoleSpecificContent();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bienvenido, {profile.firstName}</h1>
        <p className="text-muted-foreground mt-2">{content.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.links.map((link) => {
          const IconComponent = link.icon;
          return (
            <Card key={link.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {link.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={link.href}>Ir a {link.label}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración
          </CardTitle>
          <CardDescription>
            Actualiza tu perfil y configuraciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/settings">Ir a Configuración</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
