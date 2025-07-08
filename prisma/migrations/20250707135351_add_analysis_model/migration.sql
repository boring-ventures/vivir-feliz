/*
  Warnings:

  - The values [APPROVED] on the enum `MedicalFormStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('DRAFT', 'COMPLETED', 'SENT_TO_ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "MedicalFormStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');
ALTER TABLE "medical_forms" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "medical_forms" ALTER COLUMN "status" TYPE "MedicalFormStatus_new" USING ("status"::text::"MedicalFormStatus_new");
ALTER TYPE "MedicalFormStatus" RENAME TO "MedicalFormStatus_old";
ALTER TYPE "MedicalFormStatus_new" RENAME TO "MedicalFormStatus";
DROP TYPE "MedicalFormStatus_old";
ALTER TABLE "medical_forms" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "presentation" TEXT[],
    "disposition" TEXT[],
    "eye_contact" TEXT[],
    "activity_level" TEXT[],
    "sensory_evaluation" TEXT,
    "general_behavior" TEXT,
    "psychological_analysis" TEXT,
    "cognitive_area" TEXT,
    "learning_area" TEXT,
    "school_performance" TEXT,
    "language_analysis" TEXT,
    "motor_analysis" TEXT,
    "additional_information" TEXT,
    "general_observations" TEXT,
    "diagnostic_hypothesis" TEXT,
    "recommendations" TEXT,
    "treatment_plan" TEXT,
    "follow_up_needed" BOOLEAN NOT NULL DEFAULT false,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'DRAFT',
    "completed_at" TIMESTAMP(3),
    "sent_to_admin_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analyses_appointment_id_key" ON "analyses"("appointment_id");

-- CreateIndex
CREATE INDEX "analyses_appointment_id_idx" ON "analyses"("appointment_id");

-- CreateIndex
CREATE INDEX "analyses_status_idx" ON "analyses"("status");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
