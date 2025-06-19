"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TherapistSesionesPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Sesiones</h1>
        <p className="text-muted-foreground">
          Registro y seguimiento de sesiones terapéuticas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Sesiones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página estará disponible próximamente. Aquí podrás registrar
            sesiones, tomar notas de progreso y gestionar el historial de
            intervenciones terapéuticas.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
