import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { parseTaskDetailRowKeyParts } from '../utils/task-detail-row-key';

const taskDetailSelect = {
  id: true,
  rowKey: true,
  columnKey: true,
  date: true,
  text: true,
} as const;

export async function findTaskDetailsByYearWeekRange(
  year: number,
  minWeek: number,
  maxWeek: number,
) {
  if (minWeek < 1 || maxWeek > 53 || minWeek > maxWeek) {
    return [];
  }

  const rows = await prisma.taskDetail.findMany({
    where: {
      rowKey: {
        startsWith: `${year}-w`,
        mode: Prisma.QueryMode.insensitive,
      },
    },
    orderBy: [{ rowKey: 'asc' }, { columnKey: 'asc' }],
    select: taskDetailSelect,
  });

  return rows.filter((r) => {
    const p = parseTaskDetailRowKeyParts(r.rowKey);
    if (!p) return false;
    return p.year === year && p.week >= minWeek && p.week <= maxWeek;
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
