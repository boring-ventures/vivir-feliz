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
import { useTherapists, getTherapistDisplayName } from "@/hooks/useTherapists";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface ServiceItem {
  id: number;
  dbId?: string; // Optional DB ID for existing services
  name: string;
  sessions: number;
  cost: number;
  therapistId?: string;
  code: string; // Add code field to track the selected service code
}

// Service data from therapist proposal page
const serviciosEvaluacionData = [
  {
    codigo: "EV-INT",
    servicio: "Evaluación Integral",
    descripcion: "Evaluación Específica",
    sesiones: 4,
  },
  {
    codigo: "EV-PSI",
    servicio: "Evaluación Psicológica",
    descripcion: "",
    sesiones: 3,
  },
  {
    codigo: "EV-PSP",
    servicio: "Evaluación Psicopedagógica",
    descripcion: "",
    sesiones: 3,
  },
  {
    codigo: "EV-NRP",
    servicio: "Evaluación Neuropsicológica",
    descripcion: "",
    sesiones: 4,
  },
  {
    codigo: "EV-PDG",
    servicio: "Evaluación Pedagógica",
    descripcion: "",
    sesiones: 2,
  },
  {
    codigo: "EV-FON",
    servicio: "Evaluación Fonoaudiológica",
    descripcion: "",
    sesiones: 2,
  },
  {
    codigo: "EV-PSM",
    servicio: "Evaluación Psicomotriz",
    descripcion: "",
    sesiones: 2,
  },
  {
    codigo: "EV-FIS",
    servicio: "Evaluación en Fisioterapia",
    descripcion: "",
    sesiones: 2,
  },
  {
    codigo: "EV-TO",
    servicio: "Evaluación en Terapia Ocupacional",
    descripcion: "",
    sesiones: 2,
  },
  {
    codigo: "EV-TGD",
    servicio: "Evaluación especializada en TGD",
    descripcion: "",
    sesiones: 3,
  },
  {
    codigo: "EV-ENT-COL",
    servicio: "Entrevista colegio",
    descripcion: "",
    sesiones: 1,
  },
  {
    codigo: "EV-ENT-PAD",
    servicio: "Entrevista a padres",
    descripcion: "",
    sesiones: 1,
  },
  {
    codigo: "EV-INF",
    servicio: "Entrega de informe",
    descripcion: "",
    sesiones: 1,
  },
];

const serviciosTratamientoData = [
  {
    codigo: "TRAT-PSP",
    servicio: "Tratamiento Psicopedagógico",
    sesiones: 16,
  },
  { codigo: "TRAT-PSI", servicio: "Tratamiento Psicológico", sesiones: 16 },
  {
    codigo: "TRAT-NRP",
    servicio: "Tratamiento Neuropsicológico",
    sesiones: 16,
  },
  {
    codigo: "TRAT-FON",
    servicio: "Tratamiento Fonoaudiológico",
    sesiones: 16,
  },
  { codigo: "TRAT-PSM", servicio: "Tratamiento Psicomotor", sesiones: 16 },
  {
    codigo: "TRAT-TO",
    servicio: "Tratamiento de Terapia Ocupacional",
    sesiones: 16,
  },
  {
    codigo: "TRAT-FIS",
    servicio: "Tratamiento en Fisioterapia y Kinesiología",
    sesiones: 16,
  },
  {
    codigo: "TRAT-PSI-P",
    servicio: "Tratamiento de Entrenamiento Parental",
    sesiones: 8,
  },
  {
    codigo: "TLL-PSP",
    servicio: "Taller grupal Psicopedagógico",
    sesiones: 8,
  },
  { codigo: "TLL-PSI", servicio: "Taller grupal Psicológico", sesiones: 8 },
  {
    codigo: "TLL-NRP",
    servicio: "Taller grupal Neuropsicológico",
    sesiones: 8,
  },
  {
    codigo: "TLL-FON",
    servicio: "Taller grupal Fonoaudiológico",
    sesiones: 8,
  },
  { codigo: "TLL-PSM", servicio: "Taller grupal Psicomotor", sesiones: 8 },
  {
    codigo: "TLL-TO",
    servicio: "Taller grupal de Terapia Ocupacional",
    sesiones: 8,
  },
  {
    codigo: "TLL-FIS",
    servicio: "Taller grupal en Fisioterapia y kinesiología",
    sesiones: 8,
  },
  {
    codigo: "INT-ESC",
    servicio: "Visitas del Terapeuta al Colegio",
    sesiones: 4,
  },
  {
    codigo: "SEG-EQU",
    servicio: "Entrega de informe cuatrimestral",
    sesiones: 1,
  },
  { codigo: "TLL-TALLERES", servicio: "Talleres:", sesiones: 0 },
  {
    codigo: "PROG-INCL",
    servicio: "Programa de especialistas de inclusión",
    sesiones: 0,
  },
  {
    codigo: "PROG-APOYO",
    servicio: "Programa de apoyo escolar",
    sesiones: 0,
  },
  {
    codigo: "PROG-TEMP-IND",
    servicio: "Programa de atención temprana individual",
    sesiones: 0,
  },
  {
    codigo: "PROG-TEMP-GRP",
    servicio: "Programa de atención temprana grupal",
    sesiones: 0,
  },
  {
    codigo: "PROG-NEURO",
    servicio: "Programa de neurorehabilitación infantil",
    sesiones: 0,
  },
];

// Mapping between service codes and required specialties
const serviceSpecialtyMapping: Record<string, string> = {
  "EV-PSI": "NEUROPSYCHOLOGIST",
  "EV-PSP": "PSYCHOPEDAGOGUE",
  "EV-NRP": "NEUROPSYCHOLOGIST",
  "EV-PDG": "PSYCHOPEDAGOGUE",
  "EV-FON": "SPEECH_THERAPIST",
  "EV-PSM": "OCCUPATIONAL_THERAPIST",
  "EV-FIS": "OCCUPATIONAL_THERAPIST",
  "EV-TO": "OCCUPATIONAL_THERAPIST",
  "EV-TGD": "ASD_THERAPIST",
  "TRAT-PSP": "PSYCHOPEDAGOGUE",
  "TRAT-PSI": "NEUROPSYCHOLOGIST",
  "TRAT-NRP": "NEUROPSYCHOLOGIST",
  "TRAT-FON": "SPEECH_THERAPIST",
  "TRAT-PSM": "OCCUPATIONAL_THERAPIST",
  "TRAT-TO": "OCCUPATIONAL_THERAPIST",
  "TRAT-FIS": "OCCUPATIONAL_THERAPIST",
  "TRAT-PSI-P": "NEUROPSYCHOLOGIST",
  "TLL-PSP": "PSYCHOPEDAGOGUE",
  "TLL-PSI": "NEUROPSYCHOLOGIST",
  "TLL-NRP": "NEUROPSYCHOLOGIST",
  "TLL-FON": "SPEECH_THERAPIST",
  "TLL-PSM": "OCCUPATIONAL_THERAPIST",
  "TLL-TO": "OCCUPATIONAL_THERAPIST",
  "TLL-FIS": "OCCUPATIONAL_THERAPIST",
};

export default function AdminProposalEditPage() {
  const params = useParams();
  const { data: proposals, isLoading } = useProposals();
  const { data: proposalServices, isLoading: servicesLoading } =
    useProposalServices(params.id as string);
  const updateServicesMutation = useUpdateProposalServices();
  const currentProposal = proposals?.find((p) => p.id === params.id);
  const { data: allTherapists = [], isLoading: therapistsLoading } =
    useTherapists();

  // Helper function to get therapists by specialty for a specific service
  const getTherapistsByService = (codigo: string) => {
    const requiredSpecialty = serviceSpecialtyMapping[codigo];
    if (!requiredSpecialty) {
      return allTherapists; // If no specific specialty required, show all therapists
    }
    return allTherapists.filter(
      (therapist) => therapist.specialty === requiredSpecialty
    );
  };

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
          therapistId: service.therapistId, // Add therapistId
          code: service.code, // Add code field
        }));

      const treatmentServices = proposalServices
        .filter((service) => service.type === "TREATMENT")
        .map((service, index) => ({
          id: 2000 + index, // Use 2000+ for treatments to avoid conflicts
          dbId: service.id, // Keep original DB ID for reference
          name: service.service,
          sessions: Number(service.sessions), // Convert to number
          cost: Number(service.cost || 0), // Convert to number
          therapistId: service.therapistId, // Add therapistId
          code: service.code, // Add code field
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
      code: "", // Add code field to track the selected service code
      sessions: 1,
      cost: 0,
      therapistId: "",
    };
    setEvaluations([...evaluations, newEvaluation]);
  };

  const updateEvaluation = (
    id: number,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setEvaluations(
      evaluations.map((evaluation) => {
        if (evaluation.id === id) {
          const updatedEvaluation = {
            ...evaluation,
            [field]: value,
          };

          // If updating the code field
          if (field === "code") {
            const selectedService = serviciosEvaluacionData.find(
              (s) => s.codigo === value
            );
            if (selectedService) {
              updatedEvaluation.name = selectedService.servicio;
              updatedEvaluation.sessions = selectedService.sesiones;
              updatedEvaluation.cost = selectedService.sesiones * 150; // Example: 150 Bs per session
              // Reset therapist when service changes
              updatedEvaluation.therapistId = "";
            }
          }

          return updatedEvaluation;
        }
        return evaluation;
      })
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
      code: "", // Add code field to track the selected service code
      sessions: 1,
      cost: 0,
      therapistId: "",
    };
    setTreatments([...treatments, newTreatment]);
  };

  const updateTreatment = (
    id: number,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setTreatments(
      treatments.map((treatment) => {
        if (treatment.id === id) {
          const updatedTreatment = {
            ...treatment,
            [field]: value,
          };

          // If updating the code field
          if (field === "code") {
            const selectedService = serviciosTratamientoData.find(
              (s) => s.codigo === value
            );
            if (selectedService) {
              updatedTreatment.name = selectedService.servicio;
              updatedTreatment.sessions = selectedService.sesiones;
              updatedTreatment.cost = selectedService.sesiones * 150; // Example: 150 Bs per session
              // Reset therapist when service changes
              updatedTreatment.therapistId = "";
            }
          }

          return updatedTreatment;
        }
        return treatment;
      })
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

  // Update the saveProposal function to include therapist IDs
  const saveProposal = async () => {
    try {
      // Validate that all services have therapists assigned
      const evaluationsWithoutTherapist = evaluations.filter(
        (evaluation) => !evaluation.therapistId
      );
      const treatmentsWithoutTherapist = treatments.filter(
        (treatment) => !treatment.therapistId
      );

      if (
        evaluationsWithoutTherapist.length > 0 ||
        treatmentsWithoutTherapist.length > 0
      ) {
        toast({
          title: "Error de validación",
          description: "Todos los servicios deben tener un terapeuta asignado",
          variant: "destructive",
        });
        return;
      }

      const allServices = [
        ...evaluations.map((evaluation) => ({
          treatmentProposalId: params.id as string,
          type: "EVALUATION" as const,
          code: `EVAL-${evaluation.id}`,
          service: evaluation.name,
          sessions: Number(evaluation.sessions),
          cost: Number(evaluation.cost) || 0,
          therapistId: evaluation.therapistId!,
        })),
        ...treatments.map((treatment) => ({
          treatmentProposalId: params.id as string,
          type: "TREATMENT" as const,
          code: `TREAT-${treatment.id}`,
          service: treatment.name,
          sessions: Number(treatment.sessions),
          cost: Number(treatment.cost) || 0,
          therapistId: treatment.therapistId!,
        })),
      ];

      // Filter out empty services
      const validServices = allServices.filter(
        (service) => service.service.trim() !== ""
      );

      await updateServicesMutation.mutateAsync({
        proposalId: params.id as string,
        services: validServices,
      });

      toast({
        title: "¡Propuesta guardada exitosamente!",
        description: "Los cambios han sido guardados correctamente.",
      });
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast({
        title: "Error",
        description:
          "Error al guardar la propuesta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
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
              {evaluations.map((evaluation) => {
                // Get list of already selected services (excluding current evaluation)
                const selectedCodes = evaluations
                  .filter((e) => e.id !== evaluation.id)
                  .map((e) => e.code)
                  .filter(Boolean);

                // Filter out already selected services
                const availableServices = serviciosEvaluacionData.filter(
                  (service) => !selectedCodes.includes(service.codigo)
                );

                return (
                  <div
                    key={evaluation.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-5">
                        <Label className="text-sm font-medium">
                          Nombre de la Evaluación
                        </Label>
                        <Select
                          value={evaluation.code}
                          onValueChange={(value) =>
                            updateEvaluation(evaluation.id, "code", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar evaluación" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableServices.map((service) => (
                              <SelectItem
                                key={service.codigo}
                                value={service.codigo}
                              >
                                {service.servicio}
                              </SelectItem>
                            ))}
                            {evaluation.code &&
                              !availableServices.some(
                                (s) => s.codigo === evaluation.code
                              ) && (
                                <SelectItem value={evaluation.code}>
                                  {
                                    serviciosEvaluacionData.find(
                                      (s) => s.codigo === evaluation.code
                                    )?.servicio
                                  }
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-4">
                        <Label className="text-sm font-medium">Terapeuta</Label>
                        <Select
                          value={evaluation.therapistId}
                          onValueChange={(value) =>
                            updateEvaluation(
                              evaluation.id,
                              "therapistId",
                              value
                            )
                          }
                          disabled={!evaluation.code} // Disable until service is selected
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar terapeuta" />
                          </SelectTrigger>
                          <SelectContent>
                            {getTherapistsByService(evaluation.code).map(
                              (therapist) => (
                                <SelectItem
                                  key={therapist.id}
                                  value={therapist.id}
                                >
                                  {getTherapistDisplayName(therapist)}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-1">
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
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">
                          Costo (Bs.)
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
                );
              })}

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
              {treatments.map((treatment) => {
                // Get list of already selected services (excluding current treatment)
                const selectedCodes = treatments
                  .filter((t) => t.id !== treatment.id)
                  .map((t) => t.code)
                  .filter(Boolean);

                // Filter out already selected services
                const availableServices = serviciosTratamientoData.filter(
                  (service) => !selectedCodes.includes(service.codigo)
                );

                return (
                  <div
                    key={treatment.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-5">
                        <Label className="text-sm font-medium">
                          Nombre del Tratamiento
                        </Label>
                        <Select
                          value={treatment.code}
                          onValueChange={(value) =>
                            updateTreatment(treatment.id, "code", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tratamiento" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableServices.map((service) => (
                              <SelectItem
                                key={service.codigo}
                                value={service.codigo}
                              >
                                {service.servicio}
                              </SelectItem>
                            ))}
                            {treatment.code &&
                              !availableServices.some(
                                (s) => s.codigo === treatment.code
                              ) && (
                                <SelectItem value={treatment.code}>
                                  {
                                    serviciosTratamientoData.find(
                                      (s) => s.codigo === treatment.code
                                    )?.servicio
                                  }
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-4">
                        <Label className="text-sm font-medium">Terapeuta</Label>
                        <Select
                          value={treatment.therapistId}
                          onValueChange={(value) =>
                            updateTreatment(treatment.id, "therapistId", value)
                          }
                          disabled={!treatment.code} // Disable until service is selected
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar terapeuta" />
                          </SelectTrigger>
                          <SelectContent>
                            {getTherapistsByService(treatment.code).map(
                              (therapist) => (
                                <SelectItem
                                  key={therapist.id}
                                  value={therapist.id}
                                >
                                  {getTherapistDisplayName(therapist)}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-1">
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
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">
                          Costo (Bs.)
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
                );
              })}

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
