import { MapPin, Pencil } from "lucide-react";
import { RichTextContent } from "@/components/ui/rich-text-content";
import {
  extractUrlFromRichText,
  isRichTextEmpty,
  looksLikeHtml,
  stripHtmlToPlainText,
} from "@/lib/rich-text";
import { isLeaveTransportType, type DashboardRow, type TaskRecord } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";
import { TransportTypeDot } from "./transport-type-dot";
import { LEAVE_CELL_SURFACE, transportTypeMeta } from "./transport-constants";
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
  const isLeave = isLeaveTransportType(task.transportType);
  const hasLocation = !isLeave && !isRichTextEmpty(task.location);
  const showShift = !isLeave && task.shift.trim().length > 0;
  const locationContent = looksLikeHtml(task.location) ? (
    <RichTextContent html={task.location} inline className="text-xs" />
  ) : (
    <span className="truncate">{locationHref ? "Location" : task.location}</span>
  );

  if (isLeave) {
    const statusLabel = transportTypeMeta(task.transportType).label;
    const label = looksLikeHtml(task.task)
      ? stripHtmlToPlainText(task.task).trim() || statusLabel
      : task.task.trim() || statusLabel;
    const surface = isLeaveTransportType(task.transportType)
      ? LEAVE_CELL_SURFACE[task.transportType]
      : "bg-muted";

    return (
      <div
        className={cn(
          "group/cell absolute inset-0 flex items-center justify-center px-8 py-6",
          surface
        )}
        data-user={userName}
        data-day={row.dateNum}
      >
        <p className="text-center text-sm font-semibold leading-snug text-foreground">
          {label}
        </p>
        <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1">
          <span className="inline-flex shrink-0 items-center rounded-full bg-background/80 px-1.5 py-0.5">
            <TransportTypeDot transportType={task.transportType} />
          </span>
          {canEdit ? (
            <button
              type="button"
              className="shrink-0 rounded-md bg-background/80 p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:hover:text-indigo-300"
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
      </div>
    );
  }

  return (
    <div
      className="group/cell flex min-h-40 w-full min-w-0 flex-col px-2.5 py-2"
      data-user={userName}
      data-day={row.dateNum}
    >
      <div className="mb-1.5 flex w-full items-center gap-1.5 border-b border-border pb-1.5">
        <span className="min-w-0 flex-1 break-words text-left text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-300">
          {showShift ? formatShiftLabel(task.shift) : null}
        </span>
        <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-1.5 py-0.5">
          <TransportTypeDot transportType={task.transportType} />
        </span>
        {canEdit ? (
          <button
            type="button"
            className="shrink-0 rounded-md p-0.5 text-muted-foreground opacity-50 transition-colors hover:bg-accent hover:text-indigo-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 group-hover/cell:opacity-100 dark:hover:text-indigo-300"
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

      <div className="flex min-w-0 flex-col gap-1 text-left">
        {task.companyName.trim() ? (
          <p className="w-full break-words text-base font-semibold leading-snug text-foreground">
            {task.companyName}
          </p>
        ) : null}
        <RichTextContent
          html={task.task}
          className="w-full break-words text-sm leading-snug text-foreground/90"
        />
        {task.carName.trim() ? (
          <p className="w-full break-words text-sm font-medium leading-snug text-muted-foreground">
            {task.carName}
          </p>
        ) : null}
      </div>

      {hasLocation ? (
        <div className="mt-1.5 flex justify-start border-t border-border pt-1.5">
          {locationHref ? (
            <a
              href={locationHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 rounded-md text-xs text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              aria-label="Open location"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {locationContent}
            </a>
          ) : (
            <div className="max-w-full text-xs text-muted-foreground">
              {locationContent}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
