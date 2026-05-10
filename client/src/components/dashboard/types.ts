import type {
  DashboardRow,
  TaskRecord,
  TeamMember,
  User,
} from "@/features/dashboard/types";

export type DashboardClientProps = {
  initialData: DashboardRow[];
  initialTeamMembers: TeamMember[];
  users: User[];
  initialTasks: TaskRecord[];
};

export type SelectedTaskUserState = {
  userId: number;
  userName: string;
  dateLabel: string;
  calendarYear: number;
  calendarMonth: number;
  dayOfMonth: number;
};
