"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  useDevelopmentEvaluation,
  useSaveDevelopmentEvaluation,
  type DevelopmentEvaluationData,
  type EvaluationLevel,
  EVALUATION_LEVELS,
  DEVELOPMENT_AREAS,
} from "@/hooks/use-development-evaluation";

interface DevelopmentEvaluationFormProps {
  appointmentId: string;
}

export default function DevelopmentEvaluationForm({
  appointmentId,
}: DevelopmentEvaluationFormProps) {
  const { data: existingEvaluation, isLoading } =
    useDevelopmentEvaluation(appointmentId);
  const saveDevelopmentEvaluation = useSaveDevelopmentEvaluation();

  const [formData, setFormData] = useState<Partial<DevelopmentEvaluationData>>({
    communicationAndLanguage: null,
    grossMotorSkills: null,
    fineMotorSkills: null,
    attentionAndLearning: null,
    socialRelations: null,
    autonomyAndAdaptation: null,
    strengths: "",
    areasToSupport: "",
    homeRecommendations: "",
    schoolRecommendations: "",
  });

  const [saving, setSaving] = useState(false);

  // Load existing evaluation data if available
  useEffect(() => {
    if (existingEvaluation && !isLoading) {
      setFormData(existingEvaluation);
    }
  }, [existingEvaluation, isLoading]);

  const handleEvaluationChange = (area: string, level: EvaluationLevel) => {
    setFormData((prev) => ({
      ...prev,
      [area]: level,
    }));
  };

  const handleTextChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDevelopmentEvaluation.mutateAsync({
        ...formData,
        appointmentId,
      });

      toast({
        title: "Evaluación guardada",
        description:
          "La evaluación de desarrollo ha sido guardada exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la evaluación",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getEvaluationColor = (level: EvaluationLevel) => {
    switch (level) {
      case "NEEDS_SUPPORT":
        return "bg-red-100 text-red-800 border-red-200";
      case "IN_DEVELOPMENT":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "DEVELOPING_WELL":
        return "bg-green-100 text-green-800 border-green-200";
      case "WITH_OUTSTANDING_SKILLS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-medium">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
          Evaluación de Desarrollo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Development Areas Evaluation Table */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-4">
            Áreas de Desarrollo
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                    Área de desarrollo
                  </th>
                  {EVALUATION_LEVELS.map((level) => (
                    <th
                      key={level.value}
                      className="border border-gray-300 px-3 py-3 text-center font-semibold text-gray-700 min-w-[120px]"
                    >
                      {level.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEVELOPMENT_AREAS.map((area) => (
                  <tr key={area.key} className="hover:bg-gray-25">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">
                      {area.label}
                    </td>
                    {EVALUATION_LEVELS.map((level) => (
                      <td
                        key={level.value}
                        className="border border-gray-300 px-3 py-3 text-center"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleEvaluationChange(area.key, level.value)
                          }
                          className={`w-6 h-6 rounded-full border-2 transition-colors ${
                            formData[area.key as keyof typeof formData] ===
                            level.value
                              ? "bg-purple-600 border-purple-600"
                              : "border-gray-300 hover:border-purple-400"
                          }`}
                        >
                          {formData[area.key as keyof typeof formData] ===
                            level.value && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto"></div>
                          )}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Evaluations Summary */}
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">
              Evaluaciones Seleccionadas:
            </h4>
            <div className="flex flex-wrap gap-2">
              {DEVELOPMENT_AREAS.map((area) => {
                const selectedLevel = formData[
                  area.key as keyof typeof formData
                ] as EvaluationLevel;
                if (!selectedLevel) return null;

                const levelText = EVALUATION_LEVELS.find(
                  (l) => l.value === selectedLevel
                )?.label;

                return (
                  <Badge
                    key={area.key}
                    variant="secondary"
                    className={getEvaluationColor(selectedLevel)}
                  >
                    {area.label}: {levelText}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fortalezas Section */}
        <div>
          <Label className="text-md font-semibold text-gray-700 mb-3 block">
            Fortalezas
          </Label>
          <Textarea
            value={formData.strengths || ""}
            onChange={(e) => handleTextChange("strengths", e.target.value)}
            placeholder="Describe las fortalezas principales observadas en el niño/a..."
            rows={4}
            className="border-gray-200"
          />
        </div>

        {/* Areas para Apoyar y Mejorar Section */}
        <div>
          <Label className="text-md font-semibold text-gray-700 mb-3 block">
            Áreas para Apoyar y Mejorar
          </Label>
          <Textarea
            value={formData.areasToSupport || ""}
            onChange={(e) => handleTextChange("areasToSupport", e.target.value)}
            placeholder="Identifica las áreas que requieren apoyo adicional y mejora..."
            rows={4}
            className="border-gray-200"
          />
        </div>

        {/* Recomendaciones Clave Section */}
        <div>
          <Label className="text-md font-semibold text-gray-700 mb-4 block">
            Recomendaciones Clave
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* En Casa */}
            <div>
              <Label className="text-sm font-medium text-gray-600 mb-2 block">
                En Casa
              </Label>
              <Textarea
                value={formData.homeRecommendations || ""}
                onChange={(e) =>
                  handleTextChange("homeRecommendations", e.target.value)
                }
                placeholder="Recomendaciones específicas para implementar en el hogar..."
                rows={5}
                className="border-gray-200"
              />
            </div>

            {/* En el Colegio */}
            <div>
              <Label className="text-sm font-medium text-gray-600 mb-2 block">
                En el Colegio
              </Label>
              <Textarea
                value={formData.schoolRecommendations || ""}
                onChange={(e) =>
                  handleTextChange("schoolRecommendations", e.target.value)
                }
                placeholder="Recomendaciones específicas para implementar en el entorno escolar..."
                rows={5}
                className="border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Evaluación de Desarrollo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
