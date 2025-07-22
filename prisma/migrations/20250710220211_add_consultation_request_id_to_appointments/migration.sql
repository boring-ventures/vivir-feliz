-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "consultation_request_id" TEXT;

-- CreateIndex
CREATE INDEX "appointments_consultation_request_id_idx" ON "appointments"("consultation_request_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_consultation_request_id_fkey" FOREIGN KEY ("consultation_request_id") REFERENCES "consultation_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
