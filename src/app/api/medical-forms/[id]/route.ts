import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Function to map frontend field names to database field names
function mapFormFieldsToDatabase(formData: Record<string, unknown>) {
  const fieldMappings: Record<string, string> = {
    specialCareStay: "specialCare",
    stayDuration: "hospitalizationDays",
    stayReason: "hospitalizationReason",
    otherAllergy: "otherAllergyDescription",
    blockTower: "blockTowers",
    adaptationToChanges: "adaptsToChanges",
    feeding: "feedingHabits",
    sleep: "sleepHabits",
    siblingAges: "siblingsAges",
    changeTypes: "typesOfChanges",
    historyDetails: "familyHistoryDetails",
  };

  const mappedData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(formData)) {
    const mappedKey = fieldMappings[key] || key;

    // Special handling for date fields
    if (mappedKey === "childBirthDate" && typeof value === "string") {
      mappedData[mappedKey] = new Date(value + "T00:00:00.000Z");
    } else {
      mappedData[mappedKey] = value;
    }
  }

  return mappedData;
}

// GET medical form by appointment ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawAppointmentId } = await params;

    // Extract the actual appointment ID from formats like "CON-{id}-{timestamp}" or "INT-{id}-{timestamp}"
    const appointmentId = (() => {
      if (
        rawAppointmentId.startsWith("CON-") ||
        rawAppointmentId.startsWith("INT-")
      ) {
        const parts = rawAppointmentId.split("-");
        if (parts.length === 3) {
          // Format: CON-{id}-{timestamp} -> return just {id}
          return parts[1];
        } else if (parts.length === 2) {
          // Format: CON-{id} -> return just {id}
          return parts[1];
        }
      }
      return rawAppointmentId;
    })();

    const medicalForm = await prisma.medicalForm.findUnique({
      where: {
        appointmentId,
      },
      include: {
        appointment: {
          select: {
            id: true,
            patientName: true,
            patientAge: true,
            parentName: true,
            date: true,
            startTime: true,
            status: true,
          },
        },
      },
    });

    if (!medicalForm) {
      return NextResponse.json(
        { error: "Formulario médico no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: medicalForm,
    });
  } catch (error) {
    console.error("Error fetching medical form:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Update medical form data (for therapists to complete missing fields)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawAppointmentId } = await params;

    // Extract the actual appointment ID from formats like "CON-{id}-{timestamp}" or "INT-{id}-{timestamp}"
    const appointmentId = (() => {
      if (
        rawAppointmentId.startsWith("CON-") ||
        rawAppointmentId.startsWith("INT-")
      ) {
        const parts = rawAppointmentId.split("-");
        if (parts.length === 3) {
          // Format: CON-{id}-{timestamp} -> return just {id}
          return parts[1];
        } else if (parts.length === 2) {
          // Format: CON-{id} -> return just {id}
          return parts[1];
        }
      }
      return rawAppointmentId;
    })();
    const body = await request.json();

    // First, verify the appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Update the medical form with the provided data
    const mappedBody = mapFormFieldsToDatabase(body);

    // Use upsert to create or update the medical form
    const updatedForm = await prisma.medicalForm.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        ...mappedBody,
        childName: appointment.patientName || "Nombre del paciente",
        childBirthDate: (mappedBody.childBirthDate as Date) || new Date(),
        hospitalizations: mappedBody.hospitalizations || [],
        medications: mappedBody.medications || [],
        status: "REVIEWED",
        reviewedAt: new Date(),
        reviewedBy: "therapist",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        ...mappedBody,
        reviewedAt: new Date(),
        reviewedBy: "therapist",
        status: "REVIEWED",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedForm,
      message: "Formulario médico guardado exitosamente",
    });
  } catch (error) {
    console.error("Error updating medical form:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
