-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SpecialtyType" ADD VALUE 'PSYCHOMOTRICIAN';
ALTER TYPE "SpecialtyType" ADD VALUE 'PEDIATRIC_KINESIOLOGIST';
ALTER TYPE "SpecialtyType" ADD VALUE 'PSYCHOLOGIST';
ALTER TYPE "SpecialtyType" ADD VALUE 'COORDINATION_ASSISTANT';
ALTER TYPE "SpecialtyType" ADD VALUE 'BEHAVIORAL_THERAPIST';
