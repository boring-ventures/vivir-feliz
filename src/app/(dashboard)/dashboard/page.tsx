"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // No user session, redirect to sign in
        router.push("/sign-in");
        return;
      }

      // Redirect based on user role
      if (profile?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (profile?.role === "THERAPIST") {
        router.push("/therapist/dashboard");
      } else {
        // Default to parent dashboard for PARENT role or fallback
        router.push("/parent/dashboard");
      }
    }
  }, [user, profile, isLoading, router]);

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

  // This component will redirect, so we show a loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
}
