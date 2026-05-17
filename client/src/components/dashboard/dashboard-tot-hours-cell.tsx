import { formatSummaryHours } from "@/features/dashboard/dashboard-summary";
import { cn } from "@/lib/utils";

const TOT_HOURS_CELL_CLASS =
  "bg-indigo-950 px-1 py-2.5 text-center text-sm font-semibold tabular-nums text-white border-b border-indigo-900/80";

type DashboardTotHoursCellProps = {
  hours: number;
  className?: string;
};

export function DashboardTotHoursCell({ hours, className }: DashboardTotHoursCellProps) {
  return (
    <td className={cn(TOT_HOURS_CELL_CLASS, "border-r border-indigo-900/80", className)}>
      {formatSummaryHours(hours)}
    </td>
  );
}

export const TOT_HOURS_HEADER_CLASS = cn(
  TOT_HOURS_CELL_CLASS,
  "h-10 border-t border-r border-indigo-900/80 align-middle text-[10px] leading-tight tracking-wide"
);

export function TotHoursHeaderLabel() {
  return (
    <span className="mx-auto block w-full text-center font-semibold uppercase">
      TOT. HOURS
    </span>
  );
}
