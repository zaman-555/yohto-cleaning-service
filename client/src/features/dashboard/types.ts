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
  timestamp: string;
  userId: number;
  companyName: string;
  task: string;
  carName: string;
  transportType: TransportType;
  location: string;
};
