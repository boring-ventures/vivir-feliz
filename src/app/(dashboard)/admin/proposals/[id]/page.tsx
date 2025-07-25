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
  proposalType: "A" | "B"; // Add proposal type
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
  const { data: allTherapists = [] } = useTherapists();

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

  // Initialize state for services - separated by proposal type
  const [evaluationsA, setEvaluationsA] = useState<ServiceItem[]>([]);
  const [treatmentsA, setTreatmentsA] = useState<ServiceItem[]>([]);
  const [evaluationsB, setEvaluationsB] = useState<ServiceItem[]>([]);
  const [treatmentsB, setTreatmentsB] = useState<ServiceItem[]>([]);

  // Update services when data loads from database - separate by proposal type
  useEffect(() => {
    if (proposalServices) {
      // Proposal A services
      const evaluationServicesA = proposalServices
        .filter(
          (service) =>
            service.type === "EVALUATION" && service.proposalType === "A"
        )
        .map((service, index) => ({
          id: 1000 + index, // Use 1000+ for evaluations A
          dbId: service.id,
          name: service.service,
          sessions: Number(service.sessions),
          cost: Number(service.cost || 0),
          therapistId: service.therapistId,
          code: service.code,
          proposalType: "A" as const,
        }));

      const treatmentServicesA = proposalServices
        .filter(
          (service) =>
            service.type === "TREATMENT" && service.proposalType === "A"
        )
        .map((service, index) => ({
          id: 2000 + index, // Use 2000+ for treatments A
          dbId: service.id,
          name: service.service,
          sessions: Number(service.sessions),
          cost: Number(service.cost || 0),
          therapistId: service.therapistId,
          code: service.code,
          proposalType: "A" as const,
        }));

      // Proposal B services
      const evaluationServicesB = proposalServices
        .filter(
          (service) =>
            service.type === "EVALUATION" && service.proposalType === "B"
        )
        .map((service, index) => ({
          id: 3000 + index, // Use 3000+ for evaluations B
          dbId: service.id,
          name: service.service,
          sessions: Number(service.sessions),
          cost: Number(service.cost || 0),
          therapistId: service.therapistId,
          code: service.code,
          proposalType: "B" as const,
        }));

      const treatmentServicesB = proposalServices
        .filter(
          (service) =>
            service.type === "TREATMENT" && service.proposalType === "B"
        )
        .map((service, index) => ({
          id: 4000 + index, // Use 4000+ for treatments B
          dbId: service.id,
          name: service.service,
          sessions: Number(service.sessions),
          cost: Number(service.cost || 0),
          therapistId: service.therapistId,
          code: service.code,
          proposalType: "B" as const,
        }));

      setEvaluationsA(evaluationServicesA);
      setTreatmentsA(treatmentServicesA);
      setEvaluationsB(evaluationServicesB);
      setTreatmentsB(treatmentServicesB);
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

  // Functions to handle evaluations A
  const addEvaluationA = () => {
    const newEvaluation: ServiceItem = {
      id: Math.max(...evaluationsA.map((e) => e.id), 999) + 1,
      name: "",
      code: "",
      sessions: 1,
      cost: 0,
      therapistId: "",
      proposalType: "A",
    };
    setEvaluationsA([...evaluationsA, newEvaluation]);
  };

  const updateEvaluationA = (
    id: number,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setEvaluationsA(
      evaluationsA.map((evaluation) => {
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
              updatedEvaluation.cost = selectedService.sesiones * 150;
              updatedEvaluation.therapistId = "";
            }
          }

          if (field === "cost") {
            updatedEvaluation.cost = Number(value) || 0;
          }

          if (field === "sessions") {
            updatedEvaluation.sessions = Number(value) || 1;
          }

          return updatedEvaluation;
        }
        return evaluation;
      })
    );
  };

  const removeEvaluationA = (id: number) => {
    setEvaluationsA(evaluationsA.filter((evaluation) => evaluation.id !== id));
  };

  // Functions to handle treatments A
  const addTreatmentA = () => {
    const newTreatment: ServiceItem = {
      id: Math.max(...treatmentsA.map((t) => t.id), 1999) + 1,
      name: "",
      code: "",
      sessions: 1,
      cost: 0,
      therapistId: "",
      proposalType: "A",
    };
    setTreatmentsA([...treatmentsA, newTreatment]);
  };

  const updateTreatmentA = (
    id: number,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setTreatmentsA(
      treatmentsA.map((treatment) => {
        if (treatment.id === id) {
          const updatedTreatment = {
            ...treatment,
            [field]: value,
          };

          if (field === "code") {
            const selectedService = serviciosTratamientoData.find(
              (s) => s.codigo === value
            );
            if (selectedService) {
              updatedTreatment.name = selectedService.servicio;
              updatedTreatment.sessions = selectedService.sesiones;
              updatedTreatment.cost = selectedService.sesiones * 150;
              updatedTreatment.therapistId = "";
            }
          }

          if (field === "cost") {
            updatedTreatment.cost = Number(value) || 0;
          }

          if (field === "sessions") {
            updatedTreatment.sessions = Number(value) || 1;
          }

          return updatedTreatment;
        }
        return treatment;
      })
    );
  };

  const removeTreatmentA = (id: number) => {
    setTreatmentsA(treatmentsA.filter((treatment) => treatment.id !== id));
  };

  // Functions to handle evaluations B
  const addEvaluationB = () => {
    const newEvaluation: ServiceItem = {
      id: Math.max(...evaluationsB.map((e) => e.id), 2999) + 1,
      name: "",
      code: "",
      sessions: 1,
      cost: 0,
      therapistId: "",
      proposalType: "B",
    };
    setEvaluationsB([...evaluationsB, newEvaluation]);
  };

  const updateEvaluationB = (
    id: number,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setEvaluationsB(
      evaluationsB.map((evaluation) => {
        if (evaluation.id === id) {
          const updatedEvaluation = {
            ...evaluation,
            [field]: value,
          };

          if (field === "code") {
            const selectedService = serviciosEvaluacionData.find(
              (s) => s.codigo === value
            );
            if (selectedService) {
              updatedEvaluation.name = selectedService.servicio;
              updatedEvaluation.sessions = selectedService.sesiones;
              updatedEvaluation.cost = selectedService.sesiones * 150;
              updatedEvaluation.therapistId = "";
            }
          }

          if (field === "cost") {
            updatedEvaluation.cost = Number(value) || 0;
          }

          if (field === "sessions") {
            updatedEvaluation.sessions = Number(value) || 1;
          }

          return updatedEvaluation;
        }
        return evaluation;
      })
    );
  };

  const removeEvaluationB = (id: number) => {
    setEvaluationsB(evaluationsB.filter((evaluation) => evaluation.id !== id));
  };

  // Functions to handle treatments B
  const addTreatmentB = () => {
    const newTreatment: ServiceItem = {
      id: Math.max(...treatmentsB.map((t) => t.id), 3999) + 1,
      name: "",
      code: "",
      sessions: 1,
      cost: 0,
      therapistId: "",
      proposalType: "B",
    };
    setTreatmentsB([...treatmentsB, newTreatment]);
  };

  const updateTreatmentB = (
    id: number,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setTreatmentsB(
      treatmentsB.map((treatment) => {
        if (treatment.id === id) {
          const updatedTreatment = {
            ...treatment,
            [field]: value,
          };

          if (field === "code") {
            const selectedService = serviciosTratamientoData.find(
              (s) => s.codigo === value
            );
            if (selectedService) {
              updatedTreatment.name = selectedService.servicio;
              updatedTreatment.sessions = selectedService.sesiones;
              updatedTreatment.cost = selectedService.sesiones * 150;
              updatedTreatment.therapistId = "";
            }
          }

          if (field === "cost") {
            updatedTreatment.cost = Number(value) || 0;
          }

          if (field === "sessions") {
            updatedTreatment.sessions = Number(value) || 1;
          }

          return updatedTreatment;
        }
        return treatment;
      })
    );
  };

  const removeTreatmentB = (id: number) => {
    setTreatmentsB(treatmentsB.filter((treatment) => treatment.id !== id));
  };

  // Calculations for both proposals
  const totalEvaluationsA = evaluationsA.reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0
  );
  const totalTreatmentsA = treatmentsA.reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0
  );
  const totalProposalA = totalEvaluationsA + totalTreatmentsA;

  // Calculate session totals for Proposal A
  const totalSessionsEvaluationsA = evaluationsA.reduce(
    (sum, item) => sum + (Number(item.sessions) || 0),
    0
  );
  const totalSessionsTreatmentsA = treatmentsA.reduce(
    (sum, item) => sum + (Number(item.sessions) || 0),
    0
  );
  const totalSessionsProposalA =
    totalSessionsEvaluationsA + totalSessionsTreatmentsA;

  const totalEvaluationsB = evaluationsB.reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0
  );
  const totalTreatmentsB = treatmentsB.reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0
  );
  const totalProposalB = totalEvaluationsB + totalTreatmentsB;

  // Calculate session totals for Proposal B
  const totalSessionsEvaluationsB = evaluationsB.reduce(
    (sum, item) => sum + (Number(item.sessions) || 0),
    0
  );
  const totalSessionsTreatmentsB = treatmentsB.reduce(
    (sum, item) => sum + (Number(item.sessions) || 0),
    0
  );
  const totalSessionsProposalB =
    totalSessionsEvaluationsB + totalSessionsTreatmentsB;

  // Update the saveProposal function to include both proposals
  const saveProposal = async () => {
    try {
      // Validate that all services have therapists assigned
      const allServices = [
        ...evaluationsA,
        ...treatmentsA,
        ...evaluationsB,
        ...treatmentsB,
      ];
      const servicesWithoutTherapist = allServices.filter(
        (service) => !service.therapistId
      );

      if (servicesWithoutTherapist.length > 0) {
        toast({
          title: "Error de validación",
          description: "Todos los servicios deben tener un terapeuta asignado",
          variant: "destructive",
        });
        return;
      }

      const allServicesData = [
        // Proposal A services
        ...evaluationsA.map((evaluation) => ({
          treatmentProposalId: params.id as string,
          type: "EVALUATION" as const,
          code: evaluation.code,
          service: evaluation.name,
          sessions: Number(evaluation.sessions),
          cost: Number(evaluation.cost) || 0,
          therapistId: evaluation.therapistId!,
          proposalType: "A",
        })),
        ...treatmentsA.map((treatment) => ({
          treatmentProposalId: params.id as string,
          type: "TREATMENT" as const,
          code: treatment.code,
          service: treatment.name,
          sessions: Number(treatment.sessions),
          cost: Number(treatment.cost) || 0,
          therapistId: treatment.therapistId!,
          proposalType: "A",
        })),
        // Proposal B services
        ...evaluationsB.map((evaluation) => ({
          treatmentProposalId: params.id as string,
          type: "EVALUATION" as const,
          code: evaluation.code,
          service: evaluation.name,
          sessions: Number(evaluation.sessions),
          cost: Number(evaluation.cost) || 0,
          therapistId: evaluation.therapistId!,
          proposalType: "B",
        })),
        ...treatmentsB.map((treatment) => ({
          treatmentProposalId: params.id as string,
          type: "TREATMENT" as const,
          code: treatment.code,
          service: treatment.name,
          sessions: Number(treatment.sessions),
          cost: Number(treatment.cost) || 0,
          therapistId: treatment.therapistId!,
          proposalType: "B",
        })),
      ];

      // Filter out empty services
      const validServices = allServicesData.filter(
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

  // Helper function to render service section
  const renderServiceSection = (
    title: string,
    services: ServiceItem[],
    addService: () => void,
    updateService: (
      id: number,
      field: keyof ServiceItem,
      value: string | number
    ) => void,
    removeService: (id: number) => void,
    serviceData: Array<{
      codigo: string;
      servicio: string;
      sesiones: number;
      descripcion?: string;
    }>,
    proposalType: "A" | "B"
  ) => {
    const proposalColor = proposalType === "A" ? "blue" : "green";

    return (
      <Card className={`border-${proposalColor}-200`}>
        <CardHeader
          className={`flex flex-row items-center justify-between space-y-0 bg-${proposalColor}-50`}
        >
          <CardTitle className={`text-${proposalColor}-900`}>{title}</CardTitle>
          <Button
            onClick={addService}
            size="sm"
            variant="outline"
            className={`border-${proposalColor}-200 text-${proposalColor}-600 hover:bg-${proposalColor}-50`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Servicio
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => {
              // Get list of already selected services (excluding current service)
              const selectedCodes = services
                .filter((s) => s.id !== service.id)
                .map((s) => s.code)
                .filter(Boolean);

              // Filter out already selected services
              const availableServices = serviceData.filter(
                (serviceItem) => !selectedCodes.includes(serviceItem.codigo)
              );

              return (
                <div
                  key={service.id}
                  className={`p-4 border border-${proposalColor}-200 rounded-lg bg-${proposalColor}-25`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <Label className="text-sm font-medium">
                        Nombre del Servicio
                      </Label>
                      <Select
                        value={service.code}
                        onValueChange={(value) =>
                          updateService(service.id, "code", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableServices.map((serviceItem) => (
                            <SelectItem
                              key={serviceItem.codigo}
                              value={serviceItem.codigo}
                            >
                              {serviceItem.servicio}
                            </SelectItem>
                          ))}
                          {service.code &&
                            !availableServices.some(
                              (s) => s.codigo === service.code
                            ) && (
                              <SelectItem value={service.code}>
                                {
                                  serviceData.find(
                                    (s) => s.codigo === service.code
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
                        value={service.therapistId}
                        onValueChange={(value) =>
                          updateService(service.id, "therapistId", value)
                        }
                        disabled={!service.code}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar terapeuta" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTherapistsByService(service.code).map(
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
                        value={service.sessions}
                        onChange={(e) =>
                          updateService(service.id, "sessions", e.target.value)
                        }
                        min="1"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Costo (Bs.)</Label>
                      <div className="flex mt-1">
                        <Input
                          type="number"
                          value={service.cost}
                          onChange={(e) =>
                            updateService(service.id, "cost", e.target.value)
                          }
                          min="0"
                          className="rounded-r-none"
                        />
                        <Button
                          onClick={() => removeService(service.id)}
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
          </div>
        </CardContent>
      </Card>
    );
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
              <h1 className="text-3xl font-bold">
                Editar Propuesta Económica (Dual)
              </h1>
              <p className="text-gray-600">
                Personaliza los servicios y costos para ambas propuestas (A y B)
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

        {/* Proposal A */}
            <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <h2 className="text-2xl font-bold text-blue-900">Propuesta A</h2>
          </div>

          {/* Evaluations A */}
          {renderServiceSection(
            "Evaluaciones - Propuesta A",
            evaluationsA,
            addEvaluationA,
            updateEvaluationA,
            removeEvaluationA,
            serviciosEvaluacionData,
            "A"
          )}

          {/* Treatments A */}
          {renderServiceSection(
            "Tratamientos - Propuesta A (6 meses)",
            treatmentsA,
            addTreatmentA,
            updateTreatmentA,
            removeTreatmentA,
            serviciosTratamientoData,
            "A"
          )}

          {/* Proposal A Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Evaluaciones A:</span>
                  <span>Bs. {totalEvaluationsA.toLocaleString()}</span>
                      </div>
                <div className="flex justify-between text-lg">
                  <span>Tratamientos A:</span>
                  <span>Bs. {totalTreatmentsA.toLocaleString()}</span>
                      </div>
                <div className="border-t border-blue-300 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>TOTAL PROPUESTA A:</span>
                    <span className="text-blue-600">
                      Bs. {totalProposalA.toLocaleString()}
                    </span>
                      </div>
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Total Sesiones:</span>
                    <span>{totalSessionsProposalA} sesiones</span>
                        </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Proposal B */}
            <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <h2 className="text-2xl font-bold text-green-900">Propuesta B</h2>
          </div>

          {/* Evaluations B */}
          {renderServiceSection(
            "Evaluaciones - Propuesta B",
            evaluationsB,
            addEvaluationB,
            updateEvaluationB,
            removeEvaluationB,
            serviciosEvaluacionData,
            "B"
          )}

          {/* Treatments B */}
          {renderServiceSection(
            "Tratamientos - Propuesta B (6 meses)",
            treatmentsB,
            addTreatmentB,
            updateTreatmentB,
            removeTreatmentB,
            serviciosTratamientoData,
            "B"
          )}

          {/* Proposal B Summary */}
          <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                  <span>Evaluaciones B:</span>
                  <span>Bs. {totalEvaluationsB.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                  <span>Tratamientos B:</span>
                  <span>Bs. {totalTreatmentsB.toLocaleString()}</span>
              </div>
                <div className="border-t border-green-300 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>TOTAL PROPUESTA B:</span>
                    <span className="text-green-600">
                      Bs. {totalProposalB.toLocaleString()}
                  </span>
                </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Total Sesiones:</span>
                    <span>{totalSessionsProposalB} sesiones</span>
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

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
