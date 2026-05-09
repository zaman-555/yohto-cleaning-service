import type { DashboardRow, User } from "./types";

const getWeekNumber = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const generateTableData = (users: User[]): DashboardRow[] => {
  const data: DashboardRow[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const availability = users.map((user) => ({
      userId: user.id,
      available: Math.random() > 0.3,
    }));

    data.push({
      id: day,
      dateNum: day,
      dayName: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
      week: getWeekNumber(currentDate),
      availability,
    });
  }

  return data;
};
