-- CreateTable
CREATE TABLE "therapist_report_contributions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "objectives" JSONB,
    "background" TEXT,
    "indicators" JSONB,
    "indicators_comment" TEXT,
    "conclusions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapist_report_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_reports" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "coordinator_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_date_of_birth" TIMESTAMP(3) NOT NULL,
    "patientAge" TEXT NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL,
    "general_objective" TEXT,
    "general_background" TEXT,
    "general_conclusions" TEXT,
    "other_objectives" JSONB,
    "therapist_backgrounds" JSONB,
    "therapist_progress" JSONB,
    "therapist_conclusions" JSONB,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "final_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "therapist_report_contributions_patient_id_idx" ON "therapist_report_contributions"("patient_id");

-- CreateIndex
CREATE INDEX "therapist_report_contributions_therapist_id_idx" ON "therapist_report_contributions"("therapist_id");

-- CreateIndex
CREATE INDEX "final_reports_patient_id_idx" ON "final_reports"("patient_id");

-- CreateIndex
CREATE INDEX "final_reports_coordinator_id_idx" ON "final_reports"("coordinator_id");

-- AddForeignKey
ALTER TABLE "therapist_report_contributions" ADD CONSTRAINT "therapist_report_contributions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_report_contributions" ADD CONSTRAINT "therapist_report_contributions_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_reports" ADD CONSTRAINT "final_reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_reports" ADD CONSTRAINT "final_reports_coordinator_id_fkey" FOREIGN KEY ("coordinator_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
