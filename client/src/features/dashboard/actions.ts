"use server";

import { serverApiUrl } from "@/env";
import { getServerAuthHeaders } from "@/lib/auth/server";
import {
  isCustomWeeklyColumnKey,
  type TaskDetailRecord,
  type WeeklyShowcaseColumnHeader,
  type WeeklyShowcaseColumnKey,
  type WeeklyShowcaseHeaderStyle,
} from "@/features/dashboard/weekly-showcase-types";
import type {
  ScheduleMonthVisibility,
  TaskInput,
  TaskUpdateBody,
  TeamMember,
} from "./types";

export async function fetchTeamMembersAction(): Promise<TeamMember[] | null> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/users"), {
      headers: authHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as TeamMember[];
  } catch {
    return null;
  }
}

export async function updateUserApproval(userId: number, isApproved: boolean): Promise<boolean> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl(`/api/users/${userId}/approval`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ isApproved }),
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export type UpdateDashboardStaffOrderResult =
  | { ok: true; staffUserIds: number[] }
  | { ok: false; error: string };

export async function updateDashboardStaffOrder(
  staffUserIds: number[]
): Promise<UpdateDashboardStaffOrderResult> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/users/me/dashboard-staff-order"), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ staffUserIds }),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as
      | { staffUserIds?: number[]; error?: string }
      | null;

    if (!response.ok || !data?.staffUserIds) {
      return { ok: false, error: data?.error ?? "Failed to save staff column order." };
    }

    return { ok: true, staffUserIds: data.staffUserIds };
  } catch {
    return { ok: false, error: "Request failed. Please check the backend connection." };
  }
}

export async function updateScheduleMonthVisibility(
  year: number,
  month: number,
  isPublished: boolean
): Promise<
  | { ok: true; visibility: ScheduleMonthVisibility }
  | { ok: false; error: string }
> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(
      serverApiUrl(`/api/tasks/month-visibility?year=${year}&month=${month}`),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ isPublished }),
        cache: "no-store",
      }
    );
    const data = (await response.json().catch(() => null)) as
      | (ScheduleMonthVisibility & { error?: string })
      | null;
    if (!response.ok || !data) {
      return {
        ok: false,
        error: data?.error ?? "Failed to update schedule visibility.",
      };
    }
    return { ok: true, visibility: data };
  } catch {
    return {
      ok: false,
      error: "Request failed. Please check the backend connection.",
    };
  }
}

export type DeleteUserResult = {
  ok: boolean;
  error?: string;
};

export async function deleteUser(userId: number): Promise<DeleteUserResult> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl(`/api/users/${userId}`), {
      method: "DELETE",
      headers: { ...authHeaders },
      cache: "no-store",
    });

    if (response.ok) {
      return { ok: true };
    }

    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Failed to delete user." };
  } catch {
    return { ok: false, error: "Request failed. Please check backend connection." };
  }
}

export type CreateTaskResult = {
  ok: boolean;
  error?: string;
};

export async function createTask(payload: TaskInput): Promise<CreateTaskResult> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/tasks"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (response.ok) {
      return { ok: true };
    }

    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Failed to create task." };
  } catch {
    return { ok: false, error: "Request failed. Please check backend connection." };
  }
}

export async function updateTask(taskId: number, payload: TaskUpdateBody): Promise<CreateTaskResult> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl(`/api/tasks/${taskId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (response.ok) {
      return { ok: true };
    }

    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Failed to update task." };
  } catch {
    return { ok: false, error: "Request failed. Please check backend connection." };
  }
}

export type UpsertWeeklyTaskDetailResult =
  | { ok: true; detail: TaskDetailRecord }
  | { ok: false; error: string };

export async function upsertWeeklyTaskDetail(input: {
  year: number;
  weekNumber: number;
  rowKey: string;
  columnKey: WeeklyShowcaseColumnKey;
  text: string;
  weekdayLabelForDate: string;
}): Promise<UpsertWeeklyTaskDetailResult> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/task-details/upsert"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | TaskDetailRecord
      | { error?: string }
      | null;

    if (!response.ok) {
      const err =
        data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : "Failed to save cell.";
      return { ok: false, error: err };
    }

    if (!data || typeof data !== "object" || !("id" in data)) {
      return { ok: false, error: "Invalid response from server." };
    }

    return { ok: true, detail: data as TaskDetailRecord };
  } catch {
    return { ok: false, error: "Request failed. Please check backend connection." };
  }
}

export type UpsertWeeklyColumnHeaderResult =
  | { ok: true; header: WeeklyShowcaseColumnHeader }
  | { ok: false; error: string };

export async function upsertWeeklyShowcaseColumnHeader(input: {
  columnKey: WeeklyShowcaseColumnKey;
  label: string;
  headerStyle: WeeklyShowcaseHeaderStyle;
  isVisible?: boolean;
  sortOrder?: number;
}): Promise<UpsertWeeklyColumnHeaderResult> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/weekly-showcase/column-headers"), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | WeeklyShowcaseColumnHeader
      | { error?: string }
      | null;

    if (!response.ok) {
      const err =
        data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : "Failed to save column header.";
      return { ok: false, error: err };
    }

    if (!data || typeof data !== "object" || !("columnKey" in data)) {
      return { ok: false, error: "Invalid response from server." };
    }

    return { ok: true, header: data as WeeklyShowcaseColumnHeader };
  } catch {
    return { ok: false, error: "Request failed. Please check backend connection." };
  }
}

export type CreateWeeklyColumnResult =
  | { ok: true; header: WeeklyShowcaseColumnHeader }
  | { ok: false; error: string };

export async function createWeeklyShowcaseColumn(input: {
  label: string;
}): Promise<CreateWeeklyColumnResult> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/weekly-showcase/column-headers"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | WeeklyShowcaseColumnHeader
      | { error?: string }
      | null;

    if (!response.ok) {
      let err = "Failed to add column.";
      if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
        err = data.error;
      } else if (response.status === 404) {
        err =
          "Add column is not available on the API server. Restart or redeploy the backend with the latest code.";
      } else if (response.status === 503) {
        err = "Database migration required. Run: cd server && npx prisma migrate deploy";
      }
      return { ok: false, error: err };
    }

    if (!data || typeof data !== "object" || !("columnKey" in data)) {
      return { ok: false, error: "Invalid response from server." };
    }

    return { ok: true, header: data as WeeklyShowcaseColumnHeader };
  } catch {
    return { ok: false, error: "Request failed. Please check backend connection." };
  }
}

export type RemoveWeeklyColumnResult =
  | { ok: true; columnKey: WeeklyShowcaseColumnKey; hidden: boolean }
  | { ok: false; error: string };

export async function removeWeeklyShowcaseColumn(
  columnKey: WeeklyShowcaseColumnKey,
  header?: WeeklyShowcaseColumnHeader
): Promise<RemoveWeeklyColumnResult> {
  if (!isCustomWeeklyColumnKey(columnKey)) {
    if (!header) {
      return { ok: false, error: "Column header data is missing." };
    }

    const result = await upsertWeeklyShowcaseColumnHeader({
      columnKey: header.columnKey,
      label: header.label,
      headerStyle: header.headerStyle,
      isVisible: false,
      sortOrder: header.sortOrder,
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    return { ok: true, columnKey, hidden: true };
  }

  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(
      serverApiUrl(`/api/weekly-showcase/column-headers/${encodeURIComponent(columnKey)}`),
      {
        method: "DELETE",
        headers: authHeaders,
        cache: "no-store",
      }
    );

    if (response.status === 204) {
      return { ok: true, columnKey, hidden: false };
    }

    const data = (await response.json().catch(() => null)) as
      | WeeklyShowcaseColumnHeader
      | { error?: string }
      | null;

    if (!response.ok) {
      let err = "Failed to remove column.";
      if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
        err = data.error;
      } else if (response.status === 404) {
        err =
          "Remove column is not available on the API server. Restart or redeploy the backend with the latest code.";
      } else if (response.status === 503) {
        err = "Database migration required. Run: cd server && npx prisma migrate deploy";
      }
      return { ok: false, error: err };
    }

    return { ok: true, columnKey, hidden: false };
  } catch {
    return { ok: false, error: "Request failed. Please check backend connection." };
  }
}

export type RestoreWeeklyColumnResult =
  | { ok: true; header: WeeklyShowcaseColumnHeader }
  | { ok: false; error: string };

export async function restoreWeeklyShowcaseColumn(
  header: WeeklyShowcaseColumnHeader
): Promise<RestoreWeeklyColumnResult> {
  const result = await upsertWeeklyShowcaseColumnHeader({
    columnKey: header.columnKey,
    label: header.label,
    headerStyle: header.headerStyle,
    isVisible: true,
    sortOrder: header.sortOrder,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true, header: result.header };
}

