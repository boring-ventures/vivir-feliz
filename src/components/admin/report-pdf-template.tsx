"use client";

import {
  FinalReport,
  ProgressReport,
  TherapeuticPlan,
  TherapistReportContribution,
  TherapistData,
  Indicator,
} from "@/types/reports";
import { format } from "date-fns";

interface ReportPDFTemplateProps {
  report:
    | FinalReport
    | ProgressReport
    | TherapeuticPlan
    | TherapistReportContribution;
  type: string;
}

// Helper function to translate specialties to Spanish
const translateSpecialty = (specialty: string): string => {
  const translations: { [key: string]: string } = {
    SPEECH_THERAPIST: "Fonoaudiología",
    OCCUPATIONAL_THERAPIST: "Terapia Ocupacional",
    PSYCHOPEDAGOGUE: "Psicopedagogía",
    ASD_THERAPIST: "Terapeuta TEA",
    NEUROPSYCHOLOGIST: "Neuropsicología",
    COORDINATOR: "Coordinación",
    PSYCHOMOTRICIAN: "Psicomotricidad",
    PEDIATRIC_KINESIOLOGIST: "Kinesiología Pediátrica",
    PSYCHOLOGIST: "Psicología",
    COORDINATION_ASSISTANT: "Asistente de Coordinación",
    BEHAVIORAL_THERAPIST: "Terapia Conductual",
  };
  return translations[specialty] || specialty;
};

// Helper function to get report properties safely
const getReportProperty = (
  report:
    | FinalReport
    | ProgressReport
    | TherapeuticPlan
    | TherapistReportContribution,
  property: string,
  type: string
): string => {
  try {
    switch (type) {
      case "final":
        const finalReport = report as FinalReport;
        const finalValue = finalReport[property as keyof FinalReport];
        return typeof finalValue === "string" ? finalValue : "N/A";
      case "progress":
        const progressReport = report as ProgressReport;
        const progressValue = progressReport[property as keyof ProgressReport];
        return typeof progressValue === "string" ? progressValue : "N/A";
      case "therapeutic":
        const therapeuticPlan = report as TherapeuticPlan;
        const therapeuticValue =
          therapeuticPlan[property as keyof TherapeuticPlan];
        return typeof therapeuticValue === "string" ? therapeuticValue : "N/A";
      case "contribution":
        // For contributions, some properties might not exist
        if (property === "patientName" || property === "patientAge") {
          return "N/A"; // These properties don't exist on TherapistReportContribution
        }
        const contribution = report as TherapistReportContribution;
        const contributionValue =
          contribution[property as keyof TherapistReportContribution];
        return typeof contributionValue === "string"
          ? contributionValue
          : "N/A";
      default:
        return "N/A";
    }
  } catch {
    return "N/A";
  }
};

// Helper function to get report date
const getReportDate = (
  report:
    | FinalReport
    | ProgressReport
    | TherapeuticPlan
    | TherapistReportContribution,
  type: string
): Date => {
  try {
    switch (type) {
      case "final":
        return new Date((report as FinalReport).createdAt);
      case "progress":
        return new Date((report as ProgressReport).createdAt);
      case "therapeutic":
        return new Date((report as TherapeuticPlan).createdAt);
      case "contribution":
        return new Date((report as TherapistReportContribution).createdAt);
      default:
        return new Date();
    }
  } catch {
    return new Date();
  }
};

export function ReportPDFTemplate({ report, type }: ReportPDFTemplateProps) {
  const getReportTitle = () => {
    switch (type) {
      case "final":
        return "Informe Final";
      case "progress":
        return "Informe de Progreso";
      case "therapeutic":
        return "Plan Terapéutico";
      case "contribution":
        return "Contribución de Terapeuta";
      default:
        return "Informe";
    }
  };

  const getResponsiblePerson = () => {
    if (type === "final") {
      const finalReport = report as FinalReport;
      return {
        title: "Coordinador",
        name: `${finalReport.coordinator.firstName} ${finalReport.coordinator.lastName}`,
        specialty: translateSpecialty(finalReport.coordinator.specialty),
      };
    } else {
      const otherReport = report as
        | ProgressReport
        | TherapeuticPlan
        | TherapistReportContribution;
      return {
        title: "Terapeuta",
        name: `${otherReport.therapist.firstName} ${otherReport.therapist.lastName}`,
        specialty: translateSpecialty(otherReport.therapist.specialty),
      };
    }
  };

  const responsiblePerson = getResponsiblePerson();

  return (
    <div
      className="print-content bg-white p-8 max-w-none"
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.4",
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Centro Vivir Feliz - Terapias Especializadas
        </h1>
        <p className="text-lg text-gray-700 mb-1">{getReportTitle()}</p>
        <p className="text-sm text-gray-600">
          Teléfono: +591-4-123-4567 | Email: info@vivirfeliz.bo
        </p>
        <p className="text-sm text-gray-600">
          Dirección: Av. Principal 123, Cochabamba, Bolivia
        </p>
      </div>

      {/* Basic Information */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Información Básica
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">
              Nombre del Paciente:
            </span>
            <span className="ml-2 text-gray-900">
              {getReportProperty(report, "patientName", type)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Edad:</span>
            <span className="ml-2 text-gray-900">
              {getReportProperty(report, "patientAge", type)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">
              {responsiblePerson.title}:
            </span>
            <span className="ml-2 text-gray-900">{responsiblePerson.name}</span>
          </div>
          <div className="col-span-1 md:col-span-3">
            <span className="font-medium text-gray-700">
              Fecha del Informe:
            </span>
            <span className="ml-2 text-gray-900">
              {format(getReportDate(report, type), "dd/MM/yyyy")}
            </span>
          </div>
          {type === "progress" && (
            <div className="col-span-1 md:col-span-3">
              <span className="font-medium text-gray-700">
                Área de Tratamiento:
              </span>
              <span className="ml-2 text-gray-900">
                {(report as ProgressReport).treatmentArea}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content based on report type */}
      {type === "final" && (
        <FinalReportContent report={report as FinalReport} />
      )}

      {type === "progress" && (
        <ProgressReportContent report={report as ProgressReport} />
      )}

      {type === "therapeutic" && (
        <TherapeuticPlanContent report={report as TherapeuticPlan} />
      )}

      {type === "contribution" && (
        <ContributionReportContent
          report={report as TherapistReportContribution}
        />
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
        <p className="font-medium">
          Centro Vivir Feliz - Terapias Especializadas
        </p>
        <p>Teléfono: +591-4-123-4567 | Email: info@vivirfeliz.bo</p>
        <p>Dirección: Av. Principal 123, Cochabamba, Bolivia</p>
        <p className="mt-2">
          Documento generado el {format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}
        </p>
      </div>
    </div>
  );
}

// Final Report Content Component
function FinalReportContent({ report }: { report: FinalReport }) {
  return (
    <>
      {/* Combined Objectives */}
      {(report.generalObjective || report.otherObjectives) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Objetivos
          </h2>
          <div className="space-y-6">
            {/* General Objective */}
            {report.generalObjective && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Objetivo General
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {report.generalObjective}
                </p>
              </div>
            )}

            {/* Therapist Objectives */}
            {report.otherObjectives &&
              report.otherObjectives.map(
                (therapistData: TherapistData, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border-l-4 border-blue-500 rounded"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      Objetivo de {translateSpecialty(therapistData.specialty)}
                    </h4>
                    {therapistData.objectives && (
                      <div className="space-y-1">
                        {therapistData.objectives.map(
                          (objective: string, objIndex: number) => (
                            <div
                              key={objIndex}
                              className="text-sm text-gray-700"
                            >
                              <span className="font-medium">•</span> {objective}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
          </div>
        </div>
      )}

      {/* Combined Backgrounds */}
      {(report.generalBackground || report.therapistBackgrounds) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Antecedentes
          </h2>
          <div className="space-y-6">
            {/* General Background */}
            {report.generalBackground && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Antecedentes Generales
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {report.generalBackground}
                </p>
              </div>
            )}

            {/* Therapist Backgrounds */}
            {report.therapistBackgrounds &&
              report.therapistBackgrounds.map(
                (therapistData: TherapistData, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border-l-4 border-green-500 rounded"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      Antecedentes de{" "}
                      {translateSpecialty(therapistData.specialty)}
                    </h4>
                    <div className="text-sm text-gray-700">
                      {therapistData.background}
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      )}

      {/* Therapist Progress */}
      {report.therapistProgress && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Indicadores y Avances
          </h2>
          <div className="space-y-4">
            {report.therapistProgress.length > 0 ? (
              report.therapistProgress.map(
                (therapistData: TherapistData, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border-l-4 border-orange-500 rounded"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      Avances en el área de{" "}
                      {translateSpecialty(therapistData.specialty)}
                    </h4>
                    {therapistData.indicators &&
                    Array.isArray(therapistData.indicators) &&
                    therapistData.indicators.length > 0 ? (
                      <div className="space-y-3">
                        {therapistData.indicators.map(
                          (indicator: Indicator, indIndex: number) => (
                            <div
                              key={indIndex}
                              className="space-y-2 p-4 border rounded-lg"
                            >
                              <div className="mb-3">
                                <span className="font-medium text-gray-700">
                                  Indicador:
                                </span>
                                <span className="ml-2 text-gray-900">
                                  {indicator.name}
                                </span>
                              </div>

                              <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-700">
                                  Estado de Progreso
                                </div>
                                <div className="flex gap-2">
                                  {[
                                    {
                                      value: "not_achieved",
                                      label: "No logra",
                                    },
                                    {
                                      value: "with_help",
                                      label: "Con ayuda",
                                    },
                                    {
                                      value: "in_progress",
                                      label: "En progreso",
                                    },
                                    {
                                      value: "achieved",
                                      label: "Logrado",
                                    },
                                  ].map((status) => {
                                    const isSelected =
                                      indicator.newStatus === status.value;
                                    const isPrevious =
                                      indicator.initialStatus === status.value;

                                    const getStatusColor = (
                                      statusValue: string
                                    ) => {
                                      switch (statusValue) {
                                        case "not_achieved":
                                          return isSelected
                                            ? "border-red-500 bg-red-50 text-red-700"
                                            : isPrevious
                                              ? "border-red-300 bg-red-25 text-red-500"
                                              : "border-gray-200 bg-gray-50 text-gray-600";
                                        case "with_help":
                                          return isSelected
                                            ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                                            : isPrevious
                                              ? "border-yellow-300 bg-yellow-25 text-yellow-500"
                                              : "border-gray-200 bg-gray-50 text-gray-600";
                                        case "in_progress":
                                          return isSelected
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : isPrevious
                                              ? "border-blue-300 bg-blue-25 text-blue-500"
                                              : "border-gray-200 bg-gray-50 text-gray-600";
                                        case "achieved":
                                          return isSelected
                                            ? "border-green-500 bg-green-50 text-green-700"
                                            : isPrevious
                                              ? "border-green-300 bg-green-25 text-green-500"
                                              : "border-gray-200 bg-gray-50 text-gray-600";
                                        default:
                                          return "border-gray-200 bg-gray-50 text-gray-600";
                                      }
                                    };

                                    return (
                                      <div
                                        key={status.value}
                                        className={`p-3 rounded-lg border-2 flex-1 ${getStatusColor(status.value)}`}
                                      >
                                        <div className="text-sm font-medium">
                                          {status.label}
                                        </div>

                                        {isPrevious && (
                                          <div className="text-xs mt-1 text-gray-500">
                                            (Estado inicial)
                                          </div>
                                        )}
                                        {isSelected && (
                                          <div className="text-xs mt-1 text-gray-500">
                                            (Estado actual)
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        {therapistData.indicatorsComment && (
                          <div className="mt-3 p-3 bg-white border rounded">
                            <span className="font-medium text-gray-700">
                              Comentarios:
                            </span>
                            <p className="mt-1 text-gray-700">
                              {therapistData.indicatorsComment}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No hay indicadores registrados para este terapeuta.
                      </p>
                    )}
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-gray-500 italic">
                No hay contribuciones de terapeutas disponibles para mostrar.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Combined Conclusions */}
      {(report.generalConclusions || report.therapistConclusions) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Conclusiones y Recomendaciones
          </h2>
          <div className="space-y-6">
            {/* General Conclusions */}
            {report.generalConclusions && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Conclusiones Generales
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {report.generalConclusions}
                </p>
              </div>
            )}

            {/* Therapist Conclusions */}
            {report.therapistConclusions &&
              report.therapistConclusions.map(
                (therapistData: TherapistData, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border-l-4 border-orange-500 rounded"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      Desde {translateSpecialty(therapistData.specialty)}
                    </h4>
                    <div className="text-sm text-gray-700">
                      {therapistData.conclusions}
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      )}
    </>
  );
}

// Progress Report Content Component
function ProgressReportContent({ report }: { report: ProgressReport }) {
  return (
    <>
      {/* General Objective */}
      {report.generalObjective && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Objetivo General
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {report.generalObjective}
          </p>
        </div>
      )}

      {/* Specific Objectives */}
      {report.specificObjectives &&
        Array.isArray(report.specificObjectives) && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Objetivos Específicos
            </h2>
            <div className="space-y-2">
              {report.specificObjectives.map(
                (objective: string, index: number) => (
                  <div key={index} className="text-sm text-gray-700">
                    <span className="font-medium">•</span> {objective}
                  </div>
                )
              )}
            </div>
          </div>
        )}

      {/* Progress Entries */}
      {report.progressEntries && Array.isArray(report.progressEntries) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Entradas de Progreso
          </h2>
          <div className="space-y-4">
            {report.progressEntries.map((entry: string, index: number) => (
              <div
                key={index}
                className="p-3 bg-gray-50 border-l-4 border-green-500 rounded"
              >
                <div className="text-sm text-gray-700">{entry}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations && Array.isArray(report.recommendations) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Recomendaciones
          </h2>
          <div className="space-y-2">
            {report.recommendations.map(
              (recommendation: string, index: number) => (
                <div key={index} className="text-sm text-gray-700">
                  <span className="font-medium">•</span> {recommendation}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Therapeutic Plan Content Component
function TherapeuticPlanContent({ report }: { report: TherapeuticPlan }) {
  return (
    <>
      {/* Background */}
      {report.background && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Antecedentes
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {report.background}
          </p>
        </div>
      )}

      {/* Diagnoses */}
      {report.diagnoses && Array.isArray(report.diagnoses) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Diagnósticos
          </h2>
          <div className="space-y-2">
            {report.diagnoses.map((diagnosis: string, index: number) => (
              <div key={index} className="text-sm text-gray-700">
                <span className="font-medium">•</span> {diagnosis}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Objective */}
      {report.generalObjective && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Objetivo General
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {report.generalObjective}
          </p>
        </div>
      )}

      {/* Specific Objectives */}
      {report.specificObjectives &&
        Array.isArray(report.specificObjectives) && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Objetivos Específicos
            </h2>
            <div className="space-y-2">
              {report.specificObjectives.map(
                (objective: string, index: number) => (
                  <div key={index} className="text-sm text-gray-700">
                    <span className="font-medium">•</span> {objective}
                  </div>
                )
              )}
            </div>
          </div>
        )}

      {/* Indicators */}
      {report.indicators && Array.isArray(report.indicators) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Indicadores
          </h2>
          <div className="space-y-4">
            {report.indicators.map((indicator: string, index: number) => (
              <div
                key={index}
                className="p-3 bg-gray-50 border-l-4 border-blue-500 rounded"
              >
                <div className="text-sm text-gray-700">{indicator}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Methodologies */}
      {report.methodologies && Array.isArray(report.methodologies) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Metodologías y Estrategias
          </h2>
          <div className="space-y-2">
            {report.methodologies.map((methodology: string, index: number) => (
              <div key={index} className="text-sm text-gray-700">
                <span className="font-medium">•</span> {methodology}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observations */}
      {report.observations && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Observaciones
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {report.observations}
          </p>
        </div>
      )}
    </>
  );
}

// Contribution Report Content Component
function ContributionReportContent({
  report,
}: {
  report: TherapistReportContribution;
}) {
  return (
    <>
      {/* Objectives */}
      {report.objectives && Array.isArray(report.objectives) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Objetivos
          </h2>
          <div className="space-y-2">
            {report.objectives.map((objective: string, index: number) => (
              <div key={index} className="text-sm text-gray-700">
                <span className="font-medium">•</span> {objective}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background */}
      {report.background && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Antecedentes
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {report.background}
          </p>
        </div>
      )}

      {/* Indicators */}
      {report.indicators && Array.isArray(report.indicators) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Indicadores
          </h2>
          <div className="space-y-4">
            {report.indicators.map((indicator: string, index: number) => (
              <div
                key={index}
                className="p-3 bg-gray-50 border-l-4 border-blue-500 rounded"
              >
                <div className="text-sm text-gray-700">{indicator}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicators Comment */}
      {report.indicatorsComment && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Comentarios sobre Indicadores
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {report.indicatorsComment}
          </p>
        </div>
      )}

      {/* Conclusions */}
      {report.conclusions && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Conclusiones
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {report.conclusions}
          </p>
        </div>
      )}
    </>
  );
}
