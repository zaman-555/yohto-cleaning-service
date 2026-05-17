/**
 * Summary footer + TOT column — neutral palette aligned with the main grid.
 * Solid backgrounds, thin borders, clear typography (no gradients).
 */

export const SUMMARY_FOOTER_ROW_CLASS =
  "bg-neutral-800 text-neutral-100 hover:bg-neutral-800";

/** Separates data rows from summary block */
export const SUMMARY_FOOTER_ROW_FIRST_CLASS = "border-t border-neutral-600";

export const SUMMARY_FOOTER_LABEL_CLASS =
  "border-r border-neutral-600 bg-neutral-800 px-2.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-400";

export const SUMMARY_FOOTER_VALUE_CLASS =
  "border-r border-neutral-600 bg-neutral-800 px-2 py-2.5 text-center text-sm font-medium tabular-nums text-neutral-100";

/** Daily totals — subtle column band */
export const TOT_COLUMN_BODY_CLASS =
  "border-l border-neutral-600 bg-neutral-800/35 px-2 py-2.5 text-center text-sm font-medium tabular-nums text-neutral-300";

/** Grand totals — matches footer row, slightly stronger type */
export const TOT_COLUMN_FOOTER_CLASS =
  "border-l border-neutral-600 bg-neutral-800 px-2 py-2.5 text-center text-sm font-semibold tabular-nums text-neutral-50";

export const TOT_COLUMN_HEADER_CLASS =
  "h-10 border-t border-b border-l border-neutral-600 bg-neutral-800/50 align-middle text-[10px] font-medium uppercase tracking-wider text-neutral-400";
