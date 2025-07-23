"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Target,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock,
  Pause,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  useParentProgress,
  ParentObjective,
} from "@/hooks/use-parent-progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: es });
  } catch {
    return "Fecha no disponible";
  }
};

const getObjectiveStatusInfo = (status: ParentObjective["status"]) => {
  switch (status) {
    case "COMPLETED":
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-green-100 text-green-800 hover:bg-green-100",
        text: "Completado",
      };
    case "IN_PROGRESS":
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        text: "En Progreso",
      };
    case "PAUSED":
      return {
        icon: <Pause className="h-4 w-4" />,
        color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        text: "Pausado",
      };
    case "CANCELLED":
      return {
        icon: <XCircle className="h-4 w-4" />,
        color: "bg-red-100 text-red-800 hover:bg-red-100",
        text: "Cancelado",
      };
    case "PENDING":
      return {
        icon: <Clock className="h-4 w-4" />,
        color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
        text: "Pendiente",
      };
  }
};

const getEvaluationColor = (percentage: number) => {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 60) return "bg-blue-500";
  if (percentage >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

export default function ParentProgresoPage() {
  const { data, isLoading, error } = useParentProgress();

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Progreso y Evaluaciones</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando progreso...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Progreso y Evaluaciones</h2>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>Error al cargar el progreso. Por favor, intenta de nuevo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const objectives = data?.objectives || [];
  const sessionNotes = data?.sessionNotes || [];
  const evaluations = data?.evaluations || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Progreso y Evaluaciones</h2>

      {/* Evaluaciones - Only show if there are evaluations */}
      {evaluations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Evaluación Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluations.map((evaluacion) => (
                <div key={evaluacion.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{evaluacion.area}</span>
                      <p className="text-sm text-gray-600">
                        {evaluacion.patientName}
                      </p>
                    </div>
                    <span>
                      {evaluacion.score}/{evaluacion.maxScore}
                    </span>
                  </div>
                  <Progress
                    value={evaluacion.percentage}
                    className={`h-2 ${getEvaluationColor(evaluacion.percentage)}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 text-right text-sm text-gray-500">
              Última actualización: {formatDate(new Date().toISOString())}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objetivos y Metas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Objetivos y Metas</CardTitle>
        </CardHeader>
        <CardContent>
          {objectives.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay objetivos definidos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {objectives.map((objetivo) => {
                const statusInfo = getObjectiveStatusInfo(objetivo.status);

                return (
                  <div key={objetivo.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {statusInfo.icon}
                        <span className="font-medium">{objetivo.name}</span>
                      </div>
                      <Badge className={statusInfo.color}>
                        {statusInfo.text}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        {objetivo.patientName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Terapeuta: {objetivo.therapistName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{objetivo.progressPercentage}%</span>
                      </div>
                      <Progress
                        value={objetivo.progressPercentage}
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comentarios de Sesiones */}
      <Card>
        <CardHeader>
          <CardTitle>Comentarios de Sesiones</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionNotes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay comentarios de sesiones disponibles.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionNotes.map((sesion) => (
                <div key={sesion.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        Sesión del {formatDate(sesion.appointmentDate)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {sesion.therapistName}
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">
                      {sesion.patientName}
                    </p>
                  </div>
                  <p className="text-gray-700 mt-2">{sesion.sessionComment}</p>
                  {sesion.parentMessage && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Mensaje para padres:
                      </p>
                      <p className="text-sm text-blue-700">
                        {sesion.parentMessage}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
