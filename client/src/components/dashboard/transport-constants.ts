import type { TransportType } from "@/features/dashboard/types";

export const TRANSPORT_TYPES = [
  "own car",
  "company car",
  "going with other",
] as const satisfies readonly TransportType[];

export const TRANSPORT_TYPE_META = {
  "own car": {
    dotClass: "bg-emerald-400 ring-2 ring-emerald-400/35",
    label: "Own car",
  },
  "company car": {
    dotClass: "bg-amber-400 ring-2 ring-amber-400/35",
    label: "Company car",
  },
  "going with other": {
    dotClass: "bg-violet-400 ring-2 ring-violet-400/35",
    label: "Going with other",
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
    dotClass: "bg-neutral-500 ring-2 ring-neutral-500/30",
    label: type || "Transport",
  };
}
