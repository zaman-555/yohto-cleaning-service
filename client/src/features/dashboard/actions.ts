"use server";

import { serverApiUrl } from "@/env";
import type { TaskInput, TaskUpdateBody } from "./types";

export async function updateUserApproval(userId: number, isApproved: boolean): Promise<boolean> {
  try {
    const response = await fetch(serverApiUrl(`/api/users/${userId}/approval`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export type CreateTaskResult = {
  ok: boolean;
  error?: string;
};

export async function createTask(payload: TaskInput): Promise<CreateTaskResult> {
  try {
    const response = await fetch(serverApiUrl("/api/tasks"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const response = await fetch(serverApiUrl(`/api/tasks/${taskId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
