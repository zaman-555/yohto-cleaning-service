import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CirclePlus } from "lucide-react";
import type { DashboardRow, TaskRecord, User } from "@/features/dashboard/types";
import { DashboardTaskCell } from "./dashboard-task-cell";
import { taskCellKey } from "./task-utils";

type UseDashboardColumnsParams = {
  users: User[];
  taskLookup: Map<string, TaskRecord>;
  canManageTasks: boolean;
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
  canManageTasks,
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
              <DashboardTaskCell
                task={existing}
                userName={currentUser.name}
                row={row.original}
                canEdit={canManageTasks}
                onEdit={() =>
                  openEditTaskDialog(currentUser.name, row.original, existing)
                }
              />
            );
          }

          if (!canManageTasks) {
            return null;
          }

          return (
            <button
              type="button"
              className="flex h-full min-h-[5.5rem] w-full items-center justify-center text-neutral-500 transition-colors hover:text-indigo-200"
              aria-label={`Add task for ${currentUser.name}`}
              onClick={() =>
                openTaskDialog(currentUser.id, currentUser.name, row.original)
              }
            >
              <CirclePlus
                className="h-5 w-5 shrink-0"
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
          );
        },
      })),
    ],
    [users, canManageTasks, openTaskDialog, openEditTaskDialog, taskLookup]
  );
}
