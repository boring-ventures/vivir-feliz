import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import { useProgressReports } from "@/hooks/use-progress-reports";
import { useTherapeuticPlans } from "@/hooks/use-therapeutic-plans";
import { toast } from "@/components/ui/use-toast";

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientData: {
    user: { name: string };
    dateOfBirth?: string;
    school?: string;
    appointments: {
      id: string;
      date: string;
      startTime: string;
      endTime: string;
      status: string;
      sessionNote?: {
        id: string;
        sessionComment: string;
        parentMessage?: string;
        createdAt: string;
      };
      objectiveProgress?: Array<{
        id: string;
        percentage: number;
        comment?: string;
        createdAt: string;
      }>;
    }[];
    treatmentProposals?: {
      id: string;
      diagnosis?: string;
      totalSessions: number;
      status: string;
      recommendations?: string;
      createdAt: string;
      consultationRequest?: {
        schoolName?: string;
        schoolLevel?: string;
      };
      frequency?: string;
    }[];
  };
}

interface FormData {
  patientName: string;
  patientDateOfBirth: string;
  patientAge: string;
  school: string;
  grade: string;
  reportDate: string;
  treatmentArea: string;
  diagnoses: string[];
  generalObjective: string;
  specificObjectives: string[];
  indicators: Array<{
    indicator: string;
    status: string;
    previousStatus?: string;
  }>;
  progressEntries: string[];
  recommendations: string[];
}

export function ProgressReportModal({
  isOpen,
  onClose,
  patientId,
  patientData,
}: ProgressReportModalProps) {
  const {
    progressReports,
    latestProgressReport,
    isLoading,
    createProgressReport,
    updateProgressReport,
    isCreating,
    isUpdating,
  } = useProgressReports(patientId);
  const { therapeuticPlans, existingPlan } = useTherapeuticPlans(patientId);

  const [formData, setFormData] = useState<FormData>({
    patientName: "",
    patientDateOfBirth: "",
    patientAge: "",
    school: "",
    grade: "",
    reportDate: new Date().toISOString().split("T")[0],
    treatmentArea: "",
    diagnoses: [],
    generalObjective: "",
    specificObjectives: [],
    indicators: [],
    progressEntries: [],
    recommendations: [],
  });

  // Pre-populate form with patient data and load existing therapeutic plan
  useEffect(() => {
    if (patientData && !isLoading) {
      const calculateAge = (dateOfBirth: string) => {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          return (age - 1).toString();
        }
        return age.toString();
      };

      // Get therapist's specialty from the first treatment proposal
      const therapistSpecialty =
        patientData.treatmentProposals?.[0]?.consultationRequest?.schoolName ||
        "No especificado";

      // Get school and grade from existing therapeutic plan or treatment proposal
      const school =
        existingPlan?.school ||
        patientData.treatmentProposals?.[0]?.consultationRequest?.schoolName ||
        "";
      const grade =
        existingPlan?.grade ||
        patientData.treatmentProposals?.[0]?.consultationRequest?.schoolLevel ||
        "";

      // If there's an existing progress report, load it
      if (latestProgressReport) {
        // Format dates for HTML date inputs
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        setFormData({
          patientName: latestProgressReport.patientName,
          patientDateOfBirth: formatDateForInput(
            latestProgressReport.patientDateOfBirth
          ),
          patientAge: latestProgressReport.patientAge,
          school: latestProgressReport.school || "",
          grade: latestProgressReport.grade || "",
          reportDate: formatDateForInput(latestProgressReport.reportDate),
          treatmentArea: latestProgressReport.treatmentArea,
          diagnoses: latestProgressReport.diagnoses || [],
          generalObjective: latestProgressReport.generalObjective || "",
          specificObjectives: latestProgressReport.specificObjectives || [],
          indicators: mapIndicatorsFromDB(latestProgressReport.indicators),
          progressEntries: latestProgressReport.progressEntries || [],
          recommendations: latestProgressReport.recommendations || [],
        });
      } else if (existingPlan) {
        // Load data from existing therapeutic plan
        setFormData({
          patientName: patientData.user.name,
          patientDateOfBirth: patientData.dateOfBirth
            ? new Date(patientData.dateOfBirth).toISOString().split("T")[0]
            : "",
          patientAge: patientData.dateOfBirth
            ? calculateAge(patientData.dateOfBirth)
            : "",
          school: school,
          grade: grade,
          reportDate: new Date().toISOString().split("T")[0],
          treatmentArea: existingPlan.treatmentArea,
          diagnoses: existingPlan.diagnoses || [],
          generalObjective: existingPlan.generalObjective || "",
          specificObjectives: existingPlan.specificObjectives || [],
          indicators: mapIndicatorsFromDB(existingPlan.indicators),
          progressEntries: [],
          recommendations: [],
        });
      } else {
        // Default form with patient data
        setFormData({
          patientName: patientData.user.name,
          patientDateOfBirth: patientData.dateOfBirth
            ? new Date(patientData.dateOfBirth).toISOString().split("T")[0]
            : "",
          patientAge: patientData.dateOfBirth
            ? calculateAge(patientData.dateOfBirth)
            : "",
          school: school,
          grade: grade,
          reportDate: new Date().toISOString().split("T")[0],
          treatmentArea: therapistSpecialty,
          diagnoses: [],
          generalObjective: "",
          specificObjectives: [],
          indicators: [],
          progressEntries: [],
          recommendations: [],
        });
      }
    }
  }, [
    patientData,
    existingPlan,
    latestProgressReport,
    progressReports,
    isLoading,
    isOpen,
  ]);

  // Helper function to map database status values to Spanish display values
  const mapStatusToDisplay = (status: string): string => {
    switch (status) {
      case "not_achieved":
        return "No logra";
      case "with_help":
        return "Con ayuda";
      case "in_progress":
        return "En progreso";
      case "achieved":
        return "Logrado";
      default:
        return "No logra";
    }
  };

  // Helper function to map Spanish display values to database status values
  const mapDisplayToStatus = (display: string): string => {
    switch (display) {
      case "No logra":
        return "not_achieved";
      case "Con ayuda":
        return "with_help";
      case "En progreso":
        return "in_progress";
      case "Logrado":
        return "achieved";
      default:
        return "not_achieved";
    }
  };

  // Helper function to map indicators from database format to display format
  const mapIndicatorsFromDB = (
    indicators: any[] | undefined
  ): Array<{ indicator: string; status: string; previousStatus?: string }> => {
    if (!indicators || !Array.isArray(indicators)) return [];

    return indicators.map((indicator: any) => {
      const currentStatus = mapStatusToDisplay(
        indicator.status || "not_achieved"
      );
      return {
        indicator: indicator.indicator || "",
        status: currentStatus,
        // Set previousStatus to the original status from database
        // This preserves the original value as the "previous" status
        previousStatus: currentStatus,
      };
    });
  };

  // Helper functions for managing arrays
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
        { indicator: "", status: "No logra", previousStatus: undefined },
      ],
    }));
  };

  const updateIndicator = (
    index: number,
    field: "indicator" | "status",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      indicators: prev.indicators.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
              // Don't update previousStatus when user changes status
              // previousStatus should only be set when loading from database
            }
          : item
      ),
    }));
  };

  const removeIndicator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      indicators: prev.indicators.filter((_, i) => i !== index),
    }));
  };

  const addProgressEntry = () => {
    setFormData((prev) => ({
      ...prev,
      progressEntries: [...prev.progressEntries, ""],
    }));
  };

  const updateProgressEntry = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      progressEntries: prev.progressEntries.map((entry, i) =>
        i === index ? value : entry
      ),
    }));
  };

  const removeProgressEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      progressEntries: prev.progressEntries.filter((_, i) => i !== index),
    }));
  };

  const addRecommendation = () => {
    setFormData((prev) => ({
      ...prev,
      recommendations: [...prev.recommendations, ""],
    }));
  };

  const updateRecommendation = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      recommendations: prev.recommendations.map((rec, i) =>
        i === index ? value : rec
      ),
    }));
  };

  const removeRecommendation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Map indicators back to database format
      const mappedIndicators = formData.indicators.map((indicator) => ({
        indicator: indicator.indicator,
        status: mapDisplayToStatus(indicator.status),
      }));

      const dataToSubmit = {
        ...formData,
        indicators: mappedIndicators,
      };

      if (latestProgressReport) {
        // Update existing progress report
        updateProgressReport({
          id: latestProgressReport.id,
          patientId,
          ...dataToSubmit,
        });
      } else {
        // Create new progress report
        createProgressReport({
          ...dataToSubmit,
          patientId,
        });
      }

      toast({
        title: "Éxito",
        description: "Informe de avances guardado exitosamente",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar el informe de avances",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Informe de Avances</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando informe de avances...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Informe de Avances</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Datos del Paciente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Datos del Paciente
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Nombre del Paciente</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      patientName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="patientDateOfBirth">Fecha de Nacimiento</Label>
                <Input
                  id="patientDateOfBirth"
                  type="date"
                  value={formData.patientDateOfBirth}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      patientDateOfBirth: e.target.value,
                    }))
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
                    setFormData((prev) => ({
                      ...prev,
                      patientAge: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="school">Colegio</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, school: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="grade">Grado</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, grade: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="reportDate">Fecha del Informe</Label>
                <Input
                  id="reportDate"
                  type="date"
                  value={formData.reportDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reportDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="treatmentArea">Área en Tratamiento</Label>
                <Input
                  id="treatmentArea"
                  value={formData.treatmentArea}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      treatmentArea: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Diagnósticos y Objetivos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Diagnósticos y Objetivos
            </h3>

            {/* Diagnósticos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Diagnósticos/Dificultades Iniciales</Label>
                <span className="text-sm text-gray-500 italic">
                  (Solo lectura)
                </span>
              </div>
              {formData.diagnoses.map((diagnosis, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={diagnosis}
                    disabled
                    placeholder="Descripción del diagnóstico..."
                    className="flex-1 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              ))}
              {formData.diagnoses.length === 0 && (
                <div className="text-gray-500 italic text-sm">
                  No hay diagnósticos registrados
                </div>
              )}
            </div>

            {/* Objetivo General */}
            <div>
              <Label htmlFor="generalObjective">Objetivo General</Label>
              <Textarea
                id="generalObjective"
                value={formData.generalObjective}
                disabled
                placeholder="Objetivo general del tratamiento..."
                rows={3}
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Objetivos Específicos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Objetivos Específicos</Label>
                <span className="text-sm text-gray-500 italic">
                  (Solo lectura)
                </span>
              </div>
              {formData.specificObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={objective}
                    disabled
                    placeholder="Objetivo específico..."
                    className="flex-1 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              ))}
              {formData.specificObjectives.length === 0 && (
                <div className="text-gray-500 italic text-sm">
                  No hay objetivos específicos registrados
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Indicadores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Indicadores</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Indicadores de Progreso</Label>
                <Button
                  type="button"
                  onClick={addIndicator}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Indicador
                </Button>
              </div>
              {formData.indicators.map((indicator, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      value={indicator.indicator}
                      onChange={(e) =>
                        updateIndicator(index, "indicator", e.target.value)
                      }
                      placeholder="Descripción del indicador..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeIndicator(index)}
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Label>Estado de Progreso</Label>
                    <div className="flex gap-2">
                      {["No logra", "Con ayuda", "En progreso", "Logrado"].map(
                        (status) => {
                          const isSelected = indicator.status === status;
                          const isPrevious =
                            indicator.previousStatus === status && !isSelected;
                          const getStatusColor = (status: string) => {
                            switch (status) {
                              case "No logra":
                                return isSelected
                                  ? "border-red-500 bg-red-50 text-red-700"
                                  : isPrevious
                                    ? "border-red-300 bg-red-25 text-red-500"
                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                              case "Con ayuda":
                                return isSelected
                                  ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                                  : isPrevious
                                    ? "border-yellow-300 bg-yellow-25 text-yellow-500"
                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                              case "En progreso":
                                return isSelected
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : isPrevious
                                    ? "border-blue-300 bg-blue-25 text-blue-500"
                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                              case "Logrado":
                                return isSelected
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : isPrevious
                                    ? "border-green-300 bg-green-25 text-green-500"
                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                              default:
                                return "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300";
                            }
                          };

                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                updateIndicator(index, "status", status)
                              }
                              className={`p-3 rounded-lg border-2 transition-all flex-1 ${getStatusColor(status)}`}
                            >
                              <div className="text-sm font-medium">
                                {status}
                              </div>

                              {isPrevious && (
                                <div className="text-xs mt-1 text-gray-500">
                                  Registro previo
                                </div>
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Avances del Tratamiento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Avances del Tratamiento
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Entradas de Progreso</Label>
                <Button
                  type="button"
                  onClick={addProgressEntry}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Entrada
                </Button>
              </div>
              {formData.progressEntries.map((entry, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={entry}
                    onChange={(e) => updateProgressEntry(index, e.target.value)}
                    placeholder="Describe el progreso realizado..."
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeProgressEntry(index)}
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Recomendaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recomendaciones
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Recomendaciones</Label>
                <Button
                  type="button"
                  onClick={addRecommendation}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Recomendación
                </Button>
              </div>
              {formData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={recommendation}
                    onChange={(e) =>
                      updateRecommendation(index, e.target.value)
                    }
                    placeholder="Descripción de la recomendación..."
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeRecommendation(index)}
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
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
                : "Guardar Informe de Avances"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
