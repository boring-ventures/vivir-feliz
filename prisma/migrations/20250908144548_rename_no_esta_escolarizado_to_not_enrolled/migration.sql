/*
  Warnings:

  - You are about to drop the column `no_esta_escolarizado` on the `consultation_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "consultation_requests" DROP COLUMN "no_esta_escolarizado",
ADD COLUMN     "not_enrolled" BOOLEAN NOT NULL DEFAULT false;
