import KpiClient from "@/components/kpi-client";
import {
  fetchApprovedTeamMembers,
  fetchTasksForMonth,
  fetchTeamMembers,
} from "@/features/dashboard/server";
import {
  formatCalendarMonthLabel,
  resolveMonthlyPageMonth,
} from "@/features/dashboard/month-utils";
import type { User } from "@/features/dashboard/types";

export const dynamic = "force-dynamic";

type KpiPageProps = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

export default async function KpiPage({ searchParams }: KpiPageProps) {
  const params = await searchParams;
  const { year, month } = resolveMonthlyPageMonth(params.year, params.month);
  const monthLabel = formatCalendarMonthLabel({ year, month });

  const [teamMembers, approvedMembers, tasksForMonth] = await Promise.all([
    fetchTeamMembers(),
    fetchApprovedTeamMembers(),
    fetchTasksForMonth(year, month),
  ]);

  const users: User[] = approvedMembers
    .filter((member) => !member.isAdmin)
    .map((member) => ({ id: member.id, name: member.name }));

  return (
    <KpiClient
      key={`${year}-m${month}-kpi`}
      year={year}
      monthNumber={month}
      monthLabel={monthLabel}
      initialTeamMembers={teamMembers}
      users={users}
      initialTasks={tasksForMonth}
    />
  );
}
