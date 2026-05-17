-- DropIndex
DROP INDEX "task_timestamp_idx";

-- AlterTable
ALTER TABLE "task" ADD COLUMN "date" DATE;
ALTER TABLE "task" ADD COLUMN "shift" TEXT NOT NULL DEFAULT '09:00-17:00';

UPDATE "task" SET "date" = ("timestamp" AT TIME ZONE 'UTC')::date;

ALTER TABLE "task" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "task" DROP COLUMN "timestamp";

-- CreateIndex
CREATE INDEX "task_date_idx" ON "task"("date");
