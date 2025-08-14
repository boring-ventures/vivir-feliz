/*
  Warnings:

  - You are about to drop the column `specialty` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `services` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "services_specialty_idx";

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "specialty",
ADD COLUMN     "specialty_id" TEXT;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "specialty",
ADD COLUMN     "specialty_id" TEXT;

-- DropEnum
DROP TYPE "SpecialtyType";

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialties_name_key" ON "specialties"("name");

-- CreateIndex
CREATE INDEX "specialties_name_idx" ON "specialties"("name");

-- CreateIndex
CREATE INDEX "specialties_is_active_idx" ON "specialties"("is_active");

-- CreateIndex
CREATE INDEX "profiles_specialty_id_idx" ON "profiles"("specialty_id");

-- CreateIndex
CREATE INDEX "services_specialty_id_idx" ON "services"("specialty_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
