import type { User } from "./types";

export function applyDashboardStaffOrder(users: User[], orderedIds: number[]): User[] {
  if (orderedIds.length === 0) {
    return users;
  }

  const userById = new Map(users.map((user) => [user.id, user]));
  const ordered = orderedIds.flatMap((id) => {
    const user = userById.get(id);
    if (!user) return [];
    userById.delete(id);
    return [user];
  });

  return [...ordered, ...userById.values()];
}

export function putCurrentStaffFirst(users: User[], currentUserId: number): User[] {
  const index = users.findIndex((user) => user.id === currentUserId);
  if (index <= 0) {
    return users;
  }

  return [users[index], ...users.slice(0, index), ...users.slice(index + 1)];
}
