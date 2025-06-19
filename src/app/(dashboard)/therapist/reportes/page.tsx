"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TherapistReportesPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Reportes</h1>
        <p className="text-muted-foreground">
          Generación de informes y reportes profesionales
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reportes e Informes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página estará disponible próximamente. Aquí podrás generar
            reportes de progreso, informes de evaluación y documentos
            profesionales para pacientes y familias.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
