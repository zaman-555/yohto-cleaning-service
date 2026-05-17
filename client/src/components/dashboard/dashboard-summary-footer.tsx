import type { MutableRefObject } from "react";
import {
  formatSummaryHours,
  type DashboardUserSummaries,
} from "@/features/dashboard/dashboard-summary";
import type { User } from "@/features/dashboard/types";
import { DashboardTotHoursCell } from "./dashboard-tot-hours-cell";
import { LEADING_COLUMN_COUNT, LEADING_TOTAL_REM } from "./dashboard-table-layout";
import {
  SUMMARY_FOOTER_LABEL_CLASS,
  SUMMARY_FOOTER_ROW_CLASS,
  SUMMARY_FOOTER_ROW_FIRST_CLASS,
  SUMMARY_FOOTER_VALUE_CLASS,
} from "./dashboard-summary-theme";
import { cn } from "@/lib/utils";

type DashboardSummaryFooterProps = {
  users: User[];
  summaries: DashboardUserSummaries;
  rowRefs?: MutableRefObject<(HTMLTableRowElement | null)[]>;
};

type SummaryFooterRowProps = {
  label: string;
  users: User[];
  valuesByUserId: Map<number, number>;
  totalHours: number;
};

function SummaryFooterLeadingRow({
  label,
  isFirst,
  rowRef,
}: {
  label: string;
  isFirst?: boolean;
  rowRef?: (el: HTMLTableRowElement | null) => void;
}) {
  return (
    <tr
      ref={rowRef}
      className={cn(
        SUMMARY_FOOTER_ROW_CLASS,
        isFirst && SUMMARY_FOOTER_ROW_FIRST_CLASS,
        "[&>td]:border-b [&>td]:border-neutral-600"
      )}
    >
      <td
        colSpan={LEADING_COLUMN_COUNT}
        className={SUMMARY_FOOTER_LABEL_CLASS}
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
  isFirst,
  rowRef,
}: Omit<SummaryFooterRowProps, "label"> & {
  isFirst?: boolean;
  rowRef?: (el: HTMLTableRowElement | null) => void;
}) {
  return (
    <tr
      ref={rowRef}
      className={cn(
        SUMMARY_FOOTER_ROW_CLASS,
        isFirst && SUMMARY_FOOTER_ROW_FIRST_CLASS,
        "[&>td]:border-b [&>td]:border-neutral-600"
      )}
    >
      {users.map((user) => (
        <td key={user.id} className={SUMMARY_FOOTER_VALUE_CLASS}>
          {formatSummaryHours(valuesByUserId.get(user.id) ?? 0)}
        </td>
      ))}
      <DashboardTotHoursCell hours={totalHours} variant="footer" />
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
        isFirst
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
        isFirst
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
