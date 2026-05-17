import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatCalendarMonthLabel,
  getCurrentCalendarMonth,
  isSameCalendarMonth,
  monthlyPagePath,
  shiftCalendarMonth,
  type CalendarMonthRef,
} from "@/features/dashboard/month-utils";

type MonthlyMonthPaginationProps = {
  year: number;
  monthNumber: number;
};

export function MonthlyMonthPagination({ year, monthNumber }: MonthlyMonthPaginationProps) {
  const selected: CalendarMonthRef = { year, month: monthNumber };
  const current = getCurrentCalendarMonth();
  const isCurrentMonth = isSameCalendarMonth(selected, current);
  const prev = shiftCalendarMonth(selected, -1);
  const next = shiftCalendarMonth(selected, 1);
  const monthLabel = formatCalendarMonthLabel(selected);

  return (
    <nav
      aria-label="Month navigation"
      className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-3"
    >
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-800"
      >
        <Link href={monthlyPagePath(prev)} prefetch>
          <ChevronLeft className="size-4" aria-hidden />
          Previous month
        </Link>
      </Button>

      <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 text-center">
        <p className="text-sm font-semibold text-neutral-100">{monthLabel}</p>
        {isCurrentMonth ? (
          <span className="mt-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-indigo-300">
            Current month
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!isCurrentMonth ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-800"
          >
            <Link href={monthlyPagePath(current)} prefetch>
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
          <Link href={monthlyPagePath(next)} prefetch>
            Next month
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
