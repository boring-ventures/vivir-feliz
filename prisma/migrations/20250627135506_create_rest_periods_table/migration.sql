/*
  Warnings:

  - You are about to drop the column `rest_end_time` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `rest_start_time` on the `time_slots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "time_slots" DROP COLUMN "rest_end_time",
DROP COLUMN "rest_start_time";

-- CreateTable
CREATE TABLE "rest_periods" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rest_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rest_periods_schedule_id_day_of_week_start_time_key" ON "rest_periods"("schedule_id", "day_of_week", "start_time");

-- AddForeignKey
ALTER TABLE "rest_periods" ADD CONSTRAINT "rest_periods_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
