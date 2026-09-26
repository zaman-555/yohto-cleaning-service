import {
  LEAVE_TRANSPORT_TYPES,
  type TransportType,
} from "@/features/dashboard/types";

export const TRANSPORT_TYPES = [
  "Start from PCS Driving",
  "Start from Customer",
  "Paid Holiday",
  "Start from PCS",
  "Vacation",
  "Sick leave",
  "Unpaid off",
] as const satisfies readonly TransportType[];

export type TransportTypeMeta = {
  /** Colour swatch on dashboards and cards. */
  dotClass: string;
  /** Card / chip border matching the status colour. */
  borderClass: string;
  label: string;
};

/**
 * Fixed colour assignment per status type:
 * - Green   → Start from PCS Driving
 * - Orange  → Start from Customer
 * - Sky     → Paid Holiday
 * - Cream   → Start from PCS
 * - Rose    → Vacation
 * - Amber   → Sick leave
 * - Gray    → Unpaid off
 */
export const TRANSPORT_TYPE_META = {
  "Start from PCS Driving": {
    dotClass: "bg-emerald-500",
    borderClass: "border-emerald-500",
    label: "Start from PCS Driving",
  },
  "Start from Customer": {
    dotClass: "bg-orange-500",
    borderClass: "border-orange-500",
    label: "Start from Customer",
  },
  "Paid Holiday": {
    dotClass: "bg-sky-500",
    borderClass: "border-sky-500",
    label: "Paid Holiday",
  },
  "Start from PCS": {
    dotClass: "bg-amber-100",
    borderClass: "border-amber-200",
    label: "Start from PCS",
  },
  Vacation: {
    dotClass: "bg-rose-500",
    borderClass: "border-rose-500",
    label: "Vacation",
  },
  "Sick leave": {
    dotClass: "bg-amber-500",
    borderClass: "border-amber-500",
    label: "Sick leave",
  },
  "Unpaid off": {
    dotClass: "bg-gray-500",
    borderClass: "border-gray-500",
    label: "Unpaid off",
  },
} as const satisfies Record<TransportType, TransportTypeMeta>;

/** Soft fill for leave cells so the label stays readable in the grid. */
export const LEAVE_CELL_SURFACE: Record<(typeof LEAVE_TRANSPORT_TYPES)[number], string> = {
  "Paid Holiday": "bg-sky-500/25",
  "Sick leave": "bg-amber-500/25",
  Vacation: "bg-rose-500/25",
  "Unpaid off": "bg-zinc-500/30",
};

export function transportTypeMeta(type: string): TransportTypeMeta {
  const known = TRANSPORT_TYPE_META[type as TransportType];
  if (known) {
    return known;
  }
  return {
    dotClass: "bg-neutral-500",
    borderClass: "border-neutral-500",
    label: type || "Status",
  };
}
