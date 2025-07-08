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
import { ChevronLeft, Calculator, Send } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useMedicalFormAnalysis } from "@/hooks/use-medical-form-analysis";
import { useTherapists, getTherapistDisplayName } from "@/hooks/useTherapists";

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

  const [quienTomaConsulta, setQuienTomaConsulta] = useState("");
  const [derivacion, setDerivacion] = useState("");
  const [serviciosEvaluacion, setServiciosEvaluacion] = useState<
    Record<string, boolean>
  >({});
  const [serviciosTratamiento, setServiciosTratamiento] = useState<
    Record<string, boolean>
  >({});
  const [terapeutasEvaluacion, setTerapeutasEvaluacion] = useState<
    Record<string, string>
  >({});
  const [terapeutasTratamiento, setTerapeutasTratamiento] = useState<
    Record<string, string>
  >({});

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

  // Load all therapists (we'll filter by specialty in the component)
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

  const handleEvaluacionChange = (codigo: string, checked: boolean) => {
    setServiciosEvaluacion((prev) => ({ ...prev, [codigo]: checked }));
  };

  const handleTratamientoChange = (codigo: string, checked: boolean) => {
    setServiciosTratamiento((prev) => ({ ...prev, [codigo]: checked }));
  };

  const handleTerapeutaEvaluacionChange = (
    codigo: string,
    terapeuta: string
  ) => {
    setTerapeutasEvaluacion((prev) => ({ ...prev, [codigo]: terapeuta }));
  };

  const handleTerapeutaTratamientoChange = (
    codigo: string,
    terapeuta: string
  ) => {
    setTerapeutasTratamiento((prev) => ({ ...prev, [codigo]: terapeuta }));
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

    const hasEvaluacionSelected = Object.values(serviciosEvaluacion).some(
      (v) => v
    );
    const hasTratamientoSelected = Object.values(serviciosTratamiento).some(
      (v) => v
    );

    if (!hasEvaluacionSelected && !hasTratamientoSelected) {
      toast({
        title: "Error de validación",
        description:
          "Debe seleccionar al menos un servicio de evaluación o tratamiento",
        variant: "destructive",
      });
      return false;
    }

    // Check if selected services have therapists assigned
    const selectedEvaluacion = Object.entries(serviciosEvaluacion).filter(
      ([, selected]) => selected
    );
    const selectedTratamiento = Object.entries(serviciosTratamiento).filter(
      ([, selected]) => selected
    );

    const missingTherapists = [
      ...selectedEvaluacion.filter(([codigo]) => !terapeutasEvaluacion[codigo]),
      ...selectedTratamiento.filter(
        ([codigo]) => !terapeutasTratamiento[codigo]
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
      const proposalData = {
        appointmentId,
        quienTomaConsulta,
        derivacion,
        serviciosEvaluacion: Object.entries(serviciosEvaluacion)
          .filter(([, selected]) => selected)
          .map(([codigo]) => {
            const therapistId = terapeutasEvaluacion[codigo];
            const therapist = allTherapists.find((t) => t.id === therapistId);
            return {
              codigo,
              terapeutaId: therapistId,
              terapeutaNombre: therapist
                ? getTherapistDisplayName(therapist)
                : "",
              terapeutaEspecialidad: therapist?.specialty || "",
              servicio: serviciosEvaluacionData.find((s) => s.codigo === codigo)
                ?.servicio,
              sesiones: serviciosEvaluacionData.find((s) => s.codigo === codigo)
                ?.sesiones,
            };
          }),
        serviciosTratamiento: Object.entries(serviciosTratamiento)
          .filter(([, selected]) => selected)
          .map(([codigo]) => {
            const therapistId = terapeutasTratamiento[codigo];
            const therapist = allTherapists.find((t) => t.id === therapistId);
            return {
              codigo,
              terapeutaId: therapistId,
              terapeutaNombre: therapist
                ? getTherapistDisplayName(therapist)
                : "",
              terapeutaEspecialidad: therapist?.specialty || "",
              servicio: serviciosTratamientoData.find(
                (s) => s.codigo === codigo
              )?.servicio,
              sesiones: serviciosTratamientoData.find(
                (s) => s.codigo === codigo
              )?.sesiones,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando información del paciente...
          </h3>
          <p className="text-gray-500">
            Por favor espera mientras cargamos los datos de la consulta
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
      <div className="p-6 max-w-7xl mx-auto">
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
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                <h3 className="text-lg font-semibold text-center">
                  EVALUACIÓN
                </h3>
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
                      <th className="border border-gray-300 p-3 text-left font-medium text-gray-900">
                        Descripción
                      </th>
                      <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                        N° Sesiones
                      </th>
                      <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                        Terapeuta
                      </th>
                      <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                        Seleccionar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviciosEvaluacionData.map((servicio, index) => (
                      <tr
                        key={`${servicio.codigo}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="border border-gray-300 p-3 font-mono text-sm">
                          {servicio.codigo}
                        </td>
                        <td className="border border-gray-300 p-3">
                          {servicio.servicio}
                        </td>
                        <td className="border border-gray-300 p-3 text-sm text-gray-600">
                          {servicio.descripcion}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          {servicio.sesiones}
                        </td>
                        <td className="border border-gray-300 p-3">
                          <Select
                            value={terapeutasEvaluacion[servicio.codigo] || ""}
                            onValueChange={(value) =>
                              handleTerapeutaEvaluacionChange(
                                servicio.codigo,
                                value
                              )
                            }
                            disabled={
                              !serviciosEvaluacion[servicio.codigo] ||
                              therapistsLoading
                            }
                          >
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue placeholder="Seleccionar terapeuta" />
                            </SelectTrigger>
                            <SelectContent>
                              {getTherapistsByService(servicio.codigo).length >
                              0 ? (
                                getTherapistsByService(servicio.codigo).map(
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
                              serviciosEvaluacion[servicio.codigo] || false
                            }
                            onCheckedChange={(checked) =>
                              handleEvaluacionChange(
                                servicio.codigo,
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

            {/* Servicios de Tratamiento */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                <h3 className="text-lg font-semibold text-center">
                  TRATAMIENTO
                </h3>
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
                      <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                        N° Sesiones
                      </th>
                      <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                        Terapeuta
                      </th>
                      <th className="border border-gray-300 p-3 text-center font-medium text-gray-900">
                        Seleccionar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviciosTratamientoData.map((servicio, index) => (
                      <tr
                        key={`${servicio.codigo}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="border border-gray-300 p-3 font-mono text-sm">
                          {servicio.codigo}
                        </td>
                        <td className="border border-gray-300 p-3">
                          {servicio.servicio}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          {servicio.sesiones || ""}
                        </td>
                        <td className="border border-gray-300 p-3">
                          <Select
                            value={terapeutasTratamiento[servicio.codigo] || ""}
                            onValueChange={(value) =>
                              handleTerapeutaTratamientoChange(
                                servicio.codigo,
                                value
                              )
                            }
                            disabled={
                              !serviciosTratamiento[servicio.codigo] ||
                              therapistsLoading
                            }
                          >
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue placeholder="Seleccionar terapeuta" />
                            </SelectTrigger>
                            <SelectContent>
                              {getTherapistsByService(servicio.codigo).length >
                              0 ? (
                                getTherapistsByService(servicio.codigo).map(
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
                              serviciosTratamiento[servicio.codigo] || false
                            }
                            onCheckedChange={(checked) =>
                              handleTratamientoChange(
                                servicio.codigo,
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
