-- DropForeignKey
ALTER TABLE "treatment_proposals" DROP CONSTRAINT "treatment_proposals_patient_id_fkey";

-- AlterTable
ALTER TABLE "treatment_proposals" ADD COLUMN     "consultation_request_id" TEXT,
ALTER COLUMN "patient_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "treatment_proposals_consultation_request_id_idx" ON "treatment_proposals"("consultation_request_id");

-- AddForeignKey
ALTER TABLE "treatment_proposals" ADD CONSTRAINT "treatment_proposals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_proposals" ADD CONSTRAINT "treatment_proposals_consultation_request_id_fkey" FOREIGN KEY ("consultation_request_id") REFERENCES "consultation_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
