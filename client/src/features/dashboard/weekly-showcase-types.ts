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

export const WEEKLY_SHOWCASE_COLUMNS: {
  key: WeeklyShowcaseColumnKey;
  label: string;
  tdClass: string;
}[] = [
  {
    key: "title",
    label: "Title",
    tdClass:
      "max-w-[10rem] border-b border-l border-r border-neutral-600 p-0 align-middle text-center text-neutral-200",
  },
  {
    key: "weekdayDate",
    label: "Weekday / date",
    tdClass:
      "max-w-[9rem] border-b border-r border-neutral-600 p-0 align-middle text-center text-neutral-300",
  },
  {
    key: "customer",
    label: "Customer",
    tdClass:
      "max-w-[10rem] border-b border-r border-neutral-600 p-0 align-middle text-center text-neutral-200",
  },
  {
    key: "pointOfBusiness",
    label: "Point of business / exact work area",
    tdClass:
      "max-w-[12rem] border-b border-r border-neutral-600 p-0 align-middle text-center text-neutral-200",
  },
  {
    key: "keysSandra",
    label: "Keys Sandra fills in",
    tdClass:
      "max-w-[10rem] border-b border-r border-neutral-600 p-0 align-middle text-center text-neutral-200",
  },
  {
    key: "alarmSandra",
    label: "Alarm Sandra fills in",
    tdClass:
      "max-w-[10rem] border-b border-r border-neutral-600 p-0 align-middle text-center text-neutral-200",
  },
  {
    key: "instructions",
    label: "Instructions",
    tdClass:
      "min-w-[12rem] max-w-[18rem] border-b border-r border-neutral-600 p-0 align-middle text-center text-neutral-200",
  },
  {
    key: "specialEquipmentDetergent",
    label: "Special equipment / detergent",
    tdClass:
      "max-w-[12rem] border-b border-r border-neutral-600 p-0 align-middle text-center text-neutral-200",
  },
  {
    key: "maxTimeHoursInclusiveOfDriving",
    label: "Max time (h) inclusive of driving",
    tdClass:
      "max-w-[6rem] border-b border-r border-neutral-600 p-0 align-middle text-center tabular-nums text-neutral-300",
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
