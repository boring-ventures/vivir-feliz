"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useTherapeuticPlans } from "@/hooks/use-therapeutic-plans";
import { useCurrentUser } from "@/hooks/use-current-user";
import { FileText, Plus, Trash2 } from "lucide-react";

interface TherapeuticPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientData: {
    user: {
      name: string;
    };
    dateOfBirth?: string;
    school?: string;
    treatmentProposals?: Array<{
      id: string;
      diagnosis?: string;
      totalSessions: number;
      status: string;
      recommendations?: string;
      frequency: string;
      createdAt: string;
      consultationRequest?: {
        schoolName?: string;
        schoolLevel?: string;
      };
    }>;
    appointments?: Array<{
      id: string;
      date: string;
      startTime: string;
      endTime: string;
      status: string;
      sessionNote?: {
        id: string;
        sessionComment: string;
        parentMessage?: string | null;
        createdAt: string;
      } | null;
      objectiveProgress?: Array<{
        id: string;
        percentage: number;
        comment?: string;
        createdAt: string;
        objective: {
          id: string;
          name: string;
          type?: string;
        };
      }>;
    }>;
  };
  existingReportData?: {
    id: string;
    patientId: string;
    therapistId: string;
    patientName: string;
    patientDateOfBirth: string;
    patientAge: string;
    school?: string | null;
    grade?: string | null;
    objectivesDate?: string | null;
    planning?: string | null;
    treatmentArea: string;
    frequency?: string | null;
    therapyStartDate?: string | null;
    background?: string | null;
    diagnoses?: unknown;
    generalObjective?: string | null;
    specificObjectives?: unknown;
    indicators?: unknown;
    methodologies?: unknown;
    observations?: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface FormData {
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school: string;
  grade: string;
  objectivesDate: string;
  planning: string;
  treatmentArea: string;
  frequency: string;
  therapyStartDate: string;
  background: string;
  diagnoses: string[];
  generalObjective: string;
  specificObjectives: string[];
  indicators: Array<{ indicator: string; status: string }>;
  methodologies: string[];
  observations: string;
}

export function TherapeuticPlanModal({
  isOpen,
  onClose,
  patientId,
  patientData,
  existingReportData,
}: TherapeuticPlanModalProps) {
  const { profile } = useCurrentUser();
  const {
    createTherapeuticPlan,
    updateTherapeuticPlan,
    isCreating,
    isUpdating,
    existingPlan,
    isLoading,
  } = useTherapeuticPlans(patientId);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    patientName: "",
    patientDateOfBirth: "",
    patientAge: "",
    school: "",
    grade: "",
    objectivesDate: "",
    planning: "",
    treatmentArea: "",
    frequency: "",
    therapyStartDate: "",
    background: "",
    diagnoses: [],
    generalObjective: "",
    specificObjectives: [],
    indicators: [],
    methodologies: [],
    observations: "",
  });

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age.toString();
  };

  const findFirstTherapyAppointment = useCallback(() => {
    if (!patientData.appointments) return null;

    // Find the first therapy appointment (TERAPIA type)
    const therapyAppointments = patientData.appointments
      .filter((apt) => apt.status === "COMPLETED" || apt.status === "SCHEDULED")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return therapyAppointments.length > 0 ? therapyAppointments[0] : null;
  }, [patientData.appointments]);

  const findConsultationAppointment = useCallback(() => {
    if (!patientData.appointments) return null;

    // Find the first consultation appointment (CONSULTA type)
    const consultationAppointments = patientData.appointments
      .filter((apt) => apt.status === "COMPLETED" || apt.status === "SCHEDULED")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return consultationAppointments.length > 0
      ? consultationAppointments[0]
      : null;
  }, [patientData.appointments]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && patientData) {
      // If there's existing report data provided (for coordinator viewing), load it
      if (existingReportData) {
        setFormData({
          patientName: existingReportData.patientName,
          patientDateOfBirth:
            existingReportData.patientDateOfBirth.split("T")[0],
          patientAge: existingReportData.patientAge,
          school: existingReportData.school || "",
          grade: existingReportData.grade || "",
          objectivesDate: existingReportData.objectivesDate
            ? existingReportData.objectivesDate.split("T")[0]
            : "",
          planning: existingReportData.planning || "",
          treatmentArea: existingReportData.treatmentArea,
          frequency: existingReportData.frequency || "",
          therapyStartDate: existingReportData.therapyStartDate
            ? existingReportData.therapyStartDate.split("T")[0]
            : "",
          background: existingReportData.background || "",
          diagnoses: Array.isArray(existingReportData.diagnoses)
            ? existingReportData.diagnoses
            : [],
          generalObjective: existingReportData.generalObjective || "",
          specificObjectives: Array.isArray(
            existingReportData.specificObjectives
          )
            ? existingReportData.specificObjectives
            : [],
          indicators: Array.isArray(existingReportData.indicators)
            ? existingReportData.indicators
            : [],
          methodologies: Array.isArray(existingReportData.methodologies)
            ? existingReportData.methodologies
            : [],
          observations: existingReportData.observations || "",
        });
      }
      // If there's an existing plan from the hook (for therapist editing), load it
      else if (existingPlan) {
        setFormData({
          patientName: existingPlan.patientName,
          patientDateOfBirth: existingPlan.patientDateOfBirth.split("T")[0],
          patientAge: existingPlan.patientAge,
          school: existingPlan.school || "",
          grade: existingPlan.grade || "",
          objectivesDate: existingPlan.objectivesDate
            ? existingPlan.objectivesDate.split("T")[0]
            : "",
          planning: existingPlan.planning || "",
          treatmentArea: existingPlan.treatmentArea,
          frequency: existingPlan.frequency || "",
          therapyStartDate: existingPlan.therapyStartDate
            ? existingPlan.therapyStartDate.split("T")[0]
            : "",
          background: existingPlan.background || "",
          diagnoses: Array.isArray(existingPlan.diagnoses)
            ? existingPlan.diagnoses
            : [],
          generalObjective: existingPlan.generalObjective || "",
          specificObjectives: Array.isArray(existingPlan.specificObjectives)
            ? existingPlan.specificObjectives
            : [],
          indicators: Array.isArray(existingPlan.indicators)
            ? existingPlan.indicators
            : [],
          methodologies: Array.isArray(existingPlan.methodologies)
            ? existingPlan.methodologies
            : [],
          observations: existingPlan.observations || "",
        });
      } else {
        // Pre-populate with patient data
        const age = patientData.dateOfBirth
          ? calculateAge(patientData.dateOfBirth)
          : "";
        const firstTherapyAppointment = findFirstTherapyAppointment();
        const consultationAppointment = findConsultationAppointment();

        // Format consultation date for display
        const consultationDate = consultationAppointment
          ? new Date(consultationAppointment.date).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "fecha de consulta";

        // Pre-populate background text
        const backgroundText = `${patientData.user.name} vino al Centro en fecha ${consultationDate}, donde se tuvo como resultado...`;

        setFormData({
          patientName: patientData.user.name,
          patientDateOfBirth: patientData.dateOfBirth
            ? patientData.dateOfBirth.split("T")[0]
            : "", // Format as YYYY-MM-DD
          patientAge: age,
          school: patientData.school || "",
          grade: "", // We'll need to get this from consultation request separately
          objectivesDate: "",
          planning: "",
          treatmentArea: profile?.specialty || "",
          frequency: "", // We'll need to get this from proposal services separately
          therapyStartDate: firstTherapyAppointment
            ? firstTherapyAppointment.date.split("T")[0]
            : "",
          background: backgroundText,
          diagnoses: [],
          generalObjective: "",
          specificObjectives: [],
          indicators: [],
          methodologies: [],
          observations: "",
        });
      }
    }
  }, [
    isOpen,
    patientData,
    profile,
    existingPlan,
    existingReportData,
    findFirstTherapyAppointment,
    findConsultationAppointment,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) {
      toast({
        title: "Error",
        description: "No se pudo identificar al terapeuta",
        variant: "destructive",
      });
      return;
    }

    try {
      if (existingReportData) {
        // Update existing report (for coordinator editing)
        await updateTherapeuticPlan({
          id: existingReportData.id,
          patientId,
          therapistId: existingReportData.therapistId, // Keep original therapist ID
          ...formData,
        });

        toast({
          title: "Plan terapéutico actualizado exitosamente",
          description: "El plan terapéutico se ha actualizado correctamente",
        });
      } else if (existingPlan) {
        // Update existing plan (for therapist editing)
        await updateTherapeuticPlan({
          id: existingPlan.id,
          patientId,
          therapistId: profile.id,
          ...formData,
        });

        toast({
          title: "Plan terapéutico actualizado exitosamente",
          description: "El plan terapéutico se ha actualizado correctamente",
        });
      } else {
        // Create new plan
        await createTherapeuticPlan({
          patientId,
          therapistId: profile.id,
          ...formData,
        });

        toast({
          title: "Plan terapéutico creado exitosamente",
          description: "El plan terapéutico se ha guardado correctamente",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title:
          existingPlan || existingReportData
            ? "Error al actualizar el plan terapéutico"
            : "Error al crear el plan terapéutico",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addDiagnosis = () => {
    setFormData((prev) => ({
      ...prev,
      diagnoses: [...prev.diagnoses, ""],
    }));
  };

  const updateDiagnosis = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeDiagnosis = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.filter((_, i) => i !== index),
    }));
  };

  const addSpecificObjective = () => {
    setFormData((prev) => ({
      ...prev,
      specificObjectives: [...prev.specificObjectives, ""],
    }));
  };

  const updateSpecificObjective = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specificObjectives: prev.specificObjectives.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const removeSpecificObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specificObjectives: prev.specificObjectives.filter((_, i) => i !== index),
    }));
  };

  const addIndicator = () => {
    setFormData((prev) => ({
      ...prev,
      indicators: [
        ...prev.indicators,
        { indicator: "", status: "not_achieved" },
      ],
    }));
  };

  const updateIndicator = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      indicators: prev.indicators.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeIndicator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      indicators: prev.indicators.filter((_, i) => i !== index),
    }));
  };

  const addMethodology = () => {
    setFormData((prev) => ({
      ...prev,
      methodologies: [...prev.methodologies, ""],
    }));
  };

  const updateMethodology = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      methodologies: prev.methodologies.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const removeMethodology = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      methodologies: prev.methodologies.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Plan Terapéutico</span>
          </DialogTitle>
          <DialogDescription>
            Complete la información del plan terapéutico para el paciente
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando plan terapéutico...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos generales section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Datos Generales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Nombre del Paciente</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) =>
                      handleInputChange("patientName", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="patientDateOfBirth">
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    id="patientDateOfBirth"
                    type="date"
                    value={formData.patientDateOfBirth}
                    onChange={(e) =>
                      handleInputChange("patientDateOfBirth", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="patientAge">Edad</Label>
                  <Input
                    id="patientAge"
                    value={formData.patientAge}
                    onChange={(e) =>
                      handleInputChange("patientAge", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="school">Escuela</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) =>
                      handleInputChange("school", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="grade">Grado</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => handleInputChange("grade", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="objectivesDate">Fecha de Objetivos</Label>
                  <Input
                    id="objectivesDate"
                    type="date"
                    value={formData.objectivesDate}
                    onChange={(e) =>
                      handleInputChange("objectivesDate", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="planning">Planificación</Label>
                  <Input
                    id="planning"
                    value={formData.planning}
                    onChange={(e) =>
                      handleInputChange("planning", e.target.value)
                    }
                    placeholder="Ingrese la planificación..."
                  />
                </div>

                <div>
                  <Label htmlFor="treatmentArea">Área en Tratamiento</Label>
                  <Input
                    id="treatmentArea"
                    value={formData.treatmentArea}
                    onChange={(e) =>
                      handleInputChange("treatmentArea", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">Frecuencia</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) =>
                      handleInputChange("frequency", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="therapyStartDate">
                    Fecha de Inicio de Terapias
                  </Label>
                  <Input
                    id="therapyStartDate"
                    type="date"
                    value={formData.therapyStartDate}
                    onChange={(e) =>
                      handleInputChange("therapyStartDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Background section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Antecedentes
              </h3>
              <div>
                <Label htmlFor="background">Antecedentes</Label>
                <Textarea
                  id="background"
                  value={formData.background}
                  onChange={(e) =>
                    handleInputChange("background", e.target.value)
                  }
                  rows={4}
                />
              </div>
            </div>

            {/* Diagnosis/Initial Difficulties section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Diagnóstico/Dificultades Iniciales
              </h3>
              <div className="space-y-3">
                {formData.diagnoses.map((diagnosis, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={diagnosis}
                      onChange={(e) => updateDiagnosis(index, e.target.value)}
                      placeholder="Ingrese el diagnóstico o dificultad..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDiagnosis(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDiagnosis}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Diagnóstico
                </Button>
              </div>
            </div>

            {/* Objectives section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Objetivos</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="generalObjective">Objetivo General</Label>
                  <Textarea
                    id="generalObjective"
                    value={formData.generalObjective}
                    onChange={(e) =>
                      handleInputChange("generalObjective", e.target.value)
                    }
                    placeholder="Ingrese el objetivo general..."
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Objetivos Específicos</Label>
                  {formData.specificObjectives.map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={objective}
                        onChange={(e) =>
                          updateSpecificObjective(index, e.target.value)
                        }
                        placeholder="Ingrese un objetivo específico..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecificObjective(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSpecificObjective}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Objetivo Específico
                  </Button>
                </div>
              </div>
            </div>

            {/* Indicators section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Indicadores
              </h3>
              <div className="space-y-3">
                {formData.indicators.map((indicator, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={indicator.indicator}
                        onChange={(e) =>
                          updateIndicator(index, "indicator", e.target.value)
                        }
                        placeholder="Indicador"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIndicator(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`not_achieved_${index}`}
                          name={`status_${index}`}
                          value="not_achieved"
                          checked={indicator.status === "not_achieved"}
                          onChange={(e) =>
                            updateIndicator(index, "status", e.target.value)
                          }
                        />
                        <Label htmlFor={`not_achieved_${index}`}>
                          No logra
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`with_help_${index}`}
                          name={`status_${index}`}
                          value="with_help"
                          checked={indicator.status === "with_help"}
                          onChange={(e) =>
                            updateIndicator(index, "status", e.target.value)
                          }
                        />
                        <Label htmlFor={`with_help_${index}`}>Con ayuda</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`in_progress_${index}`}
                          name={`status_${index}`}
                          value="in_progress"
                          checked={indicator.status === "in_progress"}
                          onChange={(e) =>
                            updateIndicator(index, "status", e.target.value)
                          }
                        />
                        <Label htmlFor={`in_progress_${index}`}>
                          En progreso
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`achieved_${index}`}
                          name={`status_${index}`}
                          value="achieved"
                          checked={indicator.status === "achieved"}
                          onChange={(e) =>
                            updateIndicator(index, "status", e.target.value)
                          }
                        />
                        <Label htmlFor={`achieved_${index}`}>Logrado</Label>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIndicator}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Indicador
                </Button>
              </div>
            </div>

            {/* Methodologies/Strategies section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Metodologías/Estrategias
              </h3>
              <div className="space-y-3">
                {formData.methodologies.map((methodology, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={methodology}
                      onChange={(e) => updateMethodology(index, e.target.value)}
                      placeholder="Ingrese una metodología o estrategia..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMethodology(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMethodology}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Metodología
                </Button>
              </div>
            </div>

            {/* Observations section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Observaciones
              </h3>
              <div>
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) =>
                    handleInputChange("observations", e.target.value)
                  }
                  placeholder="Ingrese observaciones adicionales..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCreating || isUpdating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating || isUpdating
                  ? "Guardando..."
                  : "Guardar Plan Terapéutico"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
