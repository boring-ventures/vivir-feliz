"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsuariosPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra todos los usuarios del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página estará disponible próximamente. Aquí podrás ver, crear,
            editar y gestionar todos los usuarios del sistema Vivir Feliz.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
