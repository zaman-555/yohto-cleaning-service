import { CirclePlus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  parseWeekdayDateCellText,
  weekdayFullLabel,
  weekdayTheme,
} from "./weekly-weekday-picker";

type WeeklyWeekdayDateCellProps = {
  text: string;
  className?: string;
  canEdit?: boolean;
  onOpenEdit: () => void;
};

export function WeeklyWeekdayDateCell({
  text,
  className,
  canEdit = true,
  onOpenEdit,
}: WeeklyWeekdayDateCellProps) {
  const trimmed = text.trim();
  const hasData = Boolean(trimmed && trimmed !== "—");
  const { weekday, userNames } = hasData
    ? parseWeekdayDateCellText(trimmed)
    : { weekday: "", userNames: [] as string[] };
  const theme = weekday ? weekdayTheme(weekday) : null;
  const fullDay = weekday ? weekdayFullLabel(weekday) : trimmed;

  if (!hasData) {
    if (!canEdit) {
      return (
        <div
          className={cn(
            "group/cell flex min-h-[5rem] w-full items-center justify-center px-4 py-3 text-neutral-600",
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
          "group/cell flex min-h-[5rem] w-full items-center justify-center px-4 py-3",
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
          aria-label="Add weekday and users"
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
        "group/cell relative flex min-h-[5rem] w-full flex-col items-center justify-center gap-1.5 px-10 py-3",
        className
      )}
    >
      <span
        className={cn(
          "text-center text-sm font-semibold leading-snug tracking-wide",
          theme?.text ?? "text-neutral-200"
        )}
      >
        {fullDay}
      </span>
      {userNames.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {userNames.map((name) => (
            <span
              key={name}
              className="rounded-md border border-neutral-700 bg-neutral-800/80 px-2 py-0.5 text-xs font-medium text-neutral-300"
            >
              {name}
            </span>
          ))}
        </div>
      ) : null}

      {canEdit ? (
        <button
          type="button"
          className={cn(
            "absolute right-2 top-2 rounded-md p-1 text-neutral-500 transition-colors",
            "opacity-60 hover:bg-neutral-800/90 hover:text-indigo-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80",
            "group-hover/cell:opacity-100"
          )}
          aria-label="Update weekday and users"
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
