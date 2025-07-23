import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { DocumentType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the parent profile
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile || profile.role !== "PARENT") {
      return NextResponse.json(
        { error: "Parent profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    const documentType = searchParams.get("documentType");

    // Get all patients belonging to this parent
    const patients = await prisma.patient.findMany({
      where: {
        parentId: profile.id,
      },
      select: {
        id: true,
      },
    });

    const patientIds = patients.map((patient) => patient.id);

    if (patientIds.length === 0) {
      return NextResponse.json({
        documents: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    // Build where clause
    const whereClause: {
      patientId: { in: string[] };
      documentType?: DocumentType;
    } = {
      patientId: { in: patientIds },
    };

    if (documentType) {
      whereClause.documentType = documentType as DocumentType;
    }

    // Fetch documents with relations
    const [documents, total] = await Promise.all([
      prisma.patientDocument.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          therapist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
        orderBy: [{ uploadedAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.patientDocument.count({ where: whereClause }),
    ]);

    // Transform documents for response
    const transformedDocuments = documents.map((document) => {
      const patientName = document.patient
        ? `${document.patient.firstName} ${document.patient.lastName}`
        : "Paciente no disponible";

      const therapistName = document.therapist
        ? `${document.therapist.firstName} ${document.therapist.lastName}`
        : "Terapeuta no disponible";

      // Format file size for display
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      };

      return {
        id: document.id,
        title: document.title,
        description: document.description || "",
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        fileSize: document.fileSize,
        fileSizeFormatted: formatFileSize(document.fileSize),
        fileType: document.fileType,
        documentType: document.documentType,
        patientName,
        therapistName,
        therapistSpecialty: document.therapist?.specialty || "",
        uploadedAt: document.uploadedAt.toISOString(),
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      documents: transformedDocuments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching parent documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
