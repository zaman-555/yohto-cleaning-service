"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { extractUrlFromRichText, isRichTextEmpty } from "@/lib/rich-text";
import { createTask, updateTask, updateUserApproval } from "@/features/dashboard/actions";
import { clearAuthUser, clearServerSession, getAuthUser } from "@/lib/auth/client";
import type {
  CurrentUser,
  DashboardRow,
  TaskInput,
  TaskRecord,
  TransportType,
} from "@/features/dashboard/types";
import { DashboardDataTable } from "./dashboard/dashboard-data-table";
import { DashboardHeader } from "./dashboard/dashboard-header";
import { MonthlyMonthPagination } from "./dashboard/monthly-month-pagination";
import { TaskDialog } from "./dashboard/task-dialog";
import {
  calendarDateIso,
  DEFAULT_SHIFT_RANGE,
  formatShift,
  parseShift,
  tasksByUserAndDay,
  type TimeRange,
} from "./dashboard/task-utils";
import { TRANSPORT_TYPES } from "./dashboard/transport-constants";
import type { DashboardClientProps, SelectedTaskUserState } from "./dashboard/types";
import { computeDashboardUserSummaries } from "@/features/dashboard/dashboard-summary";
import { useDashboardColumns } from "./dashboard/use-dashboard-columns";

export default function DashboardClient({
  year,
  monthNumber,
  monthLabel,
  initialData,
  initialTeamMembers,
  users,
  initialTasks,
}: DashboardClientProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [pendingApprovalIds, setPendingApprovalIds] = useState<Set<number>>(
    () => new Set()
  );
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTaskUser, setSelectedTaskUser] =
    useState<SelectedTaskUserState | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [taskSubmitError, setTaskSubmitError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const router = useRouter();

  const [taskShift, setTaskShift] = useState<TimeRange>(DEFAULT_SHIFT_RANGE);
  const [taskForm, setTaskForm] = useState<
    Omit<TaskInput, "userId" | "date" | "shift">
  >({
    companyName: "",
    task: "",
    carName: "",
    transportType: TRANSPORT_TYPES[0],
    location: "",
  });

  const taskLookup = useMemo(() => tasksByUserAndDay(initialTasks), [initialTasks]);

  const calendarYear = year;
  const calendarMonth = monthNumber;

  const summaries = useMemo(
    () => computeDashboardUserSummaries(initialTasks, users, calendarYear, calendarMonth),
    [initialTasks, users, calendarYear, calendarMonth]
  );

  const openTaskDialog = useCallback(
    (selectedUserId: number, selectedUserName: string, row: DashboardRow) => {
      const rowDate = new Date(row.calendarYear, row.calendarMonth - 1, row.dateNum);
      const dateLabel = rowDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      setEditingTaskId(null);
      setSelectedTaskUser({
        userId: selectedUserId,
        userName: selectedUserName,
        dateLabel,
        calendarYear: row.calendarYear,
        calendarMonth: row.calendarMonth,
        dayOfMonth: row.dateNum,
      });
      setTaskShift(DEFAULT_SHIFT_RANGE);
      setTaskForm({
        companyName: "",
        task: "",
        carName: "",
        transportType: TRANSPORT_TYPES[0],
        location: "",
      });
      setTaskSubmitError(null);
      setIsTaskDialogOpen(true);
    },
    []
  );

  const openEditTaskDialog = useCallback(
    (selectedUserName: string, row: DashboardRow, record: TaskRecord) => {
      const rowDate = new Date(row.calendarYear, row.calendarMonth - 1, row.dateNum);
      const dateLabel = rowDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      setEditingTaskId(record.id);
      setSelectedTaskUser({
        userId: record.userId,
        userName: selectedUserName,
        dateLabel,
        calendarYear: row.calendarYear,
        calendarMonth: row.calendarMonth,
        dayOfMonth: row.dateNum,
      });
      setTaskShift(parseShift(record.shift) ?? DEFAULT_SHIFT_RANGE);
      setTaskForm({
        companyName: record.companyName,
        task: record.task,
        carName: record.carName,
        transportType: record.transportType as TransportType,
        location: record.location,
      });
      setTaskSubmitError(null);
      setIsTaskDialogOpen(true);
    },
    []
  );

  useEffect(() => {
    const storedUser = getAuthUser();
    if (!storedUser) {
      router.push("/login");
      return;
    }

    setUser(storedUser);
    setLoading(false);
  }, [router]);

  // Clear pending toggle spinners once the server-refreshed props arrive
  // (this is what makes the spinner stay visible until the user columns
  // actually update).
  useEffect(() => {
    setTeamMembers(initialTeamMembers);
    setPendingApprovalIds((current) => (current.size === 0 ? current : new Set()));
  }, [initialTeamMembers, users]);

  const columns = useDashboardColumns({
    users,
    taskLookup,
    canManageTasks: Boolean(user?.isAdmin),
    openTaskDialog,
    openEditTaskDialog,
  });

  const table = useReactTable({
    data: initialData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const manageableMembers = teamMembers.filter((member) => !member.isAdmin);

  const toggleApproval = async (id: number, currentStatus: boolean) => {
    if (pendingApprovalIds.has(id)) return;

    const nextStatus = !currentStatus;

    setPendingApprovalIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    setTeamMembers((members) =>
      members.map((member) =>
        member.id === id ? { ...member, isApproved: nextStatus } : member
      )
    );

    const clearPending = () =>
      setPendingApprovalIds((current) => {
        if (!current.has(id)) return current;
        const next = new Set(current);
        next.delete(id);
        return next;
      });

    try {
      const success = await updateUserApproval(id, nextStatus);
      if (!success) {
        setTeamMembers((members) =>
          members.map((member) =>
            member.id === id ? { ...member, isApproved: currentStatus } : member
          )
        );
        clearPending();
        return;
      }

      // Pending stays true until the server-refreshed props land
      // (cleared by the effect above), so the spinner persists until
      // the user columns actually update.
      router.refresh();
    } catch (err) {
      setTeamMembers((members) =>
        members.map((member) =>
          member.id === id ? { ...member, isApproved: currentStatus } : member
        )
      );
      clearPending();
      console.error("Failed to update approval", err);
    }
  };

  const handleLogout = async () => {
    await clearServerSession();
    clearAuthUser();
    router.push("/login");
    router.refresh();
  };

  const handleTaskSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTaskUser) {
      return;
    }

    setIsSubmittingTask(true);
    setTaskSubmitError(null);

    const shift = formatShift(taskShift);
    if (!parseShift(shift)) {
      setTaskSubmitError("Please enter a valid shift time range.");
      setIsSubmittingTask(false);
      return;
    }

    if (isRichTextEmpty(taskForm.task)) {
      setTaskSubmitError("Please enter a task description.");
      setIsSubmittingTask(false);
      return;
    }

    if (isRichTextEmpty(taskForm.location) || !extractUrlFromRichText(taskForm.location)) {
      setTaskSubmitError("Location must include a valid URL.");
      setIsSubmittingTask(false);
      return;
    }

    const body = {
      date: calendarDateIso(
        selectedTaskUser.calendarYear,
        selectedTaskUser.calendarMonth,
        selectedTaskUser.dayOfMonth
      ),
      shift,
      companyName: taskForm.companyName,
      task: taskForm.task,
      carName: taskForm.carName,
      transportType: taskForm.transportType as TransportType,
      location: taskForm.location,
    };

    const result =
      editingTaskId != null
        ? await updateTask(editingTaskId, body)
        : await createTask({
            userId: selectedTaskUser.userId,
            ...body,
          });

    if (!result.ok) {
      setTaskSubmitError(
        result.error ??
          (editingTaskId != null
            ? "Failed to update task. Please check your input and try again."
            : "Failed to create task. Please check your input and try again.")
      );
      setIsSubmittingTask(false);
      return;
    }

    setIsSubmittingTask(false);
    setEditingTaskId(null);
    setIsTaskDialogOpen(false);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8 font-sans text-neutral-100 selection:bg-indigo-500/30">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeader
          user={user}
          manageableMembers={manageableMembers}
          pendingApprovalIds={pendingApprovalIds}
          onToggleApproval={toggleApproval}
          onLogout={handleLogout}
          subtitle={`Manage your team's availability and schedule for ${monthLabel}.`}
        />

        <MonthlyMonthPagination year={year} monthNumber={monthNumber} />

        <DashboardDataTable table={table} users={users} summaries={summaries} />

        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={(open) => {
            setIsTaskDialogOpen(open);
            if (!open) {
              setEditingTaskId(null);
            }
          }}
          editingTaskId={editingTaskId}
          selectedTaskUser={selectedTaskUser}
          taskShift={taskShift}
          onTaskShiftChange={setTaskShift}
          taskForm={taskForm}
          onTaskFormChange={setTaskForm}
          taskSubmitError={taskSubmitError}
          isSubmittingTask={isSubmittingTask}
          onSubmit={handleTaskSubmit}
        />
      </div>
    </div>
  );
}
