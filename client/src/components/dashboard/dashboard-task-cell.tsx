import { MapPin, Pencil } from "lucide-react";
import type { DashboardRow, TaskRecord } from "@/features/dashboard/types";
import { TransportTypeDot } from "./transport-type-dot";
import { formatShiftLabel } from "./task-utils";

type DashboardTaskCellProps = {
  task: TaskRecord;
  userName: string;
  row: DashboardRow;
  onEdit: () => void;
};

export function DashboardTaskCell({
  task,
  userName,
  row,
  onEdit,
}: DashboardTaskCellProps) {
  return (
    <div
      className="group/cell flex h-full w-full min-h-[5.5rem] min-w-0 flex-col px-2.5 py-2"
      data-user={userName}
      data-day={row.dateNum}
    >
      <div className="mb-1.5 flex w-full items-center gap-1.5 border-b border-neutral-800/80 pb-1.5">
        <span className="min-w-0 flex-1 break-words text-left text-xs font-semibold tracking-wide text-indigo-300">
          {formatShiftLabel(task.shift)}
        </span>
        <span className="inline-flex shrink-0 items-center rounded-full bg-neutral-800/80 px-1.5 py-0.5">
          <TransportTypeDot transportType={task.transportType} />
        </span>
        <button
          type="button"
          className="shrink-0 rounded-md p-0.5 text-neutral-500 opacity-50 transition-colors hover:bg-neutral-800/90 hover:text-indigo-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 group-hover/cell:opacity-100"
          aria-label={`Edit task for ${userName}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="size-3.5 shrink-0" aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1 text-left">
        <p className="w-full break-all text-base font-semibold leading-snug text-neutral-50">
          {task.companyName}
        </p>
        <p className="w-full break-all text-sm leading-snug text-neutral-300">
          {task.task}
        </p>
        <p className="w-full break-all text-sm font-medium leading-snug text-neutral-400">
          {task.carName}
        </p>
      </div>

      <div className="mt-1.5 flex justify-start border-t border-neutral-800/80 pt-1.5">
        <a
          href={task.location}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-md text-xs text-indigo-400 transition-colors hover:text-indigo-300"
          aria-label="Open location"
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span>Location</span>
        </a>
      </div>
    </div>
  );
}
