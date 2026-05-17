import type { TaskRecord } from "@/features/dashboard/types";

const pad2 = (n: number) => String(n).padStart(2, "0");

export type TimeRange = {
  start: string;
  end: string;
};

export const DEFAULT_SHIFT_RANGE: TimeRange = {
  start: "09:00",
  end: "17:00",
};

export function formatShift(range: TimeRange): string {
  return `${range.start}-${range.end}`;
}

export function parseShift(shift: string): TimeRange | null {
  const match = /^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/.exec(shift.trim());
  if (!match) {
    return null;
  }
  return { start: match[1], end: match[2] };
}

export function formatShiftLabel(shift: string): string {
  const parsed = parseShift(shift);
  if (!parsed) {
    return shift;
  }
  return `${parsed.start} – ${parsed.end}`;
}

export function calendarDateIso(
  year: number,
  month1to12: number,
  dayOfMonth: number
): string {
  return `${year}-${pad2(month1to12)}-${pad2(dayOfMonth)}`;
}

export function dayFromDateIso(iso: string): number {
  const day = Number(iso.slice(8, 10));
  return Number.isFinite(day) ? day : 0;
}

export function taskCellKey(userId: number, dayOfMonth: number): string {
  return `${userId}-${dayOfMonth}`;
}

/** Keeps the latest task per user per calendar day (API returns newest first). */
export function tasksByUserAndDay(tasks: TaskRecord[]): Map<string, TaskRecord> {
  const map = new Map<string, TaskRecord>();
  for (const t of tasks) {
    const day = dayFromDateIso(t.date);
    const key = taskCellKey(t.userId, day);
    if (!map.has(key)) {
      map.set(key, t);
    }
  }
  return map;
}
