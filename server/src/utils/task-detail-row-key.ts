/**
 * Parses `task_details.rowKey` shapes like `2026-w20-1`, `2026-W20-1`, or `2026-w020-1`
 * into numeric year/week and the row suffix (week is normalized, no zero-padding).
 */
export function parseTaskDetailRowKeyParts(
  rowKey: string,
): { year: number; week: number; suffix: string } | null {
  const m = /^(\d{4})-w(\d+)-(.*)$/i.exec(rowKey.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const week = Number(m[2]);
  const suffix = m[3];
  if (!Number.isFinite(y) || !Number.isFinite(week) || week < 1 || week > 53) return null;
  return { year: y, week, suffix };
}

/** Canonical row id used in maps and UI: `2026-w20-1`. */
export function normalizedTaskDetailRowKey(rowKey: string): string | null {
  const p = parseTaskDetailRowKeyParts(rowKey);
  if (!p) return null;
  return `${p.year}-w${p.week}-${p.suffix}`;
}

/**
 * Normalizes client row ids (`w18-1`) to canonical `2026-w18-1` using request year/week.
 * Full ids are normalized (case / padded week digits); short ids use the request week.
 */
export function canonicalTaskDetailRowKey(
  year: number,
  weekNumber: number,
  rowKey: string,
): string {
  const t = rowKey.trim();
  const normalized = normalizedTaskDetailRowKey(t);
  if (normalized) {
    return normalized;
  }
  const m = /^w\d+-(.+)$/i.exec(t);
  if (m) {
    return `${year}-w${weekNumber}-${m[1]}`;
  }
  return `${year}-w${weekNumber}-${t}`;
}
