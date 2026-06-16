"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WeeklyWeekPagination } from "@/components/dashboard/weekly-week-pagination";
import { useDashboardShell } from "@/components/dashboard/use-dashboard-shell";
import { WeeklyCellDialog } from "@/components/dashboard/weekly-cell-dialog";
import { WeeklyTaskDetailCell } from "@/components/dashboard/weekly-task-detail-cell";
import { normalizeWeekdaySelection } from "@/components/dashboard/weekly-weekday-picker";
import { Button } from "@/components/ui/button";
import { isRichTextEmpty } from "@/lib/rich-text";
import { upsertWeeklyTaskDetail } from "@/features/dashboard/actions";
import {
  maxRowSuffixForWeek,
  weeklyRowHasAnyData,
} from "@/features/dashboard/weekly-row-utils";
import { createBlankWeeklyRow } from "@/features/dashboard/weekly-showcase-rows";
import {
  WEEKLY_SHOWCASE_COLUMNS,
  type WeeklyShowcaseColumnKey,
  type WeeklyShowcaseRow,
} from "@/features/dashboard/weekly-showcase-types";
import type { TeamMember, User } from "@/features/dashboard/types";

export type WeeklyShowcaseClientProps = {
  year: number;
  weekNumber: number;
  weekRangeLabel: string | null;
  initialTeamMembers: TeamMember[];
  users: User[];
  initialRows: WeeklyShowcaseRow[];
};

type CellEditTarget = {
  weekNumber: number;
  rowId: string;
  column: WeeklyShowcaseColumnKey;
  columnLabel: string;
};

export default function WeeklyShowcaseClient({
  year,
  weekNumber,
  weekRangeLabel,
  initialTeamMembers,
  users,
  initialRows,
}: WeeklyShowcaseClientProps) {
  const [cellDialogOpen, setCellDialogOpen] = useState(false);
  const [cellTarget, setCellTarget] = useState<CellEditTarget | null>(null);
  const [cellText, setCellText] = useState("");
  const [cellError, setCellError] = useState<string | null>(null);
  const [isSavingCell, setIsSavingCell] = useState(false);
  const [localRows, setLocalRows] = useState<WeeklyShowcaseRow[]>(() =>
    structuredClone(initialRows)
  );
  const router = useRouter();

  useEffect(() => {
    setLocalRows((prev) => {
      const incoming = structuredClone(initialRows);
      const weekRowPrefix = `${year}-w${weekNumber}-`;
      const incomingIds = new Set(incoming.map((r) => r.id));
      // Keep only unsynced rows for the *current* week (e.g. locally added before refresh).
      const localExtras = prev.filter(
        (r) => r.id.startsWith(weekRowPrefix) && !incomingIds.has(r.id)
      );
      return [...incoming, ...localExtras];
    });
  }, [initialRows, year, weekNumber]);

  const {
    user,
    loading,
    manageableMembers,
    pendingApprovalIds,
    pendingDeleteIds,
    toggleApproval,
    removeUser,
    handleLogout,
  } = useDashboardShell(initialTeamMembers, users);

  const rows = localRows;
  const canManageWeeklyRows = Boolean(user?.isAdmin);

  const canAddRow =
    canManageWeeklyRows && rows.length > 0 && weeklyRowHasAnyData(rows[rows.length - 1]);

  const addLocalRow = useCallback(() => {
    setLocalRows((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (!weeklyRowHasAnyData(last)) return prev;
      const nextSuffix = maxRowSuffixForWeek(prev, year, weekNumber) + 1;
      return [...prev, createBlankWeeklyRow(year, weekNumber, String(nextSuffix))];
    });
  }, [year, weekNumber]);

  const openCellDialog = useCallback(
    (target: CellEditTarget, detail: WeeklyShowcaseRow[WeeklyShowcaseColumnKey]) => {
      setCellTarget(target);
      if (target.column === "weekdayDate") {
        const raw = detail.text === "—" ? "" : detail.text;
        setCellText(normalizeWeekdaySelection(raw));
      } else {
        setCellText(detail.text === "—" ? "" : detail.text);
      }
      setCellError(null);
      setCellDialogOpen(true);
    },
    []
  );

  const handleCellDialogOpenChange = useCallback((open: boolean) => {
    setCellDialogOpen(open);
    if (!open) {
      setCellTarget(null);
      setCellError(null);
      setIsSavingCell(false);
    }
  }, []);

  const handleCellSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!cellTarget) return;

      const isWeekdayColumn = cellTarget.column === "weekdayDate";
      const textToSave = isWeekdayColumn ? cellText.trim() : cellText;

      if (isWeekdayColumn ? !textToSave : isRichTextEmpty(textToSave)) {
        setCellError(
          isWeekdayColumn
            ? "Please select a day of the week."
            : "Please enter text for this cell."
        );
        return;
      }

      const row = localRows.find((r) => r.id === cellTarget.rowId);
      const weekdayLabel =
        isWeekdayColumn
          ? textToSave
          : (() => {
              const t = row?.weekdayDate.text?.trim() ?? "";
              if (!t || t === "—") return "";
              return t;
            })();

      setIsSavingCell(true);
      setCellError(null);

      const result = await upsertWeeklyTaskDetail({
        year,
        weekNumber: cellTarget.weekNumber,
        rowKey: cellTarget.rowId,
        columnKey: cellTarget.column,
        text: textToSave,
        weekdayLabelForDate: weekdayLabel,
      });

      setIsSavingCell(false);

      if (!result.ok) {
        setCellError(result.error);
        return;
      }

      const savedDetail = result.detail;
      setLocalRows((prev) =>
        prev.map((r) =>
          r.id === cellTarget.rowId
            ? {
                ...r,
                [cellTarget.column]: {
                  id: savedDetail.id,
                  date: savedDetail.date,
                  text: savedDetail.text,
                },
              }
            : r
        )
      );

      setCellDialogOpen(false);
      setCellTarget(null);
      router.refresh();
    },
    [cellTarget, cellText, localRows, year, router]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        Loading...
      </div>
    );
  }

  const colCount = WEEKLY_SHOWCASE_COLUMNS.length;

  return (
    <DashboardShell
      user={user}
      manageableMembers={manageableMembers}
      pendingApprovalIds={pendingApprovalIds}
      pendingDeleteIds={pendingDeleteIds}
      onToggleApproval={toggleApproval}
      onDeleteUser={removeUser}
      onLogout={handleLogout}
      title="Weekly showcase"
      subtitle={
        weekRangeLabel
          ? `Calendar week ${weekNumber}, ${year} (${weekRangeLabel})`
          : `Calendar week ${weekNumber}, ${year}`
      }
    >
      <WeeklyWeekPagination year={year} weekNumber={weekNumber} />

      {canManageWeeklyRows ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddRow}
            onClick={addLocalRow}
            title={
              canAddRow
                ? "Add another row for this week"
                : "Enter data in the last row before adding another"
            }
            className="border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
          >
            <Plus className="mr-1.5 size-4" aria-hidden />
            Add row
          </Button>
          {!canAddRow && rows.length > 0 ? (
            <span className="text-xs text-neutral-500">
              Fill at least one cell in the bottom row to add another.
            </span>
          ) : null}
        </div>
      ) : null}

        <div className="overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[68rem] border-separate border-spacing-0 text-center text-sm">
              <thead className="bg-neutral-950/50">
                <tr>
                  {WEEKLY_SHOWCASE_COLUMNS.map((col, i) => (
                    <th
                      key={col.key}
                      className={
                        i === 0
                          ? "border-b border-l border-r border-t border-neutral-600 px-3 py-3 text-center font-semibold leading-snug text-neutral-300"
                          : "border-b border-r border-t border-neutral-600 px-3 py-3 text-center font-semibold leading-snug text-neutral-300"
                      }
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={colCount}
                      className="border-b border-l border-r border-neutral-600 px-3 py-8 text-center text-neutral-500"
                    >
                      No rows for week {weekNumber}.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-neutral-800/50"
                    >
                      {WEEKLY_SHOWCASE_COLUMNS.map((col) => (
                        <td key={col.key} className={col.tdClass}>
                          <WeeklyTaskDetailCell
                            detail={row[col.key]}
                            canEdit={canManageWeeklyRows}
                            onOpenEdit={() =>
                              openCellDialog(
                                {
                                  weekNumber,
                                  rowId: row.id,
                                  column: col.key,
                                  columnLabel: col.label,
                                },
                                row[col.key]
                              )
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <WeeklyCellDialog
          open={cellDialogOpen}
          onOpenChange={handleCellDialogOpenChange}
          title={
            cellTarget
              ? `Week ${cellTarget.weekNumber} · ${cellTarget.columnLabel}`
              : "Edit cell"
          }
          description={
            cellTarget
              ? `Row ${cellTarget.rowId}. Saving writes to the database.`
              : undefined
          }
          inputVariant={cellTarget?.column === "weekdayDate" ? "weekday" : "text"}
          textValue={cellText}
          onTextChange={setCellText}
          error={cellError}
          isSubmitting={isSavingCell}
          onSubmit={handleCellSubmit}
        />
    </DashboardShell>
  );
}
