/** Allowed `columnKey` values for `task_details` (must match client weekly columns). */
export const WEEKLY_TASK_DETAIL_COLUMN_KEYS = [
  'weekdayDate',
  'customer',
  'pointOfBusiness',
  'keysSandra',
  'instructions',
  'specialEquipmentDetergent',
  'maxTimeHoursInclusiveOfDriving',
] as const;

export type WeeklyTaskDetailColumnKey = (typeof WEEKLY_TASK_DETAIL_COLUMN_KEYS)[number];

export function isWeeklyTaskDetailColumnKey(
  value: string,
): value is WeeklyTaskDetailColumnKey {
  return (WEEKLY_TASK_DETAIL_COLUMN_KEYS as readonly string[]).includes(value);
}
