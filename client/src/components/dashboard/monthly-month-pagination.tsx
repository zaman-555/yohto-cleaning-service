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
      className="flex items-center justify-between gap-4"
    >
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-neutral-400 hover:bg-transparent hover:text-neutral-100"
      >
        <Link href={monthlyPagePath(prev)} prefetch aria-label="Previous month">
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
      </Button>

      <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
        <p className="text-sm font-semibold text-neutral-100">{monthLabel}</p>
        {isCurrentMonth ? (
          <span className="text-[0.65rem] font-medium uppercase tracking-wide text-indigo-300">
            Current month
          </span>
        ) : (
          <Link
            href={monthlyPagePath(current)}
            prefetch
            className="text-[0.65rem] font-medium uppercase tracking-wide text-neutral-500 hover:text-neutral-300"
          >
            Today
          </Link>
        )}
      </div>

      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-neutral-400 hover:bg-transparent hover:text-neutral-100"
      >
        <Link href={monthlyPagePath(next)} prefetch aria-label="Next month">
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      </Button>
    </nav>
  );
}
