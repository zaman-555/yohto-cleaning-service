import type { Request, Response } from 'express';
import * as visibilityModel from '../models/schedule-month-visibility.model';

function parseMonthQuery(req: Request): { year: number; month: number } | null {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (
    !Number.isInteger(year) ||
    year < 1970 ||
    year > 2100 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }
  return { year, month };
}

export async function getMonthVisibility(req: Request, res: Response): Promise<void> {
  const parsed = parseMonthQuery(req);
  if (!parsed) {
    res.status(400).json({ error: 'Valid year and month (1–12) are required' });
    return;
  }

  try {
    const publication = await visibilityModel.getMonthPublication(parsed.year, parsed.month);
    res.json(publication);
  } catch (error) {
    console.error('Error fetching month visibility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateMonthVisibility(req: Request, res: Response): Promise<void> {
  const parsed = parseMonthQuery(req);
  const { isPublished } = req.body as { isPublished?: unknown };
  if (!parsed || typeof isPublished !== 'boolean') {
    res.status(400).json({ error: 'Valid year, month, and publication state are required' });
    return;
  }

  if (!visibilityModel.isFutureCalendarMonth(parsed.year, parsed.month)) {
    res.status(400).json({ error: 'Current and past schedules are always visible to staff' });
    return;
  }

  try {
    await visibilityModel.setMonthPublication(parsed.year, parsed.month, isPublished);
    res.json({
      isFuture: true,
      isPublished,
      isVisibleToStaff: isPublished,
    });
  } catch (error) {
    console.error('Error updating month visibility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
