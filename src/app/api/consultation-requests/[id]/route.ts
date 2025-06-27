import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ConsultationRequestStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate the consultation request exists
    const existingRequest = await prisma.consultationRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Solicitud de consulta no encontrada" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      status?: ConsultationRequestStatus;
      notes?: string;
      scheduledDate?: Date | null;
      scheduledTime?: string;
      assignedTherapistId?: string;
      price?: number;
    } = {};

    // Handle status update
    if (
      body.status &&
      Object.values(ConsultationRequestStatus).includes(body.status)
    ) {
      updateData.status = body.status;
    }

    // Handle notes
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    // Handle scheduling fields
    if (body.scheduledDate !== undefined) {
      updateData.scheduledDate = body.scheduledDate
        ? new Date(body.scheduledDate)
        : null;
    }

    if (body.scheduledTime !== undefined) {
      updateData.scheduledTime = body.scheduledTime;
    }

    if (body.assignedTherapistId !== undefined) {
      updateData.assignedTherapistId = body.assignedTherapistId;
    }

    // Handle price
    if (body.price !== undefined) {
      updateData.price = parseFloat(body.price);
    }

    // Update the consultation request
    const updatedRequest = await prisma.consultationRequest.update({
      where: { id },
      data: updateData,
      include: {
        children: true,
        assignedTherapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    // Transform the response to match the expected format
    const response = {
      id: updatedRequest.id,
      childName: updatedRequest.childName,
      childGender: updatedRequest.childGender,
      childDateOfBirth: updatedRequest.childDateOfBirth.toISOString(),
      childLivesWith: updatedRequest.childLivesWith,
      childOtherLivesWith: updatedRequest.childOtherLivesWith,
      childAddress: updatedRequest.childAddress,
      motherName: updatedRequest.motherName,
      motherAge: updatedRequest.motherAge,
      motherPhone: updatedRequest.motherPhone,
      motherEmail: updatedRequest.motherEmail,
      motherEducation: updatedRequest.motherEducation,
      motherOccupation: updatedRequest.motherOccupation,
      fatherName: updatedRequest.fatherName,
      fatherAge: updatedRequest.fatherAge,
      fatherPhone: updatedRequest.fatherPhone,
      fatherEmail: updatedRequest.fatherEmail,
      fatherEducation: updatedRequest.fatherEducation,
      fatherOccupation: updatedRequest.fatherOccupation,
      schoolName: updatedRequest.schoolName,
      schoolPhone: updatedRequest.schoolPhone,
      schoolAddress: updatedRequest.schoolAddress,
      schoolLevel: updatedRequest.schoolLevel,
      teacherName: updatedRequest.teacherName,
      consultationReasons: updatedRequest.consultationReasons,
      referredBy: updatedRequest.referredBy,
      status: updatedRequest.status,
      notes: updatedRequest.notes,
      scheduledDate: updatedRequest.scheduledDate?.toISOString(),
      scheduledTime: updatedRequest.scheduledTime,
      assignedTherapistId: updatedRequest.assignedTherapistId,
      price: updatedRequest.price,
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString(),
      children: updatedRequest.children.map((child) => ({
        id: child.id,
        name: child.name,
        dateOfBirth: child.dateOfBirth.toISOString(),
        schoolGrade: child.schoolGrade,
        hasProblems: child.hasProblems,
        problemDescription: child.problemDescription,
      })),
      assignedTherapist: updatedRequest.assignedTherapist,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating consultation request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
 