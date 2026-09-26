import { CirclePlus, FileText, Pencil } from "lucide-react";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { cn } from "@/lib/utils";
import { extractRichTextLink, hasRichTextContent } from "@/lib/rich-text";
import {
  extractGoogleDriveLink,
  stripGoogleDriveLinks,
} from "@/features/dashboard/weekly-instructions";
import type { TaskDetail } from "@/features/dashboard/weekly-showcase-types";
import { WeeklyWeekdayDateCell } from "./weekly-weekday-date-cell";

type WeeklyTaskDetailCellProps = {
  detail: TaskDetail;
  className?: string;
  canEdit?: boolean;
  /** When false (e.g. the weekday column), links are never rendered as a file chip. */
  enableLink?: boolean;
  /** Instructions: show info text plus Drive link chip at the bottom. */
  isInstructions?: boolean;
  isWeekdayDate?: boolean;
  contentAlign?: "left" | "center";
  onOpenEdit: () => void;
};

/** Wrap at word spaces for every text column (no mid-word breaks). */
const CELL_TEXT_WRAP = cn(
  "w-full text-sm leading-relaxed text-foreground whitespace-normal",
  "[overflow-wrap:break-word] [word-break:normal]"
);

function cellHasData(detail: TaskDetail): boolean {
  return hasRichTextContent(detail.text);
}

export function WeeklyTaskDetailCell({
  detail,
  className,
  canEdit = true,
  enableLink = true,
  isInstructions = false,
  isWeekdayDate = false,
  contentAlign = "left",
  onOpenEdit,
}: WeeklyTaskDetailCellProps) {
  if (isWeekdayDate) {
    return (
      <WeeklyWeekdayDateCell
        text={detail.text}
        className={className}
        canEdit={canEdit}
        onOpenEdit={onOpenEdit}
      />
    );
  }

  const hasData = cellHasData(detail);
  const driveHref = isInstructions ? extractGoogleDriveLink(detail.text) : null;
  const instructionsBody = isInstructions
    ? stripGoogleDriveLinks(detail.text)
    : detail.text;
  const link =
    !isInstructions && enableLink && hasData
      ? extractRichTextLink(detail.text)
      : null;

  if (!hasData) {
    if (!canEdit) {
      return (
        <div
          className={cn(
            "group/cell relative min-h-[5rem] h-full w-full",
            className
          )}
        >
          <div
            className={cn(
              "absolute inset-0 flex items-center py-3 text-muted-foreground",
              contentAlign === "center"
                ? "justify-center px-3 text-center"
                : "justify-start pl-3 pr-10 text-left"
            )}
          >
            —
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "group/cell relative min-h-[5rem] h-full w-full",
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors",
              "hover:bg-accent hover:text-indigo-500 dark:hover:text-indigo-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
            )}
            aria-label="Add cell content"
            onClick={(e) => {
              e.stopPropagation();
              onOpenEdit();
            }}
          >
            <CirclePlus className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group/cell relative min-h-[5rem] w-full py-3",
        contentAlign === "center" ? "px-3 text-center" : "pl-3 pr-10 text-left",
        className
      )}
    >
      {isInstructions ? (
        <div
          className={cn(
            "flex w-full flex-col gap-2.5",
            contentAlign === "center" ? "items-center" : "items-start"
          )}
        >
          {hasRichTextContent(instructionsBody) ? (
            <RichTextContent
              html={instructionsBody}
              wrapAtWords
              className={cn(
                CELL_TEXT_WRAP,
                "[&_.ql-align-center]:text-left [&_.ql-align-right]:text-left [&_.ql-align-justify]:text-left",
                contentAlign === "center" ? "text-center" : "text-left"
              )}
            />
          ) : null}
          {driveHref ? (
            <a
              href={driveHref}
              title="Open Google Drive document (use browser Back to return)"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-muted px-2.5 py-1.5",
                "transition-colors hover:border-sky-400 hover:bg-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80"
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-sky-600 text-white">
                <FileText className="size-3" strokeWidth={2} aria-hidden />
              </span>
              <span className="truncate text-xs font-medium text-foreground">
                Google Drive document
              </span>
            </a>
          ) : null}
        </div>
      ) : link ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-muted px-2.5 py-1.5",
            "transition-colors hover:border-indigo-400 hover:bg-accent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80",
            contentAlign === "center" && "mx-auto"
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-red-600 text-white">
            <FileText className="size-3" strokeWidth={2} aria-hidden />
          </span>
          <span className="truncate text-xs font-medium text-foreground">
            {link.label}
          </span>
        </a>
      ) : (
        <RichTextContent
          html={detail.text}
          wrapAtWords
          className={cn(
            CELL_TEXT_WRAP,
            contentAlign === "center"
              ? "text-center"
              : "text-left [&_.ql-align-center]:text-left [&_.ql-align-right]:text-left [&_.ql-align-justify]:text-left"
          )}
        />
      )}

      {canEdit ? (
        <button
          type="button"
          className={cn(
            "absolute right-1.5 top-1.5 rounded-md p-1 text-muted-foreground transition-colors",
            "opacity-60 hover:bg-accent hover:text-indigo-500 dark:hover:text-indigo-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80",
            "group-hover/cell:opacity-100"
          )}
          aria-label="Update cell"
          onClick={(e) => {
            e.stopPropagation();
            onOpenEdit();
          }}
        >
          <Pencil className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
