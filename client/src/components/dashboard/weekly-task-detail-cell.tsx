import { CirclePlus, Pencil } from "lucide-react";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { cn } from "@/lib/utils";
import { hasRichTextContent } from "@/lib/rich-text";
import type { TaskDetail } from "@/features/dashboard/weekly-showcase-types";

type WeeklyTaskDetailCellProps = {
  detail: TaskDetail;
  className?: string;
  onOpenEdit: () => void;
};

function cellHasData(detail: TaskDetail): boolean {
  return hasRichTextContent(detail.text);
}

export function WeeklyTaskDetailCell({
  detail,
  className,
  onOpenEdit,
}: WeeklyTaskDetailCellProps) {
  const hasData = cellHasData(detail);

  if (!hasData) {
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
      <RichTextContent
        html={detail.text}
        className="w-full text-center text-sm leading-relaxed text-neutral-100"
      />

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
    </div>
  );
}
