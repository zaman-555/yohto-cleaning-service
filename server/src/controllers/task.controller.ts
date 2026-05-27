import type { Request, Response } from 'express';
import { isValidTransportType } from '../constants/task';
import { isValidTaskShift, normalizeTaskShift } from '../constants/task-shift';
import * as taskModel from '../models/task.model';
import * as userModel from '../models/user.model';
import { extractUrlFromLocation, isLocationFieldEmpty } from '../utils/location-url';

function formatDateOnly(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return parsed;
}

export async function getTasks(req: Request, res: Response): Promise<void> {
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    res.status(400).json({ error: 'Valid year and month (1–12) are required' });
    return;
  }

  try {
    const tasks = await taskModel.findTasksInMonth(year, month);
    res.json(
      tasks.map((task) => ({
        ...task,
        date: formatDateOnly(task.date),
      })),
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

type TaskBody = {
  date?: string;
  shift?: string;
  userId?: number;
  companyName?: string;
  task?: string;
  carName?: string;
  transportType?: string;
  location?: string;
};

function parseTaskPayload(body: TaskBody, requireUserId: boolean) {
  const { date, shift, userId, companyName, task, carName, transportType, location } = body;

  const userIdNum = userId !== undefined && userId !== null ? Number(userId) : NaN;
  if (
    !date ||
    !shift ||
    (requireUserId && !Number.isFinite(userIdNum)) ||
    !companyName ||
    !task ||
    !carName ||
    !transportType ||
    !location
  ) {
    return { error: 'All task fields are required' as const };
  }

  if (!isValidTransportType(transportType)) {
    return { error: 'Invalid transport type' as const };
  }

  if (!isValidTaskShift(shift)) {
    return { error: 'Shift must be a valid time range (HH:mm-HH:mm)' as const };
  }

  const locationTrimmed = location.trim();
  if (isLocationFieldEmpty(locationTrimmed)) {
    return { error: 'All task fields are required' as const };
  }

  if (!extractUrlFromLocation(locationTrimmed)) {
    return { error: 'Location must include a valid URL' as const };
  }

  const parsedDate = parseDateOnly(date);
  if (!parsedDate) {
    return { error: 'Date must be a valid calendar date (YYYY-MM-DD)' as const };
  }

  return {
    parsed: {
      parsedDate,
      shift: normalizeTaskShift(shift),
      userId: requireUserId ? userIdNum : undefined,
      companyName: companyName.trim(),
      task: task.trim(),
      carName: carName.trim(),
      transportType,
      location: locationTrimmed,
    },
  };
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const parsed = parseTaskPayload(req.body as TaskBody, true);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { parsedDate, shift, userId, companyName, task, carName, transportType, location } =
    parsed.parsed;

  if (userId === undefined || !Number.isFinite(userId)) {
    res.status(400).json({ error: 'All task fields are required' });
    return;
  }

  try {
    const existingUser = await userModel.userExistsById(userId);
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const createdTask = await taskModel.createTask({
      date: parsedDate,
      shift,
      userId,
      companyName,
      task,
      carName,
      transportType,
      location,
    });

    res.status(201).json({
      message: 'Task created',
      task: { ...createdTask, date: formatDateOnly(createdTask.date) },
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const taskId = Number(id);
  if (!Number.isFinite(taskId)) {
    res.status(400).json({ error: 'Invalid task id' });
    return;
  }

  const parsed = parseTaskPayload(req.body as TaskBody, false);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { parsedDate, shift, companyName, task, carName, transportType, location } =
    parsed.parsed;

  try {
    const existing = await taskModel.findTaskById(taskId);
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const updatedTask = await taskModel.updateTaskById(taskId, {
      date: parsedDate,
      shift,
      companyName,
      task,
      carName,
      transportType,
      location,
    });

    res.json({
      message: 'Task updated',
      task: { ...updatedTask, date: formatDateOnly(updatedTask.date) },
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
