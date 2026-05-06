"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
          <div className="absolute top-0 right-0 flex items-center gap-4">
            {user?.isAdmin && (
              <div className="flex items-center gap-3 relative">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                  Admin
                </span>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-2 rounded-lg"
                >
                  Manage Users
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-3 py-2 mb-1">Team Members</h3>
                    <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                      {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between px-3 py-2 hover:bg-neutral-800/50 rounded-lg transition-colors">
                          <div className="truncate pr-2">
                            <p className="text-sm font-medium text-neutral-200 truncate">{member.name}</p>
                            <p className="text-xs text-neutral-500 truncate">{member.email}</p>
                          </div>
                          <button
                            onClick={() => toggleApproval(member.id, member.isApproved)}
                            className={`flex-shrink-0 w-10 h-5 rounded-full relative transition-colors ${member.isApproved ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${member.isApproved ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                      {teamMembers.length === 0 && (
                        <div className="px-3 py-2 text-sm text-neutral-500 text-center">No users found.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <Link
              href="/login"
              onClick={handleLogout}
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors bg-neutral-800/50 hover:bg-neutral-800 px-4 py-2 rounded-lg"
            >
              Log Out
            </Link>
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950/50 text-neutral-300 text-sm uppercase tracking-wider">
                  <th className="py-4 px-6 border-b border-neutral-800 font-semibold sticky left-0 bg-neutral-900/90 backdrop-blur z-10 w-20 text-center">
                    Date
                  </th>
                  <th className="py-4 px-6 border-b border-neutral-800 font-semibold sticky left-20 bg-neutral-900/90 backdrop-blur z-10 w-32">
                    Day
                  </th>
                  <th className="py-4 px-6 border-b border-neutral-800 font-semibold sticky left-20 bg-neutral-900/90 backdrop-blur z-10 w-32">
                    Week
                  </th>
                  {users.map(user => (
                    <th key={user.id} className="py-4 px-6 border-b border-neutral-800 font-semibold text-center">
                      {user.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {data.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-neutral-800/50 transition-colors group"
                  >
                    <td className="py-3 px-6 whitespace-nowrap text-sm text-neutral-300 font-bold sticky left-0 bg-neutral-900 group-hover:bg-neutral-800 transition-colors text-center border-r border-neutral-800/50">
                      {row.dateNum}
                    </td>
                    <td className="py-3 px-6 whitespace-nowrap text-sm text-neutral-400 font-medium sticky left-20 bg-neutral-900 group-hover:bg-neutral-800 transition-colors border-r border-neutral-800/50">
                      {row.dayName}
                    </td>
                    <td className="py-3 px-6 text-center text-sm border-r border-neutral-800/50">
                      <span className="inline-flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {row.week}
                      </span>
                    </td>
                    {row.availability.map((avail, index) => (
                      <td key={index} className="py-3 px-6 text-center">
                        {avail.available ? (
                          <div className="mx-auto w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                        ) : (
                          <div className="mx-auto w-3 h-3 rounded-full bg-neutral-700"></div>
                        )}
                      </td>
                    ))}
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
