"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import {
  ChevronLeft,
  Save,
  Printer,
  Eye,
  Brain,
  CheckCircle,
  ArrowRight,
  FileText,
  Heart,
  Activity,
  MessageCircle,
  Users,
  Baby,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useMedicalFormAnalysis } from "@/hooks/use-medical-form-analysis";

export default function TherapistAnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  // Use the hook for fetching analysis data
  const {
    data: analysisData,
    isLoading: loading,
    error,
  } = useMedicalFormAnalysis(appointmentId);

  const [evaluacionEnviada, setEvaluacionEnviada] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    // Observación Clínica
    presentacion: [] as string[],
    disposicion: [] as string[],
    contactoOcular: [] as string[],
    nivelActividad: [] as string[],
    evaluacionSensorial: "",
    comportamientoGeneral: "",

    // Análisis Profesional
    analisisPsicologico: "",
    areaCognitiva: "",
    areaAprendizaje: "",
    desempenoEscolar: "",
    analisisLenguaje: "",
    analisisMotor: "",
    informacionAdicional: "",
    observacionesGenerales: "",
    hipotesisDiagnostica: "",
  });

  // Show error toast if there's an error
  if (error) {
    toast({
      title: "Error",
      description: error.message || "No se pudo cargar la información",
      variant: "destructive",
    });
  }

  const handleCheckboxChange = (
    field: string,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(
            (item) => item !== value
          ),
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const guardarBorrador = async () => {
    setSaving(true);
    try {
      // Here you would save to database
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation
      toast({
        title: "Borrador guardado",
        description: "La evaluación ha sido guardada como borrador",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar el borrador",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const enviarAAdmin = async () => {
    try {
      // Here you would send to admin
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation
      setEvaluacionEnviada(true);
      toast({
        title: "Evaluación enviada",
        description:
          "La evaluación ha sido enviada al administrador exitosamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo enviar la evaluación",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      return `${years - 1} años`;
    }
    return `${years} años`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 mx-auto mb-4" />
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

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
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

  const { appointment, medicalForm } = analysisData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/therapist/analysis">
              <Button variant="outline" size="sm" className="border-gray-200">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Evaluación: {appointment.patientName}
              </h1>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span>{appointment.patientAge} años</span>
                <span>•</span>
                <span>Padre: {appointment.parentName}</span>
                <span>•</span>
                <span>{formatDate(appointment.date)}</span>
                {medicalForm && (
                  <>
                    <span>•</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Formulario médico disponible
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={guardarBorrador}
              disabled={saving}
            >
              {saving ? (
                <Loader className="h-4 w-4 mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Guardar
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Imprimir
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medical Form Data - Left Sidebar */}
          {medicalForm && (
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Información del Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic" className="text-xs">
                        Básico
                      </TabsTrigger>
                      <TabsTrigger value="development" className="text-xs">
                        Desarrollo
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 mt-4">
                      {/* Basic Info */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <Baby className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium text-sm">
                            Información Básica
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p>
                            <strong>Nombre:</strong>{" "}
                            {medicalForm.basicInfo.childName}
                          </p>
                          <p>
                            <strong>Nacimiento:</strong>{" "}
                            {formatDate(medicalForm.basicInfo.childBirthDate)}
                          </p>
                          <p>
                            <strong>Edad:</strong>{" "}
                            {calculateAge(medicalForm.basicInfo.childBirthDate)}
                          </p>
                        </div>
                      </div>

                      {/* Perinatal History */}
                      <div className="bg-pink-50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <Heart className="h-4 w-4 mr-2 text-pink-600" />
                          <span className="font-medium text-sm">
                            Historia Perinatal
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p>
                            <strong>Embarazo:</strong>{" "}
                            {medicalForm.perinatalHistory.pregnancyType ||
                              "No especificado"}
                          </p>
                          <p>
                            <strong>Tipo de parto:</strong>{" "}
                            {medicalForm.perinatalHistory.deliveryType ||
                              "No especificado"}
                          </p>
                          <p>
                            <strong>Peso al nacer:</strong>{" "}
                            {medicalForm.perinatalHistory.birthWeight ||
                              "No especificado"}{" "}
                            kg
                          </p>
                          {medicalForm.perinatalHistory
                            .pregnancyComplications && (
                            <p>
                              <strong>Complicaciones:</strong>{" "}
                              {
                                medicalForm.perinatalHistory
                                  .pregnancyComplications
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Medical History */}
                      <div className="bg-teal-50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <Stethoscope className="h-4 w-4 mr-2 text-teal-600" />
                          <span className="font-medium text-sm">
                            Historia Médica
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          {medicalForm.medicalHistory.importantIllnesses &&
                            medicalForm.medicalHistory.importantIllnesses
                              .length > 0 && (
                              <p>
                                <strong>Enfermedades:</strong>{" "}
                                {medicalForm.medicalHistory.importantIllnesses.join(
                                  ", "
                                )}
                              </p>
                            )}
                          {medicalForm.medicationsAllergies.takesMedications ===
                            "si" && (
                            <p>
                              <strong>Medicamentos:</strong> Sí
                            </p>
                          )}
                          {medicalForm.medicationsAllergies.foodAllergies &&
                            medicalForm.medicationsAllergies.foodAllergies
                              .length > 0 && (
                              <p>
                                <strong>Alergias:</strong>{" "}
                                {medicalForm.medicationsAllergies.foodAllergies.join(
                                  ", "
                                )}
                              </p>
                            )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="development" className="space-y-4 mt-4">
                      {/* Motor Development */}
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <Activity className="h-4 w-4 mr-2 text-green-600" />
                          <span className="font-medium text-sm">
                            Desarrollo Motor
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p>
                            <strong>Caminó:</strong>{" "}
                            {medicalForm.motorDevelopment.walkingAge ||
                              "No especificado"}
                          </p>
                          <p>
                            <strong>Sentarse:</strong>{" "}
                            {medicalForm.motorDevelopment.sittingAge ||
                              "No especificado"}
                          </p>
                          <p>
                            <strong>Gateo:</strong>{" "}
                            {medicalForm.motorDevelopment.crawlingAge ||
                              "No especificado"}
                          </p>
                          {medicalForm.motorDevelopment.balanceDifficulties && (
                            <p>
                              <strong>Dificultades equilibrio:</strong>{" "}
                              {medicalForm.motorDevelopment.balanceDifficulties}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Language Development */}
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <MessageCircle className="h-4 w-4 mr-2 text-indigo-600" />
                          <span className="font-medium text-sm">
                            Lenguaje y Cognición
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p>
                            <strong>Primeras palabras:</strong>{" "}
                            {medicalForm.languageCognition.firstWordsAge ||
                              "No especificado"}
                          </p>
                          <p>
                            <strong>Frases 2 palabras:</strong>{" "}
                            {medicalForm.languageCognition.twoWordPhrasesAge ||
                              "No especificado"}
                          </p>
                          <p>
                            <strong>Comprensión:</strong>{" "}
                            {medicalForm.languageCognition.comprehension ||
                              "No especificado"}
                          </p>
                          {medicalForm.languageCognition
                            .learningDifficulties && (
                            <p>
                              <strong>Dificultades:</strong>{" "}
                              {
                                medicalForm.languageCognition
                                  .learningDifficulties
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Family Info */}
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <Users className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="font-medium text-sm">
                            Información Familiar
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p>
                            <strong>Vive con:</strong>{" "}
                            {medicalForm.familyInfo.livesWithWhom ||
                              "No especificado"}
                          </p>
                          <p>
                            <strong>Hermanos:</strong>{" "}
                            {medicalForm.familyInfo.hasSiblings ||
                              "No especificado"}
                          </p>
                          {medicalForm.familyInfo.recentChanges && (
                            <p>
                              <strong>Cambios recientes:</strong>{" "}
                              {medicalForm.familyInfo.recentChanges}
                            </p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analysis Form - Main Content */}
          <div className={medicalForm ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-8">
                  {/* SECCIÓN 1: OBSERVACIÓN CLÍNICA */}
                  <div>
                    <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-gray-200">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-900">
                        OBSERVACIÓN CLÍNICA
                      </h2>
                    </div>

                    {/* Impresión General */}
                    <div className="mb-8">
                      <h3 className="text-md font-semibold text-gray-700 mb-4">
                        Impresión General del Niño/a
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Presentación */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Presentación:
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              "Acicalado",
                              "Descuidado",
                              "Edad aparente acorde",
                              "Edad aparente no acorde",
                            ].map((item) => (
                              <div
                                key={item}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={item}
                                  checked={formData.presentacion.includes(item)}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                      "presentacion",
                                      item,
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label htmlFor={item} className="text-sm">
                                  {item}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Disposición */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Disposición:
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              "Colaborador",
                              "Tímido",
                              "Agitado",
                              "Retraído",
                              "Desafiante",
                              "No contactable",
                            ].map((item) => (
                              <div
                                key={item}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={item}
                                  checked={formData.disposicion.includes(item)}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                      "disposicion",
                                      item,
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label htmlFor={item} className="text-sm">
                                  {item}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contacto Ocular */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Contacto Ocular:
                          </Label>
                          <div className="grid grid-cols-3 gap-2">
                            {["Sostenido", "Fugaz", "Evita"].map((item) => (
                              <div
                                key={item}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={item}
                                  checked={formData.contactoOcular.includes(
                                    item
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                      "contactoOcular",
                                      item,
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label htmlFor={item} className="text-sm">
                                  {item}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Nivel de Actividad */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Nivel de Actividad:
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              "Hipotónico/a",
                              "Normotónico/a",
                              "Hipertónico/a",
                              "Hiperactivo/a",
                              "Hipoactivo/a",
                            ].map((item) => (
                              <div
                                key={item}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={item}
                                  checked={formData.nivelActividad.includes(
                                    item
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                      "nivelActividad",
                                      item,
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label htmlFor={item} className="text-sm">
                                  {item}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Evaluación Sensorial */}
                      <div className="mt-6">
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                          Evaluación Sensorial (reacción a estímulos):
                        </Label>
                        <Textarea
                          value={formData.evaluacionSensorial}
                          onChange={(e) =>
                            handleInputChange(
                              "evaluacionSensorial",
                              e.target.value
                            )
                          }
                          placeholder="Describe las reacciones del niño/a a diferentes estímulos sensoriales..."
                          rows={3}
                          className="border-gray-200"
                        />
                      </div>

                      {/* Comportamiento General */}
                      <div className="mt-6">
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                          Comportamiento General:
                        </Label>
                        <Textarea
                          value={formData.comportamientoGeneral}
                          onChange={(e) =>
                            handleInputChange(
                              "comportamientoGeneral",
                              e.target.value
                            )
                          }
                          placeholder="Describe el comportamiento general observado durante la sesión..."
                          rows={3}
                          className="border-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: ANÁLISIS PROFESIONAL */}
                  <div>
                    <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-gray-200">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <h2 className="text-xl font-bold text-gray-900">
                        ANÁLISIS PROFESIONAL
                      </h2>
                    </div>

                    {/* Análisis Psicológico */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Análisis Psicológico:
                      </Label>
                      <Textarea
                        value={formData.analisisPsicologico}
                        onChange={(e) =>
                          handleInputChange(
                            "analisisPsicologico",
                            e.target.value
                          )
                        }
                        placeholder="Análisis psicológico detallado del paciente..."
                        rows={3}
                        className="border-gray-200"
                      />
                    </div>

                    {/* Análisis Psicopedagógico */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Análisis Psicopedagógico:
                      </Label>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">
                            ÁREA COGNITIVA:
                          </Label>
                          <Textarea
                            value={formData.areaCognitiva}
                            onChange={(e) =>
                              handleInputChange("areaCognitiva", e.target.value)
                            }
                            placeholder="Evaluación del área cognitiva..."
                            rows={2}
                            className="border-gray-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">
                            ÁREA DEL APRENDIZAJE:
                          </Label>
                          <Textarea
                            value={formData.areaAprendizaje}
                            onChange={(e) =>
                              handleInputChange(
                                "areaAprendizaje",
                                e.target.value
                              )
                            }
                            placeholder="Evaluación del área de aprendizaje..."
                            rows={2}
                            className="border-gray-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">
                            DESEMPEÑO ESCOLAR (si aplica):
                          </Label>
                          <Textarea
                            value={formData.desempenoEscolar}
                            onChange={(e) =>
                              handleInputChange(
                                "desempenoEscolar",
                                e.target.value
                              )
                            }
                            placeholder="Evaluación del desempeño escolar..."
                            rows={2}
                            className="border-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Análisis de Lenguaje */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Análisis de Lenguaje y Comunicación:
                      </Label>
                      <Textarea
                        value={formData.analisisLenguaje}
                        onChange={(e) =>
                          handleInputChange("analisisLenguaje", e.target.value)
                        }
                        placeholder="Análisis del lenguaje y comunicación..."
                        rows={3}
                        className="border-gray-200"
                      />
                    </div>

                    {/* Análisis Motor */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Análisis Motor y Sensorial:
                      </Label>
                      <Textarea
                        value={formData.analisisMotor}
                        onChange={(e) =>
                          handleInputChange("analisisMotor", e.target.value)
                        }
                        placeholder="Análisis motor y sensorial..."
                        rows={3}
                        className="border-gray-200"
                      />
                    </div>

                    {/* Información Adicional */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Información Adicional:
                      </Label>
                      <Textarea
                        value={formData.informacionAdicional}
                        onChange={(e) =>
                          handleInputChange(
                            "informacionAdicional",
                            e.target.value
                          )
                        }
                        placeholder="Información adicional relevante..."
                        rows={3}
                        className="border-gray-200"
                      />
                    </div>

                    {/* Observaciones Generales */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Observaciones Generales:
                      </Label>
                      <Textarea
                        value={formData.observacionesGenerales}
                        onChange={(e) =>
                          handleInputChange(
                            "observacionesGenerales",
                            e.target.value
                          )
                        }
                        placeholder="Observaciones generales de la evaluación..."
                        rows={3}
                        className="border-gray-200"
                      />
                    </div>

                    {/* Hipótesis Diagnóstica */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Hipótesis Diagnóstica:
                      </Label>
                      <Textarea
                        value={formData.hipotesisDiagnostica}
                        onChange={(e) =>
                          handleInputChange(
                            "hipotesisDiagnostica",
                            e.target.value
                          )
                        }
                        placeholder="Hipótesis diagnóstica basada en la evaluación..."
                        rows={3}
                        className="border-gray-200"
                      />
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-center pt-4">
                    {!evaluacionEnviada ? (
                      <Button
                        onClick={enviarAAdmin}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Enviar a Admin
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          router.push(`/admin/proposals/${appointmentId}`)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Ir a Propuesta de Servicio
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
