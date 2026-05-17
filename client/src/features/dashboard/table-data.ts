import type { DashboardRow, User } from "./types";
import { getCalendarWeekNumber } from "./week-utils";

export const generateTableData = (
  users: User[],
  year: number,
  month: number
): DashboardRow[] => {
  const data: DashboardRow[] = [];
  const monthIndex = month - 1;
  const calendarMonth = month;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, monthIndex, day);
    const availability = users.map((user) => ({
      userId: user.id,
      available: Math.random() > 0.3,
    }));

    data.push({
      id: day,
      dateNum: day,
      calendarYear: year,
      calendarMonth,
      dayName: currentDate
        .toLocaleDateString("en-US", { weekday: "long" })
        .slice(0, 3),
      week: getCalendarWeekNumber(currentDate),
      availability,
    });
  }

  return data;
};
