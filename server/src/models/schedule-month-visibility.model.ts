import prisma from '../config/database';

export function isFutureCalendarMonth(year: number, month: number): boolean {
  const now = new Date();
  const currentValue = now.getFullYear() * 12 + now.getMonth();
  const targetValue = year * 12 + (month - 1);
  return targetValue > currentValue;
}

export async function getMonthPublication(year: number, month: number) {
  if (!isFutureCalendarMonth(year, month)) {
    return {
      isFuture: false,
      isPublished: true,
      isVisibleToStaff: true,
    };
  }

  const record = await prisma.scheduleMonthVisibility.findUnique({
    where: { year_month: { year, month } },
    select: { isPublished: true },
  });
  const isPublished = record?.isPublished ?? false;
  return {
    isFuture: true,
    isPublished,
    isVisibleToStaff: isPublished,
  };
}

export async function setMonthPublication(
  year: number,
  month: number,
  isPublished: boolean,
) {
  return prisma.scheduleMonthVisibility.upsert({
    where: { year_month: { year, month } },
    create: {
      year,
      month,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
    update: {
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
    select: { isPublished: true },
  });
}
