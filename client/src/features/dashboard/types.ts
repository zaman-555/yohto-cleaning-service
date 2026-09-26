export type User = {
  id: number;
  name: string;
};

export type Availability = {
  userId: number;
  available: boolean;
};

export type ScheduleMonthVisibility = {
  isFuture: boolean;
  isPublished: boolean;
  isVisibleToStaff: boolean;
};

export type DashboardRow = {
  id: number;
  dateNum: number;
  /** Calendar year for this grid row (same month as the dashboard view). */
  calendarYear: number;
  /** 1–12 */
  calendarMonth: number;
  dayName: string;
  week: number;
  availability: Availability[];
};

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type TeamMember = {
  id: number;
  name: string;
  email: string;
  isApproved: boolean;
  isAdmin?: boolean;
};

export type TransportType =
  | "Start from PCS Driving"
  | "Start from Customer"
  | "Paid Holiday"
  | "Start from PCS"
  | "Vacation"
  | "Sick leave"
  | "Unpaid off";

/** Statuses that save with only a task label — no shift, company, car, or location. */
export const LEAVE_TRANSPORT_TYPES = [
  "Paid Holiday",
  "Sick leave",
  "Vacation",
  "Unpaid off",
] as const satisfies readonly TransportType[];

export function isLeaveTransportType(
  value: string
): value is (typeof LEAVE_TRANSPORT_TYPES)[number] {
  return (LEAVE_TRANSPORT_TYPES as readonly string[]).includes(value);
}

export type TaskInput = {
  date: string;
  shift: string;
  userId: number;
  companyName: string;
  task: string;
  carName: string;
  transportType: TransportType;
  location: string;
};

/** PATCH /api/tasks/:id body (user unchanged). */
export type TaskUpdateBody = {
  date: string;
  shift: string;
  companyName: string;
  task: string;
  carName: string;
  transportType: TransportType;
  location: string;
};

/** Task row from GET /api/tasks (ISO date string after JSON). */
export type TaskRecord = {
  id: number;
  date: string;
  shift: string;
  userId: number;
  companyName: string;
  task: string;
  carName: string;
  transportType: string;
  location: string;
};
