/*
  Warnings:

  - The `status` column on the `appointments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('NEW_PROPOSAL', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED', 'APPOINTMENTS_SCHEDULED', 'TREATMENT_ACTIVE', 'TREATMENT_COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "InterviewRequestStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConsultationRequestStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "attended_by" TEXT[],
ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "cancelled_by" TEXT,
ADD COLUMN     "homework" TEXT,
ADD COLUMN     "next_session_plan" TEXT,
ADD COLUMN     "patient_id" TEXT,
ADD COLUMN     "proposal_id" TEXT,
ADD COLUMN     "rescheduled_from" TIMESTAMP(3),
ADD COLUMN     "rescheduled_to" TIMESTAMP(3),
ADD COLUMN     "session_notes" TEXT,
ALTER COLUMN "patient_name" DROP NOT NULL,
ALTER COLUMN "parent_name" DROP NOT NULL,
ALTER COLUMN "parent_phone" DROP NOT NULL,
ALTER COLUMN "parent_email" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED';

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "national_id" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    "medical_history" TEXT,
    "special_needs" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_proposals" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "diagnosis" TEXT,
    "objectives" TEXT[],
    "methodology" TEXT,
    "total_sessions" INTEGER NOT NULL,
    "session_duration" INTEGER NOT NULL,
    "frequency" TEXT NOT NULL,
    "estimated_duration" TEXT,
    "session_price" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "payment_plan" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
    "proposal_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_date" TIMESTAMP(3),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "parent_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatment_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "reference_number" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "confirmed_by" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "notes" TEXT,
    "receipt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "record_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "appointment_id" TEXT,
    "record_date" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_requests" (
    "id" TEXT NOT NULL,
    "child_first_name" TEXT NOT NULL,
    "child_last_name" TEXT NOT NULL,
    "child_date_of_birth" TIMESTAMP(3) NOT NULL,
    "child_gender" TEXT NOT NULL,
    "parent_name" TEXT NOT NULL,
    "parent_phone" TEXT NOT NULL,
    "parent_email" TEXT NOT NULL,
    "school_name" TEXT NOT NULL,
    "derivation_description" TEXT NOT NULL,
    "derivation_file_url" TEXT,
    "status" "InterviewRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "scheduled_date" TIMESTAMP(3),
    "scheduled_time" TEXT,
    "assigned_therapist_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_requests" (
    "id" TEXT NOT NULL,
    "child_name" TEXT NOT NULL,
    "child_gender" TEXT NOT NULL,
    "child_date_of_birth" TIMESTAMP(3) NOT NULL,
    "child_lives_with" TEXT NOT NULL,
    "child_other_lives_with" TEXT,
    "child_address" TEXT NOT NULL,
    "mother_name" TEXT,
    "mother_age" TEXT,
    "mother_phone" TEXT,
    "mother_email" TEXT,
    "mother_education" TEXT,
    "mother_occupation" TEXT,
    "father_name" TEXT,
    "father_age" TEXT,
    "father_phone" TEXT,
    "father_email" TEXT,
    "father_education" TEXT,
    "father_occupation" TEXT,
    "school_name" TEXT,
    "school_phone" TEXT,
    "school_address" TEXT,
    "school_level" TEXT,
    "teacher_name" TEXT,
    "consultation_reasons" JSONB NOT NULL,
    "referred_by" TEXT,
    "status" "ConsultationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "scheduled_date" TIMESTAMP(3),
    "scheduled_time" TEXT,
    "assigned_therapist_id" TEXT,
    "price" DECIMAL(10,2) DEFAULT 250.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_children" (
    "id" TEXT NOT NULL,
    "consultation_request_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "school_grade" TEXT NOT NULL,
    "has_problems" BOOLEAN NOT NULL DEFAULT false,
    "problem_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_children_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_national_id_key" ON "patients"("national_id");

-- CreateIndex
CREATE INDEX "patients_parent_id_idx" ON "patients"("parent_id");

-- CreateIndex
CREATE INDEX "patients_national_id_idx" ON "patients"("national_id");

-- CreateIndex
CREATE INDEX "treatment_proposals_patient_id_idx" ON "treatment_proposals"("patient_id");

-- CreateIndex
CREATE INDEX "treatment_proposals_therapist_id_idx" ON "treatment_proposals"("therapist_id");

-- CreateIndex
CREATE INDEX "treatment_proposals_status_idx" ON "treatment_proposals"("status");

-- CreateIndex
CREATE INDEX "payments_proposal_id_idx" ON "payments"("proposal_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_idx" ON "medical_records"("patient_id");

-- CreateIndex
CREATE INDEX "medical_records_record_type_idx" ON "medical_records"("record_type");

-- CreateIndex
CREATE INDEX "interview_requests_status_idx" ON "interview_requests"("status");

-- CreateIndex
CREATE INDEX "interview_requests_parent_email_idx" ON "interview_requests"("parent_email");

-- CreateIndex
CREATE INDEX "interview_requests_assigned_therapist_id_idx" ON "interview_requests"("assigned_therapist_id");

-- CreateIndex
CREATE INDEX "consultation_requests_status_idx" ON "consultation_requests"("status");

-- CreateIndex
CREATE INDEX "consultation_requests_child_name_idx" ON "consultation_requests"("child_name");

-- CreateIndex
CREATE INDEX "consultation_requests_assigned_therapist_id_idx" ON "consultation_requests"("assigned_therapist_id");

-- CreateIndex
CREATE INDEX "consultation_children_consultation_request_id_idx" ON "consultation_children"("consultation_request_id");

-- CreateIndex
CREATE INDEX "appointments_patient_id_idx" ON "appointments"("patient_id");

-- CreateIndex
CREATE INDEX "appointments_proposal_id_idx" ON "appointments"("proposal_id");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_proposals" ADD CONSTRAINT "treatment_proposals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_proposals" ADD CONSTRAINT "treatment_proposals_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "treatment_proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "treatment_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_assigned_therapist_id_fkey" FOREIGN KEY ("assigned_therapist_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_assigned_therapist_id_fkey" FOREIGN KEY ("assigned_therapist_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_children" ADD CONSTRAINT "consultation_children_consultation_request_id_fkey" FOREIGN KEY ("consultation_request_id") REFERENCES "consultation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
