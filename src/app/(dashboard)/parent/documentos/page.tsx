"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentDocumentosPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Documentos</h1>
        <p className="text-muted-foreground">
          Documentos y reportes de tus hijos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos y Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página estará disponible próximamente. Aquí podrás ver y
            descargar todos los documentos, informes y reportes de tus hijos.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
