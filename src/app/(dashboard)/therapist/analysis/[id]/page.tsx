"use client";

import { useState, useEffect, useCallback } from "react";
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
  FileText,
  Activity,
  MessageCircle,
  Users,
  Baby,
  Stethoscope,
  AlertTriangle,
  Send,
  Sparkles,
  Edit,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useMedicalFormAnalysis } from "@/hooks/use-medical-form-analysis";
import {
  useAnalysis,
  useSaveAnalysis,
  useAutoPopulateAnalysis,
  type AnalysisData,
} from "@/hooks/use-analysis";
import MedicalFormModal from "@/components/therapist/medical-form-modal";
import DevelopmentEvaluationForm from "@/components/therapist/development-evaluation-form";
import { useDevelopmentEvaluation } from "@/hooks/use-development-evaluation";

export default function TherapistAnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  // Hooks for data fetching and mutations
  const {
    data: analysisData,
    isLoading: loading,
    error,
  } = useMedicalFormAnalysis(appointmentId);

  const { data: existingAnalysis, isLoading: analysisLoading } =
    useAnalysis(appointmentId);

  const saveAnalysisMutation = useSaveAnalysis();
  const autoPopulateAnalysis = useAutoPopulateAnalysis();

  const { data: developmentEvaluation } =
    useDevelopmentEvaluation(appointmentId);

  const [formData, setFormData] = useState<Partial<AnalysisData>>({
    // Observación Clínica
    presentation: [],
    disposition: [],
    eyeContact: [],
    activityLevel: [],
    sensoryEvaluation: "",
    generalBehavior: "",

    // Análisis Profesional
    psychologicalAnalysis: "",
    cognitiveArea: "",
    learningArea: "",
    schoolPerformance: "",
    languageAnalysis: "",
    motorAnalysis: "",
    additionalInformation: "",
    generalObservations: "",
    diagnosticHypothesis: "",

    // Recommendations
    recommendations: "",
    treatmentPlan: "",
    followUpNeeded: false,

    status: "DRAFT",
  });

  const [saving, setSaving] = useState(false);
  const [hasAutoPopulated, setHasAutoPopulated] = useState(false);
  const [isMedicalFormModalOpen, setIsMedicalFormModalOpen] = useState(false);

  const handleAutoPopulate = useCallback(() => {
    if (!analysisData?.medicalForm) {
      toast({
        title: "No disponible",
        description: "No hay formulario médico disponible para auto-completar",
        variant: "destructive",
      });
      return;
    }

    const autoData = autoPopulateAnalysis(analysisData.medicalForm);
    setFormData((prev) => ({
      ...prev,
      ...autoData,
    }));
    setHasAutoPopulated(true);

    toast({
      title: "Análisis auto-completado",
      description:
        "Los campos se han completado basándose en el formulario médico",
    });
  }, [analysisData?.medicalForm, autoPopulateAnalysis]);

  // Load existing analysis data if available
  useEffect(() => {
    if (existingAnalysis && !analysisLoading) {
      setFormData({
        ...existingAnalysis,
        eyeContact: existingAnalysis.eyeContact || [],
        // Map database field names to form field names
        presentation: existingAnalysis.presentation || [],
        disposition: existingAnalysis.disposition || [],
        activityLevel: existingAnalysis.activityLevel || [],
      });
    } else if (
      analysisData?.medicalForm &&
      !hasAutoPopulated &&
      !existingAnalysis
    ) {
      // Auto-populate if no existing analysis and medical form exists
      handleAutoPopulate();
    }
  }, [
    existingAnalysis,
    analysisLoading,
    analysisData,
    hasAutoPopulated,
    handleAutoPopulate,
  ]);

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const guardarBorrador = async () => {
    setSaving(true);
    try {
      await saveAnalysisMutation.mutateAsync({
        ...formData,
        appointmentId,
        status: "DRAFT",
      });

      toast({
        title: "Borrador guardado",
        description: "La evaluación ha sido guardada como borrador",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el borrador",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Validation function to check if all required fields are filled

  const completarAnalisis = async () => {
    // Validate form before proceeding
    //if (!validateForm()) {
    //  return;
    //}

    setSaving(true);
    try {
      await saveAnalysisMutation.mutateAsync({
        ...formData,
        appointmentId,
        status: "COMPLETED",
      });

      toast({
        title: "Análisis completado",
        description: "Redirigiendo a la generación de propuesta técnica...",
      });

      // Redirect to proposal form
      router.push(`/therapist/analysis/${appointmentId}/proposal`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo completar el análisis",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const enviarAAdmin = async () => {
    setSaving(true);
    try {
      await saveAnalysisMutation.mutateAsync({
        ...formData,
        appointmentId,
        status: "SENT_TO_ADMIN",
      });

      toast({
        title: "Análisis enviado",
        description:
          "La evaluación ha sido enviada al administrador exitosamente",
      });

      // Redirect back to analysis list
      router.push("/therapist/analysis");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo enviar la evaluación",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    // Parse date as local date to avoid timezone issues
    const parts = dateString.split("T")[0].split("-"); // Get YYYY-MM-DD part
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[2]);
    const date = new Date(year, month, day);
    return date.toLocaleDateString("es-ES");
  };

  const calculateAge = (birthDateString: string) => {
    // Parse birthdate as local date to avoid timezone issues
    const parts = birthDateString.split("T")[0].split("-"); // Get YYYY-MM-DD part
    const birthYear = parseInt(parts[0]);
    const birthMonth = parseInt(parts[1]) - 1; // Month is 0-indexed in JS Date
    const birthDay = parseInt(parts[2]);
    const birthDate = new Date(birthYear, birthMonth, birthDay);

    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    // Adjust if current month/day is before birth month/day
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    // Adjust months if current day is before birth day
    if (today.getDate() < birthDate.getDate()) {
      months--;
      if (months < 0) {
        months += 12;
        years--;
      }
    }

    return { years, months };
  };

  if (loading || analysisLoading) {
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
                {formData.status && (
                  <>
                    <span>•</span>
                    <Badge
                      variant="secondary"
                      className={
                        formData.status === "SENT_TO_ADMIN"
                          ? "bg-green-100 text-green-800"
                          : formData.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {formData.status === "SENT_TO_ADMIN"
                        ? "ENVIADO"
                        : formData.status === "COMPLETED"
                          ? "COMPLETADO"
                          : "BORRADOR"}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {medicalForm && !hasAutoPopulated && !existingAnalysis && (
              <Button
                variant="outline"
                onClick={handleAutoPopulate}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Auto-completar
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Imprimir
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Medical Form Section - Top */}
        {medicalForm ? (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg font-medium">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Formulario Médico
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMedicalFormModalOpen(true)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Completo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMedicalFormModalOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Summary View */}
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="development">Desarrollo</TabsTrigger>
                  <TabsTrigger value="family">Familia</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-3 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <Baby className="h-4 w-4 mr-2" />
                        Información Básica
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Nombre:</strong>{" "}
                          {medicalForm.basicInfo.childName}
                        </p>
                        <p>
                          <strong>Fecha Nac.:</strong>{" "}
                          {formatDate(medicalForm.basicInfo.childBirthDate)}
                        </p>
                        <p>
                          <strong>Edad:</strong>{" "}
                          {(() => {
                            const age = calculateAge(
                              medicalForm.basicInfo.childBirthDate
                            );
                            return `${age.years} años${age.months > 0 ? ` ${age.months} meses` : ""}`;
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Historial Médico
                      </h4>
                      <div className="space-y-2 text-sm">
                        {(medicalForm.medicalHistory?.importantIllnesses
                          ?.length ?? 0) > 0 && (
                          <p>
                            <strong>Enfermedades:</strong>{" "}
                            {medicalForm.medicalHistory?.importantIllnesses?.join(
                              ", "
                            )}
                          </p>
                        )}
                        {(medicalForm.medicationsAllergies?.foodAllergies
                          ?.length ?? 0) > 0 && (
                          <p>
                            <strong>Alergias:</strong>{" "}
                            {medicalForm.medicationsAllergies?.foodAllergies?.join(
                              ", "
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="development" className="space-y-3 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        Desarrollo Motor
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Control cabeza:</strong>{" "}
                          {medicalForm.motorDevelopment?.headControlAge ||
                            "No especificado"}
                        </p>
                        <p>
                          <strong>Sentado sin apoyo:</strong>{" "}
                          {medicalForm.motorDevelopment?.sittingAge ||
                            "No especificado"}
                        </p>
                        <p>
                          <strong>Gateo:</strong>{" "}
                          {medicalForm.motorDevelopment?.crawlingAge ||
                            "No especificado"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Lenguaje y Cognición
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Primeras palabras:</strong>{" "}
                          {medicalForm.languageCognition?.firstWordsAge ||
                            "No especificado"}
                        </p>
                        <p>
                          <strong>Frases 2 palabras:</strong>{" "}
                          {medicalForm.languageCognition?.twoWordPhrasesAge ||
                            "No especificado"}
                        </p>
                        <p>
                          <strong>Comprensión:</strong>{" "}
                          {medicalForm.languageCognition?.comprehension ||
                            "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="family" className="space-y-3 mt-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Información Familiar
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Vive con:</strong>{" "}
                        {medicalForm.familyInfo?.livesWithWhom ||
                          "No especificado"}
                      </p>
                      <p>
                        <strong>Hermanos:</strong>{" "}
                        {medicalForm.familyInfo?.hasSiblings ||
                          "No especificado"}
                      </p>
                      {medicalForm.familyInfo?.recentChanges && (
                        <p>
                          <strong>Cambios recientes:</strong>{" "}
                          {medicalForm.familyInfo?.recentChanges}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Para ver o editar la información completa del formulario
                  médico, haga clic en los botones de arriba
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay formulario médico
                </h3>
                <p className="text-gray-600 mb-4">
                  Este paciente aún no tiene un formulario médico completado.
                </p>
                <Button onClick={() => setIsMedicalFormModalOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Crear Formulario Médico
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Form - Main Content */}
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
                              checked={formData.presentation?.includes(item)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  "presentation",
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
                              checked={formData.disposition?.includes(item)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  "disposition",
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
                              checked={formData.eyeContact?.includes(item)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  "eyeContact",
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
                              checked={formData.activityLevel?.includes(item)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  "activityLevel",
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
                      value={formData.sensoryEvaluation || ""}
                      onChange={(e) =>
                        handleInputChange("sensoryEvaluation", e.target.value)
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
                      value={formData.generalBehavior || ""}
                      onChange={(e) =>
                        handleInputChange("generalBehavior", e.target.value)
                      }
                      placeholder="Describe el comportamiento general observado durante la sesión..."
                      rows={3}
                      className="border-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: EVALUACIÓN DE DESARROLLO */}
              <DevelopmentEvaluationForm appointmentId={appointmentId} />

              {/* SECCIÓN 3: ANÁLISIS PROFESIONAL */}
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
                    value={formData.psychologicalAnalysis || ""}
                    onChange={(e) =>
                      handleInputChange("psychologicalAnalysis", e.target.value)
                    }
                    placeholder="Análisis psicológico detallado del paciente..."
                    rows={4}
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
                        value={formData.cognitiveArea || ""}
                        onChange={(e) =>
                          handleInputChange("cognitiveArea", e.target.value)
                        }
                        placeholder="Evaluación del área cognitiva..."
                        rows={3}
                        className="border-gray-200"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">
                        ÁREA DEL APRENDIZAJE:
                      </Label>
                      <Textarea
                        value={formData.learningArea || ""}
                        onChange={(e) =>
                          handleInputChange("learningArea", e.target.value)
                        }
                        placeholder="Evaluación del área de aprendizaje..."
                        rows={3}
                        className="border-gray-200"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">
                        DESEMPEÑO ESCOLAR (si aplica):
                      </Label>
                      <Textarea
                        value={formData.schoolPerformance || ""}
                        onChange={(e) =>
                          handleInputChange("schoolPerformance", e.target.value)
                        }
                        placeholder="Evaluación del desempeño escolar..."
                        rows={3}
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
                    value={formData.languageAnalysis || ""}
                    onChange={(e) =>
                      handleInputChange("languageAnalysis", e.target.value)
                    }
                    placeholder="Análisis del lenguaje y comunicación..."
                    rows={4}
                    className="border-gray-200"
                  />
                </div>

                {/* Análisis Motor */}
                <div className="mb-6">
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Análisis Motor y Sensorial:
                  </Label>
                  <Textarea
                    value={formData.motorAnalysis || ""}
                    onChange={(e) =>
                      handleInputChange("motorAnalysis", e.target.value)
                    }
                    placeholder="Análisis motor y sensorial..."
                    rows={4}
                    className="border-gray-200"
                  />
                </div>

                {/* Información Adicional */}
                <div className="mb-6">
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Información Adicional:
                  </Label>
                  <Textarea
                    value={formData.additionalInformation || ""}
                    onChange={(e) =>
                      handleInputChange("additionalInformation", e.target.value)
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
                    value={formData.generalObservations || ""}
                    onChange={(e) =>
                      handleInputChange("generalObservations", e.target.value)
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
                    value={formData.diagnosticHypothesis || ""}
                    onChange={(e) =>
                      handleInputChange("diagnosticHypothesis", e.target.value)
                    }
                    placeholder="Hipótesis diagnóstica basada en la evaluación..."
                    rows={3}
                    className="border-gray-200"
                  />
                </div>

                {/* Recomendaciones */}
                <div className="mb-6">
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Recomendaciones:
                  </Label>
                  <Textarea
                    value={formData.recommendations || ""}
                    onChange={(e) =>
                      handleInputChange("recommendations", e.target.value)
                    }
                    placeholder="Recomendaciones para el paciente y la familia..."
                    rows={4}
                    className="border-gray-200"
                  />
                </div>

                {/* Plan de Tratamiento */}
                <div className="mb-6">
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Plan de Tratamiento:
                  </Label>
                  <Textarea
                    value={formData.treatmentPlan || ""}
                    onChange={(e) =>
                      handleInputChange("treatmentPlan", e.target.value)
                    }
                    placeholder="Plan de tratamiento propuesto..."
                    rows={4}
                    className="border-gray-200"
                  />
                </div>

                {/* Seguimiento Necesario */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="followUpNeeded"
                      checked={formData.followUpNeeded || false}
                      onCheckedChange={(checked) =>
                        handleInputChange("followUpNeeded", !!checked)
                      }
                    />
                    <Label
                      htmlFor="followUpNeeded"
                      className="text-sm font-medium"
                    >
                      Requiere seguimiento adicional
                    </Label>
                  </div>
                </div>
              </div>

              {/* Status indicators */}
              <div className="pt-6 border-t border-gray-200 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Estado del Proceso:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Medical Form Status */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border">
                    {analysisData?.medicalForm ? (
                      analysisData.medicalForm.status === "REVIEWED" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      )
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Formulario Médico
                      </p>
                      <p className="text-xs text-gray-600">
                        {analysisData?.medicalForm
                          ? analysisData.medicalForm.status === "REVIEWED"
                            ? "Completado y revisado"
                            : "Pendiente de revisión"
                          : "No completado"}
                      </p>
                    </div>
                  </div>

                  {/* Analysis Status */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border">
                    {(() => {
                      const requiredFields = [
                        "psychologicalAnalysis",
                        "cognitiveArea",
                        "languageAnalysis",
                        "motorAnalysis",
                        "diagnosticHypothesis",
                        "recommendations",
                        "treatmentPlan",
                      ];
                      const arrayFields = [
                        "presentation",
                        "disposition",
                        "eyeContact",
                        "activityLevel",
                      ];

                      const missingFields = requiredFields.filter(
                        (field) =>
                          !formData[field as keyof typeof formData] ||
                          (
                            formData[field as keyof typeof formData] as string
                          ).trim() === ""
                      );

                      const hasArrayValues = arrayFields.some(
                        (field) =>
                          (formData[field as keyof typeof formData] as string[])
                            ?.length > 0
                      );

                      const isComplete =
                        missingFields.length === 0 && hasArrayValues;

                      return (
                        <>
                          {isComplete ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Análisis Clínico
                            </p>
                            <p className="text-xs text-gray-600">
                              {isComplete
                                ? "Completado"
                                : `Faltan ${missingFields.length + (hasArrayValues ? 0 : 1)} campos por completar`}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Development Evaluation Status */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border">
                    {(() => {
                      if (!developmentEvaluation) {
                        return (
                          <>
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Evaluación de Desarrollo
                              </p>
                              <p className="text-xs text-gray-600">
                                No completado
                              </p>
                            </div>
                          </>
                        );
                      }

                      const developmentAreas = [
                        "communicationAndLanguage",
                        "grossMotorSkills",
                        "fineMotorSkills",
                        "attentionAndLearning",
                        "socialRelations",
                        "autonomyAndAdaptation",
                      ];

                      const evaluatedAreas = developmentAreas.filter(
                        (area) =>
                          developmentEvaluation[
                            area as keyof typeof developmentEvaluation
                          ]
                      );

                      const hasRecommendations =
                        (developmentEvaluation.strengths &&
                          developmentEvaluation.strengths.trim()) ||
                        (developmentEvaluation.areasToSupport &&
                          developmentEvaluation.areasToSupport.trim()) ||
                        (developmentEvaluation.homeRecommendations &&
                          developmentEvaluation.homeRecommendations.trim()) ||
                        (developmentEvaluation.schoolRecommendations &&
                          developmentEvaluation.schoolRecommendations.trim());

                      const isComplete =
                        evaluatedAreas.length > 0 && hasRecommendations;

                      return (
                        <>
                          {isComplete ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Evaluación de Desarrollo
                            </p>
                            <p className="text-xs text-gray-600">
                              {isComplete
                                ? "Completado"
                                : `${evaluatedAreas.length}/6 áreas evaluadas${!hasRecommendations ? ", faltan recomendaciones" : ""}`}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Requirements notice */}
                {(!analysisData?.medicalForm ||
                  analysisData.medicalForm.status !== "REVIEWED") && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800">
                          <strong>Requisito:</strong> Complete y guarde el
                          formulario médico antes de finalizar el análisis.
                        </p>
                        <button
                          onClick={() => setIsMedicalFormModalOpen(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 underline mt-1"
                        >
                          Abrir formulario médico
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={guardarBorrador}
                  disabled={saving}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar Borrador"}
                </Button>

                <Button
                  onClick={completarAnalisis}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Análisis
                </Button>

                {formData.status === "COMPLETED" && (
                  <Button
                    onClick={enviarAAdmin}
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar a Admin
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Form Modal */}
      <MedicalFormModal
        isOpen={isMedicalFormModalOpen}
        onClose={() => setIsMedicalFormModalOpen(false)}
        appointmentId={appointmentId}
        existingData={medicalForm}
        patientName={appointment.patientName}
        onSave={() => {
          // Refresh the appointment data after saving
          window.location.reload();
        }}
      />
    </div>
  );
}
