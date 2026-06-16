/** Same values as `client/src/features/dashboard/types.ts` `TRANSPORT_TYPES`. */
export const TRANSPORT_TYPES = [
  'own car',
  'company car',
  'going with other',
  'bike',
  'public transport',
  'taxi',
] as const;

export type TransportType = (typeof TRANSPORT_TYPES)[number];

export function isValidTransportType(value: string): value is TransportType {
  return (TRANSPORT_TYPES as readonly string[]).includes(value);
}
