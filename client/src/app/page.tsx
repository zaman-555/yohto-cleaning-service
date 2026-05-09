import DashboardClient from "../components/dashboard-client";
import { DASHBOARD_USERS } from "@/features/dashboard/config";
import { fetchTeamMembers } from "@/features/dashboard/server";
import { generateTableData } from "@/features/dashboard/table-data";

export default async function DashboardPage() {
  const [tableData, teamMembers] = await Promise.all([
    Promise.resolve(generateTableData()),
    fetchTeamMembers(),
  ]);

  return (
    <DashboardClient
      initialData={tableData}
      initialTeamMembers={teamMembers}
      users={DASHBOARD_USERS}
    />
  );
}
