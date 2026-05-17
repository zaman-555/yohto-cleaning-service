import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const taskDetailSelect = {
  id: true,
  rowKey: true,
  columnKey: true,
  date: true,
  text: true,
} as const;

/** Row keys are `{year}-w{week}-{suffix}` — prefix is unique per week (w1- ≠ w10-). */
function rowKeyPrefixForWeek(year: number, week: number): string {
  return `${year}-w${week}-`;
}

function weekRangeWhere(
  year: number,
  minWeek: number,
  maxWeek: number,
): Prisma.TaskDetailWhereInput {
  if (minWeek === maxWeek) {
    return {
      rowKey: {
        startsWith: rowKeyPrefixForWeek(year, minWeek),
        mode: Prisma.QueryMode.insensitive,
      },
    };
  }

  return {
    OR: Array.from({ length: maxWeek - minWeek + 1 }, (_, i) => ({
      rowKey: {
        startsWith: rowKeyPrefixForWeek(year, minWeek + i),
        mode: Prisma.QueryMode.insensitive,
      },
    })),
  };
}

export async function findTaskDetailsByYearWeek(year: number, week: number) {
  if (week < 1 || week > 53) {
    return [];
  }

  return prisma.taskDetail.findMany({
    where: weekRangeWhere(year, week, week),
    orderBy: [{ rowKey: 'asc' }, { columnKey: 'asc' }],
    select: taskDetailSelect,
  });
}

export async function findTaskDetailsByYearWeekRange(
  year: number,
  minWeek: number,
  maxWeek: number,
) {
  if (minWeek < 1 || maxWeek > 53 || minWeek > maxWeek) {
    return [];
  }

  return prisma.taskDetail.findMany({
    where: weekRangeWhere(year, minWeek, maxWeek),
    orderBy: [{ rowKey: 'asc' }, { columnKey: 'asc' }],
    select: taskDetailSelect,
  });
}

export async function upsertTaskDetailRow(params: {
  rowKey: string;
  columnKey: string;
  date: Date;
  text: string;
}) {
  const { rowKey, columnKey, date, text } = params;

  const existing = await prisma.taskDetail.findFirst({
    where: { rowKey, columnKey },
    select: { id: true },
  });

  if (existing) {
    return prisma.taskDetail.update({
      where: { id: existing.id },
      data: { date, text },
      select: taskDetailSelect,
    });
  }

  return prisma.taskDetail.create({
    data: {
      rowKey,
      columnKey,
      date,
      text,
    },
    select: taskDetailSelect,
  });
}
