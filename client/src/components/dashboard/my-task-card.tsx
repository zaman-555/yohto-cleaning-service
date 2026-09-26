"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { RichTextContent } from "@/components/ui/rich-text-content";
import {
  extractUrlFromRichText,
  isRichTextEmpty,
  looksLikeHtml,
  stripHtmlToPlainText,
} from "@/lib/rich-text";
import { isLeaveTransportType, type TaskRecord } from "@/features/dashboard/types";
import { TransportTypeDot } from "./transport-type-dot";
import { LEAVE_CELL_SURFACE, transportTypeMeta } from "./transport-constants";
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

function formatTaskDateParts(isoDate: string): { weekday: string; rest: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return { weekday: isoDate, rest: "" };
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    rest: date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export function MyTaskCard({
  task,
  workerName,
  variant = "staff",
}: MyTaskCardProps) {
  const transport = transportTypeMeta(task.transportType);
  const isLeave = isLeaveTransportType(task.transportType);
  const locationHref = extractUrlFromRichText(task.location);
  const hasLocation = !isLeave && !isRichTextEmpty(task.location);
  const showShift = !isLeave && task.shift.trim().length > 0;
  const locationContent = looksLikeHtml(task.location) ? (
    <RichTextContent html={task.location} inline className="text-xs" />
  ) : (
    <span className="truncate">{locationHref ? "Location" : task.location}</span>
  );
  const isStaff = variant === "staff";
  const dateParts = formatTaskDateParts(task.date);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusPanelId = useId();
  const statusWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!statusWrapRef.current?.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStatusOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [statusOpen]);

  if (isLeave && isLeaveTransportType(task.transportType)) {
    const label = looksLikeHtml(task.task)
      ? stripHtmlToPlainText(task.task).trim() || transport.label
      : task.task.trim() || transport.label;

    return (
      <article
        className={cn(
          "relative flex min-h-40 min-w-0 flex-col items-center justify-center rounded-xl px-6 py-8 text-center shadow-sm",
          LEAVE_CELL_SURFACE[task.transportType],
          isStaff ? cn("border-2", transport.borderClass) : "border border-border"
        )}
      >
        {workerName ? (
          <p className="absolute left-3 top-3 text-xs font-medium text-foreground/80">
            {workerName}
          </p>
        ) : null}
        <p className="text-lg font-bold leading-tight tracking-tight text-foreground sm:text-xl">
          {dateParts.weekday}
        </p>
        {dateParts.rest ? (
          <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground/85">
            {dateParts.rest}
          </p>
        ) : null}
        <p className="mt-3 text-base font-semibold leading-snug text-foreground">
          {label}
        </p>
        <div ref={statusWrapRef} className="absolute bottom-3 right-3 z-10">
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-background/80 p-1",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label={`Status: ${transport.label}. Tap for details.`}
            aria-expanded={statusOpen}
            aria-controls={statusPanelId}
            onClick={(event) => {
              event.stopPropagation();
              setStatusOpen((open) => !open);
            }}
          >
            <TransportTypeDot transportType={task.transportType} size="lg" />
          </button>
          {statusOpen ? (
            <div
              id={statusPanelId}
              role="status"
              className={cn(
                "absolute bottom-full right-0 mb-2 w-max max-w-[14rem] rounded-lg border border-border bg-popover px-3 py-2 shadow-md",
                "text-left text-popover-foreground"
              )}
            >
              <div className="flex items-start gap-2">
                <span
                  aria-hidden
                  className={cn("mt-1 inline-block size-3 shrink-0 rounded-full", transport.dotClass)}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-snug">{transport.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    Card colour matches this status.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "relative flex min-w-0 flex-col rounded-xl bg-card p-4 pb-11 text-left shadow-sm",
        isStaff
          ? cn("border-2", transport.borderClass)
          : "border border-border"
      )}
    >
      <header className="mb-3 border-b border-border pb-3">
        {workerName ? (
          <p className="mb-2 text-xs font-medium text-muted-foreground">{workerName}</p>
        ) : null}
        <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5 dark:bg-muted/80">
          <div className="min-w-0 flex-1 text-left">
            <p className="text-lg font-bold leading-tight tracking-tight text-foreground sm:text-xl">
              {dateParts.weekday}
            </p>
            {dateParts.rest ? (
              <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground/85 sm:text-base">
                {dateParts.rest}
              </p>
            ) : null}
          </div>
          {showShift ? (
            <p className="shrink-0 text-right text-base font-bold tabular-nums leading-tight text-foreground sm:text-lg">
              {formatShiftLabel(task.shift)}
            </p>
          ) : null}
        </div>
      </header>

      <div className="flex min-w-0 flex-col gap-1.5">
        {task.companyName.trim() ? (
          <p className="break-words text-base font-semibold leading-snug text-foreground">
            {task.companyName}
          </p>
        ) : null}
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
        <div className="mt-3 border-t border-border pt-3 pr-10">
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

      <div ref={statusWrapRef} className="absolute bottom-3 right-3 z-10">
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full p-1",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label={`Status: ${transport.label}. Tap for details.`}
          aria-expanded={statusOpen}
          aria-controls={statusPanelId}
          onClick={(event) => {
            event.stopPropagation();
            setStatusOpen((open) => !open);
          }}
        >
          <TransportTypeDot transportType={task.transportType} size="lg" />
        </button>
        {statusOpen ? (
          <div
            id={statusPanelId}
            role="status"
            className={cn(
              "absolute bottom-full right-0 mb-2 w-max max-w-[14rem] rounded-lg border border-border bg-popover px-3 py-2 shadow-md",
              "text-left text-popover-foreground"
            )}
          >
            <div className="flex items-start gap-2">
              <span
                aria-hidden
                className={cn("mt-1 inline-block size-3 shrink-0 rounded-full", transport.dotClass)}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-snug">{transport.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  Card border and this colour match this status.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
