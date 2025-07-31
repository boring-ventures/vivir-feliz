"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
}

// Helper function to get correct dashboard path for role
function getRoleDashboardPath(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/super-admin/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "THERAPIST":
      return "/therapist/dashboard";
    case "PARENT":
    default:
      return "/parent/dashboard";
  }
}

export function RoleGuard({
  allowedRoles,
  children,
  redirectTo,
}: RoleGuardProps) {
  const router = useRouter();
  const { user, profile, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // No user session, redirect to sign in
        router.push("/sign-in");
        return;
      }

      if (!profile) {
        // No profile found, redirect to dashboard
        router.push("/dashboard");
        return;
      }

      // Check if user's role is allowed for this page
      if (!allowedRoles.includes(profile.role)) {
        // User's role is not allowed, redirect to their appropriate dashboard
        const correctDashboard =
          redirectTo || getRoleDashboardPath(profile.role);
        router.push(correctDashboard);
        return;
      }
    }
  }, [user, profile, isLoading, router, allowedRoles, redirectTo]);

  // Show loading state while checking authentication and role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Show loading state if user or profile is not loaded yet
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if role is not allowed (this should not happen due to redirect)
  if (!allowedRoles.includes(profile.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso no autorizado</h1>
          <p className="text-muted-foreground mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => router.push(getRoleDashboardPath(profile.role))}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Ir a mi dashboard
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has the correct role, render children
  return <>{children}</>;
}
