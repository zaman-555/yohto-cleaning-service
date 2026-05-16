-- Encode year+week into rowKey; drop redundant columns.
DROP INDEX IF EXISTS "task_details_year_weekNumber_rowKey_columnKey_key";

UPDATE "task_details"
SET "rowKey" = "year"::text || '-w' || "weekNumber"::text || '-' || regexp_replace("rowKey", '^w[0-9]+-', '')
WHERE "rowKey" ~ '^w[0-9]+';

ALTER TABLE "task_details" DROP COLUMN "year";
ALTER TABLE "task_details" DROP COLUMN "weekNumber";
ALTER TABLE "task_details" DROP COLUMN "type";

CREATE UNIQUE INDEX "task_details_rowKey_columnKey_key" ON "task_details"("rowKey", "columnKey");
