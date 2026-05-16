-- Reshape task_details for per-cell upsert (year, week, row, column).
TRUNCATE TABLE "task_details";

ALTER TABLE "task_details" ADD COLUMN "year" INTEGER NOT NULL DEFAULT 2026;
ALTER TABLE "task_details" ADD COLUMN "weekNumber" INTEGER NOT NULL DEFAULT 18;
ALTER TABLE "task_details" ADD COLUMN "rowKey" TEXT NOT NULL DEFAULT '__row__';
ALTER TABLE "task_details" ADD COLUMN "columnKey" TEXT NOT NULL DEFAULT '__col__';

CREATE UNIQUE INDEX "task_details_year_weekNumber_rowKey_columnKey_key" ON "task_details"("year", "weekNumber", "rowKey", "columnKey");

ALTER TABLE "task_details" ALTER COLUMN "year" DROP DEFAULT;
ALTER TABLE "task_details" ALTER COLUMN "weekNumber" DROP DEFAULT;
ALTER TABLE "task_details" ALTER COLUMN "rowKey" DROP DEFAULT;
ALTER TABLE "task_details" ALTER COLUMN "columnKey" DROP DEFAULT;
