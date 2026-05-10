import type { TaskRecord } from "@/features/dashboard/types";

const pad2 = (n: number) => String(n).padStart(2, "0");

export function getDefaultTimeLocal(): string {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

export function localTimeFromIso(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function combineDateAndTime(
  year: number,
  month1to12: number,
  dayOfMonth: number,
  timeHHmm: string
): Date | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(timeHHmm.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return new Date(year, month1to12 - 1, dayOfMonth, hours, minutes, 0, 0);
}

export function taskCellKey(userId: number, dayOfMonth: number): string {
  return `${userId}-${dayOfMonth}`;
}

/** Keeps the latest task per user per calendar day (API returns newest first). */
export function tasksByUserAndDay(tasks: TaskRecord[]): Map<string, TaskRecord> {
  const map = new Map<string, TaskRecord>();
  for (const t of tasks) {
    const day = new Date(t.timestamp).getDate();
    const key = taskCellKey(t.userId, day);
    if (!map.has(key)) {
      map.set(key, t);
    }
  }
  return map;
}
