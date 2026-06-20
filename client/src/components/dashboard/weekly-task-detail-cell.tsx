import { CirclePlus, FileText, Pencil } from "lucide-react";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { cn } from "@/lib/utils";
import { extractRichTextLink, hasRichTextContent } from "@/lib/rich-text";
import type { TaskDetail } from "@/features/dashboard/weekly-showcase-types";

type WeeklyTaskDetailCellProps = {
  detail: TaskDetail;
  className?: string;
  canEdit?: boolean;
  /** When false (e.g. the weekday column), links are never rendered as a file chip. */
  enableLink?: boolean;
  onOpenEdit: () => void;
};

function cellHasData(detail: TaskDetail): boolean {
  return hasRichTextContent(detail.text);
}

export function WeeklyTaskDetailCell({
  detail,
  className,
  canEdit = true,
  enableLink = true,
  onOpenEdit,
}: WeeklyTaskDetailCellProps) {
  const hasData = cellHasData(detail);
  const link = enableLink && hasData ? extractRichTextLink(detail.text) : null;

  if (!hasData) {
    if (!canEdit) {
      return (
        <div
          className={cn(
            "group/cell flex min-h-[4.5rem] w-full items-center justify-center p-3 text-neutral-600",
            className
          )}
        >
          —
        </div>
      );
    }

    return (
      <div
        className={cn(
          "group/cell flex min-h-[4.5rem] w-full items-center justify-center p-3",
          className
        )}
      >
        <button
          type="button"
          className={cn(
            "rounded-md p-2 text-neutral-500 transition-colors",
            "hover:bg-neutral-800/90 hover:text-indigo-300",
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
    );
  }

  return (
    <div
      className={cn(
        "group/cell relative flex min-h-[4.5rem] w-full items-center justify-center px-8 py-3",
        className
      )}
    >
      {link ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex max-w-full items-center gap-2 rounded-md border border-neutral-600 bg-neutral-800/70 px-2.5 py-1.5",
            "transition-colors hover:border-indigo-400 hover:bg-neutral-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-red-600 text-white">
            <FileText className="size-3" strokeWidth={2} aria-hidden />
          </span>
          <span className="truncate text-xs font-medium text-neutral-100">
            {link.label}
          </span>
        </a>
      ) : (
        <RichTextContent
          html={detail.text}
          className="w-full text-center text-sm leading-relaxed text-neutral-100"
        />
      )}

      {canEdit ? (
        <button
          type="button"
          className={cn(
            "absolute right-1.5 top-1.5 rounded-md p-1 text-neutral-500 transition-colors",
            "opacity-60 hover:bg-neutral-800/90 hover:text-indigo-300",
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
