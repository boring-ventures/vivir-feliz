import { SidebarData } from "../types";
import {
  Home,
  Users,
  Calendar,
  FileText,
  Receipt,
  BookOpen,
  Heart,
  BarChart,
  UserPlus,
  UserCog,
  CalendarPlus,
  MessageSquare,
  Clock,
  CreditCard,
  Package,
} from "lucide-react";

export const getRoleBasedSidebarData = (
  userRole: string,
  specialty?: string
): SidebarData => {
  const baseTeam = {
    name: "Vivir Feliz",
    logo: Heart,
    plan: "Centro de Terapia Infantil",
  };

  switch (userRole) {
    case "SUPER_ADMIN":
      return {
        user: {
          name: "Super Administrador",
          email: "superadmin@vivirfeliz.com",
          avatar: "/avatars/superadmin.png",
        },
        teams: [baseTeam],
        navGroups: [
          {
            title: "Super Administración",
            items: [
              {
                title: "Dashboard",
                url: "/super-admin/dashboard",
                icon: BarChart,
              },
              {
                title: "Usuarios",
                url: "/super-admin/users",
                icon: Users,
              },
              {
                title: "Servicios",
                url: "/super-admin/services",
                icon: Package,
              },
              {
                title: "Terapeutas",
                url: "/admin/therapists",
                icon: UserCog,
              },
              {
                title: "Usuarios",
                url: "/admin/users",
                icon: Users,
              },
            ],
          },
        ],
      };

    case "ADMIN":
      return {
        user: {
          name: "Administrador",
          email: "admin@vivirfeliz.com",
          avatar: "/avatars/admin.png",
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
                icon: Clock,
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
                title: "Citas",
                url: "/admin/appointments",
                icon: Calendar,
              },
              {
                title: "Informes",
                url: "/admin/reports",
                icon: FileText,
              },
            ],
          },
        ],
      };

    case "THERAPIST":
      // Check if therapist is COORDINATOR
      if (specialty === "COORDINATOR") {
        return {
          user: {
            name: "Coordinador",
            email: "coordinator@vivirfeliz.com",
            avatar: "/avatars/therapist.png",
          },
          teams: [baseTeam],
          navGroups: [
            {
              title: "Mi Trabajo",
              items: [
                {
                  title: "Dashboard",
                  url: "/therapist/dashboard",
                  icon: Home,
                },
                {
                  title: "Pacientes",
                  url: "/therapist/patients",
                  icon: Users,
                },
                {
                  title: "Citas",
                  url: "/therapist/appointments",
                  icon: Calendar,
                },
                {
                  title: "Propuestas",
                  url: "/therapist/proposals",
                  icon: Receipt,
                },
                {
                  title: "Informes",
                  url: "/therapist/reports",
                  icon: FileText,
                },
              ],
            },
          ],
        };
      }

      // Default therapist navigation
      return {
        user: {
          name: "Terapeuta",
          email: "therapist@vivirfeliz.com",
          avatar: "/avatars/therapist.png",
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
      return {
        user: {
          name: "Padre/Madre",
          email: "parent@vivirfeliz.com",
          avatar: "/avatars/parent.png",
        },
        teams: [baseTeam],
        navGroups: [
          {
            title: "Mi Familia",
            items: [
              {
                title: "Dashboard",
                url: "/parent/dashboard",
                icon: BarChart,
              },
              {
                title: "Citas",
                url: "/parent/appointments",
                icon: Calendar,
              },
              {
                title: "Documentos",
                url: "/parent/documents",
                icon: FileText,
              },
              {
                title: "Pagos",
                url: "/parent/payments",
                icon: CreditCard,
              },
              {
                title: "Progreso",
                url: "/parent/progress",
                icon: BarChart,
              },
            ],
          },
        ],
      };

    default:
      return {
        user: {
          name: "Usuario",
          email: "user@vivirfeliz.com",
          avatar: "/avatars/default.png",
        },
        teams: [baseTeam],
        navGroups: [
          {
            title: "Navegación",
            items: [
              {
                title: "Dashboard",
                url: "/dashboard",
                icon: Home,
              },
            ],
          },
        ],
      };
  }
};

// Legacy export for backward compatibility
export const sidebarData: SidebarData = getRoleBasedSidebarData("PARENT");
