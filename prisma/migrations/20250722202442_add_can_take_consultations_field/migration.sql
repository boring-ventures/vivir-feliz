-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "can_take_consultations" DROP NOT NULL,
ALTER COLUMN "can_take_consultations" DROP DEFAULT;
