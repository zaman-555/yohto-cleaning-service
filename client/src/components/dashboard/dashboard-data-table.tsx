"use client";

import { useLayoutEffect, useRef } from "react";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import type { DashboardUserSummaries } from "@/features/dashboard/dashboard-summary";
import type { DashboardRow, User } from "@/features/dashboard/types";
import {
  DashboardSummaryFooterLeading,
  DashboardSummaryFooterScroll,
} from "./dashboard-summary-footer";
import {
  DashboardTotHoursCell,
  TOT_HOURS_HEADER_CLASS,
  TotHoursHeaderLabel,
} from "./dashboard-tot-hours-cell";
import {
  LEAD_DATE_W,
  LEAD_DAY_W,
  LEAD_WEEK_W,
  LEADING_TOTAL_REM,
  TOT_HOURS_MIN_REM,
  TOT_HOURS_W,
  USER_MIN_REM,
} from "./dashboard-table-layout";

const TABLE_CLASS =
  "w-full border-separate border-spacing-0 table-fixed caption-bottom text-center text-sm";

function isLeadingColumn(columnId: string): boolean {
  return columnId === "dateNum" || columnId === "dayName" || columnId === "week";
}

function leadingCellTypography(columnId: string): string {
  if (!isLeadingColumn(columnId)) return "";
  return "text-xs tabular-nums tracking-tight";
}

function leadingHeaderClass(columnId: string): string {
  if (columnId === "dateNum") {
    return `${LEAD_DATE_W} border-b border-l border-r border-t border-neutral-600 bg-neutral-900/95 text-center backdrop-blur`;
  }
  if (columnId === "dayName") {
    return `${LEAD_DAY_W} border-b border-r border-t border-neutral-600 bg-neutral-900/95 text-center backdrop-blur`;
  }
  if (columnId === "week") {
    return `${LEAD_WEEK_W} border-b border-r border-t border-neutral-600 bg-neutral-900/95 text-center backdrop-blur`;
  }
  return "";
}

function leadingBodyClass(columnId: string): string {
  if (columnId === "dateNum") {
    return `${LEAD_DATE_W} border-b border-l border-r border-neutral-600 bg-neutral-900 text-center font-bold text-neutral-300`;
  }
  if (columnId === "dayName") {
    return `${LEAD_DAY_W} border-b border-r border-neutral-600 bg-neutral-900 text-center font-medium text-neutral-400`;
  }
  if (columnId === "week") {
    return `${LEAD_WEEK_W} border-b border-r border-neutral-600 bg-neutral-900 text-center font-medium text-neutral-400`;
  }
  return "";
}

function scrollHeaderClass(): string {
  return "border-b border-r border-t border-neutral-600 text-center";
}

function scrollBodyClass(columnId: string): string {
  if (columnId.startsWith("user-")) {
    return "border-b border-r border-neutral-600 text-center";
  }
  return "border-b border-neutral-600 text-center";
}

function syncHeights(source: HTMLElement | null, target: HTMLElement | null) {
  if (!source || !target) {
    return;
  }
  const height = source.getBoundingClientRect().height;
  target.style.minHeight = `${height}px`;
  target.style.height = `${height}px`;
}

type DashboardDataTableProps = {
  table: Table<DashboardRow>;
  users: User[];
  summaries: DashboardUserSummaries;
};

export function DashboardDataTable({ table, users, summaries }: DashboardDataTableProps) {
  const userColumns = table
    .getAllLeafColumns()
    .filter((column) => column.id.startsWith("user-"));
  const hasNoUsers = userColumns.length === 0;
  const rows = table.getRowModel().rows;
  const showTotHoursColumn = !hasNoUsers;

  const scrollMinWidth = hasNoUsers
    ? `${USER_MIN_REM}rem`
    : `${userColumns.length * USER_MIN_REM + (showTotHoursColumn ? TOT_HOURS_MIN_REM : 0)}rem`;

  const leadingHeaderRef = useRef<HTMLTableRowElement>(null);
  const scrollHeaderRef = useRef<HTMLTableRowElement>(null);
  const leadingRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const scrollRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const leadingFooterRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const scrollFooterRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const leadingHeaders =
    table.getHeaderGroups()[0]?.headers.filter((h) => isLeadingColumn(h.column.id)) ?? [];

  useLayoutEffect(() => {
    const syncAll = () => {
      syncHeights(scrollHeaderRef.current, leadingHeaderRef.current);

      rows.forEach((_, index) => {
        syncHeights(scrollRowRefs.current[index], leadingRowRefs.current[index]);
      });

      [0, 1].forEach((index) => {
        syncHeights(scrollFooterRefs.current[index], leadingFooterRefs.current[index]);
      });
    };

    syncAll();

    const observer = new ResizeObserver(syncAll);
    scrollRowRefs.current.forEach((row) => {
      if (row) {
        observer.observe(row);
      }
    });

    return () => observer.disconnect();
  }, [rows, users, summaries, showTotHoursColumn]);

  const renderLeadingRow = (row: Row<DashboardRow>, index: number) => (
    <tr
      key={row.id}
      ref={(el) => {
        leadingRowRefs.current[index] = el;
      }}
    >
      {row
        .getVisibleCells()
        .filter((cell) => isLeadingColumn(cell.column.id))
        .map((cell) => {
          const id = cell.column.id;
          return (
            <td
              key={cell.id}
              className={`h-40 min-h-40 whitespace-nowrap px-1 py-2 align-middle transition-colors hover:bg-neutral-800/50 ${leadingCellTypography(id)} ${leadingBodyClass(id)}`}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
    </tr>
  );

  const renderScrollRow = (row: Row<DashboardRow>, rowIndex: number, index: number) => (
    <tr
      key={row.id}
      ref={(el) => {
        scrollRowRefs.current[index] = el;
      }}
    >
      {row
        .getVisibleCells()
        .filter((cell) => cell.column.id.startsWith("user-"))
        .map((cell) => {
          const id = cell.column.id;
          return (
            <td
              key={cell.id}
              className={`h-40 min-h-40 whitespace-normal p-0 align-middle text-sm transition-colors hover:bg-neutral-800/50 ${scrollBodyClass(id)}`}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
      {hasNoUsers && rowIndex === 0 ? (
        <td
          rowSpan={rows.length}
          className="border-b border-r border-neutral-600 bg-neutral-900 px-6 align-middle text-center text-sm text-neutral-500"
        >
          No user found
        </td>
      ) : null}
      {showTotHoursColumn ? (
        <DashboardTotHoursCell
          hours={summaries.dailyTotalHoursByDay.get(row.original.dateNum) ?? 0}
        />
      ) : null}
    </tr>
  );

  return (
    <main className="overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl backdrop-blur-sm">
      <div className="flex w-full min-w-0">
        {/* Fixed: #, Dy, Wk â€” no horizontal scrollbar underneath */}
        <div
          className="shrink-0"
          style={{ width: `${LEADING_TOTAL_REM}rem` }}
        >
          <table className={TABLE_CLASS}>
            <colgroup>
              <col className={LEAD_DATE_W} />
              <col className={LEAD_DAY_W} />
              <col className={LEAD_WEEK_W} />
            </colgroup>
            <thead className="bg-neutral-950/50">
              <tr ref={leadingHeaderRef} className="hover:bg-transparent">
                {leadingHeaders.map((header) => {
                  const id = header.column.id;
                  return (
                    <th
                      key={header.id}
                      className={`h-10 whitespace-nowrap px-1 py-2 align-middle font-semibold text-neutral-300 ${leadingCellTypography(id)} ${leadingHeaderClass(id)}`}
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
            </thead>
            <tbody className="[&_tr:last-child>td]:border-b-0">
              {rows.map((row, index) => renderLeadingRow(row, index))}
            </tbody>
            {showTotHoursColumn ? (
              <DashboardSummaryFooterLeading
                users={users}
                summaries={summaries}
                rowRefs={leadingFooterRefs}
              />
            ) : null}
          </table>
        </div>

        {/* Scrollable: users + TOT. HOURS */}
        <div className="dashboard-table-scroll min-w-0 flex-1 overflow-x-auto">
          <table className={TABLE_CLASS} style={{ minWidth: scrollMinWidth }}>
            <colgroup>
              {userColumns.map((column) => (
                <col key={`col-${column.id}`} />
              ))}
              {hasNoUsers ? <col /> : null}
              {showTotHoursColumn ? <col className={TOT_HOURS_W} /> : null}
            </colgroup>
            <thead className="bg-neutral-950/50">
              <tr ref={scrollHeaderRef} className="hover:bg-transparent">
                {userColumns.map((column) => {
                  const header = table
                    .getHeaderGroups()[0]
                    ?.headers.find((h) => h.column.id === column.id);
                  if (!header) {
                    return null;
                  }
                  return (
                    <th
                      key={header.id}
                      className={`h-10 whitespace-nowrap px-6 py-4 align-middle text-sm font-semibold text-neutral-300 ${scrollHeaderClass()}`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
                {hasNoUsers ? (
                  <th
                    aria-hidden
                    className="h-10 border-b border-r border-t border-neutral-600"
                  />
                ) : null}
                {showTotHoursColumn ? (
                  <th className={TOT_HOURS_HEADER_CLASS}>
                    <TotHoursHeaderLabel />
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child>td]:border-b-0">
              {rows.map((row, rowIndex) => renderScrollRow(row, rowIndex, rowIndex))}
            </tbody>
            {showTotHoursColumn ? (
              <DashboardSummaryFooterScroll
                users={users}
                summaries={summaries}
                rowRefs={scrollFooterRefs}
              />
            ) : null}
          </table>
        </div>
      </div>
    </main>
  );
}
