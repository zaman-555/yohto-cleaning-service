/** Values stored in `weekdayDate` cells — match server `parseDayOfWeek` (Mon, Tue, …). */
export const WEEKDAY_PICKER_OPTIONS = [
  { value: "Mon", label: "Mon" },
  { value: "Tue", label: "Tue" },
  { value: "Wed", label: "Wed" },
  { value: "Thu", label: "Thu" },
  { value: "Fri", label: "Fri" },
  { value: "Sat", label: "Sat" },
  { value: "Sun", label: "Sun" },
] as const;

export type WeekdayPickerValue = (typeof WEEKDAY_PICKER_OPTIONS)[number]["value"];

const ALIAS_TO_SHORT: Record<string, WeekdayPickerValue> = {
  mon: "Mon",
  monday: "Mon",
  tue: "Tue",
  tues: "Tue",
  tuesday: "Tue",
  wed: "Wed",
  wednesday: "Wed",
  thu: "Thu",
  thur: "Thu",
  thurs: "Thu",
  thursday: "Thu",
  fri: "Fri",
  friday: "Fri",
  sat: "Sat",
  saturday: "Sat",
  sun: "Sun",
  sunday: "Sun",
};

const SHORT_SET = new Set<string>(WEEKDAY_PICKER_OPTIONS.map((o) => o.value));

/** Map saved/API text to a picker value, or "" if unknown / empty. */
export function normalizeWeekdaySelection(raw: string): string {
  const t = raw.trim();
  if (!t || t === "—") return "";
  if (SHORT_SET.has(t)) return t;
  const first = t.split(/\s+/)[0]?.toLowerCase() ?? "";
  const fromAlias = ALIAS_TO_SHORT[first] ?? ALIAS_TO_SHORT[t.toLowerCase()];
  return fromAlias ?? "";
}
