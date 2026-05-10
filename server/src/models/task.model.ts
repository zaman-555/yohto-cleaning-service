import prisma from '../config/database';

const taskListSelect = {
  id: true,
  timestamp: true,
  userId: true,
  companyName: true,
  task: true,
  carName: true,
  transportType: true,
  location: true,
} as const;

export function monthRange(year: number, month: number) {
  const rangeStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const rangeEnd = new Date(year, month, 1, 0, 0, 0, 0);
  return { rangeStart, rangeEnd };
}

export async function findTasksInMonth(year: number, month: number) {
  const { rangeStart, rangeEnd } = monthRange(year, month);
  return prisma.task.findMany({
    where: {
      timestamp: {
        gte: rangeStart,
        lt: rangeEnd,
      },
    },
    orderBy: { timestamp: 'desc' },
    select: taskListSelect,
  });
}

export async function createTask(input: {
  timestamp: Date;
  userId: number;
  companyName: string;
  task: string;
  carName: string;
  transportType: string;
  location: string;
}) {
  return prisma.task.create({
    data: {
      timestamp: input.timestamp,
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
    timestamp: Date;
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
