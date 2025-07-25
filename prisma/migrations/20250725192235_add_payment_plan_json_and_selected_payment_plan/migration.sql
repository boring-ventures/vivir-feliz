/*
  Warnings:

  - The `payment_plan` column on the `treatment_proposals` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "treatment_proposals" ADD COLUMN     "selected_payment_plan" TEXT,
DROP COLUMN "payment_plan",
ADD COLUMN     "payment_plan" JSONB;
