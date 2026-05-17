export type User = {
  id: number;
  name: string;
};

export type Availability = {
  userId: number;
  available: boolean;
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

export type TransportType = "own car" | "company car" | "going with other";

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
