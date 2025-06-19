import {
  Settings,
  Users,
  BarChart,
  Calendar,
  FileText,
  CreditCard,
  UserCog,
  ClipboardList,
  Heart,
  BookOpen,
} from "lucide-react";
import type { SidebarData } from "../types";

export const getRoleBasedSidebarData = (userRole: string): SidebarData => {
  const baseTeam = {
    name: "Vivir Feliz",
    logo: Heart,
    plan: "Centro de Terapia Infantil",
  };

  switch (userRole) {
    case "ADMIN":
      return {
        user: {
          name: "Admin",
          email: "admin@vivirfeliz.com",
          avatar: "/avatars/admin.jpg",
        },
        teams: [baseTeam],
        navGroups: [
          {
            title: "Administración",
            items: [
              {
                title: "Dashboard",
                url: "/admin/dashboard",
                icon: BarChart,
              },
              {
                title: "Usuarios",
                url: "/admin/usuarios",
                icon: Users,
              },
              {
                title: "Terapeutas",
                url: "/admin/terapeutas",
                icon: UserCog,
              },
              {
                title: "Citas",
                url: "/admin/citas",
                icon: Calendar,
              },
              {
                title: "Reportes",
                url: "/admin/reportes",
                icon: FileText,
              },
            ],
          },
          {
            title: "Sistema",
            items: [
              {
                title: "Configuración",
                url: "/admin/configuracion",
                icon: Settings,
              },
            ],
          },
        ],
      };

    case "THERAPIST":
      return {
        user: {
          name: "Dr. Carlos Mendoza",
          email: "carlos@vivirfeliz.com",
          avatar: "/avatars/therapist.jpg",
        },
        teams: [baseTeam],
        navGroups: [
          {
            title: "Mi Trabajo",
            items: [
              {
                title: "Dashboard",
                url: "/therapist/dashboard",
                icon: BarChart,
              },
              {
                title: "Mi Agenda",
                url: "/therapist/agenda",
                icon: Calendar,
              },
              {
                title: "Mis Pacientes",
                url: "/therapist/pacientes",
                icon: Users,
              },
              {
                title: "Análisis de Consulta",
                url: "/therapist/analisis",
                icon: BookOpen,
              },
              {
                title: "Sesiones",
                url: "/therapist/sesiones",
                icon: ClipboardList,
              },
              {
                title: "Reportes",
                url: "/therapist/reportes",
                icon: FileText,
              },
            ],
          },
        ],
      };

    case "PARENT":
    default:
      return {
        user: {
          name: "María González",
          email: "maria.gonzalez@email.com",
          avatar: "/avatars/parent.jpg",
        },
        teams: [baseTeam],
        navGroups: [
          {
            title: "Mi Cuenta",
            items: [
              {
                title: "Dashboard",
                url: "/parent/dashboard",
                icon: BarChart,
              },
              {
                title: "Citas",
                url: "/parent/citas",
                icon: Calendar,
              },
              {
                title: "Documentos",
                url: "/parent/documentos",
                icon: FileText,
              },
              {
                title: "Pagos",
                url: "/parent/pagos",
                icon: CreditCard,
              },
              {
                title: "Progreso",
                url: "/parent/progreso",
                icon: BarChart,
              },
            ],
          },
        ],
      };
  }
};

// Legacy export for backward compatibility
export const sidebarData: SidebarData = getRoleBasedSidebarData("PARENT");
