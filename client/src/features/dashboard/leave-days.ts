export type LeaveDayRecord = {
  userId: number;
  date: string;
  transportType: string;
};

/** Yearly day counts on Staff KPI. Unpaid off is not included. */
export const KPI_LEAVE_DAY_TYPES = ["Paid Holiday", "Sick leave", "Vacation"] as const;

export type LeaveDayCount = {
  paidHoliday: number;
  sickLeave: number;
  vacation: number;
};

export function emptyLeaveDayCount(): LeaveDayCount {
  return { paidHoliday: 0, sickLeave: 0, vacation: 0 };
}

export function leaveDayTotal(count: LeaveDayCount): number {
  return count.paidHoliday + count.sickLeave + count.vacation;
}

/** Each staff member + calendar date + status counts as one day. */
export function countLeaveDaysByUser(
  tasks: { userId: number; date: string; transportType: string }[]
): Map<number, LeaveDayCount> {
  const seen = new Set<string>();
  const map = new Map<number, LeaveDayCount>();

  for (const task of tasks) {
    const date = task.date.slice(0, 10);
    const key = `${task.userId}|${date}|${task.transportType}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const current = map.get(task.userId) ?? emptyLeaveDayCount();
    if (task.transportType === "Paid Holiday") {
      current.paidHoliday += 1;
    } else if (task.transportType === "Sick leave") {
      current.sickLeave += 1;
    } else if (task.transportType === "Vacation") {
      current.vacation += 1;
    } else {
      continue;
    }
    map.set(task.userId, current);
  }

  return map;
}
