"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentPagosPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Pagos</h1>
        <p className="text-muted-foreground">
          Historial de pagos y facturación
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página estará disponible próximamente. Aquí podrás ver tu
            historial de pagos, facturas pendientes y realizar nuevos pagos.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
