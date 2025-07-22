import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { DocumentType } from "@/types/documents";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface UploadDocumentParams {
  file: File;
  patientId: string;
  therapistId: string;
  title: string;
  description?: string;
  documentType: DocumentType;
}

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = async (
    params: UploadDocumentParams
  ): Promise<UploadResult> => {
    setIsUploading(true);

    try {
      const { file, patientId, therapistId, title, description, documentType } =
        params;

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error:
            "Tipo de archivo no permitido. Solo se permiten PDF, Word, Excel, texto e imágenes.",
        };
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          error: "El archivo es demasiado grande. El tamaño máximo es 10MB.",
        };
      }

      // Generate a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `patient-documents/${patientId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      // For now, we're only uploading to storage, not saving to database
      // The database save will be implemented later when you're ready
      console.log("Document uploaded successfully:", {
        fileName: file.name,
        fileUrl: urlData.publicUrl,
        fileSize: file.size,
        fileType: file.type,
        documentType,
        patientId,
        therapistId,
        title,
        description,
      });

      return {
        success: true,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error("Upload failed:", error);
      return {
        success: false,
        error: "Error al subir el archivo",
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDocument,
    isUploading,
  };
}
