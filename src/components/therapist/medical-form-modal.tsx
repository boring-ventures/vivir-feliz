"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Baby,
  HeartPulse,
  Hospital,
  Stethoscope,
  AlertTriangle,
  Activity,
  MessageCircle,
  Smile,
  Users,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useUpdateMedicalForm } from "@/hooks/use-analysis";

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

interface MedicalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingData?: any;
  patientName?: string;
  onSave?: () => void;
}

export default function MedicalFormModal({
  isOpen,
  onClose,
  appointmentId,
  existingData,
  patientName,
  onSave,
}: MedicalFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const totalSteps = 9;

  const updateMedicalFormMutation = useUpdateMedicalForm();

  useEffect(() => {
    if (existingData && isOpen) {
      // Map existing medical form data to form structure
      const mappedData = mapExistingDataToForm(existingData);
      setFormData(mappedData);
    } else if (isOpen) {
      // Reset to initial state for new form
      setFormData(initialFormData);
      setCurrentStep(1);
    }
  }, [existingData, isOpen]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapExistingDataToForm = (data: any): FormData => {
    // Map the existing medical form data structure to the form structure
    return {
      nombreNino: data.basicInfo?.childName || "",
      fechaNacimiento: data.basicInfo?.childBirthDate?.split("T")[0] || "",
      edadAnos: data.basicInfo?.childAgeYears || "",
      edadMeses: data.basicInfo?.childAgeMonths || "",

      tipoEmbarazo: data.perinatalHistory?.pregnancyType || "",
      semanasPrematuro: data.perinatalHistory?.prematureWeeks || "",
      semanasPostTermino: data.perinatalHistory?.postTermWeeks || "",
      complicacionesEmbarazo:
        data.perinatalHistory?.pregnancyComplications || "",
      tipoParto: data.perinatalHistory?.deliveryType || "",
      motivoCesarea: data.perinatalHistory?.cesareanReason || "",
      pesoNacer: data.perinatalHistory?.birthWeight || "",
      tallaNacer: data.perinatalHistory?.birthHeight || "",

      complicacionesParto: data.perinatalHistory?.deliveryComplications || "",
      detallesComplicaciones: data.perinatalHistory?.complicationDetails || "",
      internacionEspecial: data.perinatalHistory?.specialCareStay || [],
      tiempoInternacion: data.perinatalHistory?.stayDuration || "",
      motivoInternacion: data.perinatalHistory?.stayReason || "",

      enfermedadesImportantes: data.medicalHistory?.importantIllnesses || [],
      otraEnfermedad: data.medicalHistory?.otherIllness || "",
      hospitalizaciones: data.medicalHistory?.hospitalizations || [
        { motivo: "", edad: "" },
      ],
      cirugiasPrevias: data.medicalHistory?.previousSurgeries || "",
      detallesCirugias: data.medicalHistory?.surgeryDetails || "",
      edadCirugias: data.medicalHistory?.surgeryAge || "",

      tomaMedicamentos: data.medicationsAllergies?.takesMedications || "",
      medicamentos: data.medicationsAllergies?.medications || [
        { nombre: "", dosis: "", motivo: "" },
      ],
      alergiasAlimentarias: data.medicationsAllergies?.foodAllergies || [],
      otraAlergiaAlimentaria: data.medicationsAllergies?.otherFoodAllergy || "",
      alergiasMedicamentos:
        data.medicationsAllergies?.medicationAllergies || [],
      otraAlergiaMedicamento:
        data.medicationsAllergies?.otherMedicationAllergy || "",
      otrasAlergias: data.medicationsAllergies?.otherAllergies || [],
      otraAlergia: data.medicationsAllergies?.otherAllergy || "",

      sostenCabeza: data.motorDevelopment?.headControlAge || "",
      sentadoSinApoyo: data.motorDevelopment?.sittingAge || "",
      gateo: data.motorDevelopment?.crawlingAge || "",
      caminaSolo: data.motorDevelopment?.walkingAge || "",
      subeEscaleras: data.motorDevelopment?.climbsStairs || false,
      dificultadesEquilibrio: data.motorDevelopment?.balanceDifficulties || "",
      detallesDificultadesEquilibrio:
        data.motorDevelopment?.balanceDifficultyDetails || "",
      motorFino: data.motorDevelopment?.fineMotorSkills || [],
      torreCubos: data.motorDevelopment?.blockTower || "",
      dificultadesMotorFino: data.motorDevelopment?.fineMotorDifficulties || "",
      detallesDificultadesMotorFino:
        data.motorDevelopment?.fineMotorDifficultyDetails || "",

      primerasPalabras: data.languageCognition?.firstWordsAge || "",
      frases2Palabras: data.languageCognition?.twoWordPhrasesAge || "",
      oracionesCompletas: data.languageCognition?.completeSentences || false,
      comunicacionActual: data.languageCognition?.currentCommunication || [],
      otraComunicacion: data.languageCognition?.otherCommunication || "",
      comprension: data.languageCognition?.comprehension || "",
      sigueInstruccionesSimples:
        data.languageCognition?.followsSimpleInstructions || false,
      sigueInstruccionesComplejas:
        data.languageCognition?.followsComplexInstructions || false,
      respondeNombre: data.languageCognition?.respondsToName || false,
      desarrolloCognitivo: data.languageCognition?.cognitiveDevelopment || [],
      dificultadesAprender: data.languageCognition?.learningDifficulties || "",

      interactuaOtrosNinos: data.socialEmotional?.interactsWithChildren || "",
      detallesInteraccion: data.socialEmotional?.interactionDetails || "",
      comparteJuguetes: data.socialEmotional?.sharesToys || false,
      expresaEmociones: data.socialEmotional?.expressesEmotions || false,
      rabietas: data.socialEmotional?.tantrums || "",
      frecuenciaRabietas: data.socialEmotional?.tantrumFrequency || "",
      adaptacionCambios: data.socialEmotional?.adaptationToChanges || "",
      conductasRepetitivas: data.socialEmotional?.repetitiveBehaviors || "",
      detallesConductas: data.socialEmotional?.behaviorDetails || "",
      alimentacion: data.socialEmotional?.feeding || [],
      utilizaCubiertos: data.socialEmotional?.usesUtensils || false,
      sueno: data.socialEmotional?.sleep || [],
      controlEsfinterDiurno: data.socialEmotional?.daytimeToiletControl || "",
      controlEsfinterNocturno:
        data.socialEmotional?.nighttimeToiletControl || "",
      usaPanal: data.socialEmotional?.usesDiapers || false,
      edadPanal: data.socialEmotional?.diaperAge || "",

      viveConQuien: data.familyInfo?.livesWithWhom || "",
      tieneHermanos: data.familyInfo?.hasSiblings || "",
      cantidadHermanos: data.familyInfo?.numberOfSiblings || "",
      edadesHermanos: data.familyInfo?.siblingAges || "",
      ambienteFamiliar: data.familyInfo?.familyEnvironment || "",
      cambiosRecientes: data.familyInfo?.recentChanges || "",
      tiposCambios: data.familyInfo?.changeTypes || [],
      otroCambio: data.familyInfo?.otherChange || "",
      detallesCambios: data.familyInfo?.changeDetails || "",
      antecedentesFamiliares: data.familyInfo?.familyHistory || "",
      detallesAntecedentes: data.familyInfo?.historyDetails || "",
    };
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Map form data to API format
      const apiData = mapFormDataToAPI(formData);

      await updateMedicalFormMutation.mutateAsync({
        appointmentId,
        formData: apiData,
      });

      toast({
        title: "Formulario guardado",
        description:
          "Los datos del formulario médico han sido guardados exitosamente",
      });

      onSave?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el formulario",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
      specialCareStay: formData.internacionEspecial,
      stayDuration: formData.tiempoInternacion,
      stayReason: formData.motivoInternacion,

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
      otherAllergy: formData.otraAlergia,

      // Motor Development
      headControlAge: formData.sostenCabeza,
      sittingAge: formData.sentadoSinApoyo,
      crawlingAge: formData.gateo,
      walkingAge: formData.caminaSolo,
      climbsStairs: formData.subeEscaleras,
      balanceDifficulties: formData.dificultadesEquilibrio,
      balanceDifficultyDetails: formData.detallesDificultadesEquilibrio,
      fineMotorSkills: formData.motorFino,
      blockTower: formData.torreCubos,
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
      adaptationToChanges: formData.adaptacionCambios,
      repetitiveBehaviors: formData.conductasRepetitivas,
      behaviorDetails: formData.detallesConductas,
      feeding: formData.alimentacion,
      usesUtensils: formData.utilizaCubiertos,
      sleep: formData.sueno,
      daytimeToiletControl: formData.controlEsfinterDiurno,
      nighttimeToiletControl: formData.controlEsfinterNocturno,
      usesDiapers: formData.usaPanal,
      diaperAge: formData.edadPanal,

      // Family Information
      livesWithWhom: formData.viveConQuien,
      hasSiblings: formData.tieneHermanos,
      numberOfSiblings: formData.cantidadHermanos,
      siblingAges: formData.edadesHermanos,
      familyEnvironment: formData.ambienteFamiliar,
      recentChanges: formData.cambiosRecientes,
      changeTypes: formData.tiposCambios,
      otherChange: formData.otroCambio,
      changeDetails: formData.detallesCambios,
      familyHistory: formData.antecedentesFamiliares,
      historyDetails: formData.detallesAntecedentes,
    };
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
      <Baby key="baby" className="h-8 w-8 text-blue-600" />,
      <HeartPulse key="heart" className="h-8 w-8 text-pink-600" />,
      <Hospital key="hospital" className="h-8 w-8 text-blue-600" />,
      <Stethoscope key="stethoscope" className="h-8 w-8 text-teal-600" />,
      <AlertTriangle key="alert" className="h-8 w-8 text-amber-600" />,
      <Activity key="activity" className="h-8 w-8 text-green-600" />,
      <MessageCircle key="message" className="h-8 w-8 text-indigo-600" />,
      <Smile key="smile" className="h-8 w-8 text-orange-600" />,
      <Users key="users" className="h-8 w-8 text-purple-600" />,
    ];
    return icons[currentStep - 1];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      case 8:
        return renderStep8();
      case 9:
        return renderStep9();
      default:
        return renderStep1();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Baby className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Información Básica</h3>
        <p className="text-gray-600 text-sm">Información básica del niño/a</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nombreNino">Nombre del niño/a *</Label>
          <Input
            id="nombreNino"
            value={formData.nombreNino}
            onChange={(e) => updateFormData("nombreNino", e.target.value)}
            placeholder="Ingrese el nombre completo"
            required
          />
        </div>

        <div>
          <Label htmlFor="fechaNacimiento">Fecha de nacimiento *</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            value={formData.fechaNacimiento}
            onChange={(e) => updateFormData("fechaNacimiento", e.target.value)}
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
            <Label htmlFor="edadMeses">Edad actual (meses)</Label>
            <Input
              id="edadMeses"
              type="number"
              value={formData.edadMeses}
              onChange={(e) => updateFormData("edadMeses", e.target.value)}
              placeholder="0"
              min="0"
              max="11"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <HeartPulse className="h-12 w-12 mx-auto text-pink-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Embarazo y Nacimiento</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">EMBARAZO:</Label>
          <RadioGroup
            value={formData.tipoEmbarazo}
            onValueChange={(value) => updateFormData("tipoEmbarazo", value)}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pesoNacer">Peso al nacer (kg):</Label>
            <Input
              id="pesoNacer"
              value={formData.pesoNacer}
              onChange={(e) => updateFormData("pesoNacer", e.target.value)}
              placeholder="3.5"
              type="number"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="tallaNacer">Talla al nacer (cm):</Label>
            <Input
              id="tallaNacer"
              value={formData.tallaNacer}
              onChange={(e) => updateFormData("tallaNacer", e.target.value)}
              placeholder="50"
              type="number"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Hospital className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Complicaciones del Nacimiento
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="complicacionesParto">
            Complicaciones durante el parto:
          </Label>
          <Textarea
            id="complicacionesParto"
            value={formData.complicacionesParto}
            onChange={(e) =>
              updateFormData("complicacionesParto", e.target.value)
            }
            placeholder="Describa cualquier complicación durante el parto"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="detallesComplicaciones">
            Detalles de las complicaciones:
          </Label>
          <Textarea
            id="detallesComplicaciones"
            value={formData.detallesComplicaciones}
            onChange={(e) =>
              updateFormData("detallesComplicaciones", e.target.value)
            }
            placeholder="Proporcione más detalles sobre las complicaciones"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            Internación en cuidados especiales:
          </Label>
          <div className="mt-2 space-y-2">
            {[
              "UCI Neonatal",
              "Cuidados intermedios",
              "Incubadora",
              "Ninguna",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={formData.internacionEspecial.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData("internacionEspecial", [
                        ...formData.internacionEspecial,
                        option,
                      ]);
                    } else {
                      updateFormData(
                        "internacionEspecial",
                        formData.internacionEspecial.filter(
                          (item) => item !== option
                        )
                      );
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        </div>

        {formData.internacionEspecial.length > 0 &&
          !formData.internacionEspecial.includes("Ninguna") && (
            <>
              <div>
                <Label htmlFor="tiempoInternacion">
                  Tiempo de internación:
                </Label>
                <Input
                  id="tiempoInternacion"
                  value={formData.tiempoInternacion}
                  onChange={(e) =>
                    updateFormData("tiempoInternacion", e.target.value)
                  }
                  placeholder="Ej: 5 días, 2 semanas"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="motivoInternacion">
                  Motivo de internación:
                </Label>
                <Textarea
                  id="motivoInternacion"
                  value={formData.motivoInternacion}
                  onChange={(e) =>
                    updateFormData("motivoInternacion", e.target.value)
                  }
                  placeholder="Explique el motivo de la internación"
                  className="mt-2"
                />
              </div>
            </>
          )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Stethoscope className="h-12 w-12 mx-auto text-teal-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Historial Médico</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">
            Enfermedades importantes:
          </Label>
          <div className="mt-2 space-y-2">
            {[
              "Asma",
              "Alergias",
              "Epilepsia",
              "Diabetes",
              "Problemas cardíacos",
              "Problemas renales",
              "Otras",
              "Ninguna",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={formData.enfermedadesImportantes.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData("enfermedadesImportantes", [
                        ...formData.enfermedadesImportantes,
                        option,
                      ]);
                    } else {
                      updateFormData(
                        "enfermedadesImportantes",
                        formData.enfermedadesImportantes.filter(
                          (item) => item !== option
                        )
                      );
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        </div>

        {formData.enfermedadesImportantes.includes("Otras") && (
          <div>
            <Label htmlFor="otraEnfermedad">
              Especifique otras enfermedades:
            </Label>
            <Input
              id="otraEnfermedad"
              value={formData.otraEnfermedad}
              onChange={(e) => updateFormData("otraEnfermedad", e.target.value)}
              placeholder="Describa otras enfermedades"
              className="mt-2"
            />
          </div>
        )}

        <div>
          <Label className="text-base font-medium">
            Hospitalizaciones previas:
          </Label>
          {formData.hospitalizaciones.map((hosp, index) => (
            <div
              key={index}
              className="mt-2 grid grid-cols-2 gap-4 p-4 border rounded"
            >
              <div>
                <Label htmlFor={`motivo-${index}`}>Motivo:</Label>
                <Input
                  id={`motivo-${index}`}
                  value={hosp.motivo}
                  onChange={(e) => {
                    const newHospitalizaciones = [
                      ...formData.hospitalizaciones,
                    ];
                    newHospitalizaciones[index].motivo = e.target.value;
                    updateFormData("hospitalizaciones", newHospitalizaciones);
                  }}
                  placeholder="Motivo de hospitalización"
                />
              </div>
              <div>
                <Label htmlFor={`edad-${index}`}>Edad:</Label>
                <Input
                  id={`edad-${index}`}
                  value={hosp.edad}
                  onChange={(e) => {
                    const newHospitalizaciones = [
                      ...formData.hospitalizaciones,
                    ];
                    newHospitalizaciones[index].edad = e.target.value;
                    updateFormData("hospitalizaciones", newHospitalizaciones);
                  }}
                  placeholder="Edad durante hospitalización"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              updateFormData("hospitalizaciones", [
                ...formData.hospitalizaciones,
                { motivo: "", edad: "" },
              ]);
            }}
            className="mt-2"
          >
            + Agregar hospitalización
          </Button>
        </div>

        <div>
          <Label className="text-base font-medium">
            ¿Ha tenido cirugías previas?
          </Label>
          <RadioGroup
            value={formData.cirugiasPrevias}
            onValueChange={(value) => updateFormData("cirugiasPrevias", value)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="si" id="cirugias-si" />
              <Label htmlFor="cirugias-si">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="cirugias-no" />
              <Label htmlFor="cirugias-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.cirugiasPrevias === "si" && (
          <>
            <div>
              <Label htmlFor="detallesCirugias">
                Detalles de las cirugías:
              </Label>
              <Textarea
                id="detallesCirugias"
                value={formData.detallesCirugias}
                onChange={(e) =>
                  updateFormData("detallesCirugias", e.target.value)
                }
                placeholder="Describa las cirugías realizadas"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edadCirugias">Edad durante las cirugías:</Label>
              <Input
                id="edadCirugias"
                value={formData.edadCirugias}
                onChange={(e) => updateFormData("edadCirugias", e.target.value)}
                placeholder="Edad cuando se realizaron las cirugías"
                className="mt-2"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Medicamentos y Alergias</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">
            ¿Toma medicamentos actualmente?
          </Label>
          <RadioGroup
            value={formData.tomaMedicamentos}
            onValueChange={(value) => updateFormData("tomaMedicamentos", value)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="si" id="medicamentos-si" />
              <Label htmlFor="medicamentos-si">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="medicamentos-no" />
              <Label htmlFor="medicamentos-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.tomaMedicamentos === "si" && (
          <div>
            <Label className="text-base font-medium">
              Medicamentos actuales:
            </Label>
            {formData.medicamentos.map((med, index) => (
              <div
                key={index}
                className="mt-2 grid grid-cols-3 gap-4 p-4 border rounded"
              >
                <div>
                  <Label htmlFor={`med-nombre-${index}`}>Nombre:</Label>
                  <Input
                    id={`med-nombre-${index}`}
                    value={med.nombre}
                    onChange={(e) => {
                      const newMedicamentos = [...formData.medicamentos];
                      newMedicamentos[index].nombre = e.target.value;
                      updateFormData("medicamentos", newMedicamentos);
                    }}
                    placeholder="Nombre del medicamento"
                  />
                </div>
                <div>
                  <Label htmlFor={`med-dosis-${index}`}>Dosis:</Label>
                  <Input
                    id={`med-dosis-${index}`}
                    value={med.dosis}
                    onChange={(e) => {
                      const newMedicamentos = [...formData.medicamentos];
                      newMedicamentos[index].dosis = e.target.value;
                      updateFormData("medicamentos", newMedicamentos);
                    }}
                    placeholder="Dosis"
                  />
                </div>
                <div>
                  <Label htmlFor={`med-motivo-${index}`}>Motivo:</Label>
                  <Input
                    id={`med-motivo-${index}`}
                    value={med.motivo}
                    onChange={(e) => {
                      const newMedicamentos = [...formData.medicamentos];
                      newMedicamentos[index].motivo = e.target.value;
                      updateFormData("medicamentos", newMedicamentos);
                    }}
                    placeholder="Motivo"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                updateFormData("medicamentos", [
                  ...formData.medicamentos,
                  { nombre: "", dosis: "", motivo: "" },
                ]);
              }}
              className="mt-2"
            >
              + Agregar medicamento
            </Button>
          </div>
        )}

        <div>
          <Label className="text-base font-medium">
            Alergias alimentarias:
          </Label>
          <div className="mt-2 space-y-2">
            {[
              "Leche",
              "Huevos",
              "Frutos secos",
              "Mariscos",
              "Soja",
              "Trigo",
              "Otras",
              "Ninguna",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={formData.alergiasAlimentarias.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData("alergiasAlimentarias", [
                        ...formData.alergiasAlimentarias,
                        option,
                      ]);
                    } else {
                      updateFormData(
                        "alergiasAlimentarias",
                        formData.alergiasAlimentarias.filter(
                          (item) => item !== option
                        )
                      );
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        </div>

        {formData.alergiasAlimentarias.includes("Otras") && (
          <div>
            <Label htmlFor="otraAlergiaAlimentaria">
              Especifique otras alergias alimentarias:
            </Label>
            <Input
              id="otraAlergiaAlimentaria"
              value={formData.otraAlergiaAlimentaria}
              onChange={(e) =>
                updateFormData("otraAlergiaAlimentaria", e.target.value)
              }
              placeholder="Otras alergias alimentarias"
              className="mt-2"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Activity className="h-12 w-12 mx-auto text-green-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Desarrollo Motor</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sostenCabeza">Sostuvo la cabeza (meses):</Label>
            <Input
              id="sostenCabeza"
              value={formData.sostenCabeza}
              onChange={(e) => updateFormData("sostenCabeza", e.target.value)}
              placeholder="3-4"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="sentadoSinApoyo">Se sentó sin apoyo (meses):</Label>
            <Input
              id="sentadoSinApoyo"
              value={formData.sentadoSinApoyo}
              onChange={(e) =>
                updateFormData("sentadoSinApoyo", e.target.value)
              }
              placeholder="6-8"
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gateo">Gateó (meses):</Label>
            <Input
              id="gateo"
              value={formData.gateo}
              onChange={(e) => updateFormData("gateo", e.target.value)}
              placeholder="8-10"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="caminaSolo">Caminó solo (meses):</Label>
            <Input
              id="caminaSolo"
              value={formData.caminaSolo}
              onChange={(e) => updateFormData("caminaSolo", e.target.value)}
              placeholder="12-15"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="subeEscaleras"
            checked={formData.subeEscaleras}
            onCheckedChange={(checked) =>
              updateFormData("subeEscaleras", checked)
            }
          />
          <Label htmlFor="subeEscaleras">Sube escaleras</Label>
        </div>

        <div>
          <Label className="text-base font-medium">
            ¿Tiene dificultades de equilibrio?
          </Label>
          <RadioGroup
            value={formData.dificultadesEquilibrio}
            onValueChange={(value) =>
              updateFormData("dificultadesEquilibrio", value)
            }
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="si" id="equilibrio-si" />
              <Label htmlFor="equilibrio-si">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="equilibrio-no" />
              <Label htmlFor="equilibrio-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.dificultadesEquilibrio === "si" && (
          <div>
            <Label htmlFor="detallesDificultadesEquilibrio">
              Detalles de dificultades de equilibrio:
            </Label>
            <Textarea
              id="detallesDificultadesEquilibrio"
              value={formData.detallesDificultadesEquilibrio}
              onChange={(e) =>
                updateFormData("detallesDificultadesEquilibrio", e.target.value)
              }
              placeholder="Describa las dificultades de equilibrio"
              className="mt-2"
            />
          </div>
        )}

        <div>
          <Label className="text-base font-medium">
            Habilidades motoras finas:
          </Label>
          <div className="mt-2 space-y-2">
            {[
              "Agarra objetos pequeños",
              "Usa pinza digital",
              "Dibuja",
              "Usa cubiertos",
              "Se viste solo",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={formData.motorFino.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData("motorFino", [
                        ...formData.motorFino,
                        option,
                      ]);
                    } else {
                      updateFormData(
                        "motorFino",
                        formData.motorFino.filter((item) => item !== option)
                      );
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MessageCircle className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Lenguaje y Cognición</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primerasPalabras">Primeras palabras (meses):</Label>
            <Input
              id="primerasPalabras"
              value={formData.primerasPalabras}
              onChange={(e) =>
                updateFormData("primerasPalabras", e.target.value)
              }
              placeholder="12-18"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="frases2Palabras">
              Frases de 2 palabras (meses):
            </Label>
            <Input
              id="frases2Palabras"
              value={formData.frases2Palabras}
              onChange={(e) =>
                updateFormData("frases2Palabras", e.target.value)
              }
              placeholder="18-24"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="oracionesCompletas"
            checked={formData.oracionesCompletas}
            onCheckedChange={(checked) =>
              updateFormData("oracionesCompletas", checked)
            }
          />
          <Label htmlFor="oracionesCompletas">Forma oraciones completas</Label>
        </div>

        <div>
          <Label className="text-base font-medium">Comunicación actual:</Label>
          <div className="mt-2 space-y-2">
            {[
              "Palabras sueltas",
              "Frases simples",
              "Oraciones completas",
              "Gestos",
              "Señala",
              "No verbal",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={formData.comunicacionActual.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData("comunicacionActual", [
                        ...formData.comunicacionActual,
                        option,
                      ]);
                    } else {
                      updateFormData(
                        "comunicacionActual",
                        formData.comunicacionActual.filter(
                          (item) => item !== option
                        )
                      );
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Comprensión:</Label>
          <RadioGroup
            value={formData.comprension}
            onValueChange={(value) => updateFormData("comprension", value)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excelente" id="comprension-excelente" />
              <Label htmlFor="comprension-excelente">Excelente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="buena" id="comprension-buena" />
              <Label htmlFor="comprension-buena">Buena</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="regular" id="comprension-regular" />
              <Label htmlFor="comprension-regular">Regular</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="limitada" id="comprension-limitada" />
              <Label htmlFor="comprension-limitada">Limitada</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sigueInstruccionesSimples"
              checked={formData.sigueInstruccionesSimples}
              onCheckedChange={(checked) =>
                updateFormData("sigueInstruccionesSimples", checked)
              }
            />
            <Label htmlFor="sigueInstruccionesSimples">
              Sigue instrucciones simples
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sigueInstruccionesComplejas"
              checked={formData.sigueInstruccionesComplejas}
              onCheckedChange={(checked) =>
                updateFormData("sigueInstruccionesComplejas", checked)
              }
            />
            <Label htmlFor="sigueInstruccionesComplejas">
              Sigue instrucciones complejas
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="respondeNombre"
              checked={formData.respondeNombre}
              onCheckedChange={(checked) =>
                updateFormData("respondeNombre", checked)
              }
            />
            <Label htmlFor="respondeNombre">Responde a su nombre</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="dificultadesAprender">
            Dificultades para aprender:
          </Label>
          <Textarea
            id="dificultadesAprender"
            value={formData.dificultadesAprender}
            onChange={(e) =>
              updateFormData("dificultadesAprender", e.target.value)
            }
            placeholder="Describa cualquier dificultad para aprender o seguir instrucciones"
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Smile className="h-12 w-12 mx-auto text-orange-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Desarrollo Social y Hábitos
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">
            ¿Interactúa con otros niños?
          </Label>
          <RadioGroup
            value={formData.interactuaOtrosNinos}
            onValueChange={(value) =>
              updateFormData("interactuaOtrosNinos", value)
            }
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mucho" id="interaccion-mucho" />
              <Label htmlFor="interaccion-mucho">Mucho</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="poco" id="interaccion-poco" />
              <Label htmlFor="interaccion-poco">Poco</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nada" id="interaccion-nada" />
              <Label htmlFor="interaccion-nada">Nada</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="detallesInteraccion">
            Detalles de la interacción:
          </Label>
          <Textarea
            id="detallesInteraccion"
            value={formData.detallesInteraccion}
            onChange={(e) =>
              updateFormData("detallesInteraccion", e.target.value)
            }
            placeholder="Describa cómo interactúa con otros niños"
            className="mt-2"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="comparteJuguetes"
              checked={formData.comparteJuguetes}
              onCheckedChange={(checked) =>
                updateFormData("comparteJuguetes", checked)
              }
            />
            <Label htmlFor="comparteJuguetes">Comparte juguetes</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="expresaEmociones"
              checked={formData.expresaEmociones}
              onCheckedChange={(checked) =>
                updateFormData("expresaEmociones", checked)
              }
            />
            <Label htmlFor="expresaEmociones">
              Expresa emociones apropiadamente
            </Label>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Rabietas:</Label>
          <RadioGroup
            value={formData.rabietas}
            onValueChange={(value) => updateFormData("rabietas", value)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="frecuentes" id="rabietas-frecuentes" />
              <Label htmlFor="rabietas-frecuentes">Frecuentes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ocasionales" id="rabietas-ocasionales" />
              <Label htmlFor="rabietas-ocasionales">Ocasionales</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="raras" id="rabietas-raras" />
              <Label htmlFor="rabietas-raras">Raras</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nunca" id="rabietas-nunca" />
              <Label htmlFor="rabietas-nunca">Nunca</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium">
            Control de esfínter diurno:
          </Label>
          <RadioGroup
            value={formData.controlEsfinterDiurno}
            onValueChange={(value) =>
              updateFormData("controlEsfinterDiurno", value)
            }
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completo" id="diurno-completo" />
              <Label htmlFor="diurno-completo">Completo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="parcial" id="diurno-parcial" />
              <Label htmlFor="diurno-parcial">Parcial</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="diurno-no" />
              <Label htmlFor="diurno-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium">
            Control de esfínter nocturno:
          </Label>
          <RadioGroup
            value={formData.controlEsfinterNocturno}
            onValueChange={(value) =>
              updateFormData("controlEsfinterNocturno", value)
            }
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completo" id="nocturno-completo" />
              <Label htmlFor="nocturno-completo">Completo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="parcial" id="nocturno-parcial" />
              <Label htmlFor="nocturno-parcial">Parcial</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="nocturno-no" />
              <Label htmlFor="nocturno-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  const renderStep9 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Información Familiar</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="viveConQuien">¿Con quién vive el niño/a?</Label>
          <Input
            id="viveConQuien"
            value={formData.viveConQuien}
            onChange={(e) => updateFormData("viveConQuien", e.target.value)}
            placeholder="Ej: Padres, abuelos, madre soltera, etc."
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base font-medium">¿Tiene hermanos?</Label>
          <RadioGroup
            value={formData.tieneHermanos}
            onValueChange={(value) => updateFormData("tieneHermanos", value)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="si" id="hermanos-si" />
              <Label htmlFor="hermanos-si">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="hermanos-no" />
              <Label htmlFor="hermanos-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.tieneHermanos === "si" && (
          <>
            <div>
              <Label htmlFor="cantidadHermanos">Cantidad de hermanos:</Label>
              <Input
                id="cantidadHermanos"
                type="number"
                value={formData.cantidadHermanos}
                onChange={(e) =>
                  updateFormData("cantidadHermanos", e.target.value)
                }
                placeholder="1"
                min="1"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edadesHermanos">Edades de los hermanos:</Label>
              <Input
                id="edadesHermanos"
                value={formData.edadesHermanos}
                onChange={(e) =>
                  updateFormData("edadesHermanos", e.target.value)
                }
                placeholder="Ej: 5 años, 8 años"
                className="mt-2"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="ambienteFamiliar">Ambiente familiar:</Label>
          <Textarea
            id="ambienteFamiliar"
            value={formData.ambienteFamiliar}
            onChange={(e) => updateFormData("ambienteFamiliar", e.target.value)}
            placeholder="Describa el ambiente familiar y las dinámicas del hogar"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base font-medium">
            ¿Ha habido cambios recientes importantes en la familia?
          </Label>
          <RadioGroup
            value={formData.cambiosRecientes}
            onValueChange={(value) => updateFormData("cambiosRecientes", value)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="si" id="cambios-si" />
              <Label htmlFor="cambios-si">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="cambios-no" />
              <Label htmlFor="cambios-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.cambiosRecientes === "si" && (
          <>
            <div>
              <Label className="text-base font-medium">Tipos de cambios:</Label>
              <div className="mt-2 space-y-2">
                {[
                  "Mudanza",
                  "Divorcio/separación",
                  "Nuevo bebé",
                  "Pérdida familiar",
                  "Cambio de trabajo",
                  "Otros",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={formData.tiposCambios.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("tiposCambios", [
                            ...formData.tiposCambios,
                            option,
                          ]);
                        } else {
                          updateFormData(
                            "tiposCambios",
                            formData.tiposCambios.filter(
                              (item) => item !== option
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="detallesCambios">Detalles de los cambios:</Label>
              <Textarea
                id="detallesCambios"
                value={formData.detallesCambios}
                onChange={(e) =>
                  updateFormData("detallesCambios", e.target.value)
                }
                placeholder="Proporcione más detalles sobre los cambios familiares"
                className="mt-2"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="antecedentesFamiliares">
            Antecedentes familiares relevantes:
          </Label>
          <Textarea
            id="antecedentesFamiliares"
            value={formData.antecedentesFamiliares}
            onChange={(e) =>
              updateFormData("antecedentesFamiliares", e.target.value)
            }
            placeholder="Mencione cualquier condición médica, desarrollo o mental significativa en la familia"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="detallesAntecedentes">
            Detalles de antecedentes:
          </Label>
          <Textarea
            id="detallesAntecedentes"
            value={formData.detallesAntecedentes}
            onChange={(e) =>
              updateFormData("detallesAntecedentes", e.target.value)
            }
            placeholder="Proporcione más detalles sobre los antecedentes familiares"
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStepIcon()}
              <div>
                <h2 className="text-xl font-bold">
                  {existingData ? "Editar" : "Crear"} Formulario Médico
                </h2>
                {patientName && (
                  <p className="text-sm text-gray-600">
                    Paciente: {patientName}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline">
              Paso {currentStep} de {totalSteps}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full">
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="w-full"
            />
            <p className="text-center text-sm text-gray-600 mt-2">
              {getStepTitle()}
            </p>
          </div>

          {/* Form Content */}
          <Card>
            <CardContent className="p-6">{renderStep()}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>

              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>

            <Button onClick={nextStep} disabled={currentStep === totalSteps}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
