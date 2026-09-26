CREATE TABLE "schedule_month_visibility" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_month_visibility_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "schedule_month_visibility_year_month_key"
ON "schedule_month_visibility"("year", "month");
