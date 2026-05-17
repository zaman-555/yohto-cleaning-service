import WeeklyShowcaseClient from "@/components/weekly-showcase-client";
import {
  fetchApprovedTeamMembers,
  fetchTaskDetailsForWeek,
  fetchTeamMembers,
} from "@/features/dashboard/server";
import {
  formatCalendarWeekRange,
  resolveWeeklyPageWeek,
} from "@/features/dashboard/week-utils";
import { mergeTaskDetailsIntoRowList } from "@/features/dashboard/weekly-merge";
import { createBlankWeeklyRow } from "@/features/dashboard/weekly-showcase-rows";

export const dynamic = "force-dynamic";

type WeeklyPageProps = {
  searchParams: Promise<{ year?: string; week?: string }>;
};

export default async function WeeklyPage({ searchParams }: WeeklyPageProps) {
  const params = await searchParams;
  const { year, week: weekNumber } = resolveWeeklyPageWeek(params.year, params.week);
  const weekRangeLabel = formatCalendarWeekRange({ year, week: weekNumber });

  const [teamMembers, approvedMembers, detailRows] = await Promise.all([
    fetchTeamMembers(),
    fetchApprovedTeamMembers(),
    fetchTaskDetailsForWeek(year, weekNumber),
  ]);
  const users = approvedMembers
    .filter((member) => !member.isAdmin)
    .map((member) => ({ id: member.id, name: member.name }));

  const seedRows = [createBlankWeeklyRow(year, weekNumber, "1")];
  const rows = mergeTaskDetailsIntoRowList(year, weekNumber, seedRows, detailRows);

  return (
    <WeeklyShowcaseClient
      key={`${year}-w${weekNumber}`}
      year={year}
      weekNumber={weekNumber}
      weekRangeLabel={weekRangeLabel}
      initialTeamMembers={teamMembers}
      users={users}
      initialRows={rows}
    />
  );
}
