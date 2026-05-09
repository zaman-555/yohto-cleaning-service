import DashboardClient from "../components/dashboard-client";
import { fetchApprovedTeamMembers, fetchTeamMembers } from "@/features/dashboard/server";
import { generateTableData } from "@/features/dashboard/table-data";
import type { User } from "@/features/dashboard/types";

export default async function DashboardPage() {
  const [teamMembers, approvedMembers] = await Promise.all([
    fetchTeamMembers(),
    fetchApprovedTeamMembers(),
  ]);
  const approvedUsers: User[] = approvedMembers
    .map((member) => ({ id: member.id, name: member.name }));
  const tableData = generateTableData(approvedUsers);

  return (
    <DashboardClient
      initialData={tableData}
      initialTeamMembers={teamMembers}
      users={approvedUsers}
    />
  );
}
