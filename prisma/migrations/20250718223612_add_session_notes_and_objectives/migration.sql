-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'PAUSED', 'CANCELLED', 'PENDING');

-- CreateTable
CREATE TABLE "therapist_patients" (
    "id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "therapist_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_notes" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "session_comment" TEXT NOT NULL,
    "parent_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_objectives" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "proposal_id" TEXT,
    "name" TEXT NOT NULL,
    "status" "ObjectiveStatus" NOT NULL DEFAULT 'PENDING',
    "type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objective_progress" (
    "id" TEXT NOT NULL,
    "objective_id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objective_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "therapist_patients_patient_id_idx" ON "therapist_patients"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "therapist_patients_therapist_id_patient_id_key" ON "therapist_patients"("therapist_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_notes_appointment_id_key" ON "session_notes"("appointment_id");

-- CreateIndex
CREATE INDEX "session_notes_appointment_id_idx" ON "session_notes"("appointment_id");

-- CreateIndex
CREATE INDEX "session_notes_therapist_id_idx" ON "session_notes"("therapist_id");

-- CreateIndex
CREATE INDEX "patient_objectives_patient_id_idx" ON "patient_objectives"("patient_id");

-- CreateIndex
CREATE INDEX "patient_objectives_therapist_id_idx" ON "patient_objectives"("therapist_id");

-- CreateIndex
CREATE INDEX "patient_objectives_proposal_id_idx" ON "patient_objectives"("proposal_id");

-- CreateIndex
CREATE INDEX "patient_objectives_status_idx" ON "patient_objectives"("status");

-- CreateIndex
CREATE INDEX "objective_progress_objective_id_idx" ON "objective_progress"("objective_id");

-- CreateIndex
CREATE INDEX "objective_progress_appointment_id_idx" ON "objective_progress"("appointment_id");

-- CreateIndex
CREATE INDEX "objective_progress_therapist_id_idx" ON "objective_progress"("therapist_id");

-- CreateIndex
CREATE UNIQUE INDEX "objective_progress_objective_id_appointment_id_key" ON "objective_progress"("objective_id", "appointment_id");

-- AddForeignKey
ALTER TABLE "therapist_patients" ADD CONSTRAINT "therapist_patients_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_patients" ADD CONSTRAINT "therapist_patients_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_objectives" ADD CONSTRAINT "patient_objectives_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_objectives" ADD CONSTRAINT "patient_objectives_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_objectives" ADD CONSTRAINT "patient_objectives_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "treatment_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_progress" ADD CONSTRAINT "objective_progress_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "patient_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_progress" ADD CONSTRAINT "objective_progress_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_progress" ADD CONSTRAINT "objective_progress_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
