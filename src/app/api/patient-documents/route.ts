import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadDocument } from "@/lib/supabase/upload-document";
import { DocumentType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // Parse FormData correctly
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const patientId = formData.get("patientId") as string;
    const therapistId = formData.get("therapistId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const documentType = formData.get("documentType") as string;

    console.log("Received form data:", {
      fileName: file?.name,
      fileSize: file?.size,
      patientId,
      therapistId,
      title,
      documentType,
    });

    // Validate required fields
    if (!file || !patientId || !therapistId || !title || !documentType) {
      console.log("Missing fields:", {
        hasFile: !!file,
        patientId: !!patientId,
        therapistId: !!therapistId,
        title: !!title,
        documentType: !!documentType,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that file is actually a File object
    if (!(file instanceof File)) {
      console.log("Invalid file object:", file);
      return NextResponse.json(
        { error: "Invalid file object" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Upload file to Supabase
    const uploadResult = await uploadDocument({
      file,
      patientId,
      therapistId,
    });

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
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.fileUrl,
        fileSize: uploadResult.fileSize,
        fileType: uploadResult.fileType,
        documentType: dbDocumentType,
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const therapistId = searchParams.get("therapistId");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const documents = await prisma.patientDocument.findMany({
      where: {
        patientId,
        ...(therapistId && { therapistId }),
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        therapist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
