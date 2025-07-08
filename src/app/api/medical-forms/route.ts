import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MedicalFormStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appointmentId: rawAppointmentId, formData } = body;

    if (!rawAppointmentId || !formData) {
      return NextResponse.json(
        { error: "ID de cita y datos del formulario requeridos" },
        { status: 400 }
      );
    }

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

    // Verify that the appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Check if medical form already exists for this appointment
    const existingForm = await prisma.medicalForm.findUnique({
      where: { appointmentId },
    });

    if (existingForm) {
      return NextResponse.json(
        { error: "Ya existe un formulario médico para esta cita" },
        { status: 409 }
      );
    }

    // Process and save the medical form
    const medicalForm = await prisma.medicalForm.create({
      data: {
        appointmentId,

        // Basic Information
        childName: formData.childName || "",
        childBirthDate: new Date(formData.childBirthDate),
        childAgeYears: formData.childAgeYears,
        childAgeMonths: formData.childAgeMonths,

        // Perinatal History
        pregnancyType: formData.pregnancyType,
        prematureWeeks: formData.prematureWeeks,
        postTermWeeks: formData.postTermWeeks,
        pregnancyComplications: formData.pregnancyComplications,
        deliveryType: formData.deliveryType,
        cesareanReason: formData.cesareanReason,
        birthWeight: formData.birthWeight,
        birthHeight: formData.birthHeight,

        // Birth Complications
        deliveryComplications: formData.deliveryComplications,
        complicationDetails: formData.complicationDetails,
        specialCare: formData.specialCare || [],
        hospitalizationDays: formData.hospitalizationDays,
        hospitalizationReason: formData.hospitalizationReason,

        // Medical History
        importantIllnesses: formData.importantIllnesses || [],
        otherIllness: formData.otherIllness,
        hospitalizations: formData.hospitalizations || [],
        previousSurgeries: formData.previousSurgeries,
        surgeryDetails: formData.surgeryDetails,
        surgeryAge: formData.surgeryAge,

        // Medications and Allergies
        takesMedications: formData.takesMedications,
        medications: formData.medications || [],
        foodAllergies: formData.foodAllergies || [],
        otherFoodAllergy: formData.otherFoodAllergy,
        medicationAllergies: formData.medicationAllergies || [],
        otherMedicationAllergy: formData.otherMedicationAllergy,
        otherAllergies: formData.otherAllergies || [],
        otherAllergyDescription: formData.otherAllergyDescription,

        // Motor Development
        headControlAge: formData.headControlAge,
        sittingAge: formData.sittingAge,
        crawlingAge: formData.crawlingAge,
        walkingAge: formData.walkingAge,
        climbsStairs: formData.climbsStairs || false,
        balanceDifficulties: formData.balanceDifficulties,
        balanceDifficultyDetails: formData.balanceDifficultyDetails,
        fineMotorSkills: formData.fineMotorSkills || [],
        blockTowers: formData.blockTowers,
        fineMotorDifficulties: formData.fineMotorDifficulties,
        fineMotorDifficultyDetails: formData.fineMotorDifficultyDetails,

        // Language and Cognition
        firstWordsAge: formData.firstWordsAge,
        twoWordPhrasesAge: formData.twoWordPhrasesAge,
        completeSentences: formData.completeSentences || false,
        currentCommunication: formData.currentCommunication || [],
        otherCommunication: formData.otherCommunication,
        comprehension: formData.comprehension,
        followsSimpleInstructions: formData.followsSimpleInstructions || false,
        followsComplexInstructions:
          formData.followsComplexInstructions || false,
        respondsToName: formData.respondsToName || false,
        cognitiveDevelopment: formData.cognitiveDevelopment || [],
        learningDifficulties: formData.learningDifficulties,

        // Social and Emotional Development
        interactsWithChildren: formData.interactsWithChildren,
        interactionDetails: formData.interactionDetails,
        sharesToys: formData.sharesToys || false,
        expressesEmotions: formData.expressesEmotions || false,
        tantrums: formData.tantrums,
        tantrumFrequency: formData.tantrumFrequency,
        adaptsToChanges: formData.adaptsToChanges,
        repetitiveBehaviors: formData.repetitiveBehaviors,
        behaviorDetails: formData.behaviorDetails,
        feedingHabits: formData.feedingHabits || [],
        usesUtensils: formData.usesUtensils || false,
        sleepHabits: formData.sleepHabits || [],
        daytimeToiletControl: formData.daytimeToiletControl,
        nighttimeToiletControl: formData.nighttimeToiletControl,
        usesDiapers: formData.usesDiapers || false,
        diaperAge: formData.diaperAge,

        // Family Information
        livesWithWhom: formData.livesWithWhom,
        hasSiblings: formData.hasSiblings,
        numberOfSiblings: formData.numberOfSiblings,
        siblingsAges: formData.siblingsAges,
        familyEnvironment: formData.familyEnvironment,
        recentChanges: formData.recentChanges,
        typesOfChanges: formData.typesOfChanges || [],
        otherChange: formData.otherChange,
        changeDetails: formData.changeDetails,
        familyHistory: formData.familyHistory,
        familyHistoryDetails: formData.familyHistoryDetails,

        // System fields
        status: MedicalFormStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: medicalForm,
      message: "Formulario médico guardado exitosamente",
    });
  } catch (error) {
    console.error("Error saving medical form:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "ID de cita requerido" },
        { status: 400 }
      );
    }

    const medicalForm = await prisma.medicalForm.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          select: {
            patientName: true,
            date: true,
            startTime: true,
            therapist: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
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
