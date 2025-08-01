"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Target, FileText, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useTherapeuticPlans } from "@/hooks/use-therapeutic-plans";
import { useProgressReports } from "@/hooks/use-progress-reports";

interface TherapistReportContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientData: {
    user: { name: string };
    dateOfBirth?: string;
    school?: string;
  };
}

interface Objective {
  id: string;
  name: string;
  description?: string;
}

interface Indicator {
  id: string;
  name: string;
  description: string;
  currentLevel: "INITIAL" | "DEVELOPING" | "ACHIEVED" | "CONSOLIDATED";
  previousLevel?: "INITIAL" | "DEVELOPING" | "ACHIEVED" | "CONSOLIDATED";
}

interface IndicatorData {
  indicator: string;
  status: string;
}

export function TherapistReportContributionModal({
  isOpen,
  onClose,
  patientId,
  patientData,
}: TherapistReportContributionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [background, setBackground] = useState("");
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [indicatorsComment, setIndicatorsComment] = useState("");
  const [conclusions, setConclusions] = useState("");
  const [progressEntries, setProgressEntries] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Fetch therapeutic plans and progress reports
  const { existingPlan } = useTherapeuticPlans(patientId);
  const { latestProgressReport } = useProgressReports(patientId);

  // Get existing therapeutic plan and progress report
  const existingTherapeuticPlan = existingPlan;
  const existingProgressReport = latestProgressReport;

  // Map database status values to display values (same as progress-report-modal)
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

  // Map display status to our internal level system
  const mapStatusToLevel = (
    status: string
  ): "INITIAL" | "DEVELOPING" | "ACHIEVED" | "CONSOLIDATED" => {
    switch (status) {
      case "No logra":
        return "INITIAL";
      case "Con ayuda":
        return "DEVELOPING";
      case "En progreso":
        return "ACHIEVED";
      case "Logrado":
        return "CONSOLIDATED";
      default:
        return "INITIAL";
    }
  };

  const mapLevelToStatus = (level: string): string => {
    switch (level) {
      case "INITIAL":
        return "No logra";
      case "DEVELOPING":
        return "Con ayuda";
      case "ACHIEVED":
        return "En progreso";
      case "CONSOLIDATED":
        return "Logrado";
      default:
        return "No logra";
    }
  };

  // Preload data when modal opens
  useEffect(() => {
    if (isOpen && existingTherapeuticPlan) {
      // Load general objective from therapeutic plan
      if (existingTherapeuticPlan.generalObjective) {
        const loadedObjectives: Objective[] = [
          {
            id: `obj-${Date.now()}`,
            name: existingTherapeuticPlan.generalObjective,
            description: "",
          },
        ];
        setObjectives(loadedObjectives);
      }

      // Load background from therapeutic plan
      if (existingTherapeuticPlan.background) {
        setBackground(existingTherapeuticPlan.background);
      }
    }
  }, [isOpen, existingTherapeuticPlan]);

  // Preload indicators with initial status from therapeutic plan and current from progress report
  useEffect(() => {
    if (isOpen) {
      let indicatorsToLoad: Indicator[] = [];

      // Get initial indicators from therapeutic plan
      const therapeuticPlanIndicators =
        existingTherapeuticPlan?.indicators &&
        Array.isArray(existingTherapeuticPlan.indicators)
          ? existingTherapeuticPlan.indicators
          : [];

      // Get current indicators from progress report
      const progressReportIndicators =
        existingProgressReport?.indicators &&
        Array.isArray(existingProgressReport.indicators)
          ? existingProgressReport.indicators
          : [];

      // Combine both sources, using therapeutic plan as base and progress report for current status
      const allIndicators = [
        ...therapeuticPlanIndicators,
        ...progressReportIndicators,
      ];
      const uniqueIndicators = allIndicators.filter(
        (ind, index, self) =>
          index === self.findIndex((i) => i.indicator === ind.indicator)
      );

      indicatorsToLoad = uniqueIndicators.map(
        (ind: IndicatorData, index: number) => {
          // Find initial status from therapeutic plan
          const initialStatus = therapeuticPlanIndicators.find(
            (tp) => tp.indicator === ind.indicator
          )?.status;

          // Find current status from progress report
          const currentStatus = progressReportIndicators.find(
            (pr) => pr.indicator === ind.indicator
          )?.status;

          return {
            id: `ind-${index}`,
            name: ind.indicator || "",
            description: "",
            currentLevel: mapStatusToLevel(
              mapStatusToDisplay(
                currentStatus || initialStatus || "not_achieved"
              )
            ),
            previousLevel: initialStatus
              ? mapStatusToLevel(mapStatusToDisplay(initialStatus))
              : undefined,
          };
        }
      );

      setIndicators(indicatorsToLoad);
    }
  }, [isOpen, existingProgressReport, existingTherapeuticPlan]);

  // Preload progress entries and recommendations from progress report
  useEffect(() => {
    if (isOpen && existingProgressReport) {
      // Load progress entries
      if (
        existingProgressReport.progressEntries &&
        Array.isArray(existingProgressReport.progressEntries)
      ) {
        setProgressEntries(existingProgressReport.progressEntries);
      }

      // Load recommendations
      if (
        existingProgressReport.recommendations &&
        Array.isArray(existingProgressReport.recommendations)
      ) {
        setRecommendations(existingProgressReport.recommendations);
      }
    }
  }, [isOpen, existingProgressReport]);

  const handleUpdateObjective = (
    id: string,
    field: keyof Objective,
    value: string
  ) => {
    setObjectives(
      objectives.map((obj) =>
        obj.id === id ? { ...obj, [field]: value } : obj
      )
    );
  };

  const handleUpdateIndicator = (
    id: string,
    field: keyof Indicator,
    value: string | "INITIAL" | "DEVELOPING" | "ACHIEVED" | "CONSOLIDATED"
  ) => {
    setIndicators(
      indicators.map((ind) =>
        ind.id === id ? { ...ind, [field]: value } : ind
      )
    );
  };

  const handleSubmit = async () => {
    if (
      !objectives.length &&
      !background &&
      !indicators.length &&
      !conclusions &&
      !progressEntries.length &&
      !recommendations.length
    ) {
      toast({
        title: "Error",
        description: "Por favor completa al menos una sección del informe",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/therapist/report-contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          objectives: objectives.length > 0 ? objectives : null,
          background: background || null,
          indicators: indicators.length > 0 ? indicators : null,
          indicatorsComment: indicatorsComment || null,
          conclusions: conclusions || null,
          progressEntries: progressEntries.length > 0 ? progressEntries : null,
          recommendations: recommendations.length > 0 ? recommendations : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "¡Contribución enviada exitosamente!",
          description: "Tu contribución al informe final ha sido guardada",
        });
        handleClose();
      } else {
        const error = await response.json();
        toast({
          title: "Error al enviar la contribución",
          description: error.message || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting contribution:", error);
      toast({
        title: "Error al enviar la contribución",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setObjectives([]);
    setBackground("");
    setIndicators([]);
    setIndicatorsComment("");
    setConclusions("");
    setProgressEntries([]);
    setRecommendations([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Contribución al Informe Final</span>
          </DialogTitle>
          <DialogDescription>
            Contribuye con tu especialidad al informe final del paciente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Información del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Nombre
                  </Label>
                  <p className="text-sm">{patientData?.user?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Fecha de Nacimiento
                  </Label>
                  <p className="text-sm">
                    {patientData?.dateOfBirth
                      ? new Date(patientData.dateOfBirth).toLocaleDateString(
                          "es-ES"
                        )
                      : "No especificada"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objectives Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Objetivos de mi Especialidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {objectives.map((objective) => (
                <div
                  key={objective.id}
                  className="space-y-3 p-4 border rounded-lg"
                >
                  <div>
                    <Label className="text-sm font-medium">
                      Objetivo General
                    </Label>
                  </div>
                  <Textarea
                    placeholder="Objetivo general de la especialidad"
                    value={objective.name}
                    onChange={(e) =>
                      handleUpdateObjective(
                        objective.id,
                        "name",
                        e.target.value
                      )
                    }
                    rows={3}
                    disabled
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Background Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Antecedentes de mi Especialidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe los antecedentes relevantes desde tu especialidad..."
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Indicators Section - Exactly like Progress Report Modal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Indicadores de Progreso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Indicadores de Progreso</Label>
              </div>

              {indicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className="space-y-2 p-4 border rounded-lg"
                >
                  <div className="flex gap-2">
                    <Input
                      value={indicator.name}
                      onChange={(e) =>
                        handleUpdateIndicator(
                          indicator.id,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Descripción del indicador..."
                      className="flex-1"
                      disabled
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Estado de Progreso</Label>
                    <div className="flex gap-2">
                      {["No logra", "Con ayuda", "En progreso", "Logrado"].map(
                        (status) => {
                          const isSelected =
                            mapLevelToStatus(indicator.currentLevel) === status;
                          const isPrevious =
                            indicator.previousLevel &&
                            mapLevelToStatus(indicator.previousLevel) ===
                              status &&
                            !isSelected;

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
                                handleUpdateIndicator(
                                  indicator.id,
                                  "currentLevel",
                                  mapStatusToLevel(status)
                                )
                              }
                              className={`p-3 rounded-lg border-2 transition-all flex-1 ${getStatusColor(status)}`}
                            >
                              <div className="text-sm font-medium">
                                {status}
                              </div>

                              {isPrevious && (
                                <div className="text-xs mt-1 text-gray-500">
                                  (estado inicial)
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

              {/* Indicators Comment */}
              <div className="mt-4">
                <Label className="text-sm font-medium">
                  Comentarios sobre los Indicadores
                </Label>
                <Textarea
                  placeholder="Agrega comentarios generales sobre los indicadores evaluados..."
                  value={indicatorsComment}
                  onChange={(e) => setIndicatorsComment(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Conclusions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Conclusiones y Recomendaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Escribe las conclusiones y recomendaciones desde tu especialidad..."
                value={conclusions}
                onChange={(e) => setConclusions(e.target.value)}
                rows={6}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Contribución"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
