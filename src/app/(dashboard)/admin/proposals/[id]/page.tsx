"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus, Trash2, Eye, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  useProposals,
  useProposalServices,
  useUpdateProposalServices,
} from "@/hooks/useProposals";

interface ServiceItem {
  id: number;
  dbId?: string; // Optional DB ID for existing services
  name: string;
  sessions: number;
  cost: number;
}

export default function AdminProposalEditPage() {
  const params = useParams();
  const { data: proposals, isLoading } = useProposals();
  const { data: proposalServices, isLoading: servicesLoading } =
    useProposalServices(params.id as string);
  const updateServicesMutation = useUpdateProposalServices();
  const currentProposal = proposals?.find((p) => p.id === params.id);

  // Patient data from database using consultation request data
  const patientInfo = currentProposal
    ? {
        childName: currentProposal.consultationRequest.childName,
        age: calculateAge(currentProposal.consultationRequest.childDateOfBirth),
        parentName:
          currentProposal.consultationRequest.motherName ||
          currentProposal.consultationRequest.fatherName ||
          "Sin nombre",
        consultationDate: new Date(
          currentProposal.createdAt
        ).toLocaleDateString("es-ES"),
        consultationReason: currentProposal.title,
        phone:
          currentProposal.consultationRequest.motherPhone ||
          currentProposal.consultationRequest.fatherPhone ||
          "Sin teléfono",
      }
    : null;

  // Editable proposal data
  const [proposalData, setProposalData] = useState({
    therapist: "",
    date: "",
    observations: "",
  });

  // Update proposal data when currentProposal loads
  useEffect(() => {
    if (currentProposal) {
      setProposalData({
        therapist: `${currentProposal.therapist.firstName} ${currentProposal.therapist.lastName}`,
        date: new Date(currentProposal.createdAt).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        observations: currentProposal.description || "",
      });
    }
  }, [currentProposal]);

  // Initialize state for services
  const [evaluations, setEvaluations] = useState<ServiceItem[]>([]);
  const [treatments, setTreatments] = useState<ServiceItem[]>([]);

  // Update services when data loads from database
  useEffect(() => {
    if (proposalServices) {
      const evaluationServices = proposalServices
        .filter((service) => service.type === "EVALUATION")
        .map((service, index) => ({
          id: 1000 + index, // Use 1000+ for evaluations to avoid conflicts
          dbId: service.id, // Keep original DB ID for reference
          name: service.service,
          sessions: Number(service.sessions), // Convert to number
          cost: Number(service.cost || 0), // Convert to number
        }));

      const treatmentServices = proposalServices
        .filter((service) => service.type === "TREATMENT")
        .map((service, index) => ({
          id: 2000 + index, // Use 2000+ for treatments to avoid conflicts
          dbId: service.id, // Keep original DB ID for reference
          name: service.service,
          sessions: Number(service.sessions), // Convert to number
          cost: Number(service.cost || 0), // Convert to number
        }));

      setEvaluations(evaluationServices);
      setTreatments(treatmentServices);
    }
  }, [proposalServices, params.id, servicesLoading]);

  // Helper function to calculate age
  function calculateAge(birthDate: Date | string): number {
    // Handle invalid dates
    if (!birthDate) return 0;

    // Parse birthdate properly to avoid timezone issues
    let parsedBirthDate: Date;

    if (typeof birthDate === "string") {
      // Parse string dates
      const parts = birthDate.split("T")[0].split("-"); // Get YYYY-MM-DD part
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed in JS Date
        const day = parseInt(parts[2]);
        parsedBirthDate = new Date(year, month, day);
      } else {
        parsedBirthDate = new Date(birthDate);
      }
    } else {
      parsedBirthDate = new Date(
        birthDate.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );
    }

    // Check if we got a valid date
    if (isNaN(parsedBirthDate.getTime())) {
      console.warn("Invalid birthdate:", birthDate);
      return 0;
    }

    const today = new Date();
    const todayLocal = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    let age = todayLocal.getFullYear() - parsedBirthDate.getFullYear();
    const monthDiff = todayLocal.getMonth() - parsedBirthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && todayLocal.getDate() < parsedBirthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Functions to handle evaluations
  const addEvaluation = () => {
    const newEvaluation: ServiceItem = {
      id: Math.max(...evaluations.map((e) => e.id), 999) + 1,
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
        evaluation.id === id
          ? {
              ...evaluation,
              [field]:
                field === "sessions" || field === "cost"
                  ? Number(value) || 0
                  : value,
            }
          : evaluation
      )
    );
  };

  const removeEvaluation = (id: number) => {
    setEvaluations(evaluations.filter((evaluation) => evaluation.id !== id));
  };

  // Functions to handle treatments
  const addTreatment = () => {
    const newTreatment: ServiceItem = {
      id: Math.max(...treatments.map((t) => t.id), 1999) + 1,
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
        treatment.id === id
          ? {
              ...treatment,
              [field]:
                field === "sessions" || field === "cost"
                  ? Number(value) || 0
                  : value,
            }
          : treatment
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

  const saveProposal = async () => {
    try {
      // Prepare services data for API
      const allServices = [
        ...evaluations.map((evaluation) => ({
          treatmentProposalId: params.id as string,
          type: "EVALUATION" as const,
          code: `EVAL-${evaluation.id}`,
          service: evaluation.name,
          sessions: Number(evaluation.sessions),
          cost: Number(evaluation.cost) || 0, // Ensure cost is a number
        })),
        ...treatments.map((treatment) => ({
          treatmentProposalId: params.id as string,
          type: "TREATMENT" as const,
          code: `TREAT-${treatment.id}`,
          service: treatment.name,
          sessions: Number(treatment.sessions),
          cost: Number(treatment.cost) || 0, // Ensure cost is a number
        })),
      ];

      // Filter out empty services (services without names)
      const validServices = allServices.filter(
        (service) => service.service.trim() !== ""
      );

      await updateServicesMutation.mutateAsync({
        proposalId: params.id as string,
        services: validServices,
      });

      alert("Propuesta guardada exitosamente");
    } catch (error) {
      console.error("Error saving proposal:", error);
      alert("Error al guardar la propuesta. Por favor, intenta de nuevo.");
    }
  };

  if (isLoading || servicesLoading || !currentProposal || !patientInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Cargando propuesta...
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Por favor espere mientras cargamos los datos de la propuesta
          </p>
        </div>
      </div>
    );
  }

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
              disabled={updateServicesMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateServicesMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar
            </Button>
            <Link href={`/admin/proposals/preview/${params.id}`}>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={saveProposal}
              >
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
                            e.target.value
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
                              e.target.value
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
                            e.target.value
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
                              e.target.value
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
              disabled={updateServicesMutation.isPending}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {updateServicesMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar Borrador
            </Button>
            <Link href={`/admin/proposals/preview/${params.id}`}>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={saveProposal}
              >
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
