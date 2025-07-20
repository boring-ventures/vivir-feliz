export enum DocumentType {
  EVALUATION = "EVALUATION",
  MEDICAL_REPORT = "MEDICAL_REPORT",
  SCHOOL_REPORT = "SCHOOL_REPORT",
  SESSION_NOTE = "SESSION_NOTE",
  PROGRESS_REPORT = "PROGRESS_REPORT",
  PRESCRIPTION = "PRESCRIPTION",
  OTHER = "OTHER",
}

export interface PatientDocument {
  id: string;
  patientId: string;
  therapistId: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  documentType: DocumentType;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDocumentWithDetails extends PatientDocument {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateDocumentData {
  title: string;
  description?: string;
  documentType: DocumentType;
  file: File;
}

export interface DocumentUploadResponse {
  document: PatientDocument;
  message: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.EVALUATION]: "Evaluación Psicológica",
  [DocumentType.MEDICAL_REPORT]: "Reporte Médico",
  [DocumentType.SCHOOL_REPORT]: "Reporte Escolar",
  [DocumentType.SESSION_NOTE]: "Nota de Sesión",
  [DocumentType.PROGRESS_REPORT]: "Reporte de Progreso",
  [DocumentType.PRESCRIPTION]: "Prescripción Médica",
  [DocumentType.OTHER]: "Otro Documento",
};

export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  maxFilesPerUpload: 5,
} as const;

export const MIME_TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/gif": "GIF",
  "application/msword": "Word Doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word Doc",
  "text/plain": "Texto",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
};
