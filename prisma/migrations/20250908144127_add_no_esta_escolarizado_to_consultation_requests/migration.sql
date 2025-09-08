/*
  Warnings:

  - You are about to drop the column `no_esta_escolarizado` on the `consultation_children` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "consultation_children" DROP COLUMN "no_esta_escolarizado";

-- AlterTable
ALTER TABLE "consultation_requests" ADD COLUMN     "no_esta_escolarizado" BOOLEAN NOT NULL DEFAULT false;
