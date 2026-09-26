/**
 * Weekly table cell payload — matches DB `task_details` (see Prisma `TaskDetail`).
 * `id` is a string placeholder until loaded from the API (numeric id).
 */
export type TaskDetail = {
  id: string | number;
  /** ISO date `yyyy-mm-dd` when known (from API). */
  date: string;
  text: string;
};

export const BUILT_IN_WEEKLY_COLUMN_KEYS = [
  "title",
  "weekdayDate",
  "customer",
  "pointOfBusiness",
  "keysSandra",
  "alarmSandra",
  "instructions",
  "specialEquipmentDetergent",
  "maxTimeHoursInclusiveOfDriving",
] as const;

export type BuiltInWeeklyColumnKey = (typeof BUILT_IN_WEEKLY_COLUMN_KEYS)[number];

export type CustomWeeklyColumnKey = `custom_${string}`;

export type WeeklyShowcaseColumnKey = BuiltInWeeklyColumnKey | CustomWeeklyColumnKey;

/** Row model for `/weekly` — each column is a `TaskDetail`, not main-dashboard `TaskRecord`. */
export type WeeklyShowcaseRow = {
  id: string;
  [key: string]: TaskDetail | string;
};

export type WeeklyShowcaseHeaderStyle = "default" | "keysSandra" | "alarmSandra";

export type WeeklyShowcaseColumnHeader = {
  columnKey: WeeklyShowcaseColumnKey;
  label: string;
  headerStyle: WeeklyShowcaseHeaderStyle;
  isVisible: boolean;
  sortOrder: number;
};

export type WeeklyShowcaseColumn = {
  key: WeeklyShowcaseColumnKey;
  label: string;
  thClass: string;
  tdClass: string;
  contentAlign: "left" | "center";
  headerStyle: WeeklyShowcaseHeaderStyle;
};

const WEEKLY_TH_BASE =
  "px-4 py-3.5 text-center text-sm font-bold leading-snug bg-muted text-foreground";

const TD_BORDER = "border-border";

/** Prefer wrapping at word spaces; only break long tokens (URLs) if needed. */
const TD_WRAP =
  "align-top whitespace-normal [overflow-wrap:break-word] [word-break:normal]";

const TD_LAYOUT: Record<
  BuiltInWeeklyColumnKey,
  {
    thMinWidthClass: string;
    tdMinWidthClass: string;
    tdClass: string;
    contentAlign: "left" | "center";
    isFirst?: boolean;
  }
> = {
  title: {
    thMinWidthClass: "w-[13rem] min-w-[13rem]",
    tdMinWidthClass: "w-[13rem] min-w-[13rem]",
    tdClass: `border-b border-l border-r ${TD_BORDER} p-0 text-foreground ${TD_WRAP}`,
    contentAlign: "left",
    isFirst: true,
  },
  weekdayDate: {
    thMinWidthClass: "w-[11rem] min-w-[11rem]",
    tdMinWidthClass: "w-[11rem] min-w-[11rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 text-muted-foreground ${TD_WRAP}`,
    contentAlign: "center",
  },
  customer: {
    thMinWidthClass: "w-[13rem] min-w-[13rem]",
    tdMinWidthClass: "w-[13rem] min-w-[13rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 text-foreground ${TD_WRAP}`,
    contentAlign: "left",
  },
  pointOfBusiness: {
    thMinWidthClass: "w-[16rem] min-w-[16rem]",
    tdMinWidthClass: "w-[16rem] min-w-[16rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 text-foreground ${TD_WRAP}`,
    contentAlign: "left",
  },
  keysSandra: {
    thMinWidthClass: "w-[13rem] min-w-[13rem]",
    tdMinWidthClass: "w-[13rem] min-w-[13rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 text-foreground ${TD_WRAP}`,
    contentAlign: "left",
  },
  alarmSandra: {
    thMinWidthClass: "w-[13rem] min-w-[13rem]",
    tdMinWidthClass: "w-[13rem] min-w-[13rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 text-foreground ${TD_WRAP}`,
    contentAlign: "left",
  },
  instructions: {
    thMinWidthClass: "w-[22rem] min-w-[22rem]",
    tdMinWidthClass: "w-[22rem] min-w-[22rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 text-foreground ${TD_WRAP}`,
    contentAlign: "left",
  },
  specialEquipmentDetergent: {
    thMinWidthClass: "w-[16rem] min-w-[16rem]",
    tdMinWidthClass: "w-[16rem] min-w-[16rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 text-foreground ${TD_WRAP}`,
    contentAlign: "left",
  },
  maxTimeHoursInclusiveOfDriving: {
    thMinWidthClass: "w-[9rem] min-w-[9rem]",
    tdMinWidthClass: "w-[9rem] min-w-[9rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 tabular-nums text-muted-foreground ${TD_WRAP}`,
    contentAlign: "center",
  },
};

const CUSTOM_COLUMN_LAYOUT = {
  thMinWidthClass: "w-[14rem] min-w-[14rem]",
  tdMinWidthClass: "w-[14rem] min-w-[14rem]",
  tdClass: `border-b border-r ${TD_BORDER} p-0 text-foreground ${TD_WRAP}`,
  contentAlign: "left" as const,
};

export const DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS: WeeklyShowcaseColumnHeader[] = [
  { columnKey: "title", label: "Title", headerStyle: "default", isVisible: true, sortOrder: 0 },
  {
    columnKey: "weekdayDate",
    label: "Weekday / date",
    headerStyle: "default",
    isVisible: true,
    sortOrder: 1,
  },
  { columnKey: "customer", label: "Customer", headerStyle: "default", isVisible: true, sortOrder: 2 },
  {
    columnKey: "pointOfBusiness",
    label: "Point of business / exact work area",
    headerStyle: "default",
    isVisible: true,
    sortOrder: 3,
  },
  {
    columnKey: "keysSandra",
    label: "Keys Sandra fills in",
    headerStyle: "default",
    isVisible: true,
    sortOrder: 4,
  },
  {
    columnKey: "alarmSandra",
    label: "Alarm Sandra fills in",
    headerStyle: "default",
    isVisible: true,
    sortOrder: 5,
  },
  {
    columnKey: "instructions",
    label: "Instructions",
    headerStyle: "default",
    isVisible: true,
    sortOrder: 6,
  },
  {
    columnKey: "specialEquipmentDetergent",
    label: "Special equipment / detergent",
    headerStyle: "default",
    isVisible: true,
    sortOrder: 7,
  },
  {
    columnKey: "maxTimeHoursInclusiveOfDriving",
    label: "Max time (h) inclusive of driving",
    headerStyle: "default",
    isVisible: true,
    sortOrder: 8,
  },
];

export const WEEKLY_SHOWCASE_HEADER_STYLE_OPTIONS: {
  value: WeeklyShowcaseHeaderStyle;
  label: string;
}[] = [
  { value: "default", label: "Default (dark gray)" },
  { value: "keysSandra", label: "Keys Sandra (amber)" },
  { value: "alarmSandra", label: "Alarm Sandra (rose)" },
];

const HEADER_STYLE_SET = new Set<string>(
  WEEKLY_SHOWCASE_HEADER_STYLE_OPTIONS.map((option) => option.value)
);

export function isCustomWeeklyColumnKey(
  value: string
): value is CustomWeeklyColumnKey {
  return /^custom_[a-z0-9]{8,32}$/i.test(value);
}

export function isBuiltInWeeklyColumnKey(
  value: string
): value is BuiltInWeeklyColumnKey {
  return (BUILT_IN_WEEKLY_COLUMN_KEYS as readonly string[]).includes(value);
}

export function isWeeklyShowcaseColumnKey(
  value: string
): value is WeeklyShowcaseColumnKey {
  return isBuiltInWeeklyColumnKey(value) || isCustomWeeklyColumnKey(value);
}

function normalizeHeaderStyle(value: string): WeeklyShowcaseHeaderStyle {
  return HEADER_STYLE_SET.has(value) ? (value as WeeklyShowcaseHeaderStyle) : "default";
}

function normalizeColumnHeaders(
  headers: WeeklyShowcaseColumnHeader[] | null | undefined
): WeeklyShowcaseColumnHeader[] {
  const source =
    headers && headers.length > 0 ? headers : DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS;
  const byKey = new Map(source.map((header) => [header.columnKey, header]));
  const merged: WeeklyShowcaseColumnHeader[] = [];

  DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS.forEach((defaults) => {
    const saved = byKey.get(defaults.columnKey);
    merged.push(
      saved
        ? {
            ...saved,
            isVisible: saved.isVisible !== false,
            sortOrder: saved.sortOrder ?? defaults.sortOrder,
          }
        : defaults
    );
  });

  for (const header of source) {
    if (isCustomWeeklyColumnKey(header.columnKey)) {
      merged.push({
        ...header,
        isVisible: header.isVisible !== false,
        sortOrder: header.sortOrder ?? merged.length,
      });
    }
  }

  return merged.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.columnKey.localeCompare(b.columnKey)
  );
}

function getColumnLayout(columnKey: WeeklyShowcaseColumnKey) {
  if (isBuiltInWeeklyColumnKey(columnKey)) {
    return TD_LAYOUT[columnKey];
  }
  return CUSTOM_COLUMN_LAYOUT;
}

function buildThClass(columnKey: WeeklyShowcaseColumnKey, isFirst: boolean): string {
  const layout = getColumnLayout(columnKey);
  const borderSides = isFirst
    ? `border-b border-l border-r border-t ${TD_BORDER}`
    : `border-b border-r border-t ${TD_BORDER}`;
  return `${layout.thMinWidthClass} ${borderSides} ${WEEKLY_TH_BASE}`;
}

export function getVisibleWeeklyColumnHeaders(
  headers: WeeklyShowcaseColumnHeader[] | null | undefined = DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS
): WeeklyShowcaseColumnHeader[] {
  return normalizeColumnHeaders(headers).filter((header) => header.isVisible !== false);
}

export function buildWeeklyShowcaseColumns(
  headers: WeeklyShowcaseColumnHeader[] | null | undefined = DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS
): WeeklyShowcaseColumn[] {
  const visibleHeaders = getVisibleWeeklyColumnHeaders(headers);

  return visibleHeaders.map((header, index) => {
    const layout = getColumnLayout(header.columnKey);
    const style = normalizeHeaderStyle(header.headerStyle);
    return {
      key: header.columnKey,
      label: header.label,
      headerStyle: style,
      thClass: buildThClass(header.columnKey, index === 0),
      tdClass: `${layout.tdMinWidthClass} ${layout.tdClass}`,
      contentAlign: layout.contentAlign,
    };
  });
}

/** Default columns for static key iteration (merge, row utils). */
export const WEEKLY_SHOWCASE_COLUMNS = buildWeeklyShowcaseColumns();

/** Row returned from GET /api/task-details */
export type TaskDetailRecord = {
  id: number;
  rowKey: string;
  columnKey: string;
  date: string;
  text: string;
};

export function getWeeklyRowCell(row: WeeklyShowcaseRow, columnKey: string): TaskDetail {
  const value = row[columnKey];
  if (value && typeof value === "object" && "text" in value) {
    return value as TaskDetail;
  }
  return {
    id: `${row.id}-${columnKey}`,
    date: "",
    text: "—",
  };
}
