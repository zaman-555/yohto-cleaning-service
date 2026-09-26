import type {
  DashboardRow,
  ScheduleMonthVisibility,
  TaskRecord,
  TeamMember,
  User,
} from "@/features/dashboard/types";

export type DashboardClientProps = {
  year: number;
  monthNumber: number;
  monthLabel: string;
  initialData: DashboardRow[];
  initialTeamMembers: TeamMember[];
  users: User[];
  initialTasks: TaskRecord[];
  initialYearTasks: TaskRecord[];
  initialCompanySearch?: string;
  initialMonthVisibility: ScheduleMonthVisibility;
  initialDashboardStaffOrder: number[];
};

export type SelectedTaskUserState = {
  userId: number;
  userName: string;
  dateLabel: string;
  calendarYear: number;
  calendarMonth: number;
  dayOfMonth: number;
};
