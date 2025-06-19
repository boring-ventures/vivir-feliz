"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TherapistPacientesPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Mis Pacientes</h1>
        <p className="text-muted-foreground">Gestión de pacientes asignados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página estará disponible próximamente. Aquí podrás ver y
            gestionar todos tus pacientes asignados, revisar sus historiales y
            seguir su progreso terapéutico.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
