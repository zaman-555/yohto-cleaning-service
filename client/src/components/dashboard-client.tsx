"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Eye, EyeOff, Loader2, Search, X } from "lucide-react";
import { isRichTextEmpty, looksLikeHtml, stripHtmlToPlainText } from "@/lib/rich-text";
import {
  createTask,
  deleteUser,
  updateDashboardStaffOrder,
  updateScheduleMonthVisibility,
  updateTask,
  updateUserApproval,
} from "@/features/dashboard/actions";
import { clearAuthUser, clearServerSession, getAuthUser } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isLeaveTransportType,
  type CurrentUser,
  type DashboardRow,
  type TaskInput,
  type TaskRecord,
  type TransportType,
} from "@/features/dashboard/types";
import { useAdminTeamMembers } from "./dashboard/use-admin-team-members";
import { DashboardDataTable } from "./dashboard/dashboard-data-table";
import { DashboardShell } from "./dashboard/dashboard-shell";
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
import {
  applyDashboardStaffOrder,
  putCurrentStaffFirst,
} from "@/features/dashboard/staff-order";
import { useDashboardColumns } from "./dashboard/use-dashboard-columns";

export default function DashboardClient({
  year,
  monthNumber,
  monthLabel,
  initialData,
  initialTeamMembers,
  users,
  initialTasks,
  initialYearTasks,
  initialCompanySearch = "",
  initialMonthVisibility,
  initialDashboardStaffOrder,
}: DashboardClientProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingApprovalIds, setPendingApprovalIds] = useState<Set<number>>(
    () => new Set()
  );
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<number>>(
    () => new Set()
  );
  const pendingMutation = pendingApprovalIds.size > 0 || pendingDeleteIds.size > 0;
  const { teamMembers, setTeamMembers, refetchTeamMembers } = useAdminTeamMembers(
    initialTeamMembers,
    pendingMutation
  );
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTaskUser, setSelectedTaskUser] =
    useState<SelectedTaskUserState | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [taskSubmitError, setTaskSubmitError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [companySearch, setCompanySearch] = useState(initialCompanySearch);
  const [monthVisibility, setMonthVisibility] = useState(initialMonthVisibility);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [dashboardStaffOrder, setDashboardStaffOrder] = useState(
    initialDashboardStaffOrder
  );
  const [isSavingStaffOrder, setIsSavingStaffOrder] = useState(false);
  const [staffOrderError, setStaffOrderError] = useState<string | null>(null);
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

  const [tasks, setTasks] = useState<TaskRecord[]>(initialTasks);

  // Keep local tasks in sync with the server-refreshed props. Optimistic
  // edits below update `tasks` immediately; this reconciles once the
  // refreshed data lands.
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    setDashboardStaffOrder(initialDashboardStaffOrder);
  }, [initialDashboardStaffOrder]);

  const taskLookup = useMemo(() => tasksByUserAndDay(tasks), [tasks]);

  const calendarYear = year;
  const calendarMonth = monthNumber;
  const normalizedCompanySearch = companySearch.trim().toLocaleLowerCase();
  const canSearchCompanies = Boolean(user?.isAdmin);
  const activeCompanySearch = canSearchCompanies ? normalizedCompanySearch : "";
  const userNameById = useMemo(
    () => new Map(users.map((teamUser) => [teamUser.id, teamUser.name])),
    [users]
  );
  const yearMatchingTasks = useMemo(() => {
    if (!activeCompanySearch) return [];
    return initialYearTasks.filter((task) =>
      task.companyName.toLocaleLowerCase().includes(activeCompanySearch)
    );
  }, [activeCompanySearch, initialYearTasks]);
  const matchingTasks = useMemo(() => {
    if (!activeCompanySearch) return tasks;
    return tasks.filter((task) =>
      task.companyName.toLocaleLowerCase().includes(activeCompanySearch)
    );
  }, [activeCompanySearch, tasks]);
  const visibleData = useMemo(() => {
    if (!activeCompanySearch) return initialData;
    const matchingDays = new Set(
      matchingTasks.map((task) => Number(task.date.slice(8, 10)))
    );
    return initialData.filter((row) => matchingDays.has(row.dateNum));
  }, [activeCompanySearch, initialData, matchingTasks]);

  const adminOrderedUsers = useMemo(
    () => applyDashboardStaffOrder(users, dashboardStaffOrder),
    [users, dashboardStaffOrder]
  );

  // Staff always see their own column first. This display-only change does
  // not modify the administrator's persisted order.
  const orderedUsers = useMemo(() => {
    if (!user || user.isAdmin) return adminOrderedUsers;
    return putCurrentStaffFirst(adminOrderedUsers, user.id);
  }, [adminOrderedUsers, user]);

  const summaries = useMemo(
    () =>
      computeDashboardUserSummaries(
        matchingTasks,
        orderedUsers,
        calendarYear,
        calendarMonth
      ),
    [matchingTasks, orderedUsers, calendarYear, calendarMonth]
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
      const transportType = record.transportType as TransportType;
      const taskText = isLeaveTransportType(transportType)
        ? looksLikeHtml(record.task)
          ? stripHtmlToPlainText(record.task).trim() || transportType
          : record.task.trim() || transportType
        : record.task;
      setTaskForm({
        companyName: record.companyName,
        task: taskText,
        carName: record.carName,
        transportType,
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

  // Clear pending toggle spinners once the server-refreshed props arrive.
  useEffect(() => {
    setPendingApprovalIds((current) => (current.size === 0 ? current : new Set()));
    setPendingDeleteIds((current) => (current.size === 0 ? current : new Set()));
  }, [initialTeamMembers, users]);

  const columns = useDashboardColumns({
    users: orderedUsers,
    taskLookup,
    canManageTasks: Boolean(user?.isAdmin),
    currentUserId: user?.id ?? null,
    openTaskDialog,
    openEditTaskDialog,
  });

  const table = useReactTable({
    data: visibleData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const manageableMembers = teamMembers.filter((member) => !member.isAdmin);

  const handleStaffColumnMove = useCallback(
    async (draggedUserId: number, targetUserId: number) => {
      if (!user?.isAdmin || isSavingStaffOrder || draggedUserId === targetUserId) {
        return;
      }

      const previousOrder = orderedUsers.map((staffUser) => staffUser.id);
      const draggedIndex = previousOrder.indexOf(draggedUserId);
      const targetIndex = previousOrder.indexOf(targetUserId);
      if (draggedIndex < 0 || targetIndex < 0) {
        return;
      }

      const nextOrder = [...previousOrder];
      [nextOrder[draggedIndex], nextOrder[targetIndex]] = [
        nextOrder[targetIndex],
        nextOrder[draggedIndex],
      ];

      setDashboardStaffOrder(nextOrder);
      setStaffOrderError(null);
      setIsSavingStaffOrder(true);
      const result = await updateDashboardStaffOrder(nextOrder);
      if (result.ok) {
        setDashboardStaffOrder(result.staffUserIds);
      } else {
        setDashboardStaffOrder(previousOrder);
        setStaffOrderError(result.error);
      }
      setIsSavingStaffOrder(false);
    },
    [isSavingStaffOrder, orderedUsers, user]
  );

  const handleMonthVisibilityChange = async () => {
    if (!user?.isAdmin || !monthVisibility.isFuture || isUpdatingVisibility) {
      return;
    }
    setIsUpdatingVisibility(true);
    setVisibilityError(null);
    const result = await updateScheduleMonthVisibility(
      year,
      monthNumber,
      !monthVisibility.isPublished
    );
    if (result.ok) {
      setMonthVisibility(result.visibility);
      router.refresh();
    } else {
      setVisibilityError(result.error);
    }
    setIsUpdatingVisibility(false);
  };

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

      await refetchTeamMembers();
      clearPending();
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

  const removeUser = async (id: number) => {
    if (pendingDeleteIds.has(id)) return;

    setPendingDeleteIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    const clearPending = () =>
      setPendingDeleteIds((current) => {
        if (!current.has(id)) return current;
        const next = new Set(current);
        next.delete(id);
        return next;
      });

    try {
      const result = await deleteUser(id);
      if (!result.ok) {
        clearPending();
        console.error("Failed to delete user", result.error);
        return;
      }

      setTeamMembers((members) => members.filter((member) => member.id !== id));
      await refetchTeamMembers();
      clearPending();
      router.refresh();
    } catch (err) {
      clearPending();
      console.error("Failed to delete user", err);
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

    const isLeave = isLeaveTransportType(taskForm.transportType);
    const shift = formatShift(taskShift);
    if (!isLeave && !parseShift(shift)) {
      setTaskSubmitError("Please enter a valid shift time range.");
      setIsSubmittingTask(false);
      return;
    }

    if (isLeave ? !taskForm.task.trim() : isRichTextEmpty(taskForm.task)) {
      setTaskSubmitError("Please enter a task description.");
      setIsSubmittingTask(false);
      return;
    }

    if (!isLeave && isRichTextEmpty(taskForm.location)) {
      setTaskSubmitError("Please enter a location.");
      setIsSubmittingTask(false);
      return;
    }

    const body = {
      date: calendarDateIso(
        selectedTaskUser.calendarYear,
        selectedTaskUser.calendarMonth,
        selectedTaskUser.dayOfMonth
      ),
      shift: isLeave ? "" : shift,
      companyName: isLeave ? "" : taskForm.companyName,
      task: isLeave ? taskForm.task.trim() : taskForm.task,
      carName: isLeave ? "" : taskForm.carName,
      transportType: taskForm.transportType as TransportType,
      location: isLeave ? "" : taskForm.location,
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

    // Optimistically reflect the edit (e.g. transport color) right away so
    // the cell updates instantly instead of waiting for the server refresh.
    if (editingTaskId != null) {
      const editedId = editingTaskId;
      setTasks((current) =>
        current.map((t) =>
          t.id === editedId
            ? {
                ...t,
                shift: body.shift,
                companyName: body.companyName,
                task: body.task,
                carName: body.carName,
                transportType: body.transportType,
                location: body.location,
              }
            : t
        )
      );
    }

    setIsSubmittingTask(false);
    setEditingTaskId(null);
    setIsTaskDialogOpen(false);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }

  return (
    <DashboardShell
      user={user}
      manageableMembers={manageableMembers}
      pendingApprovalIds={pendingApprovalIds}
      pendingDeleteIds={pendingDeleteIds}
      onToggleApproval={toggleApproval}
      onDeleteUser={removeUser}
      onLogout={handleLogout}
      title="Extra team Dashboard"
      subtitle={`Manage your team's availability and schedule for ${monthLabel}.`}
      logoSrc="/pink_logo_rgb.webp"
      logoAlt="Extra team"
    >
      <MonthlyMonthPagination year={year} monthNumber={monthNumber} />

      {user?.isAdmin && monthVisibility.isFuture ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Staff access for {monthLabel}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {monthVisibility.isPublished
                ? "Published — staff can see this month’s schedule and tasks."
                : "Private — only admins can see and prepare this month."}
            </p>
            {visibilityError ? (
              <p className="mt-1 text-xs text-destructive">{visibilityError}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant={monthVisibility.isPublished ? "outline" : "default"}
            onClick={handleMonthVisibilityChange}
            disabled={isUpdatingVisibility}
            className="self-start sm:self-auto"
          >
            {isUpdatingVisibility ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : monthVisibility.isPublished ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
            {monthVisibility.isPublished ? "Hide from staff" : "Publish to staff"}
          </Button>
        </div>
      ) : null}

      {!user?.isAdmin && !monthVisibility.isVisibleToStaff ? (
        <div className="rounded-xl border border-border bg-muted/40 px-5 py-10 text-center">
          <EyeOff className="mx-auto size-6 text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Schedule not published yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            An administrator is still preparing {monthLabel}. It will appear
            here after it is published.
          </p>
        </div>
      ) : (
        <>
      {canSearchCompanies ? (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={companySearch}
                onChange={(event) => setCompanySearch(event.target.value)}
                placeholder="Search company name"
                aria-label="Search assignments by company name"
                className="h-9 pl-8 pr-9"
              />
              {companySearch ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCompanySearch("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  aria-label="Clear company search"
                >
                  <X className="size-4" aria-hidden />
                </Button>
              ) : null}
            </div>
            {activeCompanySearch ? (
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {yearMatchingTasks.length}{" "}
                {yearMatchingTasks.length === 1 ? "result" : "results"} in {year}
              </p>
            ) : null}
          </div>

          {activeCompanySearch && yearMatchingTasks.length > 0 ? (
            <div className="max-h-80 overflow-y-auto rounded-xl border border-border bg-card shadow-sm">
              <div className="sticky top-0 z-10 border-b border-border bg-muted/95 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur">
                Select a result to open its month
              </div>
              <div className="divide-y divide-border">
                {yearMatchingTasks.slice(0, 50).map((task) => {
                  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(task.date);
                  const resultYear = Number(match?.[1] ?? year);
                  const resultMonth = Number(match?.[2] ?? monthNumber);
                  const resultDay = Number(match?.[3] ?? 1);
                  const dateLabel = new Date(
                    resultYear,
                    resultMonth - 1,
                    resultDay
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const href = `/?year=${resultYear}&month=${resultMonth}&company=${encodeURIComponent(
                    companySearch.trim()
                  )}`;

                  return (
                    <Link
                      key={task.id}
                      href={href}
                      className="flex items-center justify-between gap-4 px-3 py-2.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {task.companyName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {userNameById.get(task.userId) ?? "Unknown staff"}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {dateLabel}
                      </span>
                    </Link>
                  );
                })}
              </div>
              {yearMatchingTasks.length > 50 ? (
                <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  Showing the first 50 of {yearMatchingTasks.length} results.
                  Add more letters to narrow the search.
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      {staffOrderError ? (
        <p className="text-sm text-destructive" role="alert">
          {staffOrderError}
        </p>
      ) : null}

      {activeCompanySearch && visibleData.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            {yearMatchingTasks.length === 0
              ? `No company found in ${year}`
              : `No matches in ${monthLabel}`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {yearMatchingTasks.length === 0
              ? "Try a different spelling or clear the search."
              : "Select a result above to open the month where it was assigned."}
          </p>
        </div>
      ) : (
        <DashboardDataTable
          table={table}
          users={orderedUsers}
          summaries={summaries}
          currentUserId={user?.id ?? null}
          canReorderUsers={Boolean(user?.isAdmin) && !isSavingStaffOrder}
          onMoveUser={handleStaffColumnMove}
        />
      )}
        </>
      )}

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
    </DashboardShell>
  );
}
