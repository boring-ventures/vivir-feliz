import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ConsultationRequestStatus } from "@prisma/client";

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
        // Child data
        childName,
        childGender,
        childDateOfBirth: new Date(childDateOfBirth),
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

        // Consultation reasons
        consultationReasons,
        referredBy,

        // Create related children
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
                name: child.nombre,
                dateOfBirth: new Date(child.fechaNacimiento),
                schoolGrade: child.gradoEscolar,
                hasProblems: child.problemas,
                problemDescription: child.descripcionProblemas,
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
