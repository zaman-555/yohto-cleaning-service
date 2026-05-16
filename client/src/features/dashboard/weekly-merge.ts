import { createBlankWeeklyRow } from "./weekly-showcase-rows";
import {
  WEEKLY_SHOWCASE_COLUMNS,
  type TaskDetailRecord,
  type WeeklyShowcaseColumnKey,
  type WeeklyShowcaseRow,
} from "./weekly-showcase-types";

function isColumnKey(value: string): value is WeeklyShowcaseColumnKey {
  return WEEKLY_SHOWCASE_COLUMNS.some((c) => c.key === value);
}

/** Same rules as server `parseTaskDetailRowKeyParts` — tolerant of `W` vs `w` and padded weeks. */
function parseTaskDetailRowKeyParts(
  rowKey: string
): { year: number; week: number; suffix: string } | null {
  const m = /^(\d{4})-w(\d+)-(.*)$/i.exec(rowKey.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const wk = Number(m[2]);
  const suffix = m[3];
  if (!Number.isFinite(y) || !Number.isFinite(wk) || wk < 1 || wk > 53) return null;
  return { year: y, week: wk, suffix };
}

function normalizedTaskDetailRowKey(rowKey: string): string | null {
  const p = parseTaskDetailRowKeyParts(rowKey);
  if (!p) return null;
  return `${p.year}-w${p.week}-${p.suffix}`;
}

/** Merge GET /api/task-details rows into the seed row list for one calendar week. */
export function mergeTaskDetailsIntoRowList(
  year: number,
  week: number,
  seedRows: WeeklyShowcaseRow[],
  details: TaskDetailRecord[]
): WeeklyShowcaseRow[] {
  const out = structuredClone(seedRows);
  const byId = new Map(out.map((r) => [r.id, r] as const));

  for (const d of details) {
    const parsed = parseTaskDetailRowKeyParts(d.rowKey);
    if (!parsed || parsed.year !== year || parsed.week !== week) continue;

    const rowKeyNorm = normalizedTaskDetailRowKey(d.rowKey);
    if (!rowKeyNorm) continue;

    let row = byId.get(rowKeyNorm);
    if (!row) {
      const suffix = parsed.suffix || "1";
      row = createBlankWeeklyRow(year, week, suffix);
      out.push(row);
      byId.set(rowKeyNorm, row);
    }
    if (!isColumnKey(d.columnKey)) continue;
    const dateStr = d.date.slice(0, 10);
    row[d.columnKey] = {
      id: d.id,
      date: dateStr,
      text: d.text,
    };
  }

  return out;
}
