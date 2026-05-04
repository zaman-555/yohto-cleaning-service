"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
  { id: 4, name: "Diana" },
  { id: 5, name: "Ethan" }
];

const generateTableData = () => {
  const data = [];
  const startDate = new Date();

  for (let i = 1; i <= 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i - 1);

    // Simulate some user availability (random for visual effect)
    const availability = users.map(user => ({
      userId: user.id,
      available: Math.random() > 0.3
    }));

    data.push({
      id: i,
      dateStr: currentDate.toLocaleDateString(),
      week: Math.ceil(i / 7),
      availability
    });
  }
  return data;
};

export default function Dashboard() {
  const [data] = useState(generateTableData());

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8">

        <header className="flex flex-col gap-2 relative">
          <div className="absolute top-0 right-0">
            <Link 
              href="/login"
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
                  <th className="py-4 px-6 border-b border-neutral-800 font-semibold sticky left-0 bg-neutral-900/90 backdrop-blur z-10">
                    Date
                  </th>
                  <th className="py-4 px-6 border-b border-neutral-800 font-semibold text-center">
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
                    <td className="py-3 px-6 whitespace-nowrap text-sm text-neutral-300 font-medium sticky left-0 bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                      {row.id}
                    </td>
                    <td className="py-3 px-6 text-center text-sm">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-xs">
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
