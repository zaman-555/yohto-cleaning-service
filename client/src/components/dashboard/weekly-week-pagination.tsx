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
      className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-3"
    >
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-800"
      >
        <Link href={weeklyPagePath(prev)} prefetch>
          <ChevronLeft className="size-4" aria-hidden />
          Previous week
        </Link>
      </Button>

      <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 text-center">
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

      <div className="flex shrink-0 items-center gap-2">
        {!isCurrentWeek ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-800"
          >
            <Link href={weeklyPagePath(current)} prefetch>
              Today
            </Link>
          </Button>
        ) : null}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-800"
        >
          <Link href={weeklyPagePath(next)} prefetch>
            Next week
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
