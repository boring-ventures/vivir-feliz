/*
  Warnings:

  - A unique constraint covering the columns `[specialty_id]` on the table `specialties` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `specialty_id` to the `specialties` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "specialties_name_key";

-- AlterTable
ALTER TABLE "specialties" ADD COLUMN     "specialty_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "specialties_specialty_id_key" ON "specialties"("specialty_id");

-- CreateIndex
CREATE INDEX "specialties_specialty_id_idx" ON "specialties"("specialty_id");
