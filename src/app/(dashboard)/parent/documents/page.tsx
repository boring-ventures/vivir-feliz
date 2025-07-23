"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  useParentDocuments,
  ParentDocument,
} from "@/hooks/use-parent-documents";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const documentTypeLabels = {
  EVALUATION: "Evaluaciones",
  MEDICAL_REPORT: "Informes Médicos",
  SCHOOL_REPORT: "Informes Escolares",
  SESSION_NOTE: "Notas de Sesión",
  PROGRESS_REPORT: "Informes de Progreso",
  PRESCRIPTION: "Prescripciones",
  OTHER: "Otros",
};

const getDocumentTypeLabel = (type: string) => {
  return documentTypeLabels[type as keyof typeof documentTypeLabels] || type;
};

const getEstadoInfo = () => {
  // For now, we'll show all documents as completed since they're uploaded
  // In the future, you might want to add a status field to the database
  return {
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-100 text-green-800 hover:bg-green-100",
    text: "Disponible",
  };
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: es });
  } catch {
    return "Fecha no disponible";
  }
};

export default function ParentDocumentosPage() {
  const [tipoDocumento, setTipoDocumento] = useState<string>("todos");

  const { data, isLoading, error } = useParentDocuments({
    documentType: tipoDocumento === "todos" ? undefined : tipoDocumento,
  });

  const handleDownload = async (doc: ParentDocument) => {
    try {
      const response = await fetch(doc.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      // TODO: Show error toast
    }
  };

  const handleViewOnline = (doc: ParentDocument) => {
    // Open document in new tab
    window.open(doc.fileUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Documentos</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando documentos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Documentos</h2>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>
                Error al cargar los documentos. Por favor, intenta de nuevo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const documents = data?.documents || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Documentos</h2>

      {/* Filtros */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de documento:
          </label>
          <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los documentos</SelectItem>
              <SelectItem value="EVALUATION">Evaluaciones</SelectItem>
              <SelectItem value="MEDICAL_REPORT">Informes Médicos</SelectItem>
              <SelectItem value="SCHOOL_REPORT">Informes Escolares</SelectItem>
              <SelectItem value="SESSION_NOTE">Notas de Sesión</SelectItem>
              <SelectItem value="PROGRESS_REPORT">
                Informes de Progreso
              </SelectItem>
              <SelectItem value="PRESCRIPTION">Prescripciones</SelectItem>
              <SelectItem value="OTHER">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documentos */}
      {documents.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                {tipoDocumento === "todos"
                  ? "No hay documentos disponibles."
                  : "No se encontraron documentos con el filtro seleccionado."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((documentItem) => {
            const estadoInfo = getEstadoInfo();

            return (
              <Card key={documentItem.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">
                            {documentItem.title}
                          </h4>
                          <p className="text-gray-600">
                            Fecha: {formatDate(documentItem.uploadedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            Paciente:
                          </span>
                          <span className="text-sm font-medium">
                            {documentItem.patientName}
                          </span>
                        </div>

                        {documentItem.therapistName && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              Terapeuta:
                            </span>
                            <span className="text-sm font-medium">
                              {documentItem.therapistName}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Tipo:</span>
                          <span className="text-sm font-medium">
                            {getDocumentTypeLabel(documentItem.documentType)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Tamaño:</span>
                          <span className="text-sm font-medium">
                            {documentItem.fileSizeFormatted}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Estado:</span>
                          <Badge className={estadoInfo.color}>
                            {estadoInfo.icon}
                            <span className="ml-1">{estadoInfo.text}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(documentItem)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOnline(documentItem)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Online
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
