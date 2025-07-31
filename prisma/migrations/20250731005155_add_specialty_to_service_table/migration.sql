/*
  Warnings:

  - Added the required column `specialty` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "specialty" "SpecialtyType" NOT NULL;

-- CreateIndex
CREATE INDEX "services_specialty_idx" ON "services"("specialty");
