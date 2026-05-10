import { flexRender, type Table } from "@tanstack/react-table";
import type { DashboardRow } from "@/features/dashboard/types";

/** First three sticky columns: fixed widths + left offsets must stay in sync. */
const LEAD_DATE_W = "w-8 min-w-8 max-w-8"; // 2rem — day of month
const LEAD_DAY_W = "w-10 min-w-10 max-w-10"; // 2.5rem — 3-letter weekday
const LEAD_WEEK_W = "w-10 min-w-10 max-w-10"; // 2.5rem — week number (e.g. 52)

/** Sum of widths before the week column: date (2rem) + day (2.5rem) */
const LEAD_WEEK_LEFT = "left-[4.5rem]";

/** Numeric values used to compute the table's responsive min-width.
    Keep in sync with the Tailwind classes above. */
const LEADING_TOTAL_REM = 7; // 2 + 2.5 + 2.5
const USER_MIN_REM = 12; // each user column collapses no smaller than 12rem (w-48)

function isLeadingColumn(columnId: string): boolean {
  return columnId === "dateNum" || columnId === "dayName" || columnId === "week";
}

function leadingCellTypography(columnId: string): string {
  if (!isLeadingColumn(columnId)) return "";
  return "text-xs tabular-nums tracking-tight";
}

function headerStickyClass(columnId: string): string {
  const isUserHeader = columnId.startsWith("user-");
  if (columnId === "dateNum") {
    return `sticky left-0 z-20 ${LEAD_DATE_W} border-b border-l border-r border-t border-neutral-600 bg-neutral-900/95 text-center backdrop-blur`;
  }
  if (columnId === "dayName") {
    return `sticky left-8 z-20 ${LEAD_DAY_W} border-b border-r border-t border-neutral-600 bg-neutral-900/95 text-center backdrop-blur`;
  }
  if (columnId === "week") {
    return `sticky ${LEAD_WEEK_LEFT} z-20 ${LEAD_WEEK_W} border-b border-r border-t border-neutral-600 bg-neutral-900/95 text-center backdrop-blur`;
  }
  if (isUserHeader) {
    return "border-b border-r border-t border-neutral-600 text-center";
  }
  return "border-b border-t border-neutral-600 text-center";
}

function cellStickyClass(columnId: string): string {
  const isUserCell = columnId.startsWith("user-");
  if (columnId === "dateNum") {
    return `sticky left-0 z-10 ${LEAD_DATE_W} border-b border-l border-r border-neutral-600 bg-neutral-900 text-center font-bold text-neutral-300 group-hover:bg-neutral-800`;
  }
  if (columnId === "dayName") {
    return `sticky left-8 z-10 ${LEAD_DAY_W} border-b border-r border-neutral-600 bg-neutral-900 text-center font-medium text-neutral-400 group-hover:bg-neutral-800`;
  }
  if (columnId === "week") {
    return `sticky ${LEAD_WEEK_LEFT} z-10 ${LEAD_WEEK_W} border-b border-r border-neutral-600 bg-neutral-900 text-center font-medium text-neutral-400 group-hover:bg-neutral-800`;
  }
  if (isUserCell) {
    return "border-b border-r border-neutral-600 text-center";
  }
  return "border-b border-neutral-600 text-center";
}

type DashboardDataTableProps = {
  table: Table<DashboardRow>;
};

export function DashboardDataTable({ table }: DashboardDataTableProps) {
  const userColumns = table
    .getAllLeafColumns()
    .filter((column) => column.id.startsWith("user-"));
  const hasNoUsers = userColumns.length === 0;
  const rows = table.getRowModel().rows;

  // Forces horizontal scroll on narrow viewports while letting user columns
  // share the leftover width equally on wider screens. When users exist,
  // the table is at least: 7rem (leading) + N × 12rem (per-user minimum).
  // When there are no users, fall back to just the leading width.
  const tableMinWidth = hasNoUsers
    ? `${LEADING_TOTAL_REM}rem`
    : `${LEADING_TOTAL_REM + userColumns.length * USER_MIN_REM}rem`;

  return (
    <main className="overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table
          className="w-full border-separate border-spacing-0 table-fixed caption-bottom text-center text-sm"
          style={{ minWidth: tableMinWidth }}
        >
          <colgroup>
            <col className={LEAD_DATE_W} />
            <col className={LEAD_DAY_W} />
            <col className={LEAD_WEEK_W} />
            {userColumns.map((column) => (
              <col key={`col-${column.id}`} />
            ))}
            {hasNoUsers ? <col /> : null}
          </colgroup>
          <thead className="bg-neutral-950/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const id = header.column.id;
                  const stickyClass = headerStickyClass(id);
                  const leadPad = isLeadingColumn(id) ? "px-1 py-2" : "px-6 py-4";
                  const leadType = leadingCellTypography(id);
                  return (
                    <th
                      key={header.id}
                      className={`h-10 whitespace-nowrap ${leadPad} align-middle text-center font-semibold text-neutral-300 ${leadType} ${stickyClass}`}
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
                {hasNoUsers ? (
                  <th
                    aria-hidden
                    className="h-10 border-b border-r border-t border-neutral-600"
                  />
                ) : null}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child>td]:border-b-0">
            {rows.map((row, rowIndex) => (
              <tr key={row.id} className="group transition-colors hover:bg-neutral-800/50">
                {row.getVisibleCells().map((cell) => {
                  const id = cell.column.id;
                  const isUserCell = id.startsWith("user-");
                  const stickyClass = cellStickyClass(id);
                  const leadCellPad =
                    isLeadingColumn(id) ? "whitespace-nowrap px-1 py-2" : null;
                  const leadType = leadingCellTypography(id);
                  const cellPad = isUserCell
                    ? "whitespace-normal p-0"
                    : leadCellPad ?? "whitespace-nowrap px-6 py-3";
                  return (
                    <td
                      key={cell.id}
                      className={`${cellPad} align-middle ${isLeadingColumn(id) ? "" : "text-sm"} ${leadType} ${stickyClass}`}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
