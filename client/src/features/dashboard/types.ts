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
};
