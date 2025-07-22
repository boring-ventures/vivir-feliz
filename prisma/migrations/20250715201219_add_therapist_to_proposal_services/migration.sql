/*
  Warnings:

  - Added the required column `therapist_id` to the `proposal_services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "proposal_services" ADD COLUMN     "therapist_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "treatment_proposals" ALTER COLUMN "status" SET DEFAULT 'NEW_PROPOSAL';

-- CreateIndex
CREATE INDEX "proposal_services_therapist_id_idx" ON "proposal_services"("therapist_id");

-- AddForeignKey
ALTER TABLE "proposal_services" ADD CONSTRAINT "proposal_services_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
