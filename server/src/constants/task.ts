/** Same values as `client/src/features/dashboard/types.ts` `TransportType`. */
export const TRANSPORT_TYPES = [
  'Start from PCS Driving',
  'Start from Customer',
  'Paid Holiday',
  'Start from PCS',
  'Vacation',
  'Sick leave',
  'Unpaid off',
] as const;

export type TransportType = (typeof TRANSPORT_TYPES)[number];

export function isValidTransportType(value: string): value is TransportType {
  return (TRANSPORT_TYPES as readonly string[]).includes(value);
}

/** Day-off statuses counted on the Staff KPI yearly leave table. */
export const KPI_LEAVE_DAY_TYPES = ['Paid Holiday', 'Sick leave', 'Vacation'] as const satisfies readonly TransportType[];

/** Paid Holiday, Sick leave, Vacation, and Unpaid off can be saved with a task label only. */
export const LEAVE_TRANSPORT_TYPES = [
  'Paid Holiday',
  'Sick leave',
  'Vacation',
  'Unpaid off',
] as const satisfies readonly TransportType[];

export function isLeaveTransportType(
  value: string,
): value is (typeof LEAVE_TRANSPORT_TYPES)[number] {
  return (LEAVE_TRANSPORT_TYPES as readonly string[]).includes(value);
}
