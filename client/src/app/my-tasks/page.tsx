import MyTasksClient from "@/components/my-tasks-client";
import {
  fetchApprovedTeamMembers,
  fetchScheduleMonthVisibility,
  fetchTasksForMonth,
  fetchTeamMembers,
} from "@/features/dashboard/server";
import {
  formatCalendarMonthLabel,
  isFutureCalendarMonth,
  resolveMonthlyPageMonth,
} from "@/features/dashboard/month-utils";
import type { User } from "@/features/dashboard/types";

export const dynamic = "force-dynamic";

type MyTasksPageProps = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

export default async function MyTasksPage({ searchParams }: MyTasksPageProps) {
  const params = await searchParams;
  const { year, month } = resolveMonthlyPageMonth(params.year, params.month);
  const monthLabel = formatCalendarMonthLabel({ year, month });

  const [teamMembers, approvedMembers, tasksForMonth, visibility] =
    await Promise.all([
      fetchTeamMembers(),
      fetchApprovedTeamMembers(),
      fetchTasksForMonth(year, month),
      fetchScheduleMonthVisibility(year, month),
    ]);
  const isFuture = isFutureCalendarMonth({ year, month });
  const monthVisibility = visibility ?? {
    isFuture,
    isPublished: !isFuture,
    isVisibleToStaff: !isFuture,
  };

  const users: User[] = approvedMembers
    .filter((member) => !member.isAdmin)
    .map((member) => ({ id: member.id, name: member.name }));

  return (
    <MyTasksClient
      key={`${year}-m${month}-my-tasks`}
      year={year}
      monthNumber={month}
      monthLabel={monthLabel}
      initialTeamMembers={teamMembers}
      users={users}
      initialTasks={tasksForMonth}
      monthVisibility={monthVisibility}
    />
  );
}
