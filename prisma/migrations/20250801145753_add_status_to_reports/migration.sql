-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "progress_reports" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "therapeutic_plans" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT';
