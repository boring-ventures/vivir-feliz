/*
  Warnings:

  - The values [USER,SUPERADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[national_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SpecialtyType" AS ENUM ('SPEECH_THERAPIST', 'OCCUPATIONAL_THERAPIST', 'PSYCHOPEDAGOGUE', 'ASD_THERAPIST', 'NEUROPSYCHOLOGIST', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('CONSULTA', 'ENTREVISTA', 'SEGUIMIENTO', 'TERAPIA');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'PARENT', 'THERAPIST');
ALTER TABLE "profiles" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "profiles" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'PARENT';
COMMIT;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "accept_whatsapp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "biography" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "national_id" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "specialty" "SpecialtyType",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'PARENT';

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "time_zone" TEXT NOT NULL DEFAULT 'America/La_Paz',
    "start_time" TEXT NOT NULL DEFAULT '08:00',
    "end_time" TEXT NOT NULL DEFAULT '18:00',
    "slot_duration" INTEGER NOT NULL DEFAULT 60,
    "break_between" INTEGER NOT NULL DEFAULT 15,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "appointment_types" "AppointmentType"[],
    "max_appointments" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_slots" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "reason" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocked_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "therapist_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_age" INTEGER,
    "parent_name" TEXT NOT NULL,
    "parent_phone" TEXT NOT NULL,
    "parent_email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "price" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedules_therapist_id_key" ON "schedules"("therapist_id");

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_schedule_id_day_of_week_start_time_key" ON "time_slots"("schedule_id", "day_of_week", "start_time");

-- CreateIndex
CREATE INDEX "appointments_therapist_id_idx" ON "appointments"("therapist_id");

-- CreateIndex
CREATE INDEX "appointments_date_idx" ON "appointments"("date");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_national_id_key" ON "profiles"("national_id");

-- CreateIndex
CREATE INDEX "profiles_national_id_idx" ON "profiles"("national_id");

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_slots" ADD CONSTRAINT "blocked_slots_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
