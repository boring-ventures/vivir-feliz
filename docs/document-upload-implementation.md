# Document Upload Implementation

## Overview

This document describes the document upload functionality implemented for the therapist patients page. The system allows therapists to upload patient documents to Supabase Storage.

## Components

### 1. File Upload Component (`src/components/ui/file-upload.tsx`)

A reusable drag-and-drop file upload component with the following features:

- **Drag & Drop**: Users can drag files directly onto the upload area
- **File Browser**: Click to browse and select files
- **File Validation**: Validates file type and size
- **Visual Feedback**: Shows selected file with size and remove option
- **Accessibility**: Proper labels and keyboard navigation

**Supported File Types:**

- PDF documents
- Word documents (.doc, .docx)
- Excel spreadsheets (.xls, .xlsx)
- Text files (.txt)
- Images (JPEG, PNG, GIF)

**File Size Limit:** 10MB maximum

### 2. Upload Hook (`src/hooks/use-document-upload.ts`)

Handles the actual file upload process:

- **File Validation**: Server-side validation of file type and size
- **Supabase Storage**: Uploads files to the `documents` bucket
- **File Organization**: Files are stored in `patient-documents/{patientId}/` folders
- **Unique Naming**: Generates unique filenames to prevent conflicts
- **Error Handling**: Comprehensive error handling and user feedback

### 3. Document Types (`src/types/documents.ts`)

Defines the document type system:

```typescript
enum DocumentType {
  EVALUATION = "EVALUATION", // Evaluación Psicológica
  MEDICAL_REPORT = "MEDICAL_REPORT", // Reporte Médico
  SCHOOL_REPORT = "SCHOOL_REPORT", // Reporte Escolar
  SESSION_NOTE = "SESSION_NOTE", // Nota de Sesión
  PROGRESS_REPORT = "PROGRESS_REPORT", // Reporte de Progreso
  PRESCRIPTION = "PRESCRIPTION", // Prescripción Médica
  OTHER = "OTHER", // Otro Documento
}
```

## Usage in Patients Page

The document upload is integrated into the therapist patients page modal:

1. **Access**: Click "Subir Documento" in the patient actions dropdown
2. **Form Fields**:
   - Title: Document title/name
   - Description: Optional document description
   - Document Type: Select from predefined types
   - File: Drag & drop or browse to select file
3. **Upload**: Click "Subir Documento" to upload
4. **Feedback**: Success/error messages via toast notifications

## Storage Structure

Files are stored in Supabase Storage with the following structure:

```
documents/
└── patient-documents/
    └── {patientId}/
        ├── {timestamp}-{random}.pdf
        ├── {timestamp}-{random}.docx
        └── {timestamp}-{random}.jpg
```

## Current Implementation Status

### ✅ Completed

- File upload component with drag & drop
- File validation (type and size)
- Supabase Storage integration
- Upload hook with error handling
- Integration with patients page modal
- Document type system
- User feedback via toast notifications

### 🔄 In Progress

- Database integration (patient_documents table)
- Document listing and management
- File download functionality
- Document deletion

### 📋 Next Steps

1. **Database Integration**: Save document metadata to `patient_documents` table
2. **Document Management**: List, view, and delete uploaded documents
3. **Access Control**: Ensure only authorized users can access documents
4. **File Preview**: Add preview functionality for supported file types

## Security Considerations

- **File Type Validation**: Both client and server-side validation
- **File Size Limits**: Prevents large file uploads
- **Unique Filenames**: Prevents filename conflicts
- **Patient Isolation**: Files are organized by patient ID
- **Access Control**: Only therapists can upload for their patients

## Environment Setup

Ensure the following environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Storage Setup

1. Create a `documents` bucket in Supabase Storage
2. Set up appropriate storage policies for access control
3. Configure CORS if needed for direct uploads

## Testing

To test the upload functionality:

1. Navigate to the therapist patients page
2. Select a patient and click "Subir Documento"
3. Fill in the form fields
4. Select a file (PDF, Word, Excel, or image)
5. Click upload and verify the success message
6. Check Supabase Storage to confirm file upload

## Error Handling

The system handles various error scenarios:

- **Invalid File Type**: Shows error message with allowed types
- **File Too Large**: Shows error message with size limit
- **Upload Failure**: Shows generic upload error
- **Network Issues**: Handles connection problems gracefully
