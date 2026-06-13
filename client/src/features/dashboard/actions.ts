"use server";

import { serverApiUrl } from "@/env";
import { getServerAuthHeaders } from "@/lib/auth/server";
import type {
  TaskDetailRecord,
  WeeklyShowcaseColumnKey,
} from "@/features/dashboard/weekly-showcase-types";
import type { TaskInput, TaskUpdateBody } from "./types";

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
