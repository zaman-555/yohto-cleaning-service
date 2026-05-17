export type CalendarMonthRef = {
  year: number;
  month: number;
};

export function getCurrentCalendarMonth(): CalendarMonthRef {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function resolveMonthlyPageMonth(
  yearParam: string | undefined,
  monthParam: string | undefined
): CalendarMonthRef {
  const current = getCurrentCalendarMonth();
  if (!yearParam && !monthParam) {
    return current;
  }

  const year = Number(yearParam);
  const month = Number(monthParam);
  if (!Number.isFinite(year) || year < 1970 || year > 2100) {
    return current;
  }

  if (!Number.isFinite(month) || month < 1 || month > 12) {
    return { year, month: current.month };
  }

  return { year, month: Math.round(month) };
}

export function shiftCalendarMonth(ref: CalendarMonthRef, deltaMonths: number): CalendarMonthRef {
  const d = new Date(ref.year, ref.month - 1 + deltaMonths, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function monthlyPagePath(ref: CalendarMonthRef): string {
  return `/?year=${ref.year}&month=${ref.month}`;
}

export function formatCalendarMonthLabel(ref: CalendarMonthRef): string {
  const d = new Date(ref.year, ref.month - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function isSameCalendarMonth(a: CalendarMonthRef, b: CalendarMonthRef): boolean {
  return a.year === b.year && a.month === b.month;
}
