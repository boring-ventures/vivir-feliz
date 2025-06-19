"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentCitasPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Citas</h1>
        <p className="text-muted-foreground">Gestiona las citas de tus hijos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página estará disponible próximamente. Aquí podrás ver y
            gestionar todas las citas de tus hijos.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
