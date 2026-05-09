"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { updateUserApproval } from '@/features/dashboard/actions';
import type {
  CurrentUser,
  DashboardRow,
  TeamMember,
  User,
} from '@/features/dashboard/types';
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardClientProps = {
  initialData: DashboardRow[];
  initialTeamMembers: TeamMember[];
  users: User[];
};

export default function DashboardClient({
  initialData,
  initialTeamMembers,
  users,
}: DashboardClientProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const router = useRouter();

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
          const availability = row.original.availability.find(
            (item) => item.userId === currentUser.id
          );
          return availability?.available ? (
            <div className="mx-auto w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
          ) : (
            <div className="mx-auto w-3 h-3 rounded-full bg-neutral-700"></div>
          );
        },
      })),
    ],
    [users]
  );

  const table = useReactTable({
    data: initialData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
      }
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
                      {teamMembers.map((member) => (
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
                      {teamMembers.length === 0 && (
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
                          className={`py-3 px-6 whitespace-nowrap text-sm align-middle ${stickyClass}`}
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
      </div>
    </div>
  );
}
