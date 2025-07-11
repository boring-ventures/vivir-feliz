import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to format date without timezone issues
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId: rawAppointmentId } = await params;

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

    // Fetch appointment with medical form and analysis
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        medicalForm: true,
        analysis: true,
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
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

    // Transform appointment data
    const appointmentData = {
      id: appointment.id,
      date: formatDateLocal(appointment.date),
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientName:
        appointment.patientName ||
        `${appointment.patient?.firstName} ${appointment.patient?.lastName}` ||
        "No especificado",
      patientAge: appointment.patientAge,
      parentName: appointment.parentName || "No especificado",
      parentPhone: appointment.parentPhone || "",
      parentEmail: appointment.parentEmail || "",
      notes: appointment.notes || "",
      status: appointment.status,
    };

    // Transform medical form data if exists
    const medicalFormData = appointment.medicalForm
      ? {
          // Basic Information
          basicInfo: {
            childName: appointment.medicalForm.childName,
            childBirthDate: appointment.medicalForm.childBirthDate
              .toISOString()
              .split("T")[0],
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
            currentCommunication: appointment.medicalForm.currentCommunication,
            otherCommunication: appointment.medicalForm.otherCommunication,
            comprehension: appointment.medicalForm.comprehension,
            followsSimpleInstructions:
              appointment.medicalForm.followsSimpleInstructions,
            followsComplexInstructions:
              appointment.medicalForm.followsComplexInstructions,
            respondsToName: appointment.medicalForm.respondsToName,
            cognitiveDevelopment: appointment.medicalForm.cognitiveDevelopment,
            learningDifficulties: appointment.medicalForm.learningDifficulties,
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
            daytimeToiletControl: appointment.medicalForm.daytimeToiletControl,
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
            familyHistoryDetails: appointment.medicalForm.familyHistoryDetails,
          },

          // System Info
          submittedAt: appointment.medicalForm.submittedAt,
          status: appointment.medicalForm.status,
        }
      : null;

    // Transform analysis data if exists
    const analysisData = appointment.analysis
      ? {
          id: appointment.analysis.id,
          presentation: appointment.analysis.presentation,
          disposition: appointment.analysis.disposition,
          eyeContact: appointment.analysis.eyeContact,
          activityLevel: appointment.analysis.activityLevel,
          sensoryEvaluation: appointment.analysis.sensoryEvaluation,
          generalBehavior: appointment.analysis.generalBehavior,
          psychologicalAnalysis: appointment.analysis.psychologicalAnalysis,
          cognitiveArea: appointment.analysis.cognitiveArea,
          learningArea: appointment.analysis.learningArea,
          schoolPerformance: appointment.analysis.schoolPerformance,
          languageAnalysis: appointment.analysis.languageAnalysis,
          motorAnalysis: appointment.analysis.motorAnalysis,
          additionalInformation: appointment.analysis.additionalInformation,
          generalObservations: appointment.analysis.generalObservations,
          diagnosticHypothesis: appointment.analysis.diagnosticHypothesis,
          recommendations: appointment.analysis.recommendations,
          treatmentPlan: appointment.analysis.treatmentPlan,
          followUpNeeded: appointment.analysis.followUpNeeded,
          status: appointment.analysis.status,
          completedAt: appointment.analysis.completedAt,
          sentToAdminAt: appointment.analysis.sentToAdminAt,
        }
      : null;

    const responseData = {
      appointment: appointmentData,
      medicalForm: medicalFormData,
      analysis: analysisData,
      patient: appointment.patient,
      therapist: appointment.therapist,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching medical form for analysis:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
