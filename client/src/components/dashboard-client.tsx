"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CirclePlus, MapPin, Pencil } from "lucide-react";
import { createTask, updateTask, updateUserApproval } from '@/features/dashboard/actions';
import type {
  CurrentUser,
  DashboardRow,
  TaskInput,
  TaskRecord,
  TeamMember,
  TransportType,
  User,
} from "@/features/dashboard/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DashboardClientProps = {
  initialData: DashboardRow[];
  initialTeamMembers: TeamMember[];
  users: User[];
  initialTasks: TaskRecord[];
};

const TRANSPORT_TYPES = ["own car", "company car", "going with other"] as const satisfies readonly TransportType[];

const TRANSPORT_TYPE_META = {
  "own car": {
    dotClass: "bg-emerald-400 ring-2 ring-emerald-400/35",
    label: "Own car",
  },
  "company car": {
    dotClass: "bg-amber-400 ring-2 ring-amber-400/35",
    label: "Company car",
  },
  "going with other": {
    dotClass: "bg-violet-400 ring-2 ring-violet-400/35",
    label: "Going with other",
  },
} as const satisfies Record<TransportType, { dotClass: string; label: string }>;

function transportTypeMeta(type: string): { dotClass: string; label: string } {
  const known = TRANSPORT_TYPE_META[type as TransportType];
  if (known) {
    return known;
  }
  return {
    dotClass: "bg-neutral-500 ring-2 ring-neutral-500/30",
    label: type || "Transport",
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const getDefaultTimeLocal = () => {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
};

function localTimeFromIso(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function combineDateAndTime(
  year: number,
  month1to12: number,
  dayOfMonth: number,
  timeHHmm: string
): Date | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(timeHHmm.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return new Date(year, month1to12 - 1, dayOfMonth, hours, minutes, 0, 0);
}

function taskCellKey(userId: number, dayOfMonth: number) {
  return `${userId}-${dayOfMonth}`;
}

function TransportTypeDot({ transportType }: { transportType: string }) {
  const meta = transportTypeMeta(transportType);
  return (
    <span className="inline-flex shrink-0 items-center justify-center" title={meta.label}>
      <span className="sr-only">{meta.label}</span>
      <span
        aria-hidden
        className={cn("inline-block size-2.5 rounded-full", meta.dotClass)}
      />
    </span>
  );
}

/** Keeps the latest task per user per calendar day (API returns newest first). */
function tasksByUserAndDay(tasks: TaskRecord[]) {
  const map = new Map<string, TaskRecord>();
  for (const t of tasks) {
    const day = new Date(t.timestamp).getDate();
    const key = taskCellKey(t.userId, day);
    if (!map.has(key)) {
      map.set(key, t);
    }
  }
  return map;
}

export default function DashboardClient({
  initialData,
  initialTeamMembers,
  users,
  initialTasks,
}: DashboardClientProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTaskUser, setSelectedTaskUser] = useState<{
    userId: number;
    userName: string;
    dateLabel: string;
    calendarYear: number;
    calendarMonth: number;
    dayOfMonth: number;
  } | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [taskSubmitError, setTaskSubmitError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const router = useRouter();

  const [taskTime, setTaskTime] = useState(getDefaultTimeLocal);
  const [taskForm, setTaskForm] = useState<Omit<TaskInput, "userId" | "timestamp">>({
    companyName: "",
    task: "",
    carName: "",
    transportType: TRANSPORT_TYPES[0],
    location: "",
  });

  const taskLookup = useMemo(() => tasksByUserAndDay(initialTasks), [initialTasks]);

  const openTaskDialog = useCallback((selectedUserId: number, selectedUserName: string, row: DashboardRow) => {
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
    setTaskTime(getDefaultTimeLocal());
    setTaskForm({
      companyName: "",
      task: "",
      carName: "",
      transportType: TRANSPORT_TYPES[0],
      location: "",
    });
    setTaskSubmitError(null);
    setIsTaskDialogOpen(true);
  }, []);

  const openEditTaskDialog = useCallback((selectedUserName: string, row: DashboardRow, record: TaskRecord) => {
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
    setTaskTime(localTimeFromIso(record.timestamp));
    setTaskForm({
      companyName: record.companyName,
      task: record.task,
      carName: record.carName,
      transportType: record.transportType as TransportType,
      location: record.location,
    });
    setTaskSubmitError(null);
    setIsTaskDialogOpen(true);
  }, []);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    if (!storedUserStr) {
      router.push('/login');
      return;
    }

    const storedUser = JSON.parse(storedUserStr) as CurrentUser;
    setUser(storedUser);
    setLoading(false);
  }, [router]);

  const columns: ColumnDef<DashboardRow>[] = useMemo(
    () => [
      {
        id: 'dateNum',
        accessorKey: 'dateNum',
        header: 'Date',
        cell: ({ row }) => row.original.dateNum,
      },
      {
        id: 'dayName',
        accessorKey: 'dayName',
        header: 'Day',
        cell: ({ row }) => row.original.dayName,
      },
      {
        id: 'week',
        accessorKey: 'week',
        header: 'Week',
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center text-indigo-400 font-bold text-xs">
            {row.original.week}
          </span>
        ),
      },
      ...users.map((currentUser) => ({
        id: `user-${currentUser.id}`,
        header: currentUser.name,
        cell: ({ row }: { row: { original: DashboardRow } }) => {
          const existing = taskLookup.get(
            taskCellKey(currentUser.id, row.original.dateNum)
          );

          if (existing) {
            return (
              <div className="flex h-full min-h-[6.5rem] w-full flex-col items-center justify-center gap-2 border-l border-transparent px-4 py-3 text-center">
                <p className="w-full max-w-full text-sm font-semibold leading-snug text-neutral-50">
                  {existing.companyName}
                </p>
                <p className="line-clamp-3 w-full max-w-full text-sm leading-relaxed text-neutral-300">
                  {existing.task}
                </p>
                <div className="flex max-w-full flex-wrap items-center justify-center gap-x-2 text-xs text-neutral-400">
                  <span className="max-w-full font-medium">{existing.carName}</span>
                  <span aria-hidden className="text-neutral-500">
                    ·
                  </span>
                  <TransportTypeDot transportType={existing.transportType} />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5">
                  <a
                    href={existing.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-indigo-400 transition-colors hover:text-indigo-300"
                    aria-label="Open location"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MapPin className="h-4 w-4" aria-hidden />
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditTaskDialog(currentUser.name, row.original, existing);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <button
              type="button"
              onClick={() => openTaskDialog(currentUser.id, currentUser.name, row.original)}
              className="flex h-full w-full items-center justify-center rounded-md px-6 py-5 text-neutral-500 transition-colors hover:bg-neutral-800/60 hover:text-indigo-400"
              aria-label={`Add task for ${currentUser.name}`}
            >
              <CirclePlus className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
            </button>
          );
        },
      })),
    ],
    [users, openTaskDialog, openEditTaskDialog, taskLookup]
  );

  const table = useReactTable({
    data: initialData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const manageableMembers = teamMembers.filter((member) => !member.isAdmin);

  const toggleApproval = async (id: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Optimistic update keeps the toggle responsive.
    setTeamMembers((members) =>
      members.map((member) =>
        member.id === id ? { ...member, isApproved: nextStatus } : member
      )
    );

    try {
      const success = await updateUserApproval(id, nextStatus);
      if (!success) {
        setTeamMembers((members) =>
          members.map((member) =>
            member.id === id ? { ...member, isApproved: currentStatus } : member
          )
        );
        return;
      }

      // Re-fetch server data so approved users and table columns stay in sync.
      router.refresh();
    } catch (err) {
      setTeamMembers((members) =>
        members.map((member) =>
          member.id === id ? { ...member, isApproved: currentStatus } : member
        )
      );
      console.error('Failed to update approval', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
  };

  const handleTaskSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTaskUser) {
      return;
    }

    setIsSubmittingTask(true);
    setTaskSubmitError(null);

    const at = combineDateAndTime(
      selectedTaskUser.calendarYear,
      selectedTaskUser.calendarMonth,
      selectedTaskUser.dayOfMonth,
      taskTime
    );
    if (!at) {
      setTaskSubmitError("Please enter a valid time.");
      setIsSubmittingTask(false);
      return;
    }

    const body = {
      timestamp: at.toISOString(),
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
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-2 relative">
          <div className="absolute top-0 right-0 flex items-center gap-4 z-50">
            {user?.isAdmin && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                  Admin
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300">
                      Manage Users
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 bg-neutral-900 border-neutral-800 text-neutral-200">
                    <DropdownMenuLabel className="text-neutral-500 uppercase tracking-wider">Team Members</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <div className="max-h-60 overflow-y-auto">
                      {manageableMembers.map((member) => (
                        <DropdownMenuItem
                          key={member.id}
                          className="flex justify-between items-center focus:bg-neutral-800/50"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <div className="flex flex-col pr-4">
                            <span className="font-medium">{member.name}</span>
                            <span className="text-xs text-neutral-500">{member.email}</span>
                          </div>
                          <Toggle
                            pressed={member.isApproved}
                            onPressedChange={() => toggleApproval(member.id, member.isApproved)}
                            className={`data-[state=on]:bg-emerald-500 data-[state=on]:text-white ${!member.isApproved && 'bg-neutral-800 text-neutral-400'}`}
                            size="sm"
                          >
                            {member.isApproved ? 'Approved' : 'Pending'}
                          </Toggle>
                        </DropdownMenuItem>
                      ))}
                      {manageableMembers.length === 0 && (
                        <DropdownMenuItem disabled className="text-neutral-500">No users found.</DropdownMenuItem>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <Button asChild variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-800" onClick={handleLogout}>
              <Link href="/login">
                Log Out
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Employee Dashboard
          </h1>
          <p className="text-neutral-400 text-lg">
            Manage your team&apos;s availability and schedule at a glance.
          </p>
        </header>

        <main className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-center caption-bottom text-sm">
              <thead className="bg-neutral-950/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-neutral-800 hover:bg-transparent border-b">
                    {headerGroup.headers.map((header) => {
                      const id = header.column.id;
                      const isUserHeader = id.startsWith("user-");
                      const stickyClass =
                        id === 'dateNum'
                          ? 'sticky left-0 bg-neutral-900/90 backdrop-blur z-20 w-20 text-center'
                          : id === 'dayName'
                            ? 'sticky left-20 bg-neutral-900/90 backdrop-blur z-20 w-32 text-center'
                            : id === 'week'
                              ? 'sticky left-[13rem] bg-neutral-900/90 backdrop-blur z-20 w-32 text-center'
                              : isUserHeader
                                ? 'w-56 min-w-56 max-w-56 text-center'
                                : 'text-center';
                      return (
                        <th
                          key={header.id}
                          className={`py-4 px-6 text-neutral-300 font-semibold border-b border-neutral-800 h-10 text-center align-middle whitespace-nowrap ${stickyClass}`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-neutral-800/50 hover:bg-neutral-800/50 transition-colors group border-b"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const id = cell.column.id;
                      const isUserCell = id.startsWith("user-");
                      const stickyClass =
                        id === 'dateNum'
                          ? 'sticky left-0 bg-neutral-900 group-hover:bg-neutral-800 text-center border-r border-neutral-800/50 z-10 text-neutral-300 font-bold'
                          : id === 'dayName'
                            ? 'sticky left-20 bg-neutral-900 group-hover:bg-neutral-800 text-center border-r border-neutral-800/50 z-10 text-neutral-400 font-medium'
                            : id === 'week'
                              ? 'sticky left-[13rem] bg-neutral-900 group-hover:bg-neutral-800 text-center border-r border-neutral-800/50 z-10 text-neutral-400 font-medium'
                              : isUserCell
                                ? 'w-56 min-w-56 max-w-56 text-center'
                                : 'text-center';
                      return (
                        <td
                          key={cell.id}
                          className={`${isUserCell ? "p-0 whitespace-normal" : "py-3 px-6 whitespace-nowrap"} text-sm align-middle ${stickyClass}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        <Dialog
          open={isTaskDialogOpen}
          onOpenChange={(open) => {
            setIsTaskDialogOpen(open);
            if (!open) {
              setEditingTaskId(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-lg border-neutral-800 bg-neutral-900 text-neutral-100">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">
                {editingTaskId != null ? "Update task" : "Add Task"}
              </DialogTitle>
              <DialogDescription className="text-neutral-400">
                {selectedTaskUser
                  ? editingTaskId != null
                    ? `Edit task for ${selectedTaskUser.userName}. Date comes from the cell you selected.`
                    : `Add a task for ${selectedTaskUser.userName}. Date comes from the cell you clicked.`
                  : "Add a task."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <div
                  className="flex h-8 w-full items-center rounded-lg border border-neutral-700 bg-neutral-800/40 px-2.5 text-sm text-neutral-200"
                  aria-live="polite"
                >
                  {selectedTaskUser?.dateLabel ?? "—"}
                </div>
                <p className="text-xs text-neutral-500">
                  Set from the row you selected; it cannot be changed here.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskTime">Time</Label>
                <Input
                  id="taskTime"
                  type="time"
                  required
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  className="border-neutral-700 bg-neutral-800/60 text-neutral-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  required
                  value={taskForm.companyName}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="border-neutral-700 bg-neutral-800/60 text-neutral-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskText">Task</Label>
                <textarea
                  id="taskText"
                  required
                  value={taskForm.task}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, task: e.target.value }))}
                  className="w-full min-h-24 rounded-lg border border-neutral-700 bg-neutral-800/60 px-2.5 py-2 text-sm text-neutral-100 outline-none focus-visible:border-indigo-400 focus-visible:ring-3 focus-visible:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carName">Car Name</Label>
                <Input
                  id="carName"
                  required
                  value={taskForm.carName}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, carName: e.target.value }))}
                  className="border-neutral-700 bg-neutral-800/60 text-neutral-100"
                />
              </div>

              <div className="space-y-2">
                <Label id="transport-type-label">Transport</Label>
                <div
                  role="radiogroup"
                  aria-labelledby="transport-type-label"
                  className="flex flex-wrap items-center gap-3"
                >
                  {TRANSPORT_TYPES.map((t) => {
                    const meta = TRANSPORT_TYPE_META[t];
                    const selected = taskForm.transportType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        title={meta.label}
                        onClick={() =>
                          setTaskForm((prev) => ({ ...prev, transportType: t }))
                        }
                        className={cn(
                          "rounded-full p-1 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                          selected &&
                            "ring-2 ring-indigo-400 ring-offset-2 ring-offset-neutral-900"
                        )}
                      >
                        <span className={cn("block size-3 rounded-full", meta.dotClass)} />
                        <span className="sr-only">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location URL</Label>
                <Input
                  id="location"
                  type="url"
                  placeholder="https://example.com/location"
                  required
                  value={taskForm.location}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, location: e.target.value }))}
                  className="border-neutral-700 bg-neutral-800/60 text-neutral-100 placeholder:text-neutral-500"
                />
              </div>

              {taskSubmitError ? (
                <p className="text-sm text-red-400">{taskSubmitError}</p>
              ) : null}

              <DialogFooter className="-mx-0 -mb-0 rounded-b-lg border-neutral-800 bg-neutral-900/80 p-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTaskDialogOpen(false)}
                  className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingTask || !selectedTaskUser}
                  className="bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  {isSubmittingTask
                    ? "Saving..."
                    : editingTaskId != null
                      ? "Update task"
                      : "Save Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
