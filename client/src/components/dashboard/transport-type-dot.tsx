import { cn } from "@/lib/utils";
import { transportTypeMeta } from "./transport-constants";

type TransportTypeDotProps = {
  transportType: string;
  /** Default fits dense UI; `lg` for My work cards (phone). */
  size?: "sm" | "lg";
};

export function TransportTypeDot({
  transportType,
  size = "sm",
}: TransportTypeDotProps) {
  const meta = transportTypeMeta(transportType);
  return (
    <span className="inline-flex shrink-0 items-center justify-center" title={meta.label}>
      <span className="sr-only">{meta.label}</span>
      <span
        aria-hidden
        className={cn(
          "inline-block rounded-full",
          size === "lg" ? "size-5 ring-2 ring-background" : "size-3",
          meta.dotClass
        )}
      />
    </span>
  );
}
