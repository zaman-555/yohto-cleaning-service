"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MonthlyMonthPagination } from "@/components/dashboard/monthly-month-pagination";
import { MyTaskCard } from "@/components/dashboard/my-task-card";
import {
  TRANSPORT_TYPES,
  TRANSPORT_TYPE_META,
} from "@/components/dashboard/transport-constants";
import { useDashboardShell } from "@/components/dashboard/use-dashboard-shell";
import type { TaskRecord, TeamMember, User } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

export type MyTasksClientProps = {
  year: number;
  monthNumber: number;
  monthLabel: string;
  initialTeamMembers: TeamMember[];
  users: User[];
  initialTasks: TaskRecord[];
};

type UserTaskGroup = {
  userId: number;
  userName: string;
  tasks: TaskRecord[];
};

/** Distinct border colors so admin can tell staff columns apart at a glance. */
const STAFF_CARD_BORDERS = [
  "border-sky-500/70",
  "border-emerald-500/70",
  "border-amber-500/70",
  "border-rose-500/70",
  "border-cyan-500/70",
  "border-orange-500/70",
  "border-teal-500/70",
  "border-lime-600/70",
  "border-pink-500/70",
  "border-blue-500/70",
] as const;

function staffCardBorderClass(userId: number): string {
  const index = Math.abs(userId) % STAFF_CARD_BORDERS.length;
  return STAFF_CARD_BORDERS[index] ?? STAFF_CARD_BORDERS[0];
}

function sortTasksByDateAndShift(tasks: TaskRecord[]): TaskRecord[] {
  return [...tasks].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) {
      return byDate;
    }
    return a.shift.localeCompare(b.shift);
  });
}

function buildUserNameMap(users: User[], teamMembers: TeamMember[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const member of teamMembers) {
    map.set(member.id, member.name);
  }
  for (const user of users) {
    map.set(user.id, user.name);
  }
  return map;
}

export default function MyTasksClient({
  year,
  monthNumber,
  monthLabel,
  initialTeamMembers,
  users,
  initialTasks,
}: MyTasksClientProps) {
  const {
    user,
    loading,
    manageableMembers,
    pendingApprovalIds,
    pendingDeleteIds,
    toggleApproval,
    removeUser,
    handleLogout,
  } = useDashboardShell(initialTeamMembers, users);

  const isAdmin = Boolean(user?.isAdmin);
  const nameById = useMemo(
    () => buildUserNameMap(users, initialTeamMembers),
    [users, initialTeamMembers]
  );

  const visibleTasks = useMemo(() => {
    if (!user) {
      return [];
    }
    if (isAdmin) {
      return sortTasksByDateAndShift(initialTasks);
    }
    return sortTasksByDateAndShift(
      initialTasks.filter((task) => task.userId === user.id)
    );
  }, [initialTasks, user, isAdmin]);

  const adminGroups = useMemo((): UserTaskGroup[] => {
    if (!isAdmin) {
      return [];
    }

    const tasksByUser = new Map<number, TaskRecord[]>();
    for (const task of visibleTasks) {
      const list = tasksByUser.get(task.userId) ?? [];
      list.push(task);
      tasksByUser.set(task.userId, list);
    }

    const groups: UserTaskGroup[] = [];

    for (const teamUser of users) {
      const tasks = tasksByUser.get(teamUser.id);
      if (!tasks || tasks.length === 0) {
        continue;
      }
      groups.push({
        userId: teamUser.id,
        userName: teamUser.name,
        tasks,
      });
      tasksByUser.delete(teamUser.id);
    }

    for (const [userId, tasks] of tasksByUser) {
      groups.push({
        userId,
        userName: nameById.get(userId) ?? `User #${userId}`,
        tasks,
      });
    }

    return groups;
  }, [isAdmin, visibleTasks, users, nameById]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }

  const title = isAdmin ? "Staffs" : "My work";
  const subtitle = isAdmin
    ? `All team assignments for ${monthLabel}`
    : `Your assignments for ${monthLabel}`;
  const emptyMessage = isAdmin
    ? "No team tasks for this month."
    : "No tasks assigned to you this month.";

  return (
    <DashboardShell
      user={user}
      manageableMembers={manageableMembers}
      pendingApprovalIds={pendingApprovalIds}
      pendingDeleteIds={pendingDeleteIds}
      onToggleApproval={toggleApproval}
      onDeleteUser={removeUser}
      onLogout={handleLogout}
      title={title}
      subtitle={subtitle}
      logoSrc="/pink_logo_rgb.webp"
      logoAlt="Extra team"
    >
      <MonthlyMonthPagination
        year={year}
        monthNumber={monthNumber}
        basePath="/my-tasks"
      />

      {!isAdmin && visibleTasks.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Border colour = transport</span>
          {TRANSPORT_TYPES.map((type) => {
            const meta = TRANSPORT_TYPE_META[type];
            return (
              <span key={type} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn("inline-block size-2.5 rounded-full", meta.dotClass)}
                />
                {meta.label}
              </span>
            );
          })}
        </div>
      ) : null}

      {visibleTasks.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : isAdmin ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-6 lg:gap-8">
          {adminGroups.map((group) => (
            <section
              key={group.userId}
              className={cn(
                "min-w-0 space-y-3 rounded-xl border-2 bg-card/40 p-3 sm:p-4",
                staffCardBorderClass(group.userId)
              )}
            >
              <h2 className="text-sm font-semibold tracking-wide text-foreground">
                {group.userName}
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  {group.tasks.length}{" "}
                  {group.tasks.length === 1 ? "task" : "tasks"}
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {group.tasks.map((task) => (
                  <MyTaskCard
                    key={task.id}
                    task={task}
                    workerName={group.userName}
                    variant="admin"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTasks.map((task) => (
            <MyTaskCard key={task.id} task={task} variant="staff" />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
