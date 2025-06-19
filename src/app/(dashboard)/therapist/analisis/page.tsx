"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TherapistAnalisisPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Análisis de Consulta</h1>
        <p className="text-muted-foreground">
          Herramientas de análisis y evaluación
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis y Evaluaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página estará disponible próximamente. Aquí podrás realizar
            análisis detallados de consultas, utilizar herramientas de
            evaluación y generar reportes de seguimiento.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
