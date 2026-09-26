"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Settings2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WeeklyWeekPagination } from "@/components/dashboard/weekly-week-pagination";
import { useDashboardShell } from "@/components/dashboard/use-dashboard-shell";
import { WeeklyCellDialog } from "@/components/dashboard/weekly-cell-dialog";
import { WeeklyColumnsManageDialog } from "@/components/dashboard/weekly-columns-manage-dialog";
import { WeeklyColumnHeaderCell } from "@/components/dashboard/weekly-column-header-cell";
import { WeeklyColumnHeaderDialog } from "@/components/dashboard/weekly-column-header-dialog";
import { WeeklyTaskDetailCell } from "@/components/dashboard/weekly-task-detail-cell";
import {
  extractWeekdayLabelForDate,
  formatWeekdayDateCellText,
  matchStoredUserNamesToIds,
  normalizeWeekdayDateCellRaw,
  parseWeekdayDateCellText,
  userIdsToLastNames,
} from "@/components/dashboard/weekly-weekday-picker";
import { Button } from "@/components/ui/button";
import { isRichTextEmpty } from "@/lib/rich-text";
import {
  createWeeklyShowcaseColumn,
  removeWeeklyShowcaseColumn,
  restoreWeeklyShowcaseColumn,
  upsertWeeklyShowcaseColumnHeader,
  upsertWeeklyTaskDetail,
} from "@/features/dashboard/actions";
import {
  maxRowSuffixForWeek,
  weeklyRowHasAnyData,
  weeklyRowsHaveSavedData,
} from "@/features/dashboard/weekly-row-utils";
import { createBlankWeeklyRow } from "@/features/dashboard/weekly-showcase-rows";
import {
  buildWeeklyShowcaseColumns,
  DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS,
  getVisibleWeeklyColumnHeaders,
  getWeeklyRowCell,
  type TaskDetail,
  type WeeklyShowcaseColumnHeader,
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
  initialColumnHeaders?: WeeklyShowcaseColumnHeader[];
};

type HeaderEditTarget = WeeklyShowcaseColumnHeader;

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
  initialColumnHeaders = DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS,
}: WeeklyShowcaseClientProps) {
  const [cellDialogOpen, setCellDialogOpen] = useState(false);
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);
  const [headerTarget, setHeaderTarget] = useState<HeaderEditTarget | null>(null);
  const [headerLabel, setHeaderLabel] = useState("");
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [activeHeaderKey, setActiveHeaderKey] = useState<WeeklyShowcaseColumnKey | null>(
    null
  );
  const weeklyTableRef = useRef<HTMLDivElement>(null);
  const [columnHeaders, setColumnHeaders] =
    useState<WeeklyShowcaseColumnHeader[]>(initialColumnHeaders);
  const columns = buildWeeklyShowcaseColumns(columnHeaders);
  const visibleColumnKeys = getVisibleWeeklyColumnHeaders(columnHeaders).map(
    (header) => header.columnKey
  );
  const hiddenColumnHeaders = columnHeaders.filter((header) => header.isVisible === false);
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState("");
  const [columnsError, setColumnsError] = useState<string | null>(null);
  const [isManagingColumns, setIsManagingColumns] = useState(false);
  const [cellTarget, setCellTarget] = useState<CellEditTarget | null>(null);
  const [cellText, setCellText] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
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

  useEffect(() => {
    setColumnHeaders(initialColumnHeaders);
  }, [initialColumnHeaders]);

  useEffect(() => {
    if (!activeHeaderKey) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!weeklyTableRef.current?.contains(target)) {
        setActiveHeaderKey(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [activeHeaderKey]);

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
  const hasSavedData = weeklyRowsHaveSavedData(rows, columnHeaders);

  const canAddRow =
    canManageWeeklyRows &&
    rows.length > 0 &&
    weeklyRowHasAnyData(rows[rows.length - 1], columnHeaders);

  const addLocalRow = useCallback(() => {
    setLocalRows((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (!weeklyRowHasAnyData(last, columnHeaders)) return prev;
      const nextSuffix = maxRowSuffixForWeek(prev, year, weekNumber) + 1;
      return [
        ...prev,
        createBlankWeeklyRow(year, weekNumber, String(nextSuffix), visibleColumnKeys),
      ];
    });
  }, [year, weekNumber, columnHeaders, visibleColumnKeys]);

  const openCellDialog = useCallback(
    (target: CellEditTarget, detail: TaskDetail) => {
      setCellTarget(target);
      if (target.column === "weekdayDate") {
        const raw = detail.text === "—" ? "" : detail.text;
        const parsed = parseWeekdayDateCellText(normalizeWeekdayDateCellRaw(raw));
        setCellText(parsed.weekday);
        setSelectedUserIds(matchStoredUserNamesToIds(parsed.userNames, users));
      } else {
        setCellText(detail.text === "—" ? "" : detail.text);
        setSelectedUserIds([]);
      }
      setCellError(null);
      setCellDialogOpen(true);
    },
    [users]
  );

  const openHeaderDialog = useCallback((header: HeaderEditTarget) => {
    setHeaderTarget(header);
    setHeaderLabel(header.label);
    setHeaderError(null);
    setActiveHeaderKey(null);
    setHeaderDialogOpen(true);
  }, []);

  const toggleHeaderActive = useCallback((columnKey: WeeklyShowcaseColumnKey) => {
    setActiveHeaderKey((prev) => (prev === columnKey ? null : columnKey));
  }, []);

  const handleHeaderDialogOpenChange = useCallback((open: boolean) => {
    setHeaderDialogOpen(open);
    if (!open) {
      setHeaderTarget(null);
      setHeaderError(null);
      setIsSavingHeader(false);
    }
  }, []);

  const handleHeaderSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!headerTarget) return;

      const label = headerLabel.trim();
      if (!label) {
        setHeaderError("Please enter a header label.");
        return;
      }

      setIsSavingHeader(true);
      setHeaderError(null);

      const result = await upsertWeeklyShowcaseColumnHeader({
        columnKey: headerTarget.columnKey,
        label,
        headerStyle: "default",
        isVisible: headerTarget.isVisible,
        sortOrder: headerTarget.sortOrder,
      });

      setIsSavingHeader(false);

      if (!result.ok) {
        setHeaderError(result.error);
        return;
      }

      setColumnHeaders((prev) =>
        prev.map((header) =>
          header.columnKey === result.header.columnKey ? result.header : header
        )
      );
      setHeaderDialogOpen(false);
      setHeaderTarget(null);
      router.refresh();
    },
    [headerTarget, headerLabel, router]
  );

  const handleColumnsDialogOpenChange = useCallback((open: boolean) => {
    setColumnsDialogOpen(open);
    if (!open) {
      setColumnsError(null);
      setNewColumnLabel("");
      setIsManagingColumns(false);
    }
  }, []);

  const handleRemoveColumn = useCallback(
    async (columnKey: WeeklyShowcaseColumnKey) => {
      setIsManagingColumns(true);
      setColumnsError(null);

      const header = columnHeaders.find((item) => item.columnKey === columnKey);
      const result = await removeWeeklyShowcaseColumn(columnKey, header);
      setIsManagingColumns(false);

      if (!result.ok) {
        setColumnsError(result.error);
        return;
      }

      setColumnHeaders((prev) => {
        if (result.hidden) {
          return prev.map((header) =>
            header.columnKey === columnKey ? { ...header, isVisible: false } : header
          );
        }
        return prev.filter((header) => header.columnKey !== columnKey);
      });
      router.refresh();
    },
    [columnHeaders, router]
  );

  const handleRestoreColumn = useCallback(
    async (columnKey: WeeklyShowcaseColumnKey) => {
      setIsManagingColumns(true);
      setColumnsError(null);

      const header = columnHeaders.find((item) => item.columnKey === columnKey);
      if (!header) {
        setIsManagingColumns(false);
        setColumnsError("Column header data is missing.");
        return;
      }

      const result = await restoreWeeklyShowcaseColumn(header);
      setIsManagingColumns(false);

      if (!result.ok) {
        setColumnsError(result.error);
        return;
      }

      setColumnHeaders((prev) =>
        prev.map((header) =>
          header.columnKey === result.header.columnKey ? result.header : header
        )
      );
      router.refresh();
    },
    [columnHeaders, router]
  );

  const handleAddColumn = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const label = newColumnLabel.trim();
      if (!label) {
        setColumnsError("Please enter a header label for the new column.");
        return;
      }

      setIsManagingColumns(true);
      setColumnsError(null);

      const result = await createWeeklyShowcaseColumn({ label });
      setIsManagingColumns(false);

      if (!result.ok) {
        setColumnsError(result.error);
        return;
      }

      setColumnHeaders((prev) => [...prev, result.header]);
      setNewColumnLabel("");
      router.refresh();
    },
    [newColumnLabel, router]
  );

  const handleCellDialogOpenChange = useCallback((open: boolean) => {
    setCellDialogOpen(open);
    if (!open) {
      setCellTarget(null);
      setCellError(null);
      setSelectedUserIds([]);
      setIsSavingCell(false);
    }
  }, []);

  const handleCellSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!cellTarget) return;

      const isWeekdayColumn = cellTarget.column === "weekdayDate";
      const weekdayValue = cellText.trim();
      const textToSave = isWeekdayColumn
        ? formatWeekdayDateCellText(weekdayValue, userIdsToLastNames(selectedUserIds, users))
        : cellText;

      if (isWeekdayColumn ? !weekdayValue : isRichTextEmpty(textToSave)) {
        setCellError(
          isWeekdayColumn
            ? "Please select a day of the week."
            : "Please enter text for this cell."
        );
        return;
      }

      const row = localRows.find((r) => r.id === cellTarget.rowId);
      const weekdayLabel = isWeekdayColumn
        ? weekdayValue
        : extractWeekdayLabelForDate(getWeeklyRowCell(row ?? { id: "" }, "weekdayDate").text?.trim() ?? "");

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
    [cellTarget, cellText, selectedUserIds, users, localRows, year, router]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }

  const colCount = columns.length;

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
      logoSrc="/pink_logo_rgb.webp"
      logoAlt="Extra team"
    >
      <WeeklyWeekPagination year={year} weekNumber={weekNumber} />

      {!hasSavedData && rows.length > 0 ? (
        <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          No saved entries for calendar week {weekNumber}, {year}
          {weekRangeLabel ? ` (${weekRangeLabel})` : ""}. Use the week arrows above to
          switch weeks, or{canManageWeeklyRows ? " click +" : " ask an admin to add data"} in a
          cell below.
        </p>
      ) : null}

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
            className="disabled:opacity-50"
          >
            <Plus className="mr-1.5 size-4" aria-hidden />
            Add row
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setColumnsDialogOpen(true)}
          >
            <Settings2 className="mr-1.5 size-4" aria-hidden />
            Manage columns
          </Button>
          {!canAddRow && rows.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              Fill at least one cell in the bottom row to add another.
            </span>
          ) : null}
        </div>
      ) : null}

        <div
          ref={weeklyTableRef}
          className="overflow-hidden border border-border bg-card shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[122rem] table-fixed border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <WeeklyColumnHeaderCell
                      key={col.key}
                      column={col}
                      canEdit={canManageWeeklyRows}
                      isActive={activeHeaderKey === col.key}
                      onActivate={() => toggleHeaderActive(col.key)}
                      onEdit={() => {
                        const header = columnHeaders.find((item) => item.columnKey === col.key);
                        openHeaderDialog(
                          header ?? {
                            columnKey: col.key,
                            label: col.label,
                            headerStyle: col.headerStyle,
                            isVisible: true,
                            sortOrder: 0,
                          }
                        );
                      }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={colCount}
                      className="border-b border-l border-r border-border px-3 py-8 text-center text-muted-foreground"
                    >
                      No rows for week {weekNumber}.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-muted/50"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`${col.tdClass}`}>
                          <WeeklyTaskDetailCell
                            detail={getWeeklyRowCell(row, col.key)}
                            canEdit={canManageWeeklyRows}
                            enableLink={col.key !== "weekdayDate"}
                            isInstructions={col.key === "instructions"}
                            isWeekdayDate={col.key === "weekdayDate"}
                            contentAlign={col.contentAlign}
                            onOpenEdit={() =>
                              openCellDialog(
                                {
                                  weekNumber,
                                  rowId: row.id,
                                  column: col.key,
                                  columnLabel: col.label,
                                },
                                getWeeklyRowCell(row, col.key)
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
          inputVariant={
            cellTarget?.column === "weekdayDate"
              ? "weekday"
              : cellTarget?.column === "instructions"
                ? "instructions"
                : "text"
          }
          textValue={cellText}
          onTextChange={setCellText}
          users={users}
          selectedUserIds={selectedUserIds}
          onSelectedUserIdsChange={setSelectedUserIds}
          error={cellError}
          isSubmitting={isSavingCell}
          onSubmit={handleCellSubmit}
        />

        <WeeklyColumnHeaderDialog
          open={headerDialogOpen}
          onOpenChange={handleHeaderDialogOpenChange}
          header={headerTarget}
          labelValue={headerLabel}
          onLabelChange={setHeaderLabel}
          error={headerError}
          isSubmitting={isSavingHeader}
          onSubmit={handleHeaderSubmit}
        />

        <WeeklyColumnsManageDialog
          open={columnsDialogOpen}
          onOpenChange={handleColumnsDialogOpenChange}
          visibleHeaders={getVisibleWeeklyColumnHeaders(columnHeaders)}
          hiddenHeaders={hiddenColumnHeaders}
          newColumnLabel={newColumnLabel}
          onNewColumnLabelChange={setNewColumnLabel}
          error={columnsError}
          isSubmitting={isManagingColumns}
          onRemoveColumn={handleRemoveColumn}
          onRestoreColumn={handleRestoreColumn}
          onAddColumn={handleAddColumn}
        />
    </DashboardShell>
  );
}
