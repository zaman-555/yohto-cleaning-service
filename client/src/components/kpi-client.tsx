"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MonthlyMonthPagination } from "@/components/dashboard/monthly-month-pagination";
import { useDashboardShell } from "@/components/dashboard/use-dashboard-shell";
import { Input } from "@/components/ui/input";
import {
  computeDashboardUserSummaries,
} from "@/features/dashboard/dashboard-summary";
import {
  countLeaveDaysByUser,
  emptyLeaveDayCount,
  leaveDayTotal,
  type LeaveDayRecord,
} from "@/features/dashboard/leave-days";
import type { TaskRecord, TeamMember, User } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

/** Default monthly working-hours target / cap per staff member. */
export const DEFAULT_WORKING_LIMIT_HOURS = 170;
const WORKING_LIMIT_STORAGE_KEY = "kpi-working-limit-hours";
const MIN_WORKING_LIMIT = 1;
const MAX_WORKING_LIMIT = 500;

function readStoredWorkingLimit(): number {
  if (typeof window === "undefined") {
    return DEFAULT_WORKING_LIMIT_HOURS;
  }
  try {
    const raw = window.localStorage.getItem(WORKING_LIMIT_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_WORKING_LIMIT_HOURS;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      return DEFAULT_WORKING_LIMIT_HOURS;
    }
    return Math.min(MAX_WORKING_LIMIT, Math.max(MIN_WORKING_LIMIT, Math.round(parsed)));
  } catch {
    return DEFAULT_WORKING_LIMIT_HOURS;
  }
}

function clampWorkingLimit(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_WORKING_LIMIT_HOURS;
  }
  return Math.min(MAX_WORKING_LIMIT, Math.max(MIN_WORKING_LIMIT, Math.round(value)));
}

export type KpiClientProps = {
  year: number;
  monthNumber: number;
  monthLabel: string;
  initialTeamMembers: TeamMember[];
  users: User[];
  initialTasks: TaskRecord[];
  yearLeaveDays: LeaveDayRecord[];
};

type ChartRow = {
  userId: number;
  name: string;
  shortName: string;
  hours: number;
  hoursLabel: string;
  remaining: number;
  remainingLabel: string;
  overLimit: boolean;
  pctOfLimit: number;
  pctLabel: string;
};

function shortDisplayName(name: string): string {
  const titled = toTitleCaseName(name);
  const parts = titled.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "—";
  }
  if (parts.length === 1) {
    return parts[0].length > 12 ? `${parts[0].slice(0, 11)}…` : parts[0];
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  const label = `${first} ${last[0]}.`;
  return label.length > 14 ? `${first.slice(0, 10)}…` : label;
}

function roundHours(hours: number): number {
  return Math.round(hours * 10) / 10;
}

/** Always one decimal place for KPI comparison (e.g. 53.0). */
function formatKpiHours(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.0";
  }
  return (Math.round(value * 10) / 10).toFixed(1);
}

/** Capitalize each word for consistent staff display names. */
function toTitleCaseName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/** Progress colours relative to the editable working limit. */
type ProgressTone = "green" | "yellow" | "red";

function hoursProgressTone(hours: number, workingLimit: number): ProgressTone {
  if (hours >= workingLimit) {
    return "red";
  }
  if (hours >= workingLimit / 2) {
    return "yellow";
  }
  return "green";
}

const PROGRESS_BAR_CLASS: Record<ProgressTone, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-rose-500",
};

export default function KpiClient({
  year,
  monthNumber,
  monthLabel,
  initialTeamMembers,
  users,
  initialTasks,
  yearLeaveDays,
}: KpiClientProps) {
  const router = useRouter();
  const {
    user,
    loading,
    manageableMembers,
    pendingApprovalIds,
    pendingDeleteIds,
    toggleApproval,
    removeUser,
    handleLogout,
  } = useDashboardShell(initialTeamMembers, users);

  const isAdmin = Boolean(user?.isAdmin);
  const [workingLimit, setWorkingLimit] = useState(DEFAULT_WORKING_LIMIT_HOURS);
  const [limitInput, setLimitInput] = useState(String(DEFAULT_WORKING_LIMIT_HOURS));

  useEffect(() => {
    const stored = readStoredWorkingLimit();
    setWorkingLimit(stored);
    setLimitInput(String(stored));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(WORKING_LIMIT_STORAGE_KEY, String(workingLimit));
    } catch {
      // ignore quota / private mode
    }
  }, [workingLimit]);

  useEffect(() => {
    if (!loading && user && !user.isAdmin) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const leaveByUser = useMemo(
    () => countLeaveDaysByUser(yearLeaveDays),
    [yearLeaveDays]
  );

  const leaveRows = useMemo(() => {
    return users.map((teamUser) => {
      const counts = leaveByUser.get(teamUser.id) ?? emptyLeaveDayCount();
      const displayName = toTitleCaseName(teamUser.name);
      return {
        userId: teamUser.id,
        name: displayName,
        ...counts,
        total: leaveDayTotal(counts),
      };
    });
  }, [leaveByUser, users]);

  const leaveTotals = useMemo(() => {
    return leaveRows.reduce(
      (sum, row) => ({
        paidHoliday: sum.paidHoliday + row.paidHoliday,
        sickLeave: sum.sickLeave + row.sickLeave,
        vacation: sum.vacation + row.vacation,
        total: sum.total + row.total,
      }),
      { paidHoliday: 0, sickLeave: 0, vacation: 0, total: 0 }
    );
  }, [leaveRows]);

  const summaries = useMemo(
    () => computeDashboardUserSummaries(initialTasks, users, year, monthNumber),
    [initialTasks, users, year, monthNumber]
  );

  const chartData = useMemo((): ChartRow[] => {
    return users
      .map((teamUser) => {
        const hours = summaries.monthlySumByUserId.get(teamUser.id) ?? 0;
        const rounded = roundHours(hours);
        const remaining = roundHours(Math.max(0, workingLimit - hours));
        const overLimit = hours > workingLimit;
        const pctOfLimit =
          workingLimit > 0
            ? Math.round((hours / workingLimit) * 1000) / 10
            : 0;
        const displayName = toTitleCaseName(teamUser.name);
        return {
          userId: teamUser.id,
          name: displayName,
          shortName: shortDisplayName(displayName),
          hours: rounded,
          hoursLabel: formatKpiHours(hours),
          remaining,
          remainingLabel: formatKpiHours(remaining),
          overLimit,
          pctOfLimit,
          pctLabel: pctOfLimit.toFixed(1),
        };
      })
      .sort((a, b) => b.hours - a.hours);
  }, [users, summaries, workingLimit]);

  const yMax = useMemo(() => {
    const peak = chartData.reduce(
      (max, row) => Math.max(max, row.hours),
      workingLimit
    );
    // Headroom above limit (or peak) so labels stay readable.
    return Math.ceil(peak / 10) * 10 + 10;
  }, [chartData, workingLimit]);

  const yTicks = useMemo(() => {
    const candidates = [0, workingLimit, yMax];
    const step = workingLimit >= 100 ? 40 : 20;
    for (let t = step; t < yMax; t += step) {
      candidates.push(t);
    }
    return [...new Set(candidates)]
      .filter((v) => v >= 0 && v <= yMax)
      .sort((a, b) => a - b);
  }, [workingLimit, yMax]);

  const commitLimitInput = (rawValue: string = limitInput) => {
    const parsed = Number(rawValue);
    const next = clampWorkingLimit(parsed);
    setWorkingLimit(next);
    setLimitInput(String(next));
  };

  const handleLimitChange = (raw: string) => {
    setLimitInput(raw);
    if (raw.trim() === "") {
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      return;
    }
    setWorkingLimit(clampWorkingLimit(parsed));
  };

  const totalHoursLabel = formatKpiHours(summaries.grandMonthlyTotalHours);
  const activeWorkers = chartData.filter((row) => row.hours > 0).length;
  const overLimitCount = chartData.filter((row) => row.overLimit).length;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Redirecting...
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
      title="Staff KPI"
      subtitle={`Total hours worked — ${monthLabel} (limit ${workingLimit} h / person)`}
      logoSrc="/pink_logo_rgb.webp"
      logoAlt="Extra team"
    >
      <MonthlyMonthPagination
        year={year}
        monthNumber={monthNumber}
        basePath="/kpi"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total hours
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {totalHoursLabel}
            <span className="ml-1 text-sm font-normal text-muted-foreground">h</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <label
            htmlFor="kpi-working-limit"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Working limit
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <Input
              id="kpi-working-limit"
              type="number"
              inputMode="numeric"
              min={MIN_WORKING_LIMIT}
              max={MAX_WORKING_LIMIT}
              step={1}
              value={limitInput}
              onChange={(event) => handleLimitChange(event.target.value)}
              onBlur={() => commitLimitInput()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitLimitInput();
                  event.currentTarget.blur();
                }
              }}
              className="h-9 w-24 text-lg font-semibold tabular-nums"
              aria-describedby="kpi-working-limit-hint"
            />
            <span className="text-sm text-muted-foreground">h / person</span>
          </div>
          <p id="kpi-working-limit-hint" className="mt-1 text-[11px] text-muted-foreground">
            Updates the red limit line as you type (default {DEFAULT_WORKING_LIMIT_HOURS})
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Staff with hours
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {activeWorkers}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              / {users.length}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Over limit
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold tabular-nums",
              overLimitCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
            )}
          >
            {overLimitCount}
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
          No approved team members to show.
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Hours by staff member
            </h2>
            <p className="text-xs text-muted-foreground">
              Dashed line = {workingLimit} h working limit · table progress uses
              green / yellow / red
            </p>
          </div>
          <div className="h-[22rem] w-full min-w-0 rounded-lg bg-white dark:bg-card sm:h-[28rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                key={`kpi-limit-${workingLimit}`}
                data={chartData}
                margin={{ top: 28, right: 16, left: 0, bottom: 48 }}
                style={{ background: "transparent" }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortName"
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  domain={[0, yMax]}
                  ticks={yTicks}
                  allowDataOverflow
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  label={{
                    value: "Hours",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "var(--muted-foreground)" },
                  }}
                />
                <ReferenceLine
                  key={`limit-line-${workingLimit}`}
                  y={workingLimit}
                  ifOverflow="extendDomain"
                  stroke="#e11d48"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: `Limit ${workingLimit}h`,
                    position: "insideTopRight",
                    fill: "#be123c",
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(15, 23, 42, 0.06)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) {
                      return null;
                    }
                    const row = payload[0]?.payload as ChartRow | undefined;
                    if (!row) {
                      return null;
                    }
                    return (
                      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                        <p className="font-medium">{row.name}</p>
                        <p className="tabular-nums text-muted-foreground">
                          {row.hoursLabel} h / {formatKpiHours(workingLimit)} h (
                          {row.pctLabel}%)
                        </p>
                        {row.overLimit ? (
                          <p className="tabular-nums text-rose-600 dark:text-rose-400">
                            Over limit by {formatKpiHours(row.hours - workingLimit)} h
                          </p>
                        ) : (
                          <p className="tabular-nums text-muted-foreground">
                            {row.remainingLabel} h remaining
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="hours"
                  name="Hours"
                  fill="hsl(199 89% 48%)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={56}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="hoursLabel"
                    position="top"
                    style={{ fill: "var(--foreground)", fontSize: 10 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartData.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Staff</th>
                <th className="px-4 py-2.5 text-right font-medium">Hours</th>
                <th className="px-4 py-2.5 text-right font-medium">
                  Remaining (of {formatKpiHours(workingLimit)})
                </th>
                <th className="px-4 py-2.5 text-right font-medium">% of limit</th>
                <th className="min-w-[9rem] px-4 py-2.5 text-left font-medium">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => {
                const tone = hoursProgressTone(row.hours, workingLimit);
                const fillPct = Math.min(
                  100,
                  workingLimit > 0 ? (row.hours / workingLimit) * 100 : 0
                );
                return (
                  <tr key={row.userId} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-left font-medium text-foreground">
                      {row.name}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums",
                        tone === "red"
                          ? "font-semibold text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {row.hoursLabel}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {row.overLimit ? "—" : row.remainingLabel}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums",
                        tone === "red"
                          ? "font-semibold text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {row.pctLabel}%
                    </td>
                    <td className="px-4 py-2.5 text-left">
                      <div
                        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-valuenow={Math.round(fillPct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${row.name} ${row.pctLabel}% of ${formatKpiHours(workingLimit)} h limit`}
                      >
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width]",
                            PROGRESS_BAR_CLASS[tone]
                          )}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            Progress: green &lt; half of limit · yellow ≥ half · red ≥{" "}
            {formatKpiHours(workingLimit)} h (working limit)
          </p>
        </div>
      ) : null}

      {leaveRows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              Leave days in {year}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Paid Holiday, Sick leave, and Vacation assigned on the monthly plan.
              Each calendar day counts once.
            </p>
          </div>
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Staff</th>
                <th className="px-4 py-2.5 text-right font-medium">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    <span className="size-2 rounded-full bg-sky-500" aria-hidden />
                    Paid Holiday
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right font-medium">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    <span className="size-2 rounded-full bg-amber-500" aria-hidden />
                    Sick leave
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right font-medium">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    <span className="size-2 rounded-full bg-rose-500" aria-hidden />
                    Vacation
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right font-medium">Total days</th>
              </tr>
            </thead>
            <tbody>
              {leaveRows.map((row) => (
                <tr key={row.userId} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-left font-medium text-foreground">
                    {row.name}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                    {row.paidHoliday}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                    {row.sickLeave}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                    {row.vacation}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-border bg-muted/40 text-foreground">
              <tr>
                <td className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                  All staff
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                  {leaveTotals.paidHoliday}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                  {leaveTotals.sickLeave}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                  {leaveTotals.vacation}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                  {leaveTotals.total}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : null}
    </DashboardShell>
  );
}
