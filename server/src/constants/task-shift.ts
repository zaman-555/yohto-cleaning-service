const TIME_HHMM = /^(\d{1,2}):(\d{2})$/;
const SHIFT_RANGE = /^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/;

function isValidTimeHHmm(value: string): boolean {
  const match = TIME_HHMM.exec(value.trim());
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return (
    Number.isFinite(hours) &&
    Number.isFinite(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
}

export function isValidTaskShift(shift: string): boolean {
  const match = SHIFT_RANGE.exec(shift.trim());
  if (!match) return false;
  return isValidTimeHHmm(match[1]) && isValidTimeHHmm(match[2]);
}

export function normalizeTaskShift(shift: string): string {
  return shift.trim();
}
