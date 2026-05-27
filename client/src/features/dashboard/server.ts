import "server-only";

import { serverApiUrl } from "@/env";
import { getServerAuthHeaders } from "@/lib/auth/server";
import type { TaskDetailRecord } from "@/features/dashboard/weekly-showcase-types";
import type { TaskRecord, TeamMember } from "./types";

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/users"), {
      headers: authHeaders,
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
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/users?approved=true"), {
      headers: authHeaders,
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
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(
      serverApiUrl(`/api/tasks?year=${year}&month=${month}`),
      { headers: authHeaders, cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TaskRecord[];
  } catch {
    return [];
  }
}

/** Fetch task_details for a single calendar week only. */
export async function fetchTaskDetailsForWeek(
  year: number,
  week: number
): Promise<TaskDetailRecord[]> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(
      serverApiUrl(`/api/task-details?year=${year}&week=${week}`),
      { headers: authHeaders, cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TaskDetailRecord[];
  } catch {
    return [];
  }
}
