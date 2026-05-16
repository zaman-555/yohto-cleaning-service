import WeeklyShowcaseClient from "@/components/weekly-showcase-client";
import {
  fetchApprovedTeamMembers,
  fetchTaskDetailsForWeeks,
  fetchTeamMembers,
} from "@/features/dashboard/server";
import { getCalendarWeekNumber } from "@/features/dashboard/week-utils";
import { mergeTaskDetailsIntoRowList } from "@/features/dashboard/weekly-merge";
import { createBlankWeeklyRow } from "@/features/dashboard/weekly-showcase-rows";

export default async function WeeklyPage() {
  const year = new Date().getFullYear();
  const weekNumber = getCalendarWeekNumber(new Date());

  const [teamMembers, approvedMembers, detailRows] = await Promise.all([
    fetchTeamMembers(),
    fetchApprovedTeamMembers(),
    fetchTaskDetailsForWeeks(year, weekNumber, weekNumber),
  ]);
  const users = approvedMembers
    .filter((member) => !member.isAdmin)
    .map((member) => ({ id: member.id, name: member.name }));

  const seedRows = [createBlankWeeklyRow(year, weekNumber, "1")];
  const rows = mergeTaskDetailsIntoRowList(year, weekNumber, seedRows, detailRows);

  return (
    <WeeklyShowcaseClient
      year={year}
      weekNumber={weekNumber}
      initialTeamMembers={teamMembers}
      users={users}
      initialRows={rows}
    />
  );
}
