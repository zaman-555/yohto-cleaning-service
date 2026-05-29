import prisma from '../config/database';

export async function createPasswordResetToken(input: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}) {
  return prisma.passwordResetToken.create({
    data: {
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    },
  });
}

export async function findActivePasswordResetTokenByHash(tokenHash: string) {
  return prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function markPasswordResetTokenUsed(id: string) {
  return prisma.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

/** Invalidate any outstanding reset tokens for a user (e.g. when a new one is requested). */
export async function markAllPasswordResetTokensUsedForUser(userId: number) {
  return prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}

/** Best-effort removal of tokens that can no longer be used (expired or already used). */
export async function deleteExpiredPasswordResetTokens() {
  return prisma.passwordResetToken.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { NOT: { usedAt: null } }],
    },
  });
}
