import "server-only";

import { serverApiUrl } from "@/env";
import type { TaskRecord, TeamMember } from "./types";

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch(serverApiUrl("/api/users"), {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TeamMember[];
  } catch {
    return [];
  }
}

export async function fetchApprovedTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch(serverApiUrl("/api/users?approved=true"), {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TeamMember[];
  } catch {
    return [];
  }
}

export async function fetchTasksForMonth(year: number, month: number): Promise<TaskRecord[]> {
  try {
    const response = await fetch(
      serverApiUrl(`/api/tasks?year=${year}&month=${month}`),
      { cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TaskRecord[];
  } catch {
    return [];
  }
}
