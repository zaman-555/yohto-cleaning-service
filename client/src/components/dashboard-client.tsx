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
import { ClipboardPlus } from "lucide-react";
import { createTask, updateUserApproval } from '@/features/dashboard/actions';
import type {
  CurrentUser,
  DashboardRow,
  TaskInput,
  TeamMember,
  TransportType,
  User,
} from '@/features/dashboard/types';
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
};

const getDefaultTimestamp = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

export default function DashboardClient({
  initialData,
  initialTeamMembers,
  users,
}: DashboardClientProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTaskUser, setSelectedTaskUser] = useState<{
    userId: number;
    userName: string;
    dateLabel: string;
  } | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [taskSubmitError, setTaskSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const [taskForm, setTaskForm] = useState<Omit<TaskInput, "userId">>({
    timestamp: getDefaultTimestamp(),
    companyName: "",
    task: "",
    carName: "",
    transportType: "own car",
    location: "",
  });

  const openTaskDialog = useCallback((selectedUserId: number, selectedUserName: string, row: DashboardRow) => {
    setSelectedTaskUser({
      userId: selectedUserId,
      userName: selectedUserName,
      dateLabel: `${row.dayName} ${row.dateNum}`,
    });
    setTaskForm({
      timestamp: getDefaultTimestamp(),
      companyName: "",
      task: "",
      carName: "",
      transportType: "own car",
      location: "",
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
          return (
            <button
              type="button"
              onClick={() => openTaskDialog(currentUser.id, currentUser.name, row.original)}
              className="flex h-full w-full items-center justify-center rounded-md px-6 py-3 hover:bg-neutral-800/60 transition-colors"
              aria-label={`Add task for ${currentUser.name}`}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-200"
              >
                <ClipboardPlus className="h-3.5 w-3.5" />
                Add Task
              </span>
            </button>
          );
        },
      })),
    ],
    [users, openTaskDialog]
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

    const result = await createTask({
      userId: selectedTaskUser.userId,
      timestamp: new Date(taskForm.timestamp).toISOString(),
      companyName: taskForm.companyName,
      task: taskForm.task,
      carName: taskForm.carName,
      transportType: taskForm.transportType as TransportType,
      location: taskForm.location,
    });

    if (!result.ok) {
      setTaskSubmitError(result.error ?? "Failed to create task. Please check your input and try again.");
      setIsSubmittingTask(false);
      return;
    }

    setIsSubmittingTask(false);
    setIsTaskDialogOpen(false);
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
            <table className="w-full text-left caption-bottom text-sm">
              <thead className="bg-neutral-950/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-neutral-800 hover:bg-transparent border-b">
                    {headerGroup.headers.map((header) => {
                      const id = header.column.id;
                      const stickyClass =
                        id === 'dateNum'
                          ? 'sticky left-0 bg-neutral-900/90 backdrop-blur z-20 w-20 text-center'
                          : id === 'dayName'
                            ? 'sticky left-20 bg-neutral-900/90 backdrop-blur z-20 w-32'
                            : id === 'week'
                              ? 'sticky left-[13rem] bg-neutral-900/90 backdrop-blur z-20 w-32'
                              : 'text-center';
                      return (
                        <th
                          key={header.id}
                          className={`py-4 px-6 text-neutral-300 font-semibold border-b border-neutral-800 h-10 text-left align-middle whitespace-nowrap ${stickyClass}`}
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
                            ? 'sticky left-20 bg-neutral-900 group-hover:bg-neutral-800 border-r border-neutral-800/50 z-10 text-neutral-400 font-medium'
                            : id === 'week'
                              ? 'sticky left-[13rem] bg-neutral-900 group-hover:bg-neutral-800 border-r border-neutral-800/50 z-10 text-neutral-400 font-medium'
                              : 'text-center';
                      return (
                        <td
                          key={cell.id}
                          className={`${isUserCell ? "p-0" : "py-3 px-6"} whitespace-nowrap text-sm align-middle ${stickyClass}`}
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

        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent className="sm:max-w-lg border-neutral-800 bg-neutral-900 text-neutral-100">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">Add Task</DialogTitle>
              <DialogDescription className="text-neutral-400">
                {selectedTaskUser
                  ? `Add a task for ${selectedTaskUser.userName} on ${selectedTaskUser.dateLabel}.`
                  : "Add a task."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timestamp">Timestamp</Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  required
                  value={taskForm.timestamp}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, timestamp: e.target.value }))}
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
                <Label htmlFor="transportType">Transport Type</Label>
                <select
                  id="transportType"
                  required
                  value={taskForm.transportType}
                  onChange={(e) =>
                    setTaskForm((prev) => ({ ...prev, transportType: e.target.value as TransportType }))
                  }
                  className="h-8 w-full rounded-lg border border-neutral-700 bg-neutral-800/60 px-2.5 text-sm text-neutral-100 outline-none focus-visible:border-indigo-400 focus-visible:ring-3 focus-visible:ring-indigo-500/30"
                >
                  <option value="own car">own car</option>
                  <option value="company car">company car</option>
                  <option value="going with other">going with other</option>
                </select>
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
                  {isSubmittingTask ? "Saving..." : "Save Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
