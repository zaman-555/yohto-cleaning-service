"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Clock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TimeRange } from "./task-utils";

type TimeRangePickerProps = {
  idPrefix: string;
  label?: string;
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  disabled?: boolean;
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

/** Coerces free-form typing into a 24-hour HH:MM string. */
function normalizeTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) {
    return "";
  }

  let hours = digits.slice(0, 2);
  const minutes = digits.slice(2, 4);

  if (hours.length === 2) {
    hours = String(Math.min(23, Math.max(0, Number(hours)))).padStart(2, "0");
  }

  if (minutes.length === 0) {
    return hours;
  }

  let mm = minutes;
  if (minutes.length === 2) {
    mm = String(Math.min(59, Math.max(0, Number(minutes)))).padStart(2, "0");
  }

  return `${hours.padStart(2, "0")}:${mm}`;
}

function splitTime(value: string): { hour: string | null; minute: string | null } {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return { hour: null, minute: null };
  }
  return { hour: match[1], minute: match[2] };
}

type TimeColumnProps = {
  items: string[];
  selected: string | null;
  open: boolean;
  onSelect: (item: string) => void;
};

function TimeColumn({ items, selected, open, onSelect }: TimeColumnProps) {
  const selectedRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (open && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "center" });
    }
  }, [open]);

  return (
    <div className="no-scrollbar max-h-56 w-16 overflow-y-auto py-1">
      {items.map((item) => {
        const isSelected = item === selected;
        return (
          <button
            key={item}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(item)}
            className={cn(
              "block w-full rounded-md px-3 py-1.5 text-center text-sm tabular-nums transition-colors",
              isSelected
                ? "bg-blue-600 text-white"
                : "text-neutral-200 hover:bg-neutral-700"
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

type TimeFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel: string;
};

function TimeField({ id, value, onChange, disabled, ariaLabel }: TimeFieldProps) {
  const [open, setOpen] = React.useState(false);
  const { hour, minute } = splitTime(value);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <div className="relative min-w-[7.5rem] flex-1">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          required
          disabled={disabled}
          value={value}
          placeholder="HH:MM"
          maxLength={5}
          pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
          onChange={(e) => onChange(normalizeTimeInput(e.target.value))}
          className="border-neutral-700 bg-neutral-800/60 pr-9 text-neutral-100 tabular-nums"
          aria-label={ariaLabel}
        />
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={`${ariaLabel} picker`}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-100 disabled:pointer-events-none disabled:opacity-50"
          >
            <Clock className="size-4" aria-hidden />
          </button>
        </PopoverPrimitive.Trigger>
      </div>
      <PopoverPrimitive.Content
        align="start"
        sideOffset={6}
        className="z-50 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl"
      >
        <div className="flex gap-1">
          <TimeColumn
            items={HOURS}
            selected={hour}
            open={open}
            onSelect={(h) => onChange(`${h}:${minute ?? "00"}`)}
          />
          <div className="my-1 w-px bg-neutral-700" aria-hidden />
          <TimeColumn
            items={MINUTES}
            selected={minute}
            open={open}
            onSelect={(m) => onChange(`${hour ?? "00"}:${m}`)}
          />
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
}

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
        <TimeField
          id={`${idPrefix}-start`}
          value={value.start}
          disabled={disabled}
          ariaLabel="Shift start (24-hour)"
          onChange={(start) => onChange({ ...value, start })}
        />
        <span className="text-sm text-neutral-500" aria-hidden>
          to
        </span>
        <TimeField
          id={`${idPrefix}-end`}
          value={value.end}
          disabled={disabled}
          ariaLabel="Shift end (24-hour)"
          onChange={(end) => onChange({ ...value, end })}
        />
      </div>
    </div>
  );
}
