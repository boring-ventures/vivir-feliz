-- CreateTable
CREATE TABLE "progress_reports" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_date_of_birth" TIMESTAMP(3) NOT NULL,
    "patientAge" TEXT NOT NULL,
    "school" TEXT,
    "grade" TEXT,
    "report_date" TIMESTAMP(3) NOT NULL,
    "treatment_area" TEXT NOT NULL,
    "diagnoses" JSONB,
    "general_objective" TEXT,
    "specific_objectives" JSONB,
    "indicators" JSONB,
    "progress_entries" JSONB,
    "recommendations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_reports_patient_id_idx" ON "progress_reports"("patient_id");

-- CreateIndex
CREATE INDEX "progress_reports_therapist_id_idx" ON "progress_reports"("therapist_id");

-- AddForeignKey
ALTER TABLE "progress_reports" ADD CONSTRAINT "progress_reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_reports" ADD CONSTRAINT "progress_reports_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
