import {
  Users,
  BarChart,
  Calendar,
  FileText,
  CreditCard,
  UserCog,
  Heart,
  BookOpen,
  UserPlus,
  History,
  Receipt,
  MessageSquare,
  CalendarPlus,
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
                title: "Terapeutas",
                url: "/admin/therapists",
                icon: UserCog,
              },
              {
                title: "Nuevos pacientes",
                url: "/admin/new-patients",
                icon: UserPlus,
              },
              {
                title: "Historial de pacientes",
                url: "/admin/patients",
                icon: History,
              },
              {
                title: "Usuarios",
                url: "/admin/users",
                icon: Users,
              },
              {
                title: "Solicitudes de Consulta",
                url: "/admin/consultation-requests",
                icon: CalendarPlus,
              },
              {
                title: "Solicitudes de Entrevista",
                url: "/admin/interview-requests",
                icon: MessageSquare,
              },
              {
                title: "Propuestas",
                url: "/admin/proposals",
                icon: Receipt,
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
                url: "/therapist/patients",
                icon: Users,
              },
              {
                title: "Análisis de Consulta",
                url: "/therapist/analysis",
                icon: BookOpen,
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
