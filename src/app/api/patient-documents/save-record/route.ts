import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DocumentType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      therapistId,
      title,
      description,
      documentType,
      fileName,
      fileUrl,
      fileSize,
      fileType,
    } = body;

    // Validate required fields
    if (
      !patientId ||
      !therapistId ||
      !title ||
      !documentType ||
      !fileName ||
      !fileUrl ||
      !fileSize ||
      !fileType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Map frontend document type to database enum
    const documentTypeMap: Record<string, DocumentType> = {
      evaluacion: "EVALUATION",
      examen: "MEDICAL_REPORT",
      informe: "SCHOOL_REPORT",
      reporte: "PROGRESS_REPORT",
      otro: "OTHER",
    };

    const dbDocumentType = documentTypeMap[documentType] || "OTHER";

    // Save document info to database
    const document = await prisma.patientDocument.create({
      data: {
        patientId,
        therapistId,
        title,
        description: description || null,
        fileName,
        fileUrl,
        fileSize,
        fileType,
        documentType: dbDocumentType,
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Document record save error:", error);
    return NextResponse.json(
      { error: "Failed to save document record" },
      { status: 500 }
    );
  }
}
