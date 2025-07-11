-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('EVALUATION', 'TREATMENT');

-- CreateTable
CREATE TABLE "proposal_services" (
    "id" TEXT NOT NULL,
    "treatment_proposal_id" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "code" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL,
    "cost" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposal_services_treatment_proposal_id_idx" ON "proposal_services"("treatment_proposal_id");

-- CreateIndex
CREATE INDEX "proposal_services_type_idx" ON "proposal_services"("type");

-- AddForeignKey
ALTER TABLE "proposal_services" ADD CONSTRAINT "proposal_services_treatment_proposal_id_fkey" FOREIGN KEY ("treatment_proposal_id") REFERENCES "treatment_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
