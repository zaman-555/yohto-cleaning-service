import prisma from '../config/database';
import { hashPassword } from '../services/password.service';

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

export async function findUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
      isApproved: false,
    },
  });
}

export async function updateUserPassword(id: number, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { password: passwordHash },
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

export async function deleteUser(id: number) {
  // Caller guarantees the user is already unapproved. Related rows (tasks,
  // refresh tokens, password reset tokens) are removed automatically via
  // onDelete: Cascade.
  return prisma.user.delete({ where: { id } });
}

export async function userExistsById(id: number) {
  const row = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  return !!row;
}
