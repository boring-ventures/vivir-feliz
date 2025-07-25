-- AlterTable
ALTER TABLE "proposal_services" ADD COLUMN     "proposal_type" TEXT NOT NULL DEFAULT 'A';

-- CreateIndex
CREATE INDEX "proposal_services_proposal_type_idx" ON "proposal_services"("proposal_type");
