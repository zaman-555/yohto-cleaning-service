import type { TransportType } from "@/features/dashboard/types";

export const TRANSPORT_TYPES = [
  "own car",
  "company car",
  "going with other",
  "bike",
  "public transport",
  "taxi",
] as const satisfies readonly TransportType[];

export const TRANSPORT_TYPE_META = {
  "own car": {
    dotClass: "bg-emerald-400",
    label: "Own car",
  },
  "company car": {
    dotClass: "bg-amber-400",
    label: "Company car",
  },
  "going with other": {
    dotClass: "bg-violet-400",
    label: "Going with other",
  },
  bike: {
    dotClass: "bg-sky-400",
    label: "Bike",
  },
  "public transport": {
    dotClass: "bg-rose-400",
    label: "Public transport",
  },
  taxi: {
    dotClass: "bg-orange-400",
    label: "Taxi",
  },
} as const satisfies Record<TransportType, { dotClass: string; label: string }>;

export function transportTypeMeta(type: string): {
  dotClass: string;
  label: string;
} {
  const known = TRANSPORT_TYPE_META[type as TransportType];
  if (known) {
    return known;
  }
  return {
    dotClass: "bg-neutral-500",
    label: type || "Transport",
  };
}
