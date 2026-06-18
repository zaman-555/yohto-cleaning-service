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
    dotClass: "bg-emerald-500",
    label: "Own car",
  },
  "company car": {
    dotClass: "bg-blue-500",
    label: "Company car",
  },
  "going with other": {
    dotClass: "bg-fuchsia-500",
    label: "Going with other",
  },
  bike: {
    dotClass: "bg-cyan-400",
    label: "Bike",
  },
  "public transport": {
    dotClass: "bg-rose-500",
    label: "Public transport",
  },
  taxi: {
    dotClass: "bg-orange-500",
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
