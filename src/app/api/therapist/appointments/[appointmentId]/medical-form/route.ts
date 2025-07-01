import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { appointmentId } = resolvedParams;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "ID de cita requerido" },
        { status: 400 }
      );
    }

    // Fetch appointment with related medical form data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        medicalForm: true,
        patient: {
          select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            allergies: true,
            medications: true,
            medicalHistory: true,
            specialNeeds: true,
          },
        },
        therapist: {
          select: {
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Transform the data for easier use in the frontend
    const analysisData = {
      appointment: {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        patientName: appointment.patientName,
        patientAge: appointment.patientAge,
        parentName: appointment.parentName,
        parentPhone: appointment.parentPhone,
        parentEmail: appointment.parentEmail,
        notes: appointment.notes,
        status: appointment.status,
      },
      patient: appointment.patient,
      therapist: appointment.therapist,
      medicalForm: appointment.medicalForm
        ? {
            // Basic Information
            basicInfo: {
              childName: appointment.medicalForm.childName,
              childBirthDate: appointment.medicalForm.childBirthDate,
              childAgeYears: appointment.medicalForm.childAgeYears,
              childAgeMonths: appointment.medicalForm.childAgeMonths,
            },

            // Perinatal History
            perinatalHistory: {
              pregnancyType: appointment.medicalForm.pregnancyType,
              prematureWeeks: appointment.medicalForm.prematureWeeks,
              postTermWeeks: appointment.medicalForm.postTermWeeks,
              pregnancyComplications:
                appointment.medicalForm.pregnancyComplications,
              deliveryType: appointment.medicalForm.deliveryType,
              cesareanReason: appointment.medicalForm.cesareanReason,
              birthWeight: appointment.medicalForm.birthWeight,
              birthHeight: appointment.medicalForm.birthHeight,
              deliveryComplications:
                appointment.medicalForm.deliveryComplications,
              complicationDetails: appointment.medicalForm.complicationDetails,
              specialCare: appointment.medicalForm.specialCare,
              hospitalizationDays: appointment.medicalForm.hospitalizationDays,
              hospitalizationReason:
                appointment.medicalForm.hospitalizationReason,
            },

            // Medical History
            medicalHistory: {
              importantIllnesses: appointment.medicalForm.importantIllnesses,
              otherIllness: appointment.medicalForm.otherIllness,
              hospitalizations: appointment.medicalForm.hospitalizations,
              previousSurgeries: appointment.medicalForm.previousSurgeries,
              surgeryDetails: appointment.medicalForm.surgeryDetails,
              surgeryAge: appointment.medicalForm.surgeryAge,
            },

            // Medications and Allergies
            medicationsAllergies: {
              takesMedications: appointment.medicalForm.takesMedications,
              medications: appointment.medicalForm.medications,
              foodAllergies: appointment.medicalForm.foodAllergies,
              otherFoodAllergy: appointment.medicalForm.otherFoodAllergy,
              medicationAllergies: appointment.medicalForm.medicationAllergies,
              otherMedicationAllergy:
                appointment.medicalForm.otherMedicationAllergy,
              otherAllergies: appointment.medicalForm.otherAllergies,
              otherAllergyDescription:
                appointment.medicalForm.otherAllergyDescription,
            },

            // Motor Development
            motorDevelopment: {
              headControlAge: appointment.medicalForm.headControlAge,
              sittingAge: appointment.medicalForm.sittingAge,
              crawlingAge: appointment.medicalForm.crawlingAge,
              walkingAge: appointment.medicalForm.walkingAge,
              climbsStairs: appointment.medicalForm.climbsStairs,
              balanceDifficulties: appointment.medicalForm.balanceDifficulties,
              balanceDifficultyDetails:
                appointment.medicalForm.balanceDifficultyDetails,
              fineMotorSkills: appointment.medicalForm.fineMotorSkills,
              blockTowers: appointment.medicalForm.blockTowers,
              fineMotorDifficulties:
                appointment.medicalForm.fineMotorDifficulties,
              fineMotorDifficultyDetails:
                appointment.medicalForm.fineMotorDifficultyDetails,
            },

            // Language and Cognition
            languageCognition: {
              firstWordsAge: appointment.medicalForm.firstWordsAge,
              twoWordPhrasesAge: appointment.medicalForm.twoWordPhrasesAge,
              completeSentences: appointment.medicalForm.completeSentences,
              currentCommunication:
                appointment.medicalForm.currentCommunication,
              otherCommunication: appointment.medicalForm.otherCommunication,
              comprehension: appointment.medicalForm.comprehension,
              followsSimpleInstructions:
                appointment.medicalForm.followsSimpleInstructions,
              followsComplexInstructions:
                appointment.medicalForm.followsComplexInstructions,
              respondsToName: appointment.medicalForm.respondsToName,
              cognitiveDevelopment:
                appointment.medicalForm.cognitiveDevelopment,
              learningDifficulties:
                appointment.medicalForm.learningDifficulties,
            },

            // Social and Emotional Development
            socialEmotional: {
              interactsWithChildren:
                appointment.medicalForm.interactsWithChildren,
              interactionDetails: appointment.medicalForm.interactionDetails,
              sharesToys: appointment.medicalForm.sharesToys,
              expressesEmotions: appointment.medicalForm.expressesEmotions,
              tantrums: appointment.medicalForm.tantrums,
              tantrumFrequency: appointment.medicalForm.tantrumFrequency,
              adaptsToChanges: appointment.medicalForm.adaptsToChanges,
              repetitiveBehaviors: appointment.medicalForm.repetitiveBehaviors,
              behaviorDetails: appointment.medicalForm.behaviorDetails,
              feedingHabits: appointment.medicalForm.feedingHabits,
              usesUtensils: appointment.medicalForm.usesUtensils,
              sleepHabits: appointment.medicalForm.sleepHabits,
              daytimeToiletControl:
                appointment.medicalForm.daytimeToiletControl,
              nighttimeToiletControl:
                appointment.medicalForm.nighttimeToiletControl,
              usesDiapers: appointment.medicalForm.usesDiapers,
              diaperAge: appointment.medicalForm.diaperAge,
            },

            // Family Information
            familyInfo: {
              livesWithWhom: appointment.medicalForm.livesWithWhom,
              hasSiblings: appointment.medicalForm.hasSiblings,
              numberOfSiblings: appointment.medicalForm.numberOfSiblings,
              siblingsAges: appointment.medicalForm.siblingsAges,
              familyEnvironment: appointment.medicalForm.familyEnvironment,
              recentChanges: appointment.medicalForm.recentChanges,
              typesOfChanges: appointment.medicalForm.typesOfChanges,
              otherChange: appointment.medicalForm.otherChange,
              changeDetails: appointment.medicalForm.changeDetails,
              familyHistory: appointment.medicalForm.familyHistory,
              familyHistoryDetails:
                appointment.medicalForm.familyHistoryDetails,
            },

            // System Info
            submittedAt: appointment.medicalForm.submittedAt,
            status: appointment.medicalForm.status,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: analysisData,
    });
  } catch (error) {
    console.error("Error fetching medical form for analysis:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
