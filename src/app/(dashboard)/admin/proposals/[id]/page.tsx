"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus, Trash2, Eye, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";

interface ServiceItem {
  id: number;
  name: string;
  sessions: number;
  cost: number;
}

export default function AdminProposalEditPage() {
  const params = useParams();

  // Mock patient data
  const [patientInfo] = useState({
    childName: "Juan Pérez González",
    age: 8,
    parentName: "María González",
    consultationDate: "20/01/2025",
    consultationReason: "Dificultades de atención en el colegio",
    phone: "+591-7-123-4567",
    email: "maria.gonzalez@email.com",
  });

  // Editable proposal data
  const [proposalData, setProposalData] = useState({
    therapist: "Dr. Carlos Mendoza",
    date: "15 de Enero, 2025",
    observations:
      "Evaluación integral recomendada para determinar el plan de tratamiento más adecuado.",
  });

  const [evaluations, setEvaluations] = useState<ServiceItem[]>([
    { id: 1, name: "Evaluación Integral", sessions: 4, cost: 800 },
    { id: 2, name: "Evaluación Fonoaudiológica", sessions: 2, cost: 400 },
  ]);

  const [treatments, setTreatments] = useState<ServiceItem[]>([
    { id: 1, name: "Terapia Psicológica", sessions: 16, cost: 3200 },
    { id: 2, name: "Terapia Fonoaudiológica", sessions: 8, cost: 1600 },
    { id: 3, name: "Taller Psicológico", sessions: 4, cost: 800 },
  ]);

  // Functions to handle evaluations
  const addEvaluation = () => {
    const newEvaluation: ServiceItem = {
      id: Math.max(...evaluations.map((e) => e.id), 0) + 1,
      name: "",
      sessions: 1,
      cost: 0,
    };
    setEvaluations([...evaluations, newEvaluation]);
  };

  const updateEvaluation = (
    id: number,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setEvaluations(
      evaluations.map((evaluation) =>
        evaluation.id === id ? { ...evaluation, [field]: value } : evaluation
      )
    );
  };

  const removeEvaluation = (id: number) => {
    setEvaluations(evaluations.filter((evaluation) => evaluation.id !== id));
  };

  // Functions to handle treatments
  const addTreatment = () => {
    const newTreatment: ServiceItem = {
      id: Math.max(...treatments.map((t) => t.id), 0) + 1,
      name: "",
      sessions: 1,
      cost: 0,
    };
    setTreatments([...treatments, newTreatment]);
  };

  const updateTreatment = (
    id: number,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setTreatments(
      treatments.map((treatment) =>
        treatment.id === id ? { ...treatment, [field]: value } : treatment
      )
    );
  };

  const removeTreatment = (id: number) => {
    setTreatments(treatments.filter((treatment) => treatment.id !== id));
  };

  // Calculations
  const totalEvaluations = evaluations.reduce(
    (sum, item) => sum + item.cost,
    0
  );
  const totalTreatments = treatments.reduce((sum, item) => sum + item.cost, 0);
  const totalGeneral = totalEvaluations + totalTreatments;

  const saveProposal = () => {
    // Logic to save the proposal would go here
    alert("Propuesta guardada exitosamente");
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/admin/proposals">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Volver a Propuestas
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Editar Propuesta Económica</h1>
              <p className="text-gray-600">
                Personaliza los servicios y costos para el paciente
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={saveProposal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Link href={`/admin/proposals/preview/${params.id}`}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
            </Link>
          </div>
        </div>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-900">Paciente:</span>
                  <p className="text-blue-800 font-semibold">
                    {patientInfo.childName}
                  </p>
                  <p className="text-blue-700">{patientInfo.age} años</p>
                </div>
                <div>
                  <span className="font-medium text-blue-900">
                    Padre/Madre:
                  </span>
                  <p className="text-blue-800">{patientInfo.parentName}</p>
                  <p className="text-blue-700 text-xs">{patientInfo.phone}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Consulta:</span>
                  <p className="text-blue-800">
                    {patientInfo.consultationDate}
                  </p>
                  <p className="text-blue-700 text-xs">
                    {patientInfo.consultationReason}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposal Data */}
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Propuesta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="therapist">Terapeuta Responsable</Label>
                <Input
                  id="therapist"
                  value={proposalData.therapist}
                  onChange={(e) =>
                    setProposalData({
                      ...proposalData,
                      therapist: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date">Fecha de la Propuesta</Label>
                <Input
                  id="date"
                  value={proposalData.date}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, date: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observations">Observaciones Adicionales</Label>
              <Textarea
                id="observations"
                value={proposalData.observations}
                onChange={(e) =>
                  setProposalData({
                    ...proposalData,
                    observations: e.target.value,
                  })
                }
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Evaluations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Evaluaciones</CardTitle>
            <Button onClick={addEvaluation} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Evaluación
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">
                        Nombre de la Evaluación
                      </Label>
                      <Input
                        value={evaluation.name}
                        onChange={(e) =>
                          updateEvaluation(
                            evaluation.id,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Ej: Evaluación Integral"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Sesiones</Label>
                      <Input
                        type="number"
                        value={evaluation.sessions}
                        onChange={(e) =>
                          updateEvaluation(
                            evaluation.id,
                            "sessions",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Costo Total (Bs.)
                      </Label>
                      <div className="flex mt-1">
                        <Input
                          type="number"
                          value={evaluation.cost}
                          onChange={(e) =>
                            updateEvaluation(
                              evaluation.id,
                              "cost",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                          className="rounded-r-none"
                        />
                        <Button
                          onClick={() => removeEvaluation(evaluation.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-l-none border-l-0 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 font-semibold">
                <span>Total Evaluaciones:</span>
                <span className="text-lg">
                  Bs. {totalEvaluations.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treatments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Tratamientos (6 meses)</CardTitle>
            <Button onClick={addTreatment} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Tratamiento
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">
                        Nombre del Tratamiento
                      </Label>
                      <Input
                        value={treatment.name}
                        onChange={(e) =>
                          updateTreatment(treatment.id, "name", e.target.value)
                        }
                        placeholder="Ej: Terapia Psicológica"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Sesiones</Label>
                      <Input
                        type="number"
                        value={treatment.sessions}
                        onChange={(e) =>
                          updateTreatment(
                            treatment.id,
                            "sessions",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Costo Total (Bs.)
                      </Label>
                      <div className="flex mt-1">
                        <Input
                          type="number"
                          value={treatment.cost}
                          onChange={(e) =>
                            updateTreatment(
                              treatment.id,
                              "cost",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                          className="rounded-r-none"
                        />
                        <Button
                          onClick={() => removeTreatment(treatment.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-l-none border-l-0 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 font-semibold">
                <span>Total Tratamientos:</span>
                <span className="text-lg">
                  Bs. {totalTreatments.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Summary */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Evaluaciones:</span>
                <span>Bs. {totalEvaluations.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Tratamientos:</span>
                <span>Bs. {totalTreatments.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-2xl font-bold">
                  <span>TOTAL GENERAL:</span>
                  <span className="text-blue-600">
                    Bs. {totalGeneral.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Link href="/admin/proposals">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <div className="flex space-x-4">
            <Button
              onClick={saveProposal}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
            <Link href={`/admin/proposals/preview/${params.id}`}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Eye className="h-4 w-4 mr-2" />
                Generar Vista Previa
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
