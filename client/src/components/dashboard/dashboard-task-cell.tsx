import { MapPin, Pencil } from "lucide-react";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { extractUrlFromRichText, looksLikeHtml } from "@/lib/rich-text";
import type { DashboardRow, TaskRecord } from "@/features/dashboard/types";
import { TransportTypeDot } from "./transport-type-dot";
import { formatShiftLabel } from "./task-utils";

type DashboardTaskCellProps = {
  task: TaskRecord;
  userName: string;
  row: DashboardRow;
  canEdit?: boolean;
  onEdit: () => void;
};

export function DashboardTaskCell({
  task,
  userName,
  row,
  canEdit = true,
  onEdit,
}: DashboardTaskCellProps) {
  const locationHref = extractUrlFromRichText(task.location);

  return (
    <div
      className="group/cell flex min-h-full w-full min-w-0 flex-col px-2.5 py-2"
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
        {canEdit ? (
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
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <p className="w-full break-words text-base font-semibold leading-snug text-neutral-50">
          {task.companyName}
        </p>
        <RichTextContent
          html={task.task}
          className="w-full break-words text-sm leading-snug text-neutral-300"
        />
        <p className="w-full break-words text-sm font-medium leading-snug text-neutral-400">
          {task.carName}
        </p>
      </div>

      {locationHref ? (
        <div className="mt-1.5 flex justify-start border-t border-neutral-800/80 pt-1.5">
          <a
            href={locationHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 rounded-md text-xs text-indigo-400 transition-colors hover:text-indigo-300"
            aria-label="Open location"
            onClick={(e) => e.stopPropagation()}
          >
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {looksLikeHtml(task.location) ? (
              <RichTextContent html={task.location} inline className="text-xs" />
            ) : (
              <span className="truncate">Location</span>
            )}
          </a>
        </div>
      ) : null}
    </div>
  );
}
