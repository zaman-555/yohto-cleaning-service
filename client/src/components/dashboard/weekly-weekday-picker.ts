import type { User } from "@/features/dashboard/types";

/** Values stored in `weekdayDate` cells — match server `parseDayOfWeek` (Mon, Tue, …). */
export const WEEKDAY_PICKER_OPTIONS = [
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
  { value: "Sun", label: "Sunday" },
] as const;

export type WeekdayPickerValue = (typeof WEEKDAY_PICKER_OPTIONS)[number]["value"];

export type WeekdayTheme = {
  text: string;
  selected: string;
  unselected: string;
};

/** Shared red styling for all weekdays in picker and table. */
export const WEEKDAY_THEME: WeekdayTheme = {
  text: "text-red-400",
  selected: "border-red-400 bg-red-600 text-white hover:bg-red-500 hover:text-white",
  unselected: "border-red-900/80 bg-red-950/40 text-red-300 hover:bg-red-950/70",
};

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

const FULL_LABEL_BY_SHORT = Object.fromEntries(
  WEEKDAY_PICKER_OPTIONS.map((o) => [o.value, o.label])
) as Record<WeekdayPickerValue, string>;

/** Separator between weekday and assigned user names in `weekdayDate` cells. */
export const WEEKDAY_DATE_USER_SEPARATOR = " · ";

export function getUserLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts.length === 1 ? parts[0]! : parts[parts.length - 1]!;
}

export function weekdayFullLabel(shortOrAlias: string): string {
  const short = normalizeWeekdaySelection(shortOrAlias);
  if (short && short in FULL_LABEL_BY_SHORT) {
    return FULL_LABEL_BY_SHORT[short as WeekdayPickerValue];
  }
  return shortOrAlias.trim();
}

export function weekdayTheme(shortOrAlias: string): WeekdayTheme | null {
  const short = normalizeWeekdaySelection(shortOrAlias);
  if (!short || !SHORT_SET.has(short)) return null;
  return WEEKDAY_THEME;
}

/** Map saved/API text to a picker value, or "" if unknown / empty. */
export function normalizeWeekdaySelection(raw: string): string {
  const t = raw.trim();
  if (!t || t === "—") return "";
  if (SHORT_SET.has(t)) return t;
  const first = t.split(/\s+/)[0]?.toLowerCase() ?? "";
  const fromAlias = ALIAS_TO_SHORT[first] ?? ALIAS_TO_SHORT[t.toLowerCase()];
  return fromAlias ?? "";
}

export function parseWeekdayDateCellText(raw: string): {
  weekday: string;
  userNames: string[];
} {
  const t = raw.trim();
  if (!t || t === "—") {
    return { weekday: "", userNames: [] };
  }

  const sepIdx = t.indexOf(WEEKDAY_DATE_USER_SEPARATOR);
  if (sepIdx === -1) {
    const weekday = normalizeWeekdaySelection(t);
    if (weekday) {
      return { weekday, userNames: [] };
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
      return { weekday: t, userNames: [] };
    }
    return { weekday: "", userNames: [] };
  }

  const weekdayPart = t.slice(0, sepIdx).trim();
  const usersPart = t.slice(sepIdx + WEEKDAY_DATE_USER_SEPARATOR.length).trim();
  const weekday = normalizeWeekdaySelection(weekdayPart) || weekdayPart;
  const userNames = usersPart
    ? usersPart
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
    : [];

  return { weekday, userNames };
}

export function formatWeekdayDateCellText(weekday: string, userLastNames: string[]): string {
  const day = weekday.trim();
  const names = userLastNames.map((name) => name.trim()).filter(Boolean);
  if (!day) return "";
  if (names.length === 0) return day;
  return `${day}${WEEKDAY_DATE_USER_SEPARATOR}${names.join(", ")}`;
}

/** Weekday (or yyyy-mm-dd) portion used for calendar date resolution. */
export function extractWeekdayLabelForDate(raw: string): string {
  const t = raw.trim();
  if (!t || t === "—") return "";
  const sepIdx = t.indexOf(WEEKDAY_DATE_USER_SEPARATOR);
  if (sepIdx === -1) return t;
  return t.slice(0, sepIdx).trim();
}

function storedNameMatchesUser(stored: string, user: User): boolean {
  const trimmed = stored.trim();
  if (!trimmed) return false;
  if (trimmed === user.name) return true;
  return trimmed === getUserLastName(user.name);
}

/** Resolve stored last/full names from a cell to user ids. */
export function matchStoredUserNamesToIds(storedNames: string[], users: User[]): number[] {
  const ids: number[] = [];
  for (const stored of storedNames) {
    const match = users.find((user) => storedNameMatchesUser(stored, user));
    if (match && !ids.includes(match.id)) {
      ids.push(match.id);
    }
  }
  return ids;
}

export function userIdsToLastNames(userIds: number[], users: User[]): string[] {
  return userIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))
    .map((user) => getUserLastName(user.name));
}

export function userPickerLabelFromIds(userIds: number[], users: User[]): string {
  const lastNames = userIdsToLastNames(userIds, users);
  if (lastNames.length === 0) {
    return "Select users…";
  }
  if (lastNames.length <= 3) {
    return lastNames.join(", ");
  }
  return `${lastNames.length} users selected`;
}
