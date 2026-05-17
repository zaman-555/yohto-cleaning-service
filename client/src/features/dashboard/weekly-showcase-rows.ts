import type { TaskDetail, WeeklyShowcaseRow } from "./weekly-showcase-types";

const EM = "—";

function cell(rowKey: string, column: string): TaskDetail {
  return {
    id: `${rowKey}-${column}`,
    date: "",
    text: EM,
  };
}

/** One empty row for `year` + calendar `week` (row suffix e.g. `"1"` → id `2026-w18-1`). */
export function createBlankWeeklyRow(
  year: number,
  week: number,
  rowSuffix: string
): WeeklyShowcaseRow {
  const id = `${year}-w${week}-${rowSuffix}`;
  return {
    id,
    title: cell(id, "title"),
    weekdayDate: cell(id, "weekdayDate"),
    customer: cell(id, "customer"),
    pointOfBusiness: cell(id, "pointOfBusiness"),
    keysSandra: cell(id, "keysSandra"),
    alarmSandra: cell(id, "alarmSandra"),
    instructions: cell(id, "instructions"),
    specialEquipmentDetergent: cell(id, "specialEquipmentDetergent"),
    maxTimeHoursInclusiveOfDriving: cell(id, "maxTimeHoursInclusiveOfDriving"),
  };
}
