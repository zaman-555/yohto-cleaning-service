import type { Request, Response } from 'express';
import { isValidTransportType } from '../constants/task';
import * as taskModel from '../models/task.model';
import * as userModel from '../models/user.model';

export async function getTasks(req: Request, res: Response): Promise<void> {
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    res.status(400).json({ error: 'Valid year and month (1–12) are required' });
    return;
  }

  try {
    const tasks = await taskModel.findTasksInMonth(year, month);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

type TaskBody = {
  timestamp?: string;
  userId?: number;
  companyName?: string;
  task?: string;
  carName?: string;
  transportType?: string;
  location?: string;
};

function parseTaskPayload(body: TaskBody, requireUserId: boolean) {
  const {
    timestamp,
    userId,
    companyName,
    task,
    carName,
    transportType,
    location,
  } = body;

  const userIdNum = userId !== undefined && userId !== null ? Number(userId) : NaN;
  if (
    !timestamp ||
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

  let parsedLocation: URL;
  try {
    parsedLocation = new URL(location);
  } catch {
    return { error: 'Location must be a valid URL' as const };
  }

  const parsedTimestamp = new Date(timestamp);
  if (Number.isNaN(parsedTimestamp.getTime())) {
    return { error: 'Timestamp must be a valid date/time' as const };
  }

  return {
    parsed: {
      parsedTimestamp,
      userId: requireUserId ? userIdNum : undefined,
      companyName: companyName.trim(),
      task: task.trim(),
      carName: carName.trim(),
      transportType,
      location: parsedLocation.toString(),
    },
  };
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const parsed = parseTaskPayload(req.body as TaskBody, true);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { parsedTimestamp, userId, companyName, task, carName, transportType, location } =
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
      timestamp: parsedTimestamp,
      userId,
      companyName,
      task,
      carName,
      transportType,
      location,
    });

    res.status(201).json({ message: 'Task created', task: createdTask });
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

  const { parsedTimestamp, companyName, task, carName, transportType, location } =
    parsed.parsed;

  try {
    const existing = await taskModel.findTaskById(taskId);
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const updatedTask = await taskModel.updateTaskById(taskId, {
      timestamp: parsedTimestamp,
      companyName,
      task,
      carName,
      transportType,
      location,
    });

    res.json({ message: 'Task updated', task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
