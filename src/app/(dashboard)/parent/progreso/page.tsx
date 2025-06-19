"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentProgresoPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Progreso</h1>
        <p className="text-muted-foreground">
          Seguimiento del progreso terapéutico
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seguimiento del Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página estará disponible próximamente. Aquí podrás ver el
            progreso y evolución de las terapias de tus hijos con gráficos y
            reportes detallados.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
