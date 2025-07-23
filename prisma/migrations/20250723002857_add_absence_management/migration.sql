-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "absence_reason" TEXT,
ADD COLUMN     "marked_absent_at" TIMESTAMP(3),
ADD COLUMN     "marked_absent_by" TEXT;
