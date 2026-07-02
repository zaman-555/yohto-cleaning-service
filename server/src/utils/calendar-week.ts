/** Same week index as the dashboard client (`week-utils`). */
export function getCalendarWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

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

function parseDayOfWeek(label: string): number | null {
  const s = label
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, '');
  const map: Record<string, number> = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    tues: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    thur: 4,
    thurs: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };
  if (map[s] !== undefined) {
    return map[s];
  }
  const first = s.split(/\s+/)[0] ?? '';
  return map[first] ?? null;
}

/** Strip assigned user names from a `weekdayDate` cell (client uses ` · `). */
function stripWeekdayDateUserSuffix(label: string): string {
  const sep = ' · ';
  const idx = label.indexOf(sep);
  if (idx === -1) {
    return label;
  }
  return label.slice(0, idx).trim();
}

export function resolveTaskDetailDate(
  year: number,
  weekNum: number,
  weekdayLabel: string,
): { date: Date } | { error: string } {
  const trimmed = stripWeekdayDateUserSuffix(weekdayLabel.trim());
  if (!trimmed || trimmed === '—') {
    return {
      error:
        'Weekday / date is empty. Set that column first (e.g. Mon or 2026-05-06), then save other cells.',
    };
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) {
    const y = Number(iso[1]);
    const mo = Number(iso[2]);
    const day = Number(iso[3]);
    const date = new Date(y, mo - 1, day, 12, 0, 0, 0);
    if (Number.isNaN(date.getTime())) {
      return { error: 'Invalid calendar date in Weekday / date.' };
    }
    if (getCalendarWeekNumber(date) !== weekNum || date.getFullYear() !== year) {
      return {
        error: `That date is not in week ${weekNum} of ${year}.`,
      };
    }
    return { date };
  }

  const dow = parseDayOfWeek(trimmed);
  if (dow === null) {
    return {
      error:
        'Could not read weekday. Use Mon–Sun, a weekday name, or yyyy-mm-dd in Weekday / date.',
    };
  }

  const candidates = collectDatesInCalendarWeek(year, weekNum);
  if (candidates.length === 0) {
    return { error: `No dates found for week ${weekNum} in ${year}.` };
  }

  const match = candidates.find((d) => d.getDay() === dow);
  if (!match) {
    return { error: `No ${trimmed} in calendar week ${weekNum} for ${year}.` };
  }

  return {
    date: new Date(match.getFullYear(), match.getMonth(), match.getDate(), 12, 0, 0, 0),
  };
}
