import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { isWeeklyTaskDetailColumnKey } from '../constants/weekly-task-detail';
import * as taskDetailModel from '../models/task-detail.model';
import { canonicalTaskDetailRowKey } from '../utils/task-detail-row-key';
import { resolveTaskDetailDate } from '../utils/calendar-week';

function isTaskDetailsTableMissing(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2021' &&
    (error.meta as { modelName?: string } | undefined)?.modelName === 'TaskDetail'
  );
}

function serialize(row: {
  id: number;
  rowKey: string;
  columnKey: string;
  date: Date;
  text: string;
}) {
  return {
    id: row.id,
    rowKey: row.rowKey,
    columnKey: row.columnKey,
    date: row.date.toISOString(),
    text: row.text,
  };
}

export async function getTaskDetails(req: Request, res: Response): Promise<void> {
  const year = Number(req.query.year);
  const minWeek = Number(req.query.minWeek);
  const maxWeek = Number(req.query.maxWeek);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(minWeek) ||
    !Number.isFinite(maxWeek) ||
    minWeek < 1 ||
    maxWeek > 53 ||
    minWeek > maxWeek
  ) {
    res.status(400).json({ error: 'Valid year, minWeek, and maxWeek are required' });
    return;
  }

  try {
    const rows = await taskDetailModel.findTaskDetailsByYearWeekRange(year, minWeek, maxWeek);
    res.json(rows.map(serialize));
  } catch (error) {
    console.error('Error fetching task details:', error);
    if (isTaskDetailsTableMissing(error)) {
      console.warn(
        '[task_details] Table missing — run from server folder: npx prisma migrate deploy',
      );
      res.json([]);
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

type UpsertBody = {
  year?: unknown;
  weekNumber?: unknown;
  rowKey?: unknown;
  columnKey?: unknown;
  text?: unknown;
  weekdayLabelForDate?: unknown;
};

export async function upsertTaskDetail(req: Request, res: Response): Promise<void> {
  const body = req.body as UpsertBody;
  const year = Number(body.year);
  const weekNumber = Number(body.weekNumber);
  const rowKeyRaw = typeof body.rowKey === 'string' ? body.rowKey.trim() : '';
  const columnKey = typeof body.columnKey === 'string' ? body.columnKey.trim() : '';
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const weekdayLabelRaw =
    typeof body.weekdayLabelForDate === 'string' ? body.weekdayLabelForDate.trim() : '';

  if (!Number.isFinite(year) || !Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > 53) {
    res.status(400).json({ error: 'Valid year and weekNumber are required' });
    return;
  }
  if (!rowKeyRaw) {
    res.status(400).json({ error: 'rowKey is required' });
    return;
  }
  if (!isWeeklyTaskDetailColumnKey(columnKey)) {
    res.status(400).json({ error: 'Invalid columnKey' });
    return;
  }
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const weekdayLabelForDate = columnKey === 'weekdayDate' ? text : weekdayLabelRaw;

  const resolved = resolveTaskDetailDate(year, weekNumber, weekdayLabelForDate);
  if ('error' in resolved) {
    res.status(400).json({ error: resolved.error });
    return;
  }

  const rowKey = canonicalTaskDetailRowKey(year, weekNumber, rowKeyRaw);

  try {
    const saved = await taskDetailModel.upsertTaskDetailRow({
      rowKey,
      columnKey,
      date: resolved.date,
      text,
    });
    res.json(serialize(saved));
  } catch (error) {
    console.error('Error upserting task detail:', error);
    if (isTaskDetailsTableMissing(error)) {
      res.status(503).json({
        error:
          'Database table task_details is missing. From the server folder run: npx prisma migrate deploy',
      });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
