import DashboardClient from "../components/dashboard-client";
import {
  fetchApprovedTeamMembers,
  fetchTasksForMonth,
  fetchTeamMembers,
} from "@/features/dashboard/server";
import { generateTableData } from "@/features/dashboard/table-data";
import type { User } from "@/features/dashboard/types";

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [teamMembers, approvedMembers, tasksForMonth] = await Promise.all([
    fetchTeamMembers(),
    fetchApprovedTeamMembers(),
    fetchTasksForMonth(year, month),
  ]);
  const approvedUsers: User[] = approvedMembers
    .filter((member) => !member.isAdmin)
    .map((member) => ({ id: member.id, name: member.name }));
  const tableData = generateTableData(approvedUsers);

  return (
    <DashboardClient
      initialData={tableData}
      initialTeamMembers={teamMembers}
      users={approvedUsers}
      initialTasks={tasksForMonth}
    />
  );
}
