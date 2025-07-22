import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DocumentType } from "@/types/documents";

// PUT - Update a document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Unauthorized - Therapist access required" },
        { status: 401 }
      );
    }

    const { documentId } = await params;
    const body = await request.json();
    const { title, description, documentType } = body;

    // Find the document and verify ownership
    const existingDocument = await prisma.patientDocument.findFirst({
      where: {
        id: documentId,
        therapistId: currentUser.id,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    // Validate document type if provided
    if (documentType && !Object.values(DocumentType).includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // Update the document
    const updatedDocument = await prisma.patientDocument.update({
      where: { id: documentId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(documentType && { documentType }),
      },
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
          },
        },
      },
    });

    return NextResponse.json({
      document: updatedDocument,
      message: "Document updated successfully",
    });
  } catch (error) {
    console.error("Error updating patient document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Unauthorized - Therapist access required" },
        { status: 401 }
      );
    }

    const { documentId } = await params;

    // Find the document and verify ownership
    const existingDocument = await prisma.patientDocument.findFirst({
      where: {
        id: documentId,
        therapistId: currentUser.id,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the document from database
    await prisma.patientDocument.delete({
      where: { id: documentId },
    });

    // Note: The file in Supabase Storage will need to be deleted separately
    // This can be done by calling the Supabase Storage API or through a cleanup job

    return NextResponse.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patient document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

// GET - Get a specific document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Unauthorized - Therapist access required" },
        { status: 401 }
      );
    }

    const { documentId } = await params;

    // Find the document and verify ownership
    const document = await prisma.patientDocument.findFirst({
      where: {
        id: documentId,
        therapistId: currentUser.id,
      },
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
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      document,
      message: "Document retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching patient document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
