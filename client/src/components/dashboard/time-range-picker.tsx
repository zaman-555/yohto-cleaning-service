import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TimeRange } from "./task-utils";

type TimeRangePickerProps = {
  idPrefix: string;
  label?: string;
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  disabled?: boolean;
};

export function TimeRangePicker({
  idPrefix,
  label = "Shift",
  value,
  onChange,
  disabled = false,
}: TimeRangePickerProps) {
  return (
    <div className="space-y-2">
      <Label id={`${idPrefix}-label`}>{label}</Label>
      <div
        role="group"
        aria-labelledby={`${idPrefix}-label`}
        className="flex flex-wrap items-center gap-2"
      >
        <Input
          id={`${idPrefix}-start`}
          type="time"
          required
          disabled={disabled}
          value={value.start}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          className="min-w-[7.5rem] flex-1 border-neutral-700 bg-neutral-800/60 text-neutral-100"
          aria-label="Shift start"
        />
        <span className="text-sm text-neutral-500" aria-hidden>
          to
        </span>
        <Input
          id={`${idPrefix}-end`}
          type="time"
          required
          disabled={disabled}
          value={value.end}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          className="min-w-[7.5rem] flex-1 border-neutral-700 bg-neutral-800/60 text-neutral-100"
          aria-label="Shift end"
        />
      </div>
    </div>
  );
}
