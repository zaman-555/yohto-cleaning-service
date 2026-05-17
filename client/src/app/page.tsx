import DashboardClient from "../components/dashboard-client";
import {
  fetchApprovedTeamMembers,
  fetchTasksForMonth,
  fetchTeamMembers,
} from "@/features/dashboard/server";
import { formatCalendarMonthLabel, resolveMonthlyPageMonth } from "@/features/dashboard/month-utils";
import { generateTableData } from "@/features/dashboard/table-data";
import type { User } from "@/features/dashboard/types";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const { year, month } = resolveMonthlyPageMonth(params.year, params.month);
  const monthLabel = formatCalendarMonthLabel({ year, month });

  const [teamMembers, approvedMembers, tasksForMonth] = await Promise.all([
    fetchTeamMembers(),
    fetchApprovedTeamMembers(),
    fetchTasksForMonth(year, month),
  ]);
  const approvedUsers: User[] = approvedMembers
    .filter((member) => !member.isAdmin)
    .map((member) => ({ id: member.id, name: member.name }));
  const tableData = generateTableData(approvedUsers, year, month);

  return (
    <DashboardClient
      key={`${year}-m${month}`}
      year={year}
      monthNumber={month}
      monthLabel={monthLabel}
      initialData={tableData}
      initialTeamMembers={teamMembers}
      users={approvedUsers}
      initialTasks={tasksForMonth}
    />
  );
}
