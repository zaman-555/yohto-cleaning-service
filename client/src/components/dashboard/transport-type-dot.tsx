import { cn } from "@/lib/utils";
import { transportTypeMeta } from "./transport-constants";

export function TransportTypeDot({ transportType }: { transportType: string }) {
  const meta = transportTypeMeta(transportType);
  return (
    <span className="inline-flex shrink-0 items-center justify-center" title={meta.label}>
      <span className="sr-only">{meta.label}</span>
      <span
        aria-hidden
        className={cn("inline-block size-3 rounded-full", meta.dotClass)}
      />
    </span>
  );
}
