"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Calendar } from "lucide-react";

interface AppointmentsErrorProps {
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
}

export const AppointmentsError: React.FC<AppointmentsErrorProps> = ({
  error,
  onRetry,
  title = "Error al cargar las citas",
}) => {
  const getErrorMessage = (error?: Error | null): string => {
    if (!error) return "Ha ocurrido un error inesperado";

    const message = error.message.toLowerCase();

    if (
      message.includes("authentication") ||
      message.includes("unauthorized")
    ) {
      return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
    }

    if (message.includes("network") || message.includes("fetch")) {
      return "Error de conexión. Verifica tu conexión a internet.";
    }

    if (message.includes("service temporarily unavailable")) {
      return "El servicio no está disponible temporalmente. Intenta de nuevo en unos minutos.";
    }

    if (message.includes("not found")) {
      return "No se encontró el perfil de padre. Contacta al soporte técnico.";
    }

    return error.message || "Error desconocido al cargar las citas";
  };

  const handleReload = () => {
    window.location.reload();
  };

  const errorMessage = getErrorMessage(error);
  const isAuthError = error?.message.toLowerCase().includes("authentication");
  const isNetworkError =
    error?.message.toLowerCase().includes("network") ||
    error?.message.toLowerCase().includes("fetch");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {!isAuthError && onRetry && (
              <Button
                onClick={onRetry}
                className="flex items-center gap-2"
                variant="default"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            )}

            <Button
              onClick={handleReload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Recargar página
            </Button>

            {isAuthError && (
              <Button
                onClick={() => (window.location.href = "/login")}
                className="flex items-center gap-2"
              >
                Iniciar sesión
              </Button>
            )}
          </div>

          {/* Help text based on error type */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              {isNetworkError && (
                <>
                  <strong>Problemas de conexión:</strong> Verifica tu conexión a
                  internet y vuelve a intentar.
                </>
              )}
              {isAuthError && (
                <>
                  <strong>Sesión expirada:</strong> Por seguridad, las sesiones
                  expiran después de un tiempo. Inicia sesión nuevamente para
                  continuar.
                </>
              )}
              {!isNetworkError && !isAuthError && (
                <>
                  <strong>¿Problema persistente?</strong> Si el error continúa,
                  contacta al soporte técnico con el código de error mostrado
                  arriba.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Error boundary wrapper component
interface AppointmentsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<AppointmentsErrorProps>;
}

interface AppointmentsErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AppointmentsErrorBoundary extends React.Component<
  AppointmentsErrorBoundaryProps,
  AppointmentsErrorBoundaryState
> {
  constructor(props: AppointmentsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(
    error: Error
  ): AppointmentsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "Appointments Error Boundary caught an error:",
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || AppointmentsError;
      return (
        <FallbackComponent
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
