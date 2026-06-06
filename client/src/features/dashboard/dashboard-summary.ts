import type { TaskRecord, User } from "./types";
import { getCalendarWeekNumber } from "./week-utils";

export type DashboardUserSummaries = {
  monthlySumByUserId: Map<number, number>;
  weeklyAverageByUserId: Map<number, number>;
  /** Sum of all users' hours per calendar day (day of month). */
  dailyTotalHoursByDay: Map<number, number>;
  /** Sum of all users' monthly hours. */
  grandMonthlyTotalHours: number;
  /** Sum of each user's average h/week. */
  grandWeeklyAverageTotalHours: number;
};

function shiftDurationHours(shift: string): number {
  const match = /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/.exec(shift.trim());
  if (!match) {
    return 0;
  }
  const startH = Number(match[1]);
  const startM = Number(match[2]);
  const endH = Number(match[3]);
  const endM = Number(match[4]);
  if (
    !Number.isFinite(startH) ||
    !Number.isFinite(startM) ||
    !Number.isFinite(endH) ||
    !Number.isFinite(endM)
  ) {
    return 0;
  }
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  return (endMinutes - startMinutes) / 60;
}

function taskMatchesMonth(task: TaskRecord, year: number, month: number): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(task.date);
  if (!match) {
    return false;
  }
  return Number(match[1]) === year && Number(match[2]) === month;
}

export function computeDashboardUserSummaries(
  tasks: TaskRecord[],
  users: User[],
  year: number,
  month: number
): DashboardUserSummaries {
  const monthlySumByUserId = new Map<number, number>();
  const weeklyTotalsByUser = new Map<number, Map<number, number>>();
  const dailyTotalHoursByDay = new Map<number, number>();

  const approvedUserIds = new Set<number>();
  for (const user of users) {
    approvedUserIds.add(user.id);
    monthlySumByUserId.set(user.id, 0);
    weeklyTotalsByUser.set(user.id, new Map());
  }

  for (const task of tasks) {
    if (!approvedUserIds.has(task.userId)) {
      continue;
    }
    if (!taskMatchesMonth(task, year, month)) {
      continue;
    }
    const hours = shiftDurationHours(task.shift);
    const userId = task.userId;

    monthlySumByUserId.set(userId, (monthlySumByUserId.get(userId) ?? 0) + hours);

    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(task.date);
    if (!dateMatch) {
      continue;
    }
    const y = Number(dateMatch[1]);
    const m = Number(dateMatch[2]) - 1;
    const d = Number(dateMatch[3]);
    dailyTotalHoursByDay.set(d, (dailyTotalHoursByDay.get(d) ?? 0) + hours);
    const week = getCalendarWeekNumber(new Date(y, m, d));

    const byWeek = weeklyTotalsByUser.get(userId) ?? new Map();
    byWeek.set(week, (byWeek.get(week) ?? 0) + hours);
    weeklyTotalsByUser.set(userId, byWeek);
  }

  const weeklyAverageByUserId = new Map<number, number>();
  for (const user of users) {
    const byWeek = weeklyTotalsByUser.get(user.id);
    if (!byWeek || byWeek.size === 0) {
      weeklyAverageByUserId.set(user.id, 0);
      continue;
    }
    let weekSum = 0;
    for (const total of byWeek.values()) {
      weekSum += total;
    }
    weeklyAverageByUserId.set(user.id, weekSum / byWeek.size);
  }

  let grandMonthlyTotalHours = 0;
  for (const total of monthlySumByUserId.values()) {
    grandMonthlyTotalHours += total;
  }

  let grandWeeklyAverageTotalHours = 0;
  for (const avg of weeklyAverageByUserId.values()) {
    grandWeeklyAverageTotalHours += avg;
  }

  return {
    monthlySumByUserId,
    weeklyAverageByUserId,
    dailyTotalHoursByDay,
    grandMonthlyTotalHours,
    grandWeeklyAverageTotalHours,
  };
}

export function formatSummaryHours(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", ",");
}
