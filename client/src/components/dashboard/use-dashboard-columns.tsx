import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CirclePlus, MapPin, Pencil } from "lucide-react";
import type { DashboardRow, TaskRecord, User } from "@/features/dashboard/types";
import { Button } from "@/components/ui/button";
import { TransportTypeDot } from "./transport-type-dot";
import { taskCellKey } from "./task-utils";

type UseDashboardColumnsParams = {
  users: User[];
  taskLookup: Map<string, TaskRecord>;
  openTaskDialog: (
    selectedUserId: number,
    selectedUserName: string,
    row: DashboardRow
  ) => void;
  openEditTaskDialog: (
    selectedUserName: string,
    row: DashboardRow,
    record: TaskRecord
  ) => void;
};

export function useDashboardColumns({
  users,
  taskLookup,
  openTaskDialog,
  openEditTaskDialog,
}: UseDashboardColumnsParams): ColumnDef<DashboardRow>[] {
  return useMemo(
    () => [
      {
        id: "dateNum",
        accessorKey: "dateNum",
        header: () => (
          <abbr title="Date" className="cursor-help no-underline">
            #
          </abbr>
        ),
        cell: ({ row }) => row.original.dateNum,
      },
      {
        id: "dayName",
        accessorKey: "dayName",
        header: () => (
          <abbr title="Day of week" className="cursor-help no-underline">
            Dy
          </abbr>
        ),
        cell: ({ row }) => row.original.dayName,
      },
      {
        id: "week",
        accessorKey: "week",
        header: () => (
          <abbr title="Calendar week" className="cursor-help no-underline">
            Wk
          </abbr>
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center text-xs font-bold text-indigo-400">
            {row.original.week}
          </span>
        ),
      },
      ...users.map((currentUser) => ({
        id: `user-${currentUser.id}`,
        header: currentUser.name,
        cell: ({ row }: { row: { original: DashboardRow } }) => {
          const existing = taskLookup.get(
            taskCellKey(currentUser.id, row.original.dateNum)
          );

          if (existing) {
            return (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-3 py-2 text-center">
                <p className="w-full max-w-full text-base font-semibold leading-tight text-neutral-50">
                  {existing.companyName}
                </p>
                <p className="line-clamp-3 w-full max-w-full text-sm leading-snug text-neutral-300">
                  {existing.task}
                </p>
                <div className="flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-sm text-neutral-400">
                  <span className="max-w-full font-medium text-neutral-400">
                    {existing.carName}
                  </span>
                  <span aria-hidden className="text-neutral-600">
                    ·
                  </span>
                  <TransportTypeDot transportType={existing.transportType} />
                  <div className="ml-0.5 flex items-center gap-0 border-l border-neutral-700 pl-2">
                    <a
                      href={existing.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-md p-1 text-indigo-400 transition-colors hover:bg-neutral-800/80 hover:text-indigo-300"
                      aria-label="Open location"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MapPin className="size-4" aria-hidden />
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-neutral-300 hover:!bg-neutral-800/80 hover:!text-neutral-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditTaskDialog(currentUser.name, row.original, existing);
                      }}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              type="button"
              className="flex h-full w-full items-center justify-center px-6 py-5 text-neutral-500 transition-colors"
              aria-label={`Add task for ${currentUser.name}`}
            >
              <CirclePlus
                onClick={() =>
                  openTaskDialog(currentUser.id, currentUser.name, row.original)
                }
                className="h-5 w-5 shrink-0 text-neutral-500 transition-colors hover:text-indigo-200"
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
          );
        },
      })),
    ],
    [users, openTaskDialog, openEditTaskDialog, taskLookup]
  );
}
