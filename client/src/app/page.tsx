"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
  { id: 4, name: "Diana" },
  { id: 5, name: "Ethan" }
];

const getWeekNumber = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const generateTableData = () => {
  const data = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Get the number of days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);

    // Simulate some user availability (random for visual effect)
    const availability = users.map(user => ({
      userId: user.id,
      available: Math.random() > 0.3
    }));

    data.push({
      id: day,
      dateNum: day,
      dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      week: getWeekNumber(currentDate),
      availability
    });
  }
  return data;
};

export default function Dashboard() {
  const [data] = useState(generateTableData());
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    if (!storedUserStr) {
      router.push('/login');
    } else {
      const storedUser = JSON.parse(storedUserStr);
      setUser(storedUser);
      setLoading(false);
      if (storedUser.isAdmin) {
        fetchTeamMembers();
      }
    }
  }, [router]);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      setTeamMembers(data);
    } catch (err) {
      console.error('Failed to fetch team members', err);
    }
  };

  const toggleApproval = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`http://localhost:5000/api/users/${id}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus })
      });
      setTeamMembers(members => members.map(m => m.id === id ? { ...m, isApproved: !currentStatus } : m));
    } catch (err) {
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
                      {teamMembers.map(member => (
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
            Manage your team's availability and schedule at a glance.
          </p>
        </header>

        <main className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <Table className="w-full text-left">
              <TableHeader className="bg-neutral-950/50">
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead className="py-4 px-6 text-neutral-300 font-semibold sticky left-0 bg-neutral-900/90 backdrop-blur z-20 w-20 text-center border-b border-neutral-800">
                    Date
                  </TableHead>
                  <TableHead className="py-4 px-6 text-neutral-300 font-semibold sticky left-20 bg-neutral-900/90 backdrop-blur z-20 w-32 border-b border-neutral-800">
                    Day
                  </TableHead>
                  <TableHead className="py-4 px-6 text-neutral-300 font-semibold sticky left-20 bg-neutral-900/90 backdrop-blur z-20 w-32 border-b border-neutral-800">
                    Week
                  </TableHead>
                  {users.map(user => (
                    <TableHead key={user.id} className="py-4 px-6 text-neutral-300 font-semibold text-center border-b border-neutral-800">
                      {user.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-neutral-800/50 hover:bg-neutral-800/50 transition-colors group"
                  >
                    <TableCell className="py-3 px-6 whitespace-nowrap text-sm text-neutral-300 font-bold sticky left-0 bg-neutral-900 group-hover:bg-neutral-800 transition-colors text-center border-r border-neutral-800/50 z-10">
                      {row.dateNum}
                    </TableCell>
                    <TableCell className="py-3 px-6 whitespace-nowrap text-sm text-neutral-400 font-medium sticky left-20 bg-neutral-900 group-hover:bg-neutral-800 transition-colors border-r border-neutral-800/50 z-10">
                      {row.dayName}
                    </TableCell>
                    <TableCell className="py-3 px-6 whitespace-nowrap text-sm text-neutral-400 font-medium sticky left-20 bg-neutral-900 group-hover:bg-neutral-800 transition-colors border-r border-neutral-800/50 z-10">
                      <span className="inline-flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {row.week}
                      </span>
                    </TableCell>
                    {row.availability.map((avail, index) => (
                      <TableCell key={index} className="py-3 px-6 text-center">
                        {avail.available ? (
                          <div className="mx-auto w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                        ) : (
                          <div className="mx-auto w-3 h-3 rounded-full bg-neutral-700"></div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>

      </div>
    </div>
  );
}
