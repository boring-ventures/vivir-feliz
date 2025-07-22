"use client";

import { useState } from "react";
import { Upload, File, X } from "lucide-react";
import { UPLOAD_LIMITS, MIME_TYPE_LABELS } from "@/types/documents";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  selectedFile?: File | null;
}
type AllowedMimeTypes = (typeof UPLOAD_LIMITS.allowedTypes)[number];

export function FileUpload({
  onFileSelect,
  disabled = false,
  className = "",
  selectedFile,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!UPLOAD_LIMITS.allowedTypes.includes(file.type as AllowedMimeTypes)) {
      alert(
        `Tipo de archivo no permitido. Tipos permitidos: ${UPLOAD_LIMITS.allowedTypes.map((type) => MIME_TYPE_LABELS[type]).join(", ")}`
      );
      return;
    }

    // Validate file size
    if (file.size > UPLOAD_LIMITS.maxFileSize) {
      alert(
        `El archivo es demasiado grande. Tamaño máximo: ${UPLOAD_LIMITS.maxFileSize / 1024 / 1024}MB`
      );
      return;
    }

    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileInput}
          accept={UPLOAD_LIMITS.allowedTypes.join(",")}
          disabled={disabled}
        />

        {!selectedFile ? (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              Arrastra tu documento aquí, o{" "}
              <label
                htmlFor="file-upload"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                busca
              </label>
            </p>
            <p className="text-sm text-gray-500">
              PDF, Word, Excel, texto e imágenes (máx. 10MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <File className="h-8 w-8 text-blue-600" />
            <div className="text-left">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-red-500 p-1 rounded"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
