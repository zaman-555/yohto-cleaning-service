import prisma from '../config/database';
import { KPI_LEAVE_DAY_TYPES } from '../constants/task';

const taskListSelect = {
  id: true,
  date: true,
  shift: true,
  userId: true,
  companyName: true,
  task: true,
  carName: true,
  transportType: true,
  location: true,
} as const;

export function monthRange(year: number, month: number) {
  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 1));
  return { rangeStart, rangeEnd };
}

export async function findTasksInMonth(year: number, month: number) {
  const { rangeStart, rangeEnd } = monthRange(year, month);
  return prisma.task.findMany({
    where: {
      date: {
        gte: rangeStart,
        lt: rangeEnd,
      },
    },
    orderBy: { date: 'desc' },
    select: taskListSelect,
  });
}

export async function findTasksInYear(year: number) {
  const rangeStart = new Date(Date.UTC(year, 0, 1));
  const rangeEnd = new Date(Date.UTC(year + 1, 0, 1));
  return prisma.task.findMany({
    where: {
      date: {
        gte: rangeStart,
        lt: rangeEnd,
      },
    },
    orderBy: { date: 'desc' },
    select: taskListSelect,
  });
}

export async function findLeaveDaysInYear(year: number) {
  const rangeStart = new Date(Date.UTC(year, 0, 1));
  const rangeEnd = new Date(Date.UTC(year + 1, 0, 1));
  return prisma.task.findMany({
    where: {
      date: {
        gte: rangeStart,
        lt: rangeEnd,
      },
      transportType: { in: [...KPI_LEAVE_DAY_TYPES] },
    },
    select: {
      userId: true,
      date: true,
      transportType: true,
    },
  });
}

export async function createTask(input: {
  date: Date;
  shift: string;
  userId: number;
  companyName: string;
  task: string;
  carName: string;
  transportType: string;
  location: string;
}) {
  return prisma.task.create({
    data: {
      date: input.date,
      shift: input.shift,
      userId: input.userId,
      companyName: input.companyName,
      task: input.task,
      carName: input.carName,
      transportType: input.transportType,
      location: input.location,
    },
  });
}

export async function findTaskById(id: number) {
  return prisma.task.findUnique({
    where: { id },
    select: { id: true },
  });
}

export async function updateTaskById(
  id: number,
  data: {
    date: Date;
    shift: string;
    companyName: string;
    task: string;
    carName: string;
    transportType: string;
    location: string;
  },
) {
  return prisma.task.update({
    where: { id },
    data,
  });
}
