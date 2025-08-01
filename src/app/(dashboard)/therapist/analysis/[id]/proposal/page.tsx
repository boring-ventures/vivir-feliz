"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronLeft,
  Calculator,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useMedicalFormAnalysis } from "@/hooks/use-medical-form-analysis";
import { useTherapists, getTherapistDisplayName } from "@/hooks/useTherapists";
import { useServices } from "@/hooks/useServices";
import { useExistingProposal } from "@/hooks/use-existing-proposal";
import { useEffect } from "react";

export default function TerapeutaPropuestaServicioPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  // Fetch appointment data
  const {
    data: analysisData,
    isLoading: loading,
    error,
  } = useMedicalFormAnalysis(appointmentId);

  // Fetch services from database
  const { data: allServices = [], isLoading: servicesLoading } = useServices();

  // Fetch existing proposal data
  const { data: existingProposalData } = useExistingProposal(appointmentId);

  const [quienTomaConsulta, setQuienTomaConsulta] = useState("");
  const [derivacion, setDerivacion] = useState("");

  // Separate state for Proposal A and Proposal B
  const [
    serviciosEvaluacionSeleccionados,
    setServiciosEvaluacionSeleccionados,
  ] = useState<Record<string, boolean>>({});
  const [
    serviciosTratamientoSeleccionados,
    setServiciosTratamientoSeleccionados,
  ] = useState<Record<string, boolean>>({});
  const [terapeutasEvaluacionA, setTerapeutasEvaluacionA] = useState<
    Record<string, string>
  >({});
  const [terapeutasTratamientoA, setTerapeutasTratamientoA] = useState<
    Record<string, string>
  >({});

  // Remove unused state for Proposal B therapists - now using same therapists for both proposals
  // const [terapeutasEvaluacionB, setTerapeutasEvaluacionB] = useState<
  //   Record<string, string>
  // >({});
  // const [terapeutasTratamientoB, setTerapeutasTratamientoB] = useState<
  //   Record<string, string>
  // >({});

  // Session count state for each proposal
  const [sesionesEvaluacionA, setSesionesEvaluacionA] = useState<
    Record<string, number>
  >({});
  const [sesionesTratamientoA, setSesionesTratamientoA] = useState<
    Record<string, number>
  >({});
  const [sesionesEvaluacionB, setSesionesEvaluacionB] = useState<
    Record<string, number>
  >({});
  const [sesionesTratamientoB, setSesionesTratamientoB] = useState<
    Record<string, number>
  >({});

  // Time availability state - only Monday to Friday, no Saturday
  const [timeAvailability, setTimeAvailability] = useState<
    Record<string, { morning: boolean; afternoon: boolean }>
  >({
    monday: { morning: false, afternoon: false },
    tuesday: { morning: false, afternoon: false },
    wednesday: { morning: false, afternoon: false },
    thursday: { morning: false, afternoon: false },
    friday: { morning: false, afternoon: false },
  });

  // Debug: Log time availability state changes
  useEffect(() => {
    console.log("Time availability state changed:", timeAvailability);
  }, [timeAvailability]);

  // Collapsible states
  const [evaluacionOpen, setEvaluacionOpen] = useState(false);
  const [tratamientoOpen, setTratamientoOpen] = useState(false);
  const [disponibilidadOpen, setDisponibilidadOpen] = useState(false);

  // Filter services by type
  const serviciosEvaluacionData = allServices.filter(
    (service) => service.type === "EVALUATION" && service.status
  );
  const serviciosTratamientoData = allServices.filter(
    (service) => service.type === "TREATMENT" && service.status
  );

  // Load all therapists (we'll filter by specialty in the component)
  const { data: allTherapists = [], isLoading: therapistsLoading } =
    useTherapists();

  // Load existing proposal data when available
  useEffect(() => {
    if (existingProposalData) {
      console.log("Loading existing proposal data:", existingProposalData);
      setQuienTomaConsulta(existingProposalData.quienTomaConsulta);
      setDerivacion(existingProposalData.derivacion);
      console.log(
        "Setting time availability:",
        existingProposalData.timeAvailability
      );
      // Convert array format to object format if needed
      const timeAvailabilityData = Array.isArray(
        existingProposalData.timeAvailability
      )
        ? arrayToObject(existingProposalData.timeAvailability)
        : existingProposalData.timeAvailability;
      setTimeAvailability(timeAvailabilityData);
      console.log(
        "Time availability state after setting:",
        timeAvailabilityData
      );

      // Load evaluation services for Proposal A
      const evaluacionA: Record<string, boolean> = {};
      const terapeutasEvaluacionA: Record<string, string> = {};
      const sesionesEvaluacionA: Record<string, number> = {};

      existingProposalData.serviciosEvaluacionA.forEach((service) => {
        evaluacionA[service.codigo] = true;
        terapeutasEvaluacionA[service.codigo] = service.terapeutaId;
        sesionesEvaluacionA[service.codigo] = service.sesiones;
      });

      setServiciosEvaluacionSeleccionados(evaluacionA);
      setTerapeutasEvaluacionA(terapeutasEvaluacionA);
      setSesionesEvaluacionA(sesionesEvaluacionA);

      // Load treatment services for Proposal A
      const tratamientoA: Record<string, boolean> = {};
      const terapeutasTratamientoA: Record<string, string> = {};
      const sesionesTratamientoA: Record<string, number> = {};

      existingProposalData.serviciosTratamientoA.forEach((service) => {
        tratamientoA[service.codigo] = true;
        terapeutasTratamientoA[service.codigo] = service.terapeutaId;
        sesionesTratamientoA[service.codigo] = service.sesiones;
      });

      setServiciosTratamientoSeleccionados(tratamientoA);
      setTerapeutasTratamientoA(terapeutasTratamientoA);
      setSesionesTratamientoA(sesionesTratamientoA);

      // Load evaluation services for Proposal B
      const evaluacionB: Record<string, boolean> = {};
      const sesionesEvaluacionB: Record<string, number> = {};

      existingProposalData.serviciosEvaluacionB.forEach((service) => {
        evaluacionB[service.codigo] = true;
        sesionesEvaluacionB[service.codigo] = service.sesiones;
      });

      setSesionesEvaluacionB(sesionesEvaluacionB);

      // Load treatment services for Proposal B
      const tratamientoB: Record<string, boolean> = {};
      const sesionesTratamientoB: Record<string, number> = {};

      existingProposalData.serviciosTratamientoB.forEach((service) => {
        tratamientoB[service.codigo] = true;
        sesionesTratamientoB[service.codigo] = service.sesiones;
      });

      setSesionesTratamientoB(sesionesTratamientoB);
    }
  }, [existingProposalData]);

  // Helper function to get therapists by specialty for a specific service
  const getTherapistsByService = (codigo: string) => {
    // Find the service in both evaluation and treatment arrays
    const service = [
      ...serviciosEvaluacionData,
      ...serviciosTratamientoData,
    ].find((s) => s.code === codigo);

    if (!service) {
      return allTherapists; // If service not found, show all therapists
    }

    return allTherapists.filter(
      (therapist) => therapist.specialty === service.specialty
    );
  };

  const handleTerapeutaEvaluacionChangeA = (
    codigo: string,
    terapeuta: string
  ) => {
    setTerapeutasEvaluacionA((prev) => ({ ...prev, [codigo]: terapeuta }));
  };

  const handleTerapeutaTratamientoChangeA = (
    codigo: string,
    terapeuta: string
  ) => {
    setTerapeutasTratamientoA((prev) => ({ ...prev, [codigo]: terapeuta }));
  };

  // Remove unused handlers for Proposal B therapists
  // const handleTerapeutaEvaluacionChangeB = (
  //   codigo: string,
  //   terapeuta: string
  // ) => {
  //   setTerapeutasEvaluacionB((prev) => ({ ...prev, [codigo]: terapeuta }));
  // };

  // const handleTerapeutaTratamientoChangeB = (
  //   codigo: string,
  //   terapeuta: string
  // ) => {
  //   setTerapeutasTratamientoB((prev) => ({ ...prev, [codigo]: terapeuta }));
  // };

  // Handler for evaluation select checkbox - now controls both proposals
  const handleEvaluacionSelectChange = (codigo: string, checked: boolean) => {
    setServiciosEvaluacionSeleccionados((prev) => ({
      ...prev,
      [codigo]: checked,
    }));
  };
  // Handler for treatment select checkbox - now controls both proposals
  const handleTratamientoSelectChange = (codigo: string, checked: boolean) => {
    setServiciosTratamientoSeleccionados((prev) => ({
      ...prev,
      [codigo]: checked,
    }));
  };

  // Remove separate handlers for Proposal B
  // const handleEvaluacionSelectChangeB = (codigo: string, checked: boolean) => {
  //   setServiciosEvaluacionB((prev) => ({
  //     ...prev,
  //     [codigo]: checked,
  //   }));
  // };

  // const handleTratamientoSelectChangeB = (codigo: string, checked: boolean) => {
  //   setServiciosTratamientoB((prev) => ({
  //     ...prev,
  //     [codigo]: checked,
  //   }));
  // };

  // Session count handlers
  const handleSesionesEvaluacionChangeA = (
    codigo: string,
    sesiones: number
  ) => {
    setSesionesEvaluacionA((prev) => ({ ...prev, [codigo]: sesiones }));
  };

  const handleSesionesTratamientoChangeA = (
    codigo: string,
    sesiones: number
  ) => {
    setSesionesTratamientoA((prev) => ({ ...prev, [codigo]: sesiones }));
  };

  const handleSesionesEvaluacionChangeB = (
    codigo: string,
    sesiones: number
  ) => {
    setSesionesEvaluacionB((prev) => ({ ...prev, [codigo]: sesiones }));
  };

  const handleSesionesTratamientoChangeB = (
    codigo: string,
    sesiones: number
  ) => {
    setSesionesTratamientoB((prev) => ({ ...prev, [codigo]: sesiones }));
  };

  // Function to convert array format to object format for UI
  const arrayToObject = (
    array: Array<{ day: string; morning: boolean; afternoon: boolean }>
  ) => {
    const result: Record<string, { morning: boolean; afternoon: boolean }> = {};
    array.forEach(({ day, morning, afternoon }) => {
      result[day] = { morning, afternoon };
    });
    return result;
  };

  const handleTimeAvailabilityChange = (
    day: string,
    period: "morning" | "afternoon",
    checked: boolean
  ) => {
    console.log(`Changing ${day} ${period} to ${checked}`);
    setTimeAvailability((prev) => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [period]: checked,
        },
      };

      // Return the updated availability in the correct order
      console.log("Time availability updated:", updated);
      return updated;
    });
  };

  const calcularCosto = () => {
    console.log("Calculando costo...");
    // TODO: Implement cost calculation logic
    toast({
      title: "Calculando costo",
      description: "Funcionalidad en desarrollo",
    });
  };

  const validateForm = () => {
    if (!derivacion) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar una opción de derivación",
        variant: "destructive",
      });
      return false;
    }

    if (!quienTomaConsulta.trim()) {
      toast({
        title: "Error de validación",
        description: "Debe especificar quién toma la consulta",
        variant: "destructive",
      });
      return false;
    }

    // Check if at least one proposal has services selected with sessions > 0
    const hasEvaluacionA = Object.entries(
      serviciosEvaluacionSeleccionados
    ).some(([codigo, selected]) => {
      const sessionCountA =
        sesionesEvaluacionA[codigo] ||
        serviciosEvaluacionData.find((s) => s.code === codigo)?.sessions ||
        0;
      return selected && sessionCountA > 0;
    });
    const hasTratamientoA = Object.entries(
      serviciosTratamientoSeleccionados
    ).some(([codigo, selected]) => {
      const sessionCountA =
        sesionesTratamientoA[codigo] ||
        serviciosTratamientoData.find((s) => s.code === codigo)?.sessions ||
        0;
      return selected && sessionCountA > 0;
    });
    const hasEvaluacionB = Object.entries(
      serviciosEvaluacionSeleccionados
    ).some(([codigo, selected]) => {
      const sessionCountB =
        sesionesEvaluacionB[codigo] ||
        serviciosEvaluacionData.find((s) => s.code === codigo)?.sessions ||
        0;
      return selected && sessionCountB > 0;
    });
    const hasTratamientoB = Object.entries(
      serviciosTratamientoSeleccionados
    ).some(([codigo, selected]) => {
      const sessionCountB =
        sesionesTratamientoB[codigo] ||
        serviciosTratamientoData.find((s) => s.code === codigo)?.sessions ||
        0;
      return selected && sessionCountB > 0;
    });

    const hasProposalA = hasEvaluacionA || hasTratamientoA;
    const hasProposalB = hasEvaluacionB || hasTratamientoB;

    if (!hasProposalA && !hasProposalB) {
      toast({
        title: "Error de validación",
        description:
          "Debe seleccionar al menos un servicio en alguna de las propuestas con sesiones > 0",
        variant: "destructive",
      });
      return false;
    }

    // Check if at least one time slot is selected
    const hasTimeAvailability = Object.values(timeAvailability).some(
      (day) => day.morning || day.afternoon
    );

    if (!hasTimeAvailability) {
      toast({
        title: "Error de validación",
        description:
          "Debe seleccionar al menos un horario disponible para el tratamiento",
        variant: "destructive",
      });
      return false;
    }

    // Check if selected services have therapists assigned
    const selectedEvaluacion = Object.entries(
      serviciosEvaluacionSeleccionados
    ).filter(([, selected]) => selected);
    const selectedTratamiento = Object.entries(
      serviciosTratamientoSeleccionados
    ).filter(([, selected]) => selected);

    const missingTherapists = [
      ...selectedEvaluacion.filter(
        ([codigo]) => !terapeutasEvaluacionA[codigo]
      ),
      ...selectedTratamiento.filter(
        ([codigo]) => !terapeutasTratamientoA[codigo]
      ),
    ];

    if (missingTherapists.length > 0) {
      toast({
        title: "Error de validación",
        description:
          "Todos los servicios seleccionados deben tener un terapeuta asignado",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const enviarAAdmin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log("Sending time availability to API:", timeAvailability);
      console.log("JSON.stringify result:", JSON.stringify(timeAvailability));

      const proposalData = {
        appointmentId,
        quienTomaConsulta,
        derivacion,
        timeAvailability: timeAvailability,
        // Proposal A services - only include services with sessions > 0 for A
        serviciosEvaluacionA: Object.entries(serviciosEvaluacionSeleccionados)
          .filter(([codigo, selected]) => {
            const sessionCountA =
              sesionesEvaluacionA[codigo] ||
              serviciosEvaluacionData.find((s) => s.code === codigo)
                ?.sessions ||
              0;
            return selected && sessionCountA > 0;
          })
          .map(([codigo]) => {
            const therapistId = terapeutasEvaluacionA[codigo];
            const therapist = allTherapists.find((t) => t.id === therapistId);
            return {
              codigo,
              terapeutaId: therapistId,
              terapeutaNombre: therapist
                ? getTherapistDisplayName(therapist)
                : "",
              terapeutaEspecialidad: therapist?.specialty || "",
              servicio: serviciosEvaluacionData.find((s) => s.code === codigo)
                ?.serviceName,
              sesiones:
                sesionesEvaluacionA[codigo] ||
                serviciosEvaluacionData.find((s) => s.code === codigo)
                  ?.sessions ||
                0,
              proposalType: "A",
            };
          }),
        serviciosTratamientoA: Object.entries(serviciosTratamientoSeleccionados)
          .filter(([codigo, selected]) => {
            const sessionCountA =
              sesionesTratamientoA[codigo] ||
              serviciosTratamientoData.find((s) => s.code === codigo)
                ?.sessions ||
              0;
            return selected && sessionCountA > 0;
          })
          .map(([codigo]) => {
            const therapistId = terapeutasTratamientoA[codigo];
            const therapist = allTherapists.find((t) => t.id === therapistId);
            return {
              codigo,
              terapeutaId: therapistId,
              terapeutaNombre: therapist
                ? getTherapistDisplayName(therapist)
                : "",
              terapeutaEspecialidad: therapist?.specialty || "",
              servicio: serviciosTratamientoData.find((s) => s.code === codigo)
                ?.serviceName,
              sesiones:
                sesionesTratamientoA[codigo] ||
                serviciosTratamientoData.find((s) => s.code === codigo)
                  ?.sessions ||
                0,
              proposalType: "A",
            };
          }),
        // Proposal B services - only include services with sessions > 0 for B
        serviciosEvaluacionB: Object.entries(serviciosEvaluacionSeleccionados)
          .filter(([codigo, selected]) => {
            const sessionCountB =
              sesionesEvaluacionB[codigo] ||
              serviciosEvaluacionData.find((s) => s.code === codigo)
                ?.sessions ||
              0;
            return selected && sessionCountB > 0;
          })
          .map(([codigo]) => {
            const therapistId = terapeutasEvaluacionA[codigo]; // Use same therapist for both proposals
            const therapist = allTherapists.find((t) => t.id === therapistId);
            return {
              codigo,
              terapeutaId: therapistId,
              terapeutaNombre: therapist
                ? getTherapistDisplayName(therapist)
                : "",
              terapeutaEspecialidad: therapist?.specialty || "",
              servicio: serviciosEvaluacionData.find((s) => s.code === codigo)
                ?.serviceName,
              sesiones:
                sesionesEvaluacionB[codigo] ||
                serviciosEvaluacionData.find((s) => s.code === codigo)
                  ?.sessions ||
                0,
              proposalType: "B",
            };
          }),
        serviciosTratamientoB: Object.entries(serviciosTratamientoSeleccionados)
          .filter(([codigo, selected]) => {
            const sessionCountB =
              sesionesTratamientoB[codigo] ||
              serviciosTratamientoData.find((s) => s.code === codigo)
                ?.sessions ||
              0;
            return selected && sessionCountB > 0;
          })
          .map(([codigo]) => {
            const therapistId = terapeutasTratamientoA[codigo]; // Use same therapist for both proposals
            const therapist = allTherapists.find((t) => t.id === therapistId);
            return {
              codigo,
              terapeutaId: therapistId,
              terapeutaNombre: therapist
                ? getTherapistDisplayName(therapist)
                : "",
              terapeutaEspecialidad: therapist?.specialty || "",
              servicio: serviciosTratamientoData.find((s) => s.code === codigo)
                ?.serviceName,
              sesiones:
                sesionesTratamientoB[codigo] ||
                serviciosTratamientoData.find((s) => s.code === codigo)
                  ?.sessions ||
                0,
              proposalType: "B",
            };
          }),
      };

      const response = await fetch(
        `/api/therapist/appointments/${appointmentId}/proposal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(proposalData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear la propuesta");
      }

      toast({
        title: "¡Propuesta creada exitosamente!",
        description:
          "La propuesta técnica ha sido enviada al administrador y el análisis se ha marcado como completado.",
      });

      // Redirect back to analysis list
      router.push("/therapist/analysis");
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo crear la propuesta técnica",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  if (loading || servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando información...
          </h3>
          <p className="text-gray-500">
            Por favor espera mientras cargamos los datos necesarios
          </p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se pudo cargar la información
          </h3>
          <p className="text-gray-500 mb-4">
            No se encontró información para esta cita
          </p>
          <Link href="/therapist/analysis">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al listado
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { appointment } = analysisData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center space-x-4">
          <Link href={`/therapist/analysis/${appointmentId}`}>
            <Button variant="outline" size="sm" className="border-gray-200">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Propuesta Técnica - {appointment.patientName}
            </h1>
            <p className="text-gray-600 mt-1">
              Genera la propuesta de tratamiento para el paciente
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-full mx-auto">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 space-y-8">
            {/* Información del Cliente y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Cliente:
                </Label>
                <Input
                  value={appointment.patientName || ""}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fecha:
                </Label>
                <Input
                  value={formatDate(appointment.date)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Quien toma la consulta */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Quien toma la consulta: *
              </Label>
              <Input
                value={quienTomaConsulta}
                onChange={(e) => setQuienTomaConsulta(e.target.value)}
                placeholder="Ingrese quien toma la consulta"
                required
              />
            </div>

            {/* Se deriva a */}
            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-4 block">
                Se deriva a: *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { value: "evaluacion", label: "Evaluación" },
                  { value: "bimestre", label: "Tratamiento Bimestre" },
                  { value: "trimestre", label: "Tratamiento Trimestre" },
                  { value: "cuatrimestre", label: "Tratamiento Cuatrimestre" },
                  { value: "semestre", label: "Tratamiento Semestre" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={option.value}
                      checked={derivacion === option.value}
                      onCheckedChange={(checked) =>
                        checked && setDerivacion(option.value)
                      }
                    />
                    <Label
                      htmlFor={option.value}
                      className="text-sm font-medium"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Servicios de Evaluación */}
            <Collapsible open={evaluacionOpen} onOpenChange={setEvaluacionOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full p-4 text-gray-900 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <h3 className="text-lg font-semibold">EVALUACIÓN</h3>
                  {evaluacionOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="bg-white rounded-lg border border-gray-200">
                  {/* Proposal Summary */}
                  <div className="p-4 bg-blue-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-900 mb-2">
                          Propuesta A
                        </h4>
                        <p className="text-sm text-gray-600">
                          Servicios seleccionados:{" "}
                          {
                            Object.values(
                              serviciosEvaluacionSeleccionados
                            ).filter(Boolean).length
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          Total sesiones:{" "}
                          {Object.entries(serviciosEvaluacionSeleccionados)
                            .filter(([, selected]) => selected)
                            .reduce((total, [codigo]) => {
                              return (
                                total +
                                (sesionesEvaluacionA[codigo] ||
                                  serviciosEvaluacionData.find(
                                    (s) => s.code === codigo
                                  )?.sessions ||
                                  0)
                              );
                            }, 0)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-900 mb-2">
                          Propuesta B
                        </h4>
                        <p className="text-sm text-gray-600">
                          Servicios seleccionados:{" "}
                          {
                            Object.values(
                              serviciosEvaluacionSeleccionados
                            ).filter(Boolean).length
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          Total sesiones:{" "}
                          {Object.entries(serviciosEvaluacionSeleccionados)
                            .filter(([, selected]) => selected)
                            .reduce((total, [codigo]) => {
                              return (
                                total +
                                (sesionesEvaluacionB[codigo] ||
                                  serviciosEvaluacionData.find(
                                    (s) => s.code === codigo
                                  )?.sessions ||
                                  0)
                              );
                            }, 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="border border-gray-300 p-3 text-left font-medium text-gray-900">
                            Código
                          </th>
                          <th className="border border-gray-300 p-3 text-left font-medium text-gray-900">
                            Servicio de Evaluación
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-blue-900 bg-blue-50">
                            N° Sesiones A
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-green-900 bg-green-50">
                            N° Sesiones B
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                            Terapeuta
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviciosEvaluacionData.map((servicio, index) => (
                          <tr
                            key={`${servicio.code}-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="border border-gray-300 p-3 font-mono text-sm">
                              {servicio.code}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {servicio.serviceName}
                            </td>
                            <td className="border border-gray-300 p-3 text-center bg-blue-50">
                              <Input
                                type="number"
                                min="1"
                                value={
                                  sesionesEvaluacionA[servicio.code] ||
                                  servicio.sessions
                                }
                                onChange={(e) =>
                                  handleSesionesEvaluacionChangeA(
                                    servicio.code,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 text-center text-sm"
                                disabled={
                                  !serviciosEvaluacionSeleccionados[
                                    servicio.code
                                  ]
                                }
                              />
                            </td>
                            <td className="border border-gray-300 p-3 text-center bg-green-50">
                              <Input
                                type="number"
                                min="1"
                                value={
                                  sesionesEvaluacionB[servicio.code] ||
                                  servicio.sessions
                                }
                                onChange={(e) =>
                                  handleSesionesEvaluacionChangeB(
                                    servicio.code,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 text-center text-sm"
                                disabled={
                                  !serviciosEvaluacionSeleccionados[
                                    servicio.code
                                  ]
                                }
                              />
                            </td>
                            <td className="border border-gray-300 p-3">
                              <Select
                                value={
                                  terapeutasEvaluacionA[servicio.code] || ""
                                }
                                onValueChange={(value) =>
                                  handleTerapeutaEvaluacionChangeA(
                                    servicio.code,
                                    value
                                  )
                                }
                                disabled={
                                  !serviciosEvaluacionSeleccionados[
                                    servicio.code
                                  ] || therapistsLoading
                                }
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue placeholder="Seleccionar terapeuta" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getTherapistsByService(servicio.code)
                                    .length > 0 ? (
                                    getTherapistsByService(servicio.code).map(
                                      (therapist) => (
                                        <SelectItem
                                          key={therapist.id}
                                          value={therapist.id}
                                        >
                                          {getTherapistDisplayName(therapist)}
                                        </SelectItem>
                                      )
                                    )
                                  ) : (
                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                      {therapistsLoading
                                        ? "Cargando..."
                                        : "No hay terapeutas disponibles"}
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <Checkbox
                                checked={
                                  serviciosEvaluacionSeleccionados[
                                    servicio.code
                                  ] || false
                                }
                                onCheckedChange={(checked) =>
                                  handleEvaluacionSelectChange(
                                    servicio.code,
                                    checked as boolean
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Servicios de Tratamiento */}
            <Collapsible
              open={tratamientoOpen}
              onOpenChange={setTratamientoOpen}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full p-4 text-gray-900 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <h3 className="text-lg font-semibold">TRATAMIENTO</h3>
                  {tratamientoOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="bg-white rounded-lg border border-gray-200">
                  {/* Proposal Summary */}
                  <div className="p-4 bg-blue-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-900 mb-2">
                          Propuesta A
                        </h4>
                        <p className="text-sm text-gray-600">
                          Servicios seleccionados:{" "}
                          {
                            Object.values(
                              serviciosTratamientoSeleccionados
                            ).filter(Boolean).length
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          Total sesiones:{" "}
                          {Object.entries(serviciosTratamientoSeleccionados)
                            .filter(([, selected]) => selected)
                            .reduce((total, [codigo]) => {
                              return (
                                total +
                                (sesionesTratamientoA[codigo] ||
                                  serviciosTratamientoData.find(
                                    (s) => s.code === codigo
                                  )?.sessions ||
                                  0)
                              );
                            }, 0)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-900 mb-2">
                          Propuesta B
                        </h4>
                        <p className="text-sm text-gray-600">
                          Servicios seleccionados:{" "}
                          {
                            Object.values(
                              serviciosTratamientoSeleccionados
                            ).filter(Boolean).length
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          Total sesiones:{" "}
                          {Object.entries(serviciosTratamientoSeleccionados)
                            .filter(([, selected]) => selected)
                            .reduce((total, [codigo]) => {
                              return (
                                total +
                                (sesionesTratamientoB[codigo] ||
                                  serviciosTratamientoData.find(
                                    (s) => s.code === codigo
                                  )?.sessions ||
                                  0)
                              );
                            }, 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="border border-gray-300 p-3 text-left font-medium text-gray-900">
                            Código
                          </th>
                          <th className="border border-gray-300 p-3 text-left font-medium text-gray-900">
                            Servicio
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-blue-900 bg-blue-50">
                            N° Sesiones A
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-green-900 bg-green-50">
                            N° Sesiones B
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                            Terapeuta
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviciosTratamientoData.map((servicio, index) => (
                          <tr
                            key={`${servicio.code}-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="border border-gray-300 p-3 font-mono text-sm">
                              {servicio.code}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {servicio.serviceName}
                            </td>
                            <td className="border border-gray-300 p-3 text-center bg-blue-50">
                              <Input
                                type="number"
                                min="1"
                                value={
                                  sesionesTratamientoA[servicio.code] ||
                                  servicio.sessions
                                }
                                onChange={(e) =>
                                  handleSesionesTratamientoChangeA(
                                    servicio.code,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 text-center text-sm"
                                disabled={
                                  !serviciosTratamientoSeleccionados[
                                    servicio.code
                                  ]
                                }
                              />
                            </td>
                            <td className="border border-gray-300 p-3 text-center bg-green-50">
                              <Input
                                type="number"
                                min="1"
                                value={
                                  sesionesTratamientoB[servicio.code] ||
                                  servicio.sessions
                                }
                                onChange={(e) =>
                                  handleSesionesTratamientoChangeB(
                                    servicio.code,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 text-center text-sm"
                                disabled={
                                  !serviciosTratamientoSeleccionados[
                                    servicio.code
                                  ]
                                }
                              />
                            </td>
                            <td className="border border-gray-300 p-3">
                              <Select
                                value={
                                  terapeutasTratamientoA[servicio.code] || ""
                                }
                                onValueChange={(value) =>
                                  handleTerapeutaTratamientoChangeA(
                                    servicio.code,
                                    value
                                  )
                                }
                                disabled={
                                  !serviciosTratamientoSeleccionados[
                                    servicio.code
                                  ] || therapistsLoading
                                }
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue placeholder="Seleccionar terapeuta" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getTherapistsByService(servicio.code)
                                    .length > 0 ? (
                                    getTherapistsByService(servicio.code).map(
                                      (therapist) => (
                                        <SelectItem
                                          key={therapist.id}
                                          value={therapist.id}
                                        >
                                          {getTherapistDisplayName(therapist)}
                                        </SelectItem>
                                      )
                                    )
                                  ) : (
                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                      {therapistsLoading
                                        ? "Cargando..."
                                        : "No hay terapeutas disponibles"}
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <Checkbox
                                checked={
                                  serviciosTratamientoSeleccionados[
                                    servicio.code
                                  ] || false
                                }
                                onCheckedChange={(checked) =>
                                  handleTratamientoSelectChange(
                                    servicio.code,
                                    checked as boolean
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Disponibilidad de Tiempo */}
            <Collapsible
              open={disponibilidadOpen}
              onOpenChange={setDisponibilidadOpen}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full p-4 text-gray-900 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <h3 className="text-lg font-semibold">
                    DISPONIBILIDAD DE TIEMPO
                  </h3>
                  {disponibilidadOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">
                      Marque los horarios disponibles para el tratamiento:
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Seleccione las mañanas y tardes en las que el paciente
                      puede asistir
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Nota:</strong> Esta información ayudará a
                        programar las sesiones de tratamiento en los horarios
                        más convenientes para el paciente.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                            Día
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                            Mañana
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                            Tarde
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: "monday", label: "Lunes" },
                          { key: "tuesday", label: "Martes" },
                          { key: "wednesday", label: "Miércoles" },
                          { key: "thursday", label: "Jueves" },
                          { key: "friday", label: "Viernes" },
                        ].map((day) => (
                          <tr key={day.key} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-3 text-center font-medium">
                              {day.label}
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <Checkbox
                                checked={
                                  timeAvailability[day.key]?.morning || false
                                }
                                onCheckedChange={(checked) => {
                                  console.log(
                                    `Checkbox ${day.key} morning changed to ${checked}`
                                  );
                                  handleTimeAvailabilityChange(
                                    day.key,
                                    "morning",
                                    checked as boolean
                                  );
                                }}
                              />
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <Checkbox
                                checked={
                                  timeAvailability[day.key]?.afternoon || false
                                }
                                onCheckedChange={(checked) => {
                                  console.log(
                                    `Checkbox ${day.key} afternoon changed to ${checked}`
                                  );
                                  handleTimeAvailabilityChange(
                                    day.key,
                                    "afternoon",
                                    checked as boolean
                                  );
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary of selected time slots */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Horarios seleccionados:
                    </h5>
                    <div className="text-sm text-gray-600">
                      {(() => {
                        const selectedSlots = Object.entries(timeAvailability)
                          .filter(
                            ([, periods]) =>
                              periods.morning || periods.afternoon
                          )
                          .map(([dayKey, periods]) => {
                            const dayLabel = {
                              monday: "Lunes",
                              tuesday: "Martes",
                              wednesday: "Miércoles",
                              thursday: "Jueves",
                              friday: "Viernes",
                              saturday: "Sábado",
                            }[dayKey];

                            const periodsList = [];
                            if (periods.morning) periodsList.push("Mañana");
                            if (periods.afternoon) periodsList.push("Tarde");

                            return `${dayLabel}: ${periodsList.join(", ")}`;
                          });

                        return selectedSlots.length > 0 ? (
                          <p>{selectedSlots.join(" | ")}</p>
                        ) : (
                          <p className="text-gray-500 italic">
                            Ningún horario seleccionado
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Proposal Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen de Propuestas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Proposal A Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3">
                    Propuesta A
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Evaluación:</span>
                      <span className="font-medium">
                        {
                          Object.values(
                            serviciosEvaluacionSeleccionados
                          ).filter(Boolean).length
                        }{" "}
                        servicios
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tratamiento:</span>
                      <span className="font-medium">
                        {
                          Object.values(
                            serviciosTratamientoSeleccionados
                          ).filter(Boolean).length
                        }{" "}
                        servicios
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total sesiones:</span>
                      <span className="font-medium">
                        {(() => {
                          const evalSessions = Object.entries(
                            serviciosEvaluacionSeleccionados
                          )
                            .filter(([, selected]) => selected)
                            .reduce((sum, [codigo]) => {
                              return (
                                sum +
                                (sesionesEvaluacionA[codigo] ||
                                  serviciosEvaluacionData.find(
                                    (s) => s.code === codigo
                                  )?.sessions ||
                                  0)
                              );
                            }, 0);
                          const treatSessions = Object.entries(
                            serviciosTratamientoSeleccionados
                          )
                            .filter(([, selected]) => selected)
                            .reduce((sum, [codigo]) => {
                              return (
                                sum +
                                (sesionesTratamientoA[codigo] ||
                                  serviciosTratamientoData.find(
                                    (s) => s.code === codigo
                                  )?.sessions ||
                                  0)
                              );
                            }, 0);
                          return evalSessions + treatSessions;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span
                        className={`font-medium ${
                          Object.values(serviciosEvaluacionSeleccionados).some(
                            Boolean
                          ) ||
                          Object.values(serviciosTratamientoSeleccionados).some(
                            Boolean
                          )
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {Object.values(serviciosEvaluacionSeleccionados).some(
                          Boolean
                        ) ||
                        Object.values(serviciosTratamientoSeleccionados).some(
                          Boolean
                        )
                          ? "Completa"
                          : "Sin servicios"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proposal B Summary */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-900 mb-3">
                    Propuesta B
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Evaluación:</span>
                      <span className="font-medium">
                        {
                          Object.entries(
                            serviciosEvaluacionSeleccionados
                          ).filter(([, selected]) => selected).length
                        }{" "}
                        servicios
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tratamiento:</span>
                      <span className="font-medium">
                        {
                          Object.entries(
                            serviciosTratamientoSeleccionados
                          ).filter(
                            ([codigo, selected]) =>
                              selected &&
                              (sesionesTratamientoB[codigo] || 0) > 0
                          ).length
                        }{" "}
                        servicios
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total sesiones:</span>
                      <span className="font-medium">
                        {(() => {
                          const evalSessions = Object.entries(
                            serviciosEvaluacionSeleccionados
                          )
                            .filter(([, selected]) => selected)
                            .reduce((sum, [codigo]) => {
                              return sum + (sesionesEvaluacionB[codigo] || 0);
                            }, 0);
                          const treatSessions = Object.entries(
                            serviciosTratamientoSeleccionados
                          )
                            .filter(([, selected]) => selected)
                            .reduce((sum, [codigo]) => {
                              return sum + (sesionesTratamientoB[codigo] || 0);
                            }, 0);
                          return evalSessions + treatSessions;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span
                        className={`font-medium ${
                          Object.entries(serviciosEvaluacionSeleccionados).some(
                            ([codigo, selected]) =>
                              selected && (sesionesEvaluacionB[codigo] || 0) > 0
                          ) ||
                          Object.entries(
                            serviciosTratamientoSeleccionados
                          ).some(
                            ([codigo, selected]) =>
                              selected &&
                              (sesionesTratamientoB[codigo] || 0) > 0
                          )
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {Object.entries(serviciosEvaluacionSeleccionados).some(
                          ([codigo, selected]) =>
                            selected && (sesionesEvaluacionB[codigo] || 0) > 0
                        ) ||
                        Object.entries(serviciosTratamientoSeleccionados).some(
                          ([codigo, selected]) =>
                            selected && (sesionesTratamientoB[codigo] || 0) > 0
                        )
                          ? "Completa"
                          : "Sin servicios"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Status */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Estado General:
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      Object.values(serviciosEvaluacionSeleccionados).some(
                        Boolean
                      ) ||
                      Object.values(serviciosTratamientoSeleccionados).some(
                        Boolean
                      ) ||
                      Object.values(serviciosEvaluacionSeleccionados).some(
                        Boolean
                      ) ||
                      Object.values(serviciosTratamientoSeleccionados).some(
                        Boolean
                      )
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(() => {
                      const hasProposalA =
                        Object.values(serviciosEvaluacionSeleccionados).some(
                          Boolean
                        ) ||
                        Object.values(serviciosTratamientoSeleccionados).some(
                          Boolean
                        );
                      const hasProposalB =
                        Object.entries(serviciosEvaluacionSeleccionados).some(
                          ([codigo, selected]) =>
                            selected && (sesionesEvaluacionB[codigo] || 0) > 0
                        ) ||
                        Object.entries(serviciosTratamientoSeleccionados).some(
                          ([codigo, selected]) =>
                            selected && (sesionesTratamientoB[codigo] || 0) > 0
                        );

                      if (hasProposalA && hasProposalB)
                        return "Ambas propuestas completas";
                      if (hasProposalA || hasProposalB)
                        return "Una propuesta completa";
                      return "Sin propuestas";
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Link href={`/therapist/analysis/${appointmentId}`}>
                <Button
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </Link>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={calcularCosto}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Costo
                </Button>
                <Button
                  onClick={enviarAAdmin}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar a Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
