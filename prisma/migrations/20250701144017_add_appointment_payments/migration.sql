-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_proposal_id_fkey";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "appointment_id" TEXT,
ADD COLUMN     "consultation_request_id" TEXT,
ADD COLUMN     "interview_request_id" TEXT,
ADD COLUMN     "receipt_image_url" TEXT,
ALTER COLUMN "proposal_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "payments_appointment_id_idx" ON "payments"("appointment_id");

-- CreateIndex
CREATE INDEX "payments_consultation_request_id_idx" ON "payments"("consultation_request_id");

-- CreateIndex
CREATE INDEX "payments_interview_request_id_idx" ON "payments"("interview_request_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "treatment_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_consultation_request_id_fkey" FOREIGN KEY ("consultation_request_id") REFERENCES "consultation_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_interview_request_id_fkey" FOREIGN KEY ("interview_request_id") REFERENCES "interview_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
