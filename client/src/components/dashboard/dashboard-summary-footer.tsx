import type { MutableRefObject } from "react";
import {
  formatSummaryHours,
  type DashboardUserSummaries,
} from "@/features/dashboard/dashboard-summary";
import type { User } from "@/features/dashboard/types";
import { DashboardTotHoursCell } from "./dashboard-tot-hours-cell";
import { LEADING_COLUMN_COUNT, LEADING_TOTAL_REM } from "./dashboard-table-layout";

type DashboardSummaryFooterProps = {
  users: User[];
  summaries: DashboardUserSummaries;
  rowRefs?: MutableRefObject<(HTMLTableRowElement | null)[]>;
};

const FOOTER_ROW_CLASS =
  "bg-indigo-950 text-white hover:bg-indigo-950 [&>td]:border-b [&>td]:border-indigo-900/80";

const LABEL_CELL_CLASS =
  "border-r border-indigo-900/80 bg-indigo-950 px-2 py-2.5 text-left text-xs font-semibold whitespace-nowrap";

const VALUE_CELL_CLASS =
  "border-r border-indigo-900/80 px-2 py-2.5 text-center text-sm font-semibold tabular-nums whitespace-nowrap";

type SummaryFooterRowProps = {
  label: string;
  users: User[];
  valuesByUserId: Map<number, number>;
  totalHours: number;
};

function SummaryFooterLeadingRow({
  label,
  rowRef,
}: {
  label: string;
  rowRef?: (el: HTMLTableRowElement | null) => void;
}) {
  return (
    <tr ref={rowRef} className={FOOTER_ROW_CLASS}>
      <td
        colSpan={LEADING_COLUMN_COUNT}
        className={LABEL_CELL_CLASS}
        style={{
          width: `${LEADING_TOTAL_REM}rem`,
          minWidth: `${LEADING_TOTAL_REM}rem`,
          maxWidth: `${LEADING_TOTAL_REM}rem`,
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function SummaryFooterScrollRow({
  users,
  valuesByUserId,
  totalHours,
  rowRef,
}: Omit<SummaryFooterRowProps, "label"> & {
  rowRef?: (el: HTMLTableRowElement | null) => void;
}) {
  return (
    <tr ref={rowRef} className={FOOTER_ROW_CLASS}>
      {users.map((user) => (
        <td key={user.id} className={VALUE_CELL_CLASS}>
          {formatSummaryHours(valuesByUserId.get(user.id) ?? 0)}
        </td>
      ))}
      <DashboardTotHoursCell hours={totalHours} />
    </tr>
  );
}

export function DashboardSummaryFooterLeading({
  users,
  summaries,
  rowRefs,
}: DashboardSummaryFooterProps) {
  if (users.length === 0) {
    return null;
  }

  return (
    <tfoot>
      <SummaryFooterLeadingRow
        label="SUM h/month"
        rowRef={(el) => {
          if (rowRefs) rowRefs.current[0] = el;
        }}
      />
      <SummaryFooterLeadingRow
        label="AVERAGE h/week"
        rowRef={(el) => {
          if (rowRefs) rowRefs.current[1] = el;
        }}
      />
    </tfoot>
  );
}

export function DashboardSummaryFooterScroll({
  users,
  summaries,
  rowRefs,
}: DashboardSummaryFooterProps) {
  if (users.length === 0) {
    return null;
  }

  return (
    <tfoot>
      <SummaryFooterScrollRow
        users={users}
        valuesByUserId={summaries.monthlySumByUserId}
        totalHours={summaries.grandMonthlyTotalHours}
        rowRef={(el) => {
          if (rowRefs) rowRefs.current[0] = el;
        }}
      />
      <SummaryFooterScrollRow
        users={users}
        valuesByUserId={summaries.weeklyAverageByUserId}
        totalHours={summaries.grandWeeklyAverageTotalHours}
        rowRef={(el) => {
          if (rowRefs) rowRefs.current[1] = el;
        }}
      />
    </tfoot>
  );
}
