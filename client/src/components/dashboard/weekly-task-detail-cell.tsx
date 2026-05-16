import { CirclePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskDetail } from "@/features/dashboard/weekly-showcase-types";

type WeeklyTaskDetailCellProps = {
  detail: TaskDetail;
  className?: string;
  onOpenEdit: () => void;
};

export function WeeklyTaskDetailCell({
  detail,
  className,
  onOpenEdit,
}: WeeklyTaskDetailCellProps) {
  const displayText = detail.text === "—" || !detail.text ? "" : detail.text;

  return (
    <div
      className={cn(
        "group/cell relative flex min-h-[2.25rem] items-start pr-7",
        className
      )}
    >
      <span className={cn(displayText ? "text-neutral-100" : "text-neutral-500")}>
        {displayText || "—"}
      </span>

      <button
        type="button"
        className="absolute right-0 top-0 rounded p-0.5 text-neutral-500 opacity-80 transition-colors hover:bg-neutral-800/80 hover:text-indigo-200 group-hover/cell:opacity-100"
        aria-label="Edit cell"
        onClick={(e) => {
          e.stopPropagation();
          onOpenEdit();
        }}
      >
        <CirclePlus className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
