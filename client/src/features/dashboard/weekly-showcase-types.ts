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

/** Row model for `/weekly` — each column is a `TaskDetail`, not main-dashboard `TaskRecord`. */
export type WeeklyShowcaseRow = {
  id: string;
  title: TaskDetail;
  weekdayDate: TaskDetail;
  customer: TaskDetail;
  pointOfBusiness: TaskDetail;
  keysSandra: TaskDetail;
  alarmSandra: TaskDetail;
  instructions: TaskDetail;
  specialEquipmentDetergent: TaskDetail;
  maxTimeHoursInclusiveOfDriving: TaskDetail;
};

export type WeeklyShowcaseColumnKey = Exclude<keyof WeeklyShowcaseRow, "id">;

const WEEKLY_TH_BASE =
  "px-4 py-3.5 text-center text-sm font-bold leading-snug";

/** Default header background; Sandra columns use dedicated highlight colors. */
const TH_BG_DEFAULT = "bg-neutral-900 text-neutral-300";
const TH_BG_KEYS_SANDRA = "bg-amber-950/95 text-amber-100";
const TH_BG_ALARM_SANDRA = "bg-rose-950/95 text-rose-100";

export const WEEKLY_SHOWCASE_COLUMNS: {
  key: WeeklyShowcaseColumnKey;
  label: string;
  thClass: string;
  tdClass: string;
  contentAlign: "left" | "center";
}[] = [
  {
    key: "title",
    label: "Title",
    thClass: `min-w-[11rem] border-b border-l border-r border-t border-neutral-600 ${WEEKLY_TH_BASE} ${TH_BG_DEFAULT}`,
    tdClass:
      "min-w-[11rem] border-b border-l border-r border-neutral-600 p-0 align-top text-neutral-200",
    contentAlign: "left",
  },
  {
    key: "weekdayDate",
    label: "Weekday / date",
    thClass: `min-w-[10rem] border-b border-r border-t border-neutral-600 ${WEEKLY_TH_BASE} ${TH_BG_DEFAULT}`,
    tdClass:
      "min-w-[10rem] border-b border-r border-neutral-600 p-0 align-top text-neutral-300",
    contentAlign: "center",
  },
  {
    key: "customer",
    label: "Customer",
    thClass: `min-w-[11rem] border-b border-r border-t border-neutral-600 ${WEEKLY_TH_BASE} ${TH_BG_DEFAULT}`,
    tdClass:
      "min-w-[11rem] border-b border-r border-neutral-600 p-0 align-top text-neutral-200",
    contentAlign: "left",
  },
  {
    key: "pointOfBusiness",
    label: "Point of business / exact work area",
    thClass: `min-w-[14rem] border-b border-r border-t border-neutral-600 ${WEEKLY_TH_BASE} ${TH_BG_DEFAULT}`,
    tdClass:
      "min-w-[14rem] border-b border-r border-neutral-600 p-0 align-top text-neutral-200",
    contentAlign: "left",
  },
  {
    key: "keysSandra",
    label: "Keys Sandra fills in",
    thClass: `min-w-[11rem] border-b border-r border-t border-amber-800/60 ${WEEKLY_TH_BASE} ${TH_BG_KEYS_SANDRA}`,
    tdClass:
      "min-w-[11rem] border-b border-r border-neutral-600 p-0 align-top text-neutral-200",
    contentAlign: "left",
  },
  {
    key: "alarmSandra",
    label: "Alarm Sandra fills in",
    thClass: `min-w-[11rem] border-b border-r border-t border-rose-800/60 ${WEEKLY_TH_BASE} ${TH_BG_ALARM_SANDRA}`,
    tdClass:
      "min-w-[11rem] border-b border-r border-neutral-600 p-0 align-top text-neutral-200",
    contentAlign: "left",
  },
  {
    key: "instructions",
    label: "Instructions",
    thClass: `min-w-[16rem] border-b border-r border-t border-neutral-600 ${WEEKLY_TH_BASE} ${TH_BG_DEFAULT}`,
    tdClass:
      "min-w-[16rem] border-b border-r border-neutral-600 p-0 align-top text-neutral-200",
    contentAlign: "left",
  },
  {
    key: "specialEquipmentDetergent",
    label: "Special equipment / detergent",
    thClass: `min-w-[14rem] border-b border-r border-t border-neutral-600 ${WEEKLY_TH_BASE} ${TH_BG_DEFAULT}`,
    tdClass:
      "min-w-[14rem] border-b border-r border-neutral-600 p-0 align-top text-neutral-200",
    contentAlign: "left",
  },
  {
    key: "maxTimeHoursInclusiveOfDriving",
    label: "Max time (h) inclusive of driving",
    thClass: `min-w-[8rem] border-b border-r border-t border-neutral-600 ${WEEKLY_TH_BASE} ${TH_BG_DEFAULT}`,
    tdClass:
      "min-w-[8rem] border-b border-r border-neutral-600 p-0 align-top tabular-nums text-neutral-300",
    contentAlign: "center",
  },
];

/** Row returned from GET /api/task-details */
export type TaskDetailRecord = {
  id: number;
  rowKey: string;
  columnKey: WeeklyShowcaseColumnKey;
  date: string;
  text: string;
};
