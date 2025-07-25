/*
  Warnings:

  - Changed the type of `total_sessions` on the `treatment_proposals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `total_amount` on the `treatment_proposals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- First, add the new selected_proposal column
ALTER TABLE "treatment_proposals" ADD COLUMN "selected_proposal" TEXT;

-- Create temporary columns for the new JSON data
ALTER TABLE "treatment_proposals" ADD COLUMN "total_sessions_new" JSONB;
ALTER TABLE "treatment_proposals" ADD COLUMN "total_amount_new" JSONB;

-- Convert existing data to JSON format
-- For existing records, we'll set both A and B to the same values or defaults
UPDATE "treatment_proposals" 
SET 
  "total_sessions_new" = CASE 
    WHEN "total_sessions" IS NOT NULL THEN 
      jsonb_build_object('A', "total_sessions", 'B', "total_sessions")
    ELSE 
      jsonb_build_object('A', 0, 'B', 0)
  END,
  "total_amount_new" = CASE 
    WHEN "total_amount" IS NOT NULL THEN 
      jsonb_build_object('A', "total_amount", 'B', "total_amount")
    ELSE 
      jsonb_build_object('A', 0, 'B', 0)
  END;

-- Drop the old columns
ALTER TABLE "treatment_proposals" DROP COLUMN "total_sessions";
ALTER TABLE "treatment_proposals" DROP COLUMN "total_amount";

-- Rename the new columns to the original names
ALTER TABLE "treatment_proposals" RENAME COLUMN "total_sessions_new" TO "total_sessions";
ALTER TABLE "treatment_proposals" RENAME COLUMN "total_amount_new" TO "total_amount";

-- Make the columns NOT NULL
ALTER TABLE "treatment_proposals" ALTER COLUMN "total_sessions" SET NOT NULL;
ALTER TABLE "treatment_proposals" ALTER COLUMN "total_amount" SET NOT NULL;
