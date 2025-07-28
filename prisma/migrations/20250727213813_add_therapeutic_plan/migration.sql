-- CreateTable
CREATE TABLE "therapeutic_plans" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_date_of_birth" TIMESTAMP(3) NOT NULL,
    "patientAge" TEXT NOT NULL,
    "school" TEXT,
    "grade" TEXT,
    "objectives_date" TIMESTAMP(3),
    "planning" TEXT,
    "treatment_area" TEXT NOT NULL,
    "frequency" TEXT,
    "therapy_start_date" TIMESTAMP(3),
    "background" TEXT,
    "diagnoses" JSONB,
    "general_objective" TEXT,
    "specific_objectives" JSONB,
    "indicators" JSONB,
    "methodologies" JSONB,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapeutic_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "therapeutic_plans_patient_id_idx" ON "therapeutic_plans"("patient_id");

-- CreateIndex
CREATE INDEX "therapeutic_plans_therapist_id_idx" ON "therapeutic_plans"("therapist_id");

-- AddForeignKey
ALTER TABLE "therapeutic_plans" ADD CONSTRAINT "therapeutic_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapeutic_plans" ADD CONSTRAINT "therapeutic_plans_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
