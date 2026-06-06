import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatCalendarWeekRange,
  getCurrentCalendarWeek,
  isSameCalendarWeek,
  shiftCalendarWeek,
  weeklyPagePath,
  type CalendarWeekRef,
} from "@/features/dashboard/week-utils";

type WeeklyWeekPaginationProps = {
  year: number;
  weekNumber: number;
};

export function WeeklyWeekPagination({ year, weekNumber }: WeeklyWeekPaginationProps) {
  const selected: CalendarWeekRef = { year, week: weekNumber };
  const current = getCurrentCalendarWeek();
  const isCurrentWeek = isSameCalendarWeek(selected, current);
  const prev = shiftCalendarWeek(selected, -1);
  const next = shiftCalendarWeek(selected, 1);
  const rangeLabel = formatCalendarWeekRange(selected);

  return (
    <nav
      aria-label="Week navigation"
      className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-4"
    >
      <div className="order-first flex flex-col items-center gap-0.5 text-center sm:order-2 sm:min-w-0 sm:flex-1 sm:px-2">
        <p className="text-sm font-semibold text-neutral-100">
          Week {weekNumber}
          <span className="font-normal text-neutral-400"> · {year}</span>
        </p>
        {rangeLabel ? (
          <p className="text-xs text-neutral-500">{rangeLabel}</p>
        ) : null}
        {isCurrentWeek ? (
          <span className="mt-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-indigo-300">
            Current week
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:contents">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="order-1 border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-800 sm:order-1"
        >
          <Link href={weeklyPagePath(prev)} prefetch>
            <ChevronLeft className="size-4" aria-hidden />
            Previous week
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="order-2 border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-800 sm:order-4"
        >
          <Link href={weeklyPagePath(next)} prefetch>
            Next week
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </Button>

        {!isCurrentWeek ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="order-3 basis-full justify-center border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-800 sm:order-3 sm:basis-auto"
          >
            <Link href={weeklyPagePath(current)} prefetch>
              Today
            </Link>
          </Button>
        ) : null}
      </div>
    </nav>
  );
}
