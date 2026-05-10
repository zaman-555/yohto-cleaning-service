import prisma from '../config/database';

const userListSelect = {
  id: true,
  name: true,
  email: true,
  isApproved: true,
  isAdmin: true,
  createdAt: true,
} as const;

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: input.password,
      isApproved: false,
    },
  }); 
}

export async function listUsers(approvedFilter: boolean | undefined) {
  return prisma.user.findMany({
    where: approvedFilter === undefined ? undefined : { isApproved: approvedFilter },
    select: userListSelect,
  });
}

export async function updateUserApproval(id: number, isApproved: boolean) {
  return prisma.user.update({
    where: { id },
    data: { isApproved },
  });
}

export async function userExistsById(id: number) {
  const row = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  return !!row;
}
