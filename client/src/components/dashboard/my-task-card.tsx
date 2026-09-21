import { MapPin } from "lucide-react";
import { RichTextContent } from "@/components/ui/rich-text-content";
import {
  extractUrlFromRichText,
  isRichTextEmpty,
  looksLikeHtml,
} from "@/lib/rich-text";
import type { TaskRecord } from "@/features/dashboard/types";
import { TransportTypeDot } from "./transport-type-dot";
import { transportTypeMeta } from "./transport-constants";
import { formatShiftLabel } from "./task-utils";
import { cn } from "@/lib/utils";

type MyTaskCardProps = {
  task: TaskRecord;
  /** Shown for admins when browsing all team cards. */
  workerName?: string;
  /**
   * Admin: plain border.
   * Staff My work: border colour matches the task transport type.
   */
  variant?: "admin" | "staff";
};

function formatTaskDateLabel(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function MyTaskCard({
  task,
  workerName,
  variant = "staff",
}: MyTaskCardProps) {
  const transport = transportTypeMeta(task.transportType);
  const locationHref = extractUrlFromRichText(task.location);
  const hasLocation = !isRichTextEmpty(task.location);
  const locationContent = looksLikeHtml(task.location) ? (
    <RichTextContent html={task.location} inline className="text-xs" />
  ) : (
    <span className="truncate">{locationHref ? "Location" : task.location}</span>
  );
  const isStaff = variant === "staff";

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-xl bg-card p-4 text-left shadow-sm",
        isStaff
          ? cn("border-2", transport.borderClass)
          : "border border-border"
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0 flex-1">
          {workerName ? (
            <p className="mb-1 text-xs font-medium text-muted-foreground">{workerName}</p>
          ) : null}
          <p className="text-sm font-semibold leading-snug text-foreground">
            {formatTaskDateLabel(task.date)}
          </p>
          <p className="mt-0.5 text-xs font-semibold tracking-wide text-muted-foreground">
            {formatShiftLabel(task.shift)}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          <TransportTypeDot transportType={task.transportType} />
          <span>{transport.label}</span>
        </span>
      </header>

      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="break-words text-base font-semibold leading-snug text-foreground">
          {task.companyName}
        </p>
        <RichTextContent
          html={task.task}
          className="break-words text-sm leading-snug text-foreground/90"
        />
        {task.carName ? (
          <p className="break-words text-sm font-medium text-muted-foreground">
            {task.carName}
          </p>
        ) : null}
      </div>

      {hasLocation ? (
        <div className="mt-3 border-t border-border pt-3">
          {locationHref ? (
            <a
              href={locationHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1.5 text-xs text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              aria-label="Open location"
            >
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {locationContent}
            </a>
          ) : (
            <div className="flex max-w-full items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {locationContent}
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
