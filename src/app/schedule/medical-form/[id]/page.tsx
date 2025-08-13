"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  calculateAgeFromBirthDate,
  calculateTotalAgeInMonths,
} from "@/lib/utils";

// Helper function to format vivecon value for medical form
const formatViveCon = (vivecon: string, otroViveCon?: string): string => {
  const viveConMap: Record<string, string> = {
    "ambos-padres": "Ambos padres",
    "solo-madre": "Solo madre",
    "solo-padre": "Solo padre",
    "padres-adoptivos": "Padres adoptivos",
    "algun-pariente": "Algún pariente",
    "padre-madrastra": "Padre y madrastra",
    "madre-padrastro": "Madre y padrastro",
    otros: otroViveCon || "Otros",
  };

  return viveConMap[vivecon] || vivecon;
};
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  HeartPulse,
  Hospital,
  Stethoscope,
  AlertTriangle,
  Activity,
  MessageCircle,
  Smile,
  Users,
  CheckCircle,
  Save,
  Send,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/views/landing-page/Header";

interface Sibling {
  nombre?: string;
  fechaNacimiento?: string;
  [key: string]: unknown;
}

interface FormData {
  // Datos básicos
  nombreNino: string;
  fechaNacimiento: string;
  edadAnos: string;
  edadMeses: string;

  // Antecedentes perinatales
  tipoEmbarazo: string;
  semanasPrematuro: string;
  semanasPostTermino: string;
  complicacionesEmbarazo: string;
  tipoParto: string;
  motivoCesarea: string;
  pesoNacer: string;
  tallaNacer: string;

  // Complicaciones perinatales
  complicacionesParto: string;
  detallesComplicaciones: string;
  internacionEspecial: string[];
  tiempoInternacion: string;
  motivoInternacion: string;

  // Antecedentes médicos
  enfermedadesImportantes: string[];
  otraEnfermedad: string;
  hospitalizaciones: Array<{ motivo: string; edad: string }>;
  cirugiasPrevias: string;
  detallesCirugias: string;
  edadCirugias: string;

  // Medicamentos y alergias
  tomaMedicamentos: string;
  medicamentos: Array<{ nombre: string; dosis: string; motivo: string }>;
  alergiasAlimentarias: string[];
  otraAlergiaAlimentaria: string;
  alergiasMedicamentos: string[];
  otraAlergiaMedicamento: string;
  otrasAlergias: string[];
  otraAlergia: string;

  // Desarrollo motor
  sostenCabeza: string;
  sentadoSinApoyo: string;
  gateo: string;
  caminaSolo: string;
  subeEscaleras: boolean;
  dificultadesEquilibrio: string;
  detallesDificultadesEquilibrio: string;
  motorFino: string[];
  torreCubos: string;
  dificultadesMotorFino: string;
  detallesDificultadesMotorFino: string;

  // Lenguaje y cognición
  primerasPalabras: string;
  frases2Palabras: string;
  oracionesCompletas: boolean;
  comunicacionActual: string[];
  otraComunicacion: string;
  comprension: string;
  sigueInstruccionesSimples: boolean;
  sigueInstruccionesComplejas: boolean;
  respondeNombre: boolean;
  desarrolloCognitivo: string[];
  dificultadesAprender: string;

  // Desarrollo social y emocional
  interactuaOtrosNinos: string;
  detallesInteraccion: string;
  comparteJuguetes: boolean;
  expresaEmociones: boolean;
  rabietas: string;
  frecuenciaRabietas: string;
  adaptacionCambios: string;
  conductasRepetitivas: string;
  detallesConductas: string;
  alimentacion: string[];
  utilizaCubiertos: boolean;
  sueno: string[];
  controlEsfinterDiurno: string;
  controlEsfinterNocturno: string;
  usaPanal: boolean;
  edadPanal: string;

  // Información familiar
  viveConQuien: string;
  tieneHermanos: string;
  cantidadHermanos: string;
  edadesHermanos: string;
  ambienteFamiliar: string;
  cambiosRecientes: string;
  tiposCambios: string[];
  otroCambio: string;
  detallesCambios: string;
  antecedentesFamiliares: string;
  detallesAntecedentes: string;
}

const initialFormData: FormData = {
  nombreNino: "",
  fechaNacimiento: "",
  edadAnos: "",
  edadMeses: "",
  tipoEmbarazo: "",
  semanasPrematuro: "",
  semanasPostTermino: "",
  complicacionesEmbarazo: "",
  tipoParto: "",
  motivoCesarea: "",
  pesoNacer: "",
  tallaNacer: "",
  complicacionesParto: "",
  detallesComplicaciones: "",
  internacionEspecial: [],
  tiempoInternacion: "",
  motivoInternacion: "",
  enfermedadesImportantes: [],
  otraEnfermedad: "",
  hospitalizaciones: [{ motivo: "", edad: "" }],
  cirugiasPrevias: "",
  detallesCirugias: "",
  edadCirugias: "",
  tomaMedicamentos: "",
  medicamentos: [{ nombre: "", dosis: "", motivo: "" }],
  alergiasAlimentarias: [],
  otraAlergiaAlimentaria: "",
  alergiasMedicamentos: [],
  otraAlergiaMedicamento: "",
  otrasAlergias: [],
  otraAlergia: "",
  sostenCabeza: "",
  sentadoSinApoyo: "",
  gateo: "",
  caminaSolo: "",
  subeEscaleras: false,
  dificultadesEquilibrio: "",
  detallesDificultadesEquilibrio: "",
  motorFino: [],
  torreCubos: "",
  dificultadesMotorFino: "",
  detallesDificultadesMotorFino: "",
  primerasPalabras: "",
  frases2Palabras: "",
  oracionesCompletas: false,
  comunicacionActual: [],
  otraComunicacion: "",
  comprension: "",
  sigueInstruccionesSimples: false,
  sigueInstruccionesComplejas: false,
  respondeNombre: false,
  desarrolloCognitivo: [],
  dificultadesAprender: "",
  interactuaOtrosNinos: "",
  detallesInteraccion: "",
  comparteJuguetes: false,
  expresaEmociones: false,
  rabietas: "",
  frecuenciaRabietas: "",
  adaptacionCambios: "",
  conductasRepetitivas: "",
  detallesConductas: "",
  alimentacion: [],
  utilizaCubiertos: false,
  sueno: [],
  controlEsfinterDiurno: "",
  controlEsfinterNocturno: "",
  usaPanal: false,
  edadPanal: "",
  viveConQuien: "",
  tieneHermanos: "",
  cantidadHermanos: "",
  edadesHermanos: "",
  ambienteFamiliar: "",
  cambiosRecientes: "",
  tiposCambios: [],
  otroCambio: "",
  detallesCambios: "",
  antecedentesFamiliares: "",
  detallesAntecedentes: "",
};

// Function to map Spanish form data to English API fields
const mapFormDataToAPI = (formData: FormData) => {
  return {
    // Basic Information
    childName: formData.nombreNino,
    childBirthDate: formData.fechaNacimiento,
    childAgeYears: formData.edadAnos,
    childAgeMonths: formData.edadMeses,

    // Perinatal History
    pregnancyType: formData.tipoEmbarazo,
    prematureWeeks: formData.semanasPrematuro,
    postTermWeeks: formData.semanasPostTermino,
    pregnancyComplications: formData.complicacionesEmbarazo,
    deliveryType: formData.tipoParto,
    cesareanReason: formData.motivoCesarea,
    birthWeight: formData.pesoNacer,
    birthHeight: formData.tallaNacer,

    // Birth Complications
    deliveryComplications: formData.complicacionesParto,
    complicationDetails: formData.detallesComplicaciones,
    specialCare: formData.internacionEspecial,
    hospitalizationDays: formData.tiempoInternacion,
    hospitalizationReason: formData.motivoInternacion,

    // Medical History
    importantIllnesses: formData.enfermedadesImportantes,
    otherIllness: formData.otraEnfermedad,
    hospitalizations: formData.hospitalizaciones,
    previousSurgeries: formData.cirugiasPrevias,
    surgeryDetails: formData.detallesCirugias,
    surgeryAge: formData.edadCirugias,

    // Medications and Allergies
    takesMedications: formData.tomaMedicamentos,
    medications: formData.medicamentos,
    foodAllergies: formData.alergiasAlimentarias,
    otherFoodAllergy: formData.otraAlergiaAlimentaria,
    medicationAllergies: formData.alergiasMedicamentos,
    otherMedicationAllergy: formData.otraAlergiaMedicamento,
    otherAllergies: formData.otrasAlergias,
    otherAllergyDescription: formData.otraAlergia,

    // Motor Development
    headControlAge: formData.sostenCabeza,
    sittingAge: formData.sentadoSinApoyo,
    crawlingAge: formData.gateo,
    walkingAge: formData.caminaSolo,
    climbsStairs: formData.subeEscaleras,
    balanceDifficulties: formData.dificultadesEquilibrio,
    balanceDifficultyDetails: formData.detallesDificultadesEquilibrio,
    fineMotorSkills: formData.motorFino,
    blockTowers: formData.torreCubos,
    fineMotorDifficulties: formData.dificultadesMotorFino,
    fineMotorDifficultyDetails: formData.detallesDificultadesMotorFino,

    // Language and Cognition
    firstWordsAge: formData.primerasPalabras,
    twoWordPhrasesAge: formData.frases2Palabras,
    completeSentences: formData.oracionesCompletas,
    currentCommunication: formData.comunicacionActual,
    otherCommunication: formData.otraComunicacion,
    comprehension: formData.comprension,
    followsSimpleInstructions: formData.sigueInstruccionesSimples,
    followsComplexInstructions: formData.sigueInstruccionesComplejas,
    respondsToName: formData.respondeNombre,
    cognitiveDevelopment: formData.desarrolloCognitivo,
    learningDifficulties: formData.dificultadesAprender,

    // Social and Emotional Development
    interactsWithChildren: formData.interactuaOtrosNinos,
    interactionDetails: formData.detallesInteraccion,
    sharesToys: formData.comparteJuguetes,
    expressesEmotions: formData.expresaEmociones,
    tantrums: formData.rabietas,
    tantrumFrequency: formData.frecuenciaRabietas,
    adaptsToChanges: formData.adaptacionCambios,
    repetitiveBehaviors: formData.conductasRepetitivas,
    behaviorDetails: formData.detallesConductas,
    feedingHabits: formData.alimentacion,
    usesUtensils: formData.utilizaCubiertos,
    sleepHabits: formData.sueno,
    daytimeToiletControl: formData.controlEsfinterDiurno,
    nighttimeToiletControl: formData.controlEsfinterNocturno,
    usesDiapers: formData.usaPanal,
    diaperAge: formData.edadPanal,

    // Family Information
    livesWithWhom: formData.viveConQuien,
    hasSiblings: formData.tieneHermanos,
    numberOfSiblings: formData.cantidadHermanos,
    siblingsAges: formData.edadesHermanos,
    familyEnvironment: formData.ambienteFamiliar,
    recentChanges: formData.cambiosRecientes,
    typesOfChanges: formData.tiposCambios,
    otherChange: formData.otroCambio,
    changeDetails: formData.detallesCambios,
    familyHistory: formData.antecedentesFamiliares,
    familyHistoryDetails: formData.detallesAntecedentes,
  };
};

export default function MedicalFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formularioId, setFormularioId] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unwrap the async params
  const { id: rawAppointmentId } = use(params);

  // Extract the actual appointment ID from formats like "CON-{id}-{timestamp}" or "INT-{id}-{timestamp}"
  const appointmentId = (() => {
    if (
      rawAppointmentId.startsWith("CON-") ||
      rawAppointmentId.startsWith("INT-")
    ) {
      const parts = rawAppointmentId.split("-");
      if (parts.length === 3) {
        // Format: CON-{id}-{timestamp} -> return just {id}
        return parts[1];
      } else if (parts.length === 2) {
        // Format: CON-{id} -> return just {id}
        return parts[1];
      }
    }
    return rawAppointmentId;
  })();

  const totalSteps = 9;

  useEffect(() => {
    // Load form ID from params (this should be the appointment ID)
    setFormularioId(appointmentId);

    // Load saved form data if exists
    const savedFormData = localStorage.getItem(`formData_${appointmentId}`);
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    } else {
      // Try to prefill with consultation data if no saved form data exists
      const consultaData = sessionStorage.getItem("consultaData");
      if (consultaData) {
        try {
          const parsedConsultaData = JSON.parse(consultaData);

          // Calculate age from birth date
          const age = calculateAgeFromBirthDate(
            parsedConsultaData.fechaNacimiento
          );
          const totalMonths = calculateTotalAgeInMonths(
            parsedConsultaData.fechaNacimiento
          );

          // Calculate siblings information
          // Filter out the main child (who this form is about) from siblings
          const allChildren = parsedConsultaData.hijos || [];
          const mainChildName = parsedConsultaData.nombre || "";
          const siblings = allChildren.filter(
            (hijo: Sibling) => hijo.nombre && hijo.nombre !== mainChildName
          );
          const hasSiblings = siblings.length > 0;
          const siblingsAges = siblings
            .map((hijo: Sibling) => {
              if (hijo.fechaNacimiento) {
                const siblingAge = calculateAgeFromBirthDate(
                  hijo.fechaNacimiento
                );
                return `${siblingAge.years} años`;
              }
              return "";
            })
            .filter((age: string) => age)
            .join(", ");

          // Prefill the form with consultation data
          const prefilledData = {
            ...initialFormData,
            nombreNino: parsedConsultaData.nombre || "",
            fechaNacimiento: parsedConsultaData.fechaNacimiento || "",
            edadAnos: age.years.toString(),
            edadMeses: totalMonths.toString(),
            // Map vivecon to viveConQuien if it exists
            viveConQuien: formatViveCon(
              parsedConsultaData.vivecon || "",
              parsedConsultaData.otroViveCon
            ),
            // Prefill siblings information
            tieneHermanos: hasSiblings ? "si" : "no",
            cantidadHermanos: hasSiblings ? siblings.length.toString() : "",
            edadesHermanos: siblingsAges,
          };

          setFormData(prefilledData);

          // Save the prefilled data to localStorage
          localStorage.setItem(
            `formData_${appointmentId}`,
            JSON.stringify(prefilledData)
          );

          // toast({
          //   title: "Datos precargados",
          //   description:
          //     "Se han precargado los datos del formulario de consulta.",
          // });
        } catch (error) {
          console.error("Error parsing consultation data:", error);
        }
      }
    }
  }, [appointmentId, toast]);

  const saveFormData = () => {
    localStorage.setItem(`formData_${formularioId}`, JSON.stringify(formData));
    toast({
      title: "Borrador guardado",
      description: "Su progreso ha sido guardado localmente.",
    });
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    // Auto-save when moving to next step
    localStorage.setItem(`formData_${formularioId}`, JSON.stringify(formData));

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      setShowSubmitModal(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Map Spanish form data to English API fields
      const apiFormData = mapFormDataToAPI(formData);

      const response = await fetch("/api/medical-forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: formularioId,
          formData: apiFormData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el formulario");
      }

      // Clear saved draft from localStorage
      localStorage.removeItem(`formData_${formularioId}`);

      setShowSubmitModal(false);
      setShowFinalModal(true);

      toast({
        title: "¡Formulario enviado exitosamente!",
        description: "Su información médica ha sido registrada.",
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast({
        title: "Error al enviar el formulario",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    saveFormData();
  };

  const getStepTitle = () => {
    const titles = [
      "Información Básica",
      "Antecedentes Perinatales",
      "Complicaciones del Nacimiento",
      "Historial Médico",
      "Medicamentos y Alergias",
      "Desarrollo Motor",
      "Lenguaje y Cognición",
      "Desarrollo Social y Hábitos",
      "Información Familiar",
    ];
    return titles[currentStep - 1];
  };

  const getStepIcon = () => {
    const icons = [
      <Baby key="baby" className="h-12 w-12 text-blue-600" />,
      <HeartPulse key="heart" className="h-12 w-12 text-pink-600" />,
      <Hospital key="hospital" className="h-12 w-12 text-blue-600" />,
      <Stethoscope key="stethoscope" className="h-12 w-12 text-teal-600" />,
      <AlertTriangle key="alert" className="h-12 w-12 text-amber-600" />,
      <Activity key="activity" className="h-12 w-12 text-green-600" />,
      <MessageCircle key="message" className="h-12 w-12 text-indigo-600" />,
      <Smile key="smile" className="h-12 w-12 text-orange-600" />,
      <Users key="users" className="h-12 w-12 text-purple-600" />,
    ];
    return icons[currentStep - 1];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Baby className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Información de su hijo/a
              </h2>
              <p className="text-gray-600">
                Por favor complete la información básica antes de continuar con
                el formulario médico
              </p>
              {formData.nombreNino && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    ✅ Datos precargados del formulario de consulta. Puede
                    modificar cualquier campo si es necesario.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nombreNino">Nombre del niño/a *</Label>
                <Input
                  id="nombreNino"
                  value={formData.nombreNino}
                  onChange={(e) => updateFormData("nombreNino", e.target.value)}
                  placeholder="Ingrese el nombre completo"
                  className="capitalize"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento *</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => {
                    const birthDate = e.target.value;
                    console.log("Date input changed to:", birthDate);
                    updateFormData("fechaNacimiento", birthDate);

                    // Auto-calculate age when birth date changes
                    if (birthDate) {
                      const age = calculateAgeFromBirthDate(birthDate);
                      const totalMonths = calculateTotalAgeInMonths(birthDate);
                      console.log(
                        "Calculated age:",
                        age,
                        "Total months:",
                        totalMonths
                      );
                      updateFormData("edadAnos", age.years.toString());
                      updateFormData("edadMeses", totalMonths.toString());
                    }
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edadAnos">Edad actual (años)</Label>
                  <Input
                    id="edadAnos"
                    type="number"
                    value={formData.edadAnos}
                    onChange={(e) => updateFormData("edadAnos", e.target.value)}
                    placeholder="0"
                    min="0"
                    max="18"
                  />
                </div>
                <div>
                  <Label htmlFor="edadMeses">Edad total (meses)</Label>
                  <Input
                    id="edadMeses"
                    type="number"
                    value={formData.edadMeses}
                    onChange={(e) =>
                      updateFormData("edadMeses", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    max="216"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <HeartPulse className="h-12 w-12 mx-auto text-pink-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Embarazo y Nacimiento
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">EMBARAZO:</Label>
                <RadioGroup
                  value={formData.tipoEmbarazo}
                  onValueChange={(value) =>
                    updateFormData("tipoEmbarazo", value)
                  }
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="termino" id="termino" />
                    <Label htmlFor="termino">A término</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prematuro" id="prematuro" />
                    <Label htmlFor="prematuro">Prematuro</Label>
                    {formData.tipoEmbarazo === "prematuro" && (
                      <Input
                        placeholder="semanas"
                        value={formData.semanasPrematuro}
                        onChange={(e) =>
                          updateFormData("semanasPrematuro", e.target.value)
                        }
                        className="w-24 ml-2"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="post-termino" id="post-termino" />
                    <Label htmlFor="post-termino">Post-término</Label>
                    {formData.tipoEmbarazo === "post-termino" && (
                      <Input
                        placeholder="semanas"
                        value={formData.semanasPostTermino}
                        onChange={(e) =>
                          updateFormData("semanasPostTermino", e.target.value)
                        }
                        className="w-24 ml-2"
                      />
                    )}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="complicacionesEmbarazo">
                  Complicaciones durante embarazo:
                </Label>
                <Textarea
                  id="complicacionesEmbarazo"
                  value={formData.complicacionesEmbarazo}
                  onChange={(e) =>
                    updateFormData("complicacionesEmbarazo", e.target.value)
                  }
                  placeholder="Describa cualquier complicación durante el embarazo"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium">TIPO DE PARTO:</Label>
                <RadioGroup
                  value={formData.tipoParto}
                  onValueChange={(value) => updateFormData("tipoParto", value)}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vaginal" id="vaginal" />
                    <Label htmlFor="vaginal">Vaginal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cesarea" id="cesarea" />
                    <Label htmlFor="cesarea">Cesárea</Label>
                  </div>
                </RadioGroup>
                {formData.tipoParto === "cesarea" && (
                  <div className="mt-2">
                    <Label htmlFor="motivoCesarea">Motivo:</Label>
                    <Input
                      id="motivoCesarea"
                      placeholder="Indique el motivo de la cesárea"
                      value={formData.motivoCesarea}
                      onChange={(e) =>
                        updateFormData("motivoCesarea", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">DATOS AL NACER:</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="pesoNacer">Peso (kg)</Label>
                    <Input
                      id="pesoNacer"
                      type="number"
                      step="0.01"
                      value={formData.pesoNacer}
                      onChange={(e) =>
                        updateFormData("pesoNacer", e.target.value)
                      }
                      placeholder="3.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tallaNacer">Talla (cm)</Label>
                    <Input
                      id="tallaNacer"
                      type="number"
                      step="0.1"
                      value={formData.tallaNacer}
                      onChange={(e) =>
                        updateFormData("tallaNacer", e.target.value)
                      }
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Hospital className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Primeros Días de Vida
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  ¿Hubo complicaciones durante el parto?
                </Label>
                <RadioGroup
                  value={formData.complicacionesParto}
                  onValueChange={(value) =>
                    updateFormData("complicacionesParto", value)
                  }
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="complicaciones-si" />
                    <Label htmlFor="complicaciones-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="complicaciones-no" />
                    <Label htmlFor="complicaciones-no">No</Label>
                  </div>
                </RadioGroup>

                {formData.complicacionesParto === "si" && (
                  <div className="mt-2">
                    <Label htmlFor="detallesComplicaciones">
                      Si respondió &quot;Sí&quot;, especifique:
                    </Label>
                    <Textarea
                      id="detallesComplicaciones"
                      value={formData.detallesComplicaciones}
                      onChange={(e) =>
                        updateFormData("detallesComplicaciones", e.target.value)
                      }
                      placeholder="Describa las complicaciones"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">
                  ¿Requirió internación especial?
                </Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uci-neonatal"
                      checked={formData.internacionEspecial.includes(
                        "UCI Neonatal"
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("internacionEspecial", [
                            ...formData.internacionEspecial.filter(
                              (item) => item !== "Ninguna"
                            ),
                            "UCI Neonatal",
                          ]);
                        } else {
                          updateFormData(
                            "internacionEspecial",
                            formData.internacionEspecial.filter(
                              (item) => item !== "UCI Neonatal"
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor="uci-neonatal">UCI Neonatal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cuidados-intermedios"
                      checked={formData.internacionEspecial.includes(
                        "Cuidados intermedios"
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("internacionEspecial", [
                            ...formData.internacionEspecial.filter(
                              (item) => item !== "Ninguna"
                            ),
                            "Cuidados intermedios",
                          ]);
                        } else {
                          updateFormData(
                            "internacionEspecial",
                            formData.internacionEspecial.filter(
                              (item) => item !== "Cuidados intermedios"
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor="cuidados-intermedios">
                      Cuidados intermedios
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incubadora"
                      checked={formData.internacionEspecial.includes(
                        "Incubadora"
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("internacionEspecial", [
                            ...formData.internacionEspecial.filter(
                              (item) => item !== "Ninguna"
                            ),
                            "Incubadora",
                          ]);
                        } else {
                          updateFormData(
                            "internacionEspecial",
                            formData.internacionEspecial.filter(
                              (item) => item !== "Incubadora"
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor="incubadora">Incubadora</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ninguna-internacion"
                      checked={formData.internacionEspecial.includes("Ninguna")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("internacionEspecial", ["Ninguna"]);
                        } else {
                          updateFormData(
                            "internacionEspecial",
                            formData.internacionEspecial.filter(
                              (item) => item !== "Ninguna"
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor="ninguna-internacion">
                      No requirió internación
                    </Label>
                  </div>
                </div>

                {formData.internacionEspecial.length > 0 &&
                  !formData.internacionEspecial.includes("Ninguna") && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="tiempoInternacion">
                          Tiempo (días):
                        </Label>
                        <Input
                          id="tiempoInternacion"
                          type="number"
                          value={formData.tiempoInternacion}
                          onChange={(e) =>
                            updateFormData("tiempoInternacion", e.target.value)
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="motivoInternacion">Motivo:</Label>
                        <Input
                          id="motivoInternacion"
                          value={formData.motivoInternacion}
                          onChange={(e) =>
                            updateFormData("motivoInternacion", e.target.value)
                          }
                          placeholder="Indique el motivo"
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Stethoscope className="h-12 w-12 mx-auto text-teal-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Antecedentes Médicos
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  ENFERMEDADES IMPORTANTES:
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    "Asma",
                    "Alergias",
                    "Epilepsia",
                    "Diabetes",
                    "Problemas cardíacos",
                    "Problemas renales",
                    "Otras",
                    "Ninguna",
                  ].map((enfermedad) => (
                    <div
                      key={enfermedad}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={enfermedad}
                        checked={formData.enfermedadesImportantes.includes(
                          enfermedad
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (enfermedad === "Ninguna") {
                              updateFormData("enfermedadesImportantes", [
                                "Ninguna",
                              ]);
                            } else {
                              updateFormData("enfermedadesImportantes", [
                                ...formData.enfermedadesImportantes.filter(
                                  (item) => item !== "Ninguna"
                                ),
                                enfermedad,
                              ]);
                            }
                          } else {
                            updateFormData(
                              "enfermedadesImportantes",
                              formData.enfermedadesImportantes.filter(
                                (item) => item !== enfermedad
                              )
                            );
                          }
                        }}
                      />
                      <Label htmlFor={enfermedad} className="capitalize">
                        {enfermedad}
                      </Label>
                    </div>
                  ))}
                </div>

                {formData.enfermedadesImportantes.includes("Otras") && (
                  <div className="mt-2">
                    <Input
                      placeholder="Especifique otras enfermedades"
                      value={formData.otraEnfermedad}
                      onChange={(e) =>
                        updateFormData("otraEnfermedad", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">
                  HOSPITALIZACIONES PREVIAS:
                </Label>
                {formData.hospitalizaciones.map((hospitalizacion, index) => (
                  <div
                    key={index}
                    className="mt-2 space-y-2 p-3 border rounded-md"
                  >
                    <div>
                      <Label htmlFor={`hospitalizacion-motivo-${index}`}>
                        Motivo:
                      </Label>
                      <Input
                        id={`hospitalizacion-motivo-${index}`}
                        value={hospitalizacion.motivo}
                        onChange={(e) => {
                          const newHospitalizaciones = [
                            ...formData.hospitalizaciones,
                          ];
                          newHospitalizaciones[index].motivo = e.target.value;
                          updateFormData(
                            "hospitalizaciones",
                            newHospitalizaciones
                          );
                        }}
                        placeholder="Indique el motivo"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`hospitalizacion-edad-${index}`}>
                        Edad (años):
                      </Label>
                      <Input
                        id={`hospitalizacion-edad-${index}`}
                        type="number"
                        value={hospitalizacion.edad}
                        onChange={(e) => {
                          const newHospitalizaciones = [
                            ...formData.hospitalizaciones,
                          ];
                          newHospitalizaciones[index].edad = e.target.value;
                          updateFormData(
                            "hospitalizaciones",
                            newHospitalizaciones
                          );
                        }}
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newHospitalizaciones = [
                            ...formData.hospitalizaciones,
                          ];
                          newHospitalizaciones.splice(index, 1);
                          updateFormData(
                            "hospitalizaciones",
                            newHospitalizaciones
                          );
                        }}
                        className="mt-2"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateFormData("hospitalizaciones", [
                      ...formData.hospitalizaciones,
                      { motivo: "", edad: "" },
                    ]);
                  }}
                  className="mt-2"
                >
                  + Agregar otra hospitalización
                </Button>
              </div>

              <div>
                <Label className="text-base font-medium">
                  CIRUGÍAS PREVIAS:
                </Label>
                <RadioGroup
                  value={formData.cirugiasPrevias}
                  onValueChange={(value) =>
                    updateFormData("cirugiasPrevias", value)
                  }
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cirugia-no" />
                    <Label htmlFor="cirugia-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="cirugia-si" />
                    <Label htmlFor="cirugia-si">Sí</Label>
                  </div>
                </RadioGroup>

                {formData.cirugiasPrevias === "si" && (
                  <div className="mt-2 space-y-2">
                    <div>
                      <Label htmlFor="detallesCirugias">Detalles:</Label>
                      <Input
                        id="detallesCirugias"
                        value={formData.detallesCirugias}
                        onChange={(e) =>
                          updateFormData("detallesCirugias", e.target.value)
                        }
                        placeholder="Describa la cirugía"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edadCirugias">Edad (años):</Label>
                      <Input
                        id="edadCirugias"
                        type="number"
                        value={formData.edadCirugias}
                        onChange={(e) =>
                          updateFormData("edadCirugias", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Medicamentos y Alergias
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  💊 MEDICAMENTOS ACTUALES:
                </Label>
                <div className="mt-2">
                  <Label className="text-sm">
                    ¿Toma algún medicamento actualmente?
                  </Label>
                  <RadioGroup
                    value={formData.tomaMedicamentos}
                    onValueChange={(value) =>
                      updateFormData("tomaMedicamentos", value)
                    }
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="medicamentos-no" />
                      <Label htmlFor="medicamentos-no">
                        No toma medicamentos
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="medicamentos-si" />
                      <Label htmlFor="medicamentos-si">Sí, especifique:</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.tomaMedicamentos === "si" && (
                  <div className="mt-2">
                    {formData.medicamentos.map((medicamento, index) => (
                      <div
                        key={index}
                        className="mt-2 space-y-2 p-3 border rounded-md"
                      >
                        <div>
                          <Label htmlFor={`medicamento-nombre-${index}`}>
                            Medicamento:
                          </Label>
                          <Input
                            id={`medicamento-nombre-${index}`}
                            value={medicamento.nombre}
                            onChange={(e) => {
                              const newMedicamentos = [
                                ...formData.medicamentos,
                              ];
                              newMedicamentos[index].nombre = e.target.value;
                              updateFormData("medicamentos", newMedicamentos);
                            }}
                            placeholder="Nombre del medicamento"
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`medicamento-dosis-${index}`}>
                              Dosis:
                            </Label>
                            <Input
                              id={`medicamento-dosis-${index}`}
                              value={medicamento.dosis}
                              onChange={(e) => {
                                const newMedicamentos = [
                                  ...formData.medicamentos,
                                ];
                                newMedicamentos[index].dosis = e.target.value;
                                updateFormData("medicamentos", newMedicamentos);
                              }}
                              placeholder="Dosis"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`medicamento-motivo-${index}`}>
                              Motivo:
                            </Label>
                            <Input
                              id={`medicamento-motivo-${index}`}
                              value={medicamento.motivo}
                              onChange={(e) => {
                                const newMedicamentos = [
                                  ...formData.medicamentos,
                                ];
                                newMedicamentos[index].motivo = e.target.value;
                                updateFormData("medicamentos", newMedicamentos);
                              }}
                              placeholder="Motivo"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        {index > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newMedicamentos = [
                                ...formData.medicamentos,
                              ];
                              newMedicamentos.splice(index, 1);
                              updateFormData("medicamentos", newMedicamentos);
                            }}
                            className="mt-2"
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateFormData("medicamentos", [
                          ...formData.medicamentos,
                          { nombre: "", dosis: "", motivo: "" },
                        ]);
                      }}
                      className="mt-2"
                    >
                      + Agregar otro medicamento
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">
                  ⚠️ ALERGIAS CONOCIDAS:
                </Label>

                <div className="mt-4">
                  <Label className="text-sm font-medium">
                    ALERGIAS ALIMENTARIAS:
                  </Label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {[
                      "Ninguna",
                      "Leche",
                      "Huevos",
                      "Frutos secos",
                      "Mariscos",
                      "Soja",
                      "Trigo",
                      "Otras",
                    ].map((alergia) => (
                      <div
                        key={alergia}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`alergia-alim-${alergia}`}
                          checked={formData.alergiasAlimentarias.includes(
                            alergia
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if (alergia === "Ninguna") {
                                updateFormData("alergiasAlimentarias", [
                                  "Ninguna",
                                ]);
                              } else {
                                updateFormData("alergiasAlimentarias", [
                                  ...formData.alergiasAlimentarias.filter(
                                    (item) => item !== "Ninguna"
                                  ),
                                  alergia,
                                ]);
                              }
                            } else {
                              updateFormData(
                                "alergiasAlimentarias",
                                formData.alergiasAlimentarias.filter(
                                  (item) => item !== alergia
                                )
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`alergia-alim-${alergia}`}
                          className="capitalize"
                        >
                          {alergia}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {formData.alergiasAlimentarias.includes("Otras") && (
                    <div className="mt-2">
                      <Input
                        placeholder="Especifique otras alergias alimentarias"
                        value={formData.otraAlergiaAlimentaria}
                        onChange={(e) =>
                          updateFormData(
                            "otraAlergiaAlimentaria",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium">
                    ALERGIAS A MEDICAMENTOS:
                  </Label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {["Ninguna", "Penicilina", "Aspirina", "Otras"].map(
                      (alergia) => (
                        <div
                          key={alergia}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`alergia-med-${alergia}`}
                            checked={formData.alergiasMedicamentos.includes(
                              alergia
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                if (alergia === "Ninguna") {
                                  updateFormData("alergiasMedicamentos", [
                                    "Ninguna",
                                  ]);
                                } else {
                                  updateFormData("alergiasMedicamentos", [
                                    ...formData.alergiasMedicamentos.filter(
                                      (item) => item !== "Ninguna"
                                    ),
                                    alergia,
                                  ]);
                                }
                              } else {
                                updateFormData(
                                  "alergiasMedicamentos",
                                  formData.alergiasMedicamentos.filter(
                                    (item) => item !== alergia
                                  )
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`alergia-med-${alergia}`}
                            className="capitalize"
                          >
                            {alergia}
                          </Label>
                        </div>
                      )
                    )}
                  </div>

                  {formData.alergiasMedicamentos.includes("Otras") && (
                    <div className="mt-2">
                      <Input
                        placeholder="Especifique otras alergias a medicamentos"
                        value={formData.otraAlergiaMedicamento}
                        onChange={(e) =>
                          updateFormData(
                            "otraAlergiaMedicamento",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium">OTRAS ALERGIAS:</Label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {["Polen", "Ácaros", "Pelo de animales", "Otras"].map(
                      (alergia) => (
                        <div
                          key={alergia}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`alergia-otra-${alergia}`}
                            checked={formData.otrasAlergias.includes(alergia)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFormData("otrasAlergias", [
                                  ...formData.otrasAlergias,
                                  alergia,
                                ]);
                              } else {
                                updateFormData(
                                  "otrasAlergias",
                                  formData.otrasAlergias.filter(
                                    (item) => item !== alergia
                                  )
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`alergia-otra-${alergia}`}
                            className="capitalize"
                          >
                            {alergia}
                          </Label>
                        </div>
                      )
                    )}
                  </div>

                  {formData.otrasAlergias.includes("Otras") && (
                    <div className="mt-2">
                      <Input
                        placeholder="Especifique otras alergias"
                        value={formData.otraAlergia}
                        onChange={(e) =>
                          updateFormData("otraAlergia", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Activity className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Desarrollo Motor</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  🏃 MOTOR GRUESO (Grandes movimientos):
                </Label>
                <div className="mt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sostenCabeza">
                        Sostén de cabeza (meses):
                      </Label>
                      <Input
                        id="sostenCabeza"
                        type="number"
                        value={formData.sostenCabeza}
                        onChange={(e) =>
                          updateFormData("sostenCabeza", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sentadoSinApoyo">
                        Sentado sin apoyo (meses):
                      </Label>
                      <Input
                        id="sentadoSinApoyo"
                        type="number"
                        value={formData.sentadoSinApoyo}
                        onChange={(e) =>
                          updateFormData("sentadoSinApoyo", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gateo">Gateo (meses):</Label>
                      <Input
                        id="gateo"
                        type="number"
                        value={formData.gateo}
                        onChange={(e) =>
                          updateFormData("gateo", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="caminaSolo">Camina solo (meses):</Label>
                      <Input
                        id="caminaSolo"
                        type="number"
                        value={formData.caminaSolo}
                        onChange={(e) =>
                          updateFormData("caminaSolo", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="subeEscaleras"
                      checked={formData.subeEscaleras}
                      onCheckedChange={(checked) =>
                        updateFormData("subeEscaleras", !!checked)
                      }
                    />
                    <Label htmlFor="subeEscaleras">Sube/baja escaleras</Label>
                  </div>

                  <div>
                    <Label className="text-sm">
                      ¿Dificultades en equilibrio/coordinación?
                    </Label>
                    <RadioGroup
                      value={formData.dificultadesEquilibrio}
                      onValueChange={(value) =>
                        updateFormData("dificultadesEquilibrio", value)
                      }
                      className="mt-1 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="equilibrio-no" />
                        <Label htmlFor="equilibrio-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="si" id="equilibrio-si" />
                        <Label htmlFor="equilibrio-si">Sí</Label>
                      </div>
                    </RadioGroup>

                    {formData.dificultadesEquilibrio === "si" && (
                      <div className="mt-2">
                        <Input
                          placeholder="Especifique las dificultades"
                          value={formData.detallesDificultadesEquilibrio}
                          onChange={(e) =>
                            updateFormData(
                              "detallesDificultadesEquilibrio",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  ✋ MOTOR FINO (Movimientos precisos):
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "prension", label: "Prensión (pinza fina)" },
                    { id: "garabatea", label: "Garabatea" },
                    { id: "dibuja-formas", label: "Dibuja formas básicas" },
                    { id: "usa-tijeras", label: "Usa tijeras" },
                  ].map((habilidad) => (
                    <div
                      key={habilidad.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={habilidad.id}
                        checked={formData.motorFino.includes(habilidad.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFormData("motorFino", [
                              ...formData.motorFino,
                              habilidad.id,
                            ]);
                          } else {
                            updateFormData(
                              "motorFino",
                              formData.motorFino.filter(
                                (item) => item !== habilidad.id
                              )
                            );
                          }
                        }}
                      />
                      <Label htmlFor={habilidad.id}>{habilidad.label}</Label>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Label htmlFor="torreCubos">
                    Arma torres de cubos (cantidad):
                  </Label>
                  <Input
                    id="torreCubos"
                    type="number"
                    value={formData.torreCubos}
                    onChange={(e) =>
                      updateFormData("torreCubos", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    className="mt-1"
                  />
                </div>

                <div className="mt-4">
                  <Label className="text-sm">
                    ¿Dificultades para manipular objetos pequeños?
                  </Label>
                  <RadioGroup
                    value={formData.dificultadesMotorFino}
                    onValueChange={(value) =>
                      updateFormData("dificultadesMotorFino", value)
                    }
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="motor-fino-no" />
                      <Label htmlFor="motor-fino-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="motor-fino-si" />
                      <Label htmlFor="motor-fino-si">Sí</Label>
                    </div>
                  </RadioGroup>

                  {formData.dificultadesMotorFino === "si" && (
                    <div className="mt-2">
                      <Input
                        placeholder="Especifique las dificultades"
                        value={formData.detallesDificultadesMotorFino}
                        onChange={(e) =>
                          updateFormData(
                            "detallesDificultadesMotorFino",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MessageCircle className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Lenguaje y Cognición
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  💬 DESARROLLO DEL LENGUAJE:
                </Label>
                <div className="mt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primerasPalabras">
                        Primeras palabras (meses):
                      </Label>
                      <Input
                        id="primerasPalabras"
                        type="number"
                        value={formData.primerasPalabras}
                        onChange={(e) =>
                          updateFormData("primerasPalabras", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="frases2Palabras">
                        Frases 2-3 palabras (meses):
                      </Label>
                      <Input
                        id="frases2Palabras"
                        type="number"
                        value={formData.frases2Palabras}
                        onChange={(e) =>
                          updateFormData("frases2Palabras", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="oracionesCompletas"
                      checked={formData.oracionesCompletas}
                      onCheckedChange={(checked) =>
                        updateFormData("oracionesCompletas", !!checked)
                      }
                    />
                    <Label htmlFor="oracionesCompletas">
                      Oraciones completas
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  ¿CÓMO SE COMUNICA ACTUALMENTE?
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "palabras", label: "Palabras" },
                    { id: "gestos", label: "Gestos" },
                    { id: "senalando", label: "Señalando" },
                    { id: "sonidos", label: "Sonidos" },
                    { id: "no-verbal", label: "No verbal" },
                  ].map((comunicacion) => (
                    <div
                      key={comunicacion.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={comunicacion.id}
                        checked={formData.comunicacionActual.includes(
                          comunicacion.id
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFormData("comunicacionActual", [
                              ...formData.comunicacionActual,
                              comunicacion.id,
                            ]);
                          } else {
                            updateFormData(
                              "comunicacionActual",
                              formData.comunicacionActual.filter(
                                (item) => item !== comunicacion.id
                              )
                            );
                          }
                        }}
                      />
                      <Label htmlFor={comunicacion.id}>
                        {comunicacion.label}
                      </Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comunicacion-otra"
                      checked={formData.comunicacionActual.includes("otra")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("comunicacionActual", [
                            ...formData.comunicacionActual,
                            "otra",
                          ]);
                        } else {
                          updateFormData(
                            "comunicacionActual",
                            formData.comunicacionActual.filter(
                              (item) => item !== "otra"
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor="comunicacion-otra">Otro</Label>
                  </div>
                </div>

                {formData.comunicacionActual.includes("otra") && (
                  <div className="mt-2">
                    <Input
                      placeholder="Especifique otra forma de comunicación"
                      value={formData.otraComunicacion}
                      onChange={(e) =>
                        updateFormData("otraComunicacion", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">COMPRENSIÓN:</Label>
                <div className="mt-2">
                  <Label className="text-sm">Se le comprende:</Label>
                  <RadioGroup
                    value={formData.comprension}
                    onValueChange={(value) =>
                      updateFormData("comprension", value)
                    }
                    className="mt-1 space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {["siempre", "mayoria", "a-veces", "casi-nunca"].map(
                        (nivel) => (
                          <div
                            key={nivel}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={nivel}
                              id={`comprension-${nivel}`}
                            />
                            <Label htmlFor={`comprension-${nivel}`}>
                              {nivel === "siempre"
                                ? "Siempre"
                                : nivel === "mayoria"
                                  ? "Mayoría"
                                  : nivel === "a-veces"
                                    ? "A veces"
                                    : "Casi nunca"}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </RadioGroup>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instrucciones-simples"
                      checked={formData.sigueInstruccionesSimples}
                      onCheckedChange={(checked) =>
                        updateFormData("sigueInstruccionesSimples", !!checked)
                      }
                    />
                    <Label htmlFor="instrucciones-simples">
                      Sigue instrucciones simples
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instrucciones-complejas"
                      checked={formData.sigueInstruccionesComplejas}
                      onCheckedChange={(checked) =>
                        updateFormData("sigueInstruccionesComplejas", !!checked)
                      }
                    />
                    <Label htmlFor="instrucciones-complejas">
                      Sigue instrucciones complejas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="responde-nombre"
                      checked={formData.respondeNombre}
                      onCheckedChange={(checked) =>
                        updateFormData("respondeNombre", !!checked)
                      }
                    />
                    <Label htmlFor="responde-nombre">
                      Responde a su nombre
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  🧠 DESARROLLO COGNITIVO:
                </Label>
                <div className="mt-2 space-y-2">
                  {[
                    {
                      id: "muestra-interes",
                      label: "Muestra interés por explorar",
                    },
                    {
                      id: "presta-atencion",
                      label: "Presta atención a cuentos/actividades",
                    },
                    {
                      id: "recuerda-eventos",
                      label: "Recuerda eventos recientes",
                    },
                  ].map((habilidad) => (
                    <div
                      key={habilidad.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={habilidad.id}
                        checked={formData.desarrolloCognitivo.includes(
                          habilidad.id
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFormData("desarrolloCognitivo", [
                              ...formData.desarrolloCognitivo,
                              habilidad.id,
                            ]);
                          } else {
                            updateFormData(
                              "desarrolloCognitivo",
                              formData.desarrolloCognitivo.filter(
                                (item) => item !== habilidad.id
                              )
                            );
                          }
                        }}
                      />
                      <Label htmlFor={habilidad.id}>{habilidad.label}</Label>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Label htmlFor="dificultades-aprender">
                    Dificultades para aprender:
                  </Label>
                  <Input
                    id="dificultades-aprender"
                    value={formData.dificultadesAprender}
                    onChange={(e) =>
                      updateFormData("dificultadesAprender", e.target.value)
                    }
                    placeholder="Especifique si hay dificultades para aprender"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Smile className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Desarrollo Social y Emocional
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  😊 INTERACCIÓN SOCIAL:
                </Label>
                <div className="mt-2">
                  <Label className="text-sm">
                    ¿Interactúa con otros niños?
                  </Label>
                  <RadioGroup
                    value={formData.interactuaOtrosNinos}
                    onValueChange={(value) =>
                      updateFormData("interactuaOtrosNinos", value)
                    }
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="interactua-si" />
                      <Label htmlFor="interactua-si">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="interactua-no" />
                      <Label htmlFor="interactua-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="con-dificultad"
                        id="interactua-dificultad"
                      />
                      <Label htmlFor="interactua-dificultad">
                        Con dificultad
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.interactuaOtrosNinos === "con-dificultad" && (
                    <div className="mt-2">
                      <Input
                        placeholder="Especifique las dificultades"
                        value={formData.detallesInteraccion}
                        onChange={(e) =>
                          updateFormData("detallesInteraccion", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comparte-juguetes"
                      checked={formData.comparteJuguetes}
                      onCheckedChange={(checked) =>
                        updateFormData("comparteJuguetes", !!checked)
                      }
                    />
                    <Label htmlFor="comparte-juguetes">
                      Comparte juguetes/actividades
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="expresa-emociones"
                      checked={formData.expresaEmociones}
                      onCheckedChange={(checked) =>
                        updateFormData("expresaEmociones", !!checked)
                      }
                    />
                    <Label htmlFor="expresa-emociones">
                      Expresa emociones (alegría, tristeza, enojo)
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">COMPORTAMIENTO:</Label>
                <div className="mt-2">
                  <Label className="text-sm">Rabietas:</Label>
                  <RadioGroup
                    value={formData.rabietas}
                    onValueChange={(value) => updateFormData("rabietas", value)}
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="rabietas-no" />
                      <Label htmlFor="rabietas-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="rabietas-si" />
                      <Label htmlFor="rabietas-si">Sí</Label>
                    </div>
                  </RadioGroup>

                  {formData.rabietas === "si" && (
                    <div className="mt-2">
                      <Label htmlFor="frecuencia-rabietas">Frecuencia:</Label>
                      <Input
                        id="frecuencia-rabietas"
                        placeholder="Especifique la frecuencia"
                        value={formData.frecuenciaRabietas}
                        onChange={(e) =>
                          updateFormData("frecuenciaRabietas", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Label className="text-sm">Adaptación a cambios:</Label>
                  <RadioGroup
                    value={formData.adaptacionCambios}
                    onValueChange={(value) =>
                      updateFormData("adaptacionCambios", value)
                    }
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="facilmente"
                        id="adaptacion-facil"
                      />
                      <Label htmlFor="adaptacion-facil">Fácilmente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="con-dificultad"
                        id="adaptacion-dificultad"
                      />
                      <Label htmlFor="adaptacion-dificultad">
                        Con dificultad
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="le-cuesta-mucho"
                        id="adaptacion-mucho"
                      />
                      <Label htmlFor="adaptacion-mucho">Le cuesta mucho</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="mt-4">
                  <Label className="text-sm">Conductas repetitivas:</Label>
                  <RadioGroup
                    value={formData.conductasRepetitivas}
                    onValueChange={(value) =>
                      updateFormData("conductasRepetitivas", value)
                    }
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="conductas-no" />
                      <Label htmlFor="conductas-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="conductas-si" />
                      <Label htmlFor="conductas-si">Sí</Label>
                    </div>
                  </RadioGroup>

                  {formData.conductasRepetitivas === "si" && (
                    <div className="mt-2">
                      <Input
                        placeholder="Especifique las conductas"
                        value={formData.detallesConductas}
                        onChange={(e) =>
                          updateFormData("detallesConductas", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  🍽️ HÁBITOS Y AUTONOMÍA:
                </Label>

                <div className="mt-2">
                  <Label className="text-sm font-medium">ALIMENTACIÓN:</Label>
                  <div className="mt-1 space-y-2">
                    {[
                      { id: "come-todo", label: "Come de todo" },
                      { id: "selectivo", label: "Selectivo" },
                      {
                        id: "dificultad-masticar",
                        label: "Dificultad masticar",
                      },
                    ].map((habito) => (
                      <div
                        key={habito.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={habito.id}
                          checked={formData.alimentacion.includes(habito.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("alimentacion", [
                                ...formData.alimentacion,
                                habito.id,
                              ]);
                            } else {
                              updateFormData(
                                "alimentacion",
                                formData.alimentacion.filter(
                                  (item) => item !== habito.id
                                )
                              );
                            }
                          }}
                        />
                        <Label htmlFor={habito.id}>{habito.label}</Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="utiliza-cubiertos"
                        checked={formData.utilizaCubiertos}
                        onCheckedChange={(checked) =>
                          updateFormData("utilizaCubiertos", !!checked)
                        }
                      />
                      <Label htmlFor="utiliza-cubiertos">
                        Utiliza cubiertos
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium">SUEÑO:</Label>
                  <div className="mt-1 space-y-2">
                    {[
                      { id: "duerme-noche", label: "Duerme toda la noche" },
                      { id: "se-despierta", label: "Se despierta" },
                      {
                        id: "dificultad-conciliar",
                        label: "Dificultad conciliar",
                      },
                      { id: "pesadillas", label: "Pesadillas" },
                    ].map((habito) => (
                      <div
                        key={habito.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={habito.id}
                          checked={formData.sueno.includes(habito.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("sueno", [
                                ...formData.sueno,
                                habito.id,
                              ]);
                            } else {
                              updateFormData(
                                "sueno",
                                formData.sueno.filter(
                                  (item) => item !== habito.id
                                )
                              );
                            }
                          }}
                        />
                        <Label htmlFor={habito.id}>{habito.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium">
                    CONTROL ESFÍNTERES:
                  </Label>
                  <div className="mt-1 grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="control-diurno">Diurno (años):</Label>
                      <Input
                        id="control-diurno"
                        type="number"
                        value={formData.controlEsfinterDiurno}
                        onChange={(e) =>
                          updateFormData(
                            "controlEsfinterDiurno",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="control-nocturno">Nocturno (años):</Label>
                      <Input
                        id="control-nocturno"
                        type="number"
                        value={formData.controlEsfinterNocturno}
                        onChange={(e) =>
                          updateFormData(
                            "controlEsfinterNocturno",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center space-x-2">
                    <Checkbox
                      id="usa-panal"
                      checked={formData.usaPanal}
                      onCheckedChange={(checked) =>
                        updateFormData("usaPanal", !!checked)
                      }
                    />
                    <Label htmlFor="usa-panal">Usa pañal</Label>
                  </div>

                  {formData.usaPanal && (
                    <div className="mt-2">
                      <Label htmlFor="edad-panal">Edad:</Label>
                      <Input
                        id="edad-panal"
                        type="number"
                        value={formData.edadPanal}
                        onChange={(e) =>
                          updateFormData("edadPanal", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Dinámica Familiar</h2>
              {formData.tieneHermanos === "si" && formData.cantidadHermanos && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <p className="text-sm text-purple-700">
                    ✅ Información de hermanos precargada del formulario de
                    consulta. Puede modificar si es necesario.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  👨‍👩‍👧‍👦 COMPOSICIÓN FAMILIAR:
                </Label>
                <div className="mt-2">
                  <Label htmlFor="vive-con-quien">
                    ¿Con quién vive el niño/a?
                  </Label>
                  <Textarea
                    id="vive-con-quien"
                    value={formData.viveConQuien}
                    onChange={(e) =>
                      updateFormData("viveConQuien", e.target.value)
                    }
                    placeholder="Describa con quién vive el niño/a"
                    className="mt-1"
                  />
                </div>

                <div className="mt-4">
                  <Label className="text-sm">Hermanos:</Label>
                  <RadioGroup
                    value={formData.tieneHermanos}
                    onValueChange={(value) =>
                      updateFormData("tieneHermanos", value)
                    }
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="hermanos-no" />
                      <Label htmlFor="hermanos-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="hermanos-si" />
                      <Label htmlFor="hermanos-si">Sí</Label>
                    </div>
                  </RadioGroup>

                  {formData.tieneHermanos === "si" && (
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cantidad-hermanos">Cantidad:</Label>
                        <Input
                          id="cantidad-hermanos"
                          type="number"
                          value={formData.cantidadHermanos}
                          onChange={(e) =>
                            updateFormData("cantidadHermanos", e.target.value)
                          }
                          placeholder="0"
                          min="0"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edades-hermanos">Edades:</Label>
                        <Input
                          id="edades-hermanos"
                          value={formData.edadesHermanos}
                          onChange={(e) =>
                            updateFormData("edadesHermanos", e.target.value)
                          }
                          placeholder="Ej: 5, 8, 12 años"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  AMBIENTE FAMILIAR:
                </Label>
                <RadioGroup
                  value={formData.ambienteFamiliar}
                  onValueChange={(value) =>
                    updateFormData("ambienteFamiliar", value)
                  }
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="armonioso" id="ambiente-armonioso" />
                    <Label htmlFor="ambiente-armonioso">Armonioso</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="algunas-tensiones"
                      id="ambiente-tensiones"
                    />
                    <Label htmlFor="ambiente-tensiones">
                      Con algunas tensiones
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="conflictos-frecuentes"
                      id="ambiente-conflictos"
                    />
                    <Label htmlFor="ambiente-conflictos">
                      Con conflictos frecuentes
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">
                  CAMBIOS RECIENTES:
                </Label>
                <div className="mt-2">
                  <Label className="text-sm">
                    ¿Ha habido cambios significativos recientemente?
                  </Label>
                  <RadioGroup
                    value={formData.cambiosRecientes}
                    onValueChange={(value) =>
                      updateFormData("cambiosRecientes", value)
                    }
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="cambios-no" />
                      <Label htmlFor="cambios-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="cambios-si" />
                      <Label htmlFor="cambios-si">Sí</Label>
                    </div>
                  </RadioGroup>

                  {formData.cambiosRecientes === "si" && (
                    <div className="mt-2">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "mudanza", label: "Mudanza" },
                          { id: "nacimiento", label: "Nacimiento" },
                          { id: "separacion", label: "Separación" },
                          { id: "perdida", label: "Pérdida" },
                        ].map((cambio) => (
                          <div
                            key={cambio.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={cambio.id}
                              checked={formData.tiposCambios.includes(
                                cambio.id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateFormData("tiposCambios", [
                                    ...formData.tiposCambios,
                                    cambio.id,
                                  ]);
                                } else {
                                  updateFormData(
                                    "tiposCambios",
                                    formData.tiposCambios.filter(
                                      (item) => item !== cambio.id
                                    )
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={cambio.id}>{cambio.label}</Label>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="otro-cambio"
                            checked={formData.tiposCambios.includes("otro")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFormData("tiposCambios", [
                                  ...formData.tiposCambios,
                                  "otro",
                                ]);
                              } else {
                                updateFormData(
                                  "tiposCambios",
                                  formData.tiposCambios.filter(
                                    (item) => item !== "otro"
                                  )
                                );
                              }
                            }}
                          />
                          <Label htmlFor="otro-cambio">Otro</Label>
                        </div>
                      </div>

                      {formData.tiposCambios.includes("otro") && (
                        <div className="mt-2">
                          <Input
                            placeholder="Especifique otro cambio"
                            value={formData.otroCambio}
                            onChange={(e) =>
                              updateFormData("otroCambio", e.target.value)
                            }
                          />
                        </div>
                      )}

                      <div className="mt-2">
                        <Label htmlFor="detalles-cambios">Detalles:</Label>
                        <Textarea
                          id="detalles-cambios"
                          value={formData.detallesCambios}
                          onChange={(e) =>
                            updateFormData("detallesCambios", e.target.value)
                          }
                          placeholder="Describa los detalles de los cambios"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  ANTECEDENTES FAMILIARES:
                </Label>
                <div className="mt-2">
                  <Label className="text-sm">
                    ¿Alguien más en la familia ha tenido dificultades similares?
                  </Label>
                  <RadioGroup
                    value={formData.antecedentesFamiliares}
                    onValueChange={(value) =>
                      updateFormData("antecedentesFamiliares", value)
                    }
                    className="mt-1 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="antecedentes-no" />
                      <Label htmlFor="antecedentes-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="antecedentes-si" />
                      <Label htmlFor="antecedentes-si">Sí</Label>
                    </div>
                  </RadioGroup>

                  {formData.antecedentesFamiliares === "si" && (
                    <div className="mt-2">
                      <Input
                        placeholder="Especifique los antecedentes familiares"
                        value={formData.detallesAntecedentes}
                        onChange={(e) =>
                          updateFormData("detallesAntecedentes", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-gray-500">ID: {formularioId}</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/schedule/appointment/success"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al resumen de la cita</span>
          </Link>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step Header */}
            <div className="text-center mb-8">
              {getStepIcon()}
              <h1 className="text-2xl font-bold text-gray-900 mt-4">
                {getStepTitle()}
              </h1>
            </div>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="flex space-x-2">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Atrás
                  </Button>
                )}
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Borrador
                </Button>
              </div>

              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === totalSteps ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Finalizar
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-green-600" />
              Confirmar Envío
            </DialogTitle>
            <div className="space-y-2">
              <span>¿Está seguro de que desea enviar el formulario?</span>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-3">
                <div className="text-sm text-amber-800">
                  <strong>Antes de enviar:</strong>
                </div>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  <li>• Revise que toda la información sea correcta</li>
                  <li>• Esta información será enviada al médico</li>
                  <li>
                    • Podrá modificarla antes de la consulta si es necesario
                  </li>
                </ul>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
              Revisar Información
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Formulario
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Success Modal */}
      <Dialog open={showFinalModal} onOpenChange={setShowFinalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              ¡Formulario Enviado!
            </DialogTitle>
            <div className="space-y-3">
              <span>Su formulario médico ha sido enviado exitosamente.</span>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="text-sm font-medium text-blue-900 mb-2">
                  📋 Código del formulario:
                </div>
                <div className="text-lg font-mono font-bold text-blue-800 bg-white px-3 py-2 rounded border">
                  {formularioId}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <div className="text-sm text-amber-800">
                  <strong>⚠️ Importante:</strong> No olvides que debes
                  aproximarte a la clínica e indicar el código de tu formulario
                  para proseguir con la consulta.
                </div>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowFinalModal(false);
                router.push("/");
              }}
              className="w-full"
            >
              Volver al inicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
