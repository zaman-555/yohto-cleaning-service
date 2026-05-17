/** Same week index as the main dashboard grid (`table-data`). */
export function getCalendarWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export type CalendarWeekRef = {
  year: number;
  week: number;
};

export function getCurrentCalendarWeek(): CalendarWeekRef {
  const now = new Date();
  return { year: now.getFullYear(), week: getCalendarWeekNumber(now) };
}

export function getMaxCalendarWeekInYear(year: number): number {
  for (let day = 31; day >= 28; day--) {
    const d = new Date(year, 11, day);
    if (d.getMonth() === 11) {
      return getCalendarWeekNumber(d);
    }
  }
  return 52;
}

/** Dates in `year` that belong to calendar week `weekNum` (same rules as server). */
export function collectDatesInCalendarWeek(year: number, weekNum: number): Date[] {
  const out: Date[] = [];
  for (let m = 0; m < 12; m++) {
    const dim = new Date(year, m + 1, 0).getDate();
    for (let day = 1; day <= dim; day++) {
      const date = new Date(year, m, day);
      if (getCalendarWeekNumber(date) === weekNum) {
        out.push(date);
      }
    }
  }
  return out.sort((a, b) => a.getTime() - b.getTime());
}

export function resolveWeeklyPageWeek(
  yearParam: string | undefined,
  weekParam: string | undefined
): CalendarWeekRef {
  const current = getCurrentCalendarWeek();
  if (!yearParam && !weekParam) {
    return current;
  }

  const year = Number(yearParam);
  const week = Number(weekParam);
  if (!Number.isFinite(year) || year < 1970 || year > 2100) {
    return current;
  }

  const maxWeek = getMaxCalendarWeekInYear(year);
  if (!Number.isFinite(week) || week < 1) {
    return { year, week: Math.min(current.week, maxWeek) };
  }

  return { year, week: Math.min(Math.round(week), maxWeek) };
}

export function shiftCalendarWeek(ref: CalendarWeekRef, deltaWeeks: number): CalendarWeekRef {
  const dates = collectDatesInCalendarWeek(ref.year, ref.week);
  const anchor = dates[0] ?? new Date(ref.year, 0, 1);
  const shifted = new Date(anchor);
  shifted.setDate(shifted.getDate() + deltaWeeks * 7);
  return { year: shifted.getFullYear(), week: getCalendarWeekNumber(shifted) };
}

export function weeklyPagePath(ref: CalendarWeekRef): string {
  return `/weekly?year=${ref.year}&week=${ref.week}`;
}

export function formatCalendarWeekRange(ref: CalendarWeekRef): string | null {
  const dates = collectDatesInCalendarWeek(ref.year, ref.week);
  if (dates.length === 0) return null;

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
}

export function isSameCalendarWeek(a: CalendarWeekRef, b: CalendarWeekRef): boolean {
  return a.year === b.year && a.week === b.week;
}
