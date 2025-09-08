import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ConsultationRequestStatus } from "@prisma/client";
import {
  capitalizeName,
  capitalizeAddress,
  capitalizeWords,
} from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      // Child data
      childName,
      childGender,
      childDateOfBirth,
      childLivesWith,
      childOtherLivesWith,
      childAddress,

      // Parent data
      motherName,
      motherAge,
      motherPhone,
      motherEmail,
      motherEducation,
      motherOccupation,
      fatherName,
      fatherAge,
      fatherPhone,
      fatherEmail,
      fatherEducation,
      fatherOccupation,

      // School data
      schoolName,
      schoolPhone,
      schoolAddress,
      schoolLevel,
      teacherName,
      notEnrolled,

      // Children array
      children,

      // Consultation reasons
      consultationReasons,
      referredBy,
    } = body;

    // Validate required fields
    if (!childName || !childGender || !childDateOfBirth) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios del niño" },
        { status: 400 }
      );
    }

    // Create consultation request
    const consultationRequest = await prisma.consultationRequest.create({
      data: {
        // Child data - capitalize names and addresses
        childName: capitalizeName(childName),
        childGender,
        childDateOfBirth: new Date(childDateOfBirth),
        childLivesWith,
        childOtherLivesWith: childOtherLivesWith
          ? capitalizeWords(childOtherLivesWith)
          : null,
        childAddress: capitalizeAddress(childAddress),

        // Parent data - capitalize names, occupations, and addresses
        motherName: motherName ? capitalizeName(motherName) : null,
        motherAge,
        motherPhone,
        motherEmail,
        motherEducation: motherEducation
          ? capitalizeWords(motherEducation)
          : null,
        motherOccupation: motherOccupation
          ? capitalizeWords(motherOccupation)
          : null,
        fatherName: fatherName ? capitalizeName(fatherName) : null,
        fatherAge,
        fatherPhone,
        fatherEmail,
        fatherEducation: fatherEducation
          ? capitalizeWords(fatherEducation)
          : null,
        fatherOccupation: fatherOccupation
          ? capitalizeWords(fatherOccupation)
          : null,

        // School data - capitalize names and addresses
        schoolName: schoolName ? capitalizeWords(schoolName) : null,
        schoolPhone,
        schoolAddress: schoolAddress ? capitalizeAddress(schoolAddress) : null,
        schoolLevel: schoolLevel ? capitalizeWords(schoolLevel) : null,
        teacherName: teacherName ? capitalizeName(teacherName) : null,
        notEnrolled: notEnrolled || false,

        // Consultation reasons
        consultationReasons,
        referredBy: referredBy ? capitalizeWords(referredBy) : null,

        // Create related children - capitalize names and school grades
        children: {
          create:
            children?.map(
              (child: {
                nombre: string;
                fechaNacimiento: string;
                gradoEscolar: string;
                problemas: boolean;
                descripcionProblemas: string;
              }) => ({
                name: capitalizeName(child.nombre),
                dateOfBirth: new Date(child.fechaNacimiento),
                schoolGrade: capitalizeWords(child.gradoEscolar),
                hasProblems: child.problemas,
                problemDescription: child.descripcionProblemas
                  ? capitalizeWords(child.descripcionProblemas)
                  : null,
              })
            ) || [],
        },
      },
      include: {
        children: true,
      },
    });

    return NextResponse.json(consultationRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating consultation request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Properly type the where clause
    const where =
      statusParam &&
      Object.values(ConsultationRequestStatus).includes(
        statusParam as ConsultationRequestStatus
      )
        ? { status: statusParam as ConsultationRequestStatus }
        : {};

    const [consultationRequests, total] = await Promise.all([
      prisma.consultationRequest.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.consultationRequest.count({ where }),
    ]);

    return NextResponse.json({
      consultationRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching consultation requests:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
