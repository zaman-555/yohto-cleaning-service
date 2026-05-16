import type { FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { WEEKDAY_PICKER_OPTIONS } from "./weekly-weekday-picker";

export type WeeklyCellDialogInputVariant = "text" | "weekday";

type WeeklyCellDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  inputVariant?: WeeklyCellDialogInputVariant;
  textValue: string;
  onTextChange: (value: string) => void;
  error: string | null;
  isSubmitting?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function WeeklyCellDialog({
  open,
  onOpenChange,
  title,
  description,
  inputVariant = "text",
  textValue,
  onTextChange,
  error,
  isSubmitting = false,
  onSubmit,
}: WeeklyCellDialogProps) {
  const isWeekday = inputVariant === "weekday";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-neutral-100">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-neutral-400">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {isWeekday ? (
            <div className="space-y-2">
              <Label id="weekly-weekday-label">Day of week</Label>
              <div
                role="radiogroup"
                aria-labelledby="weekly-weekday-label"
                className="grid grid-cols-7 gap-2"
              >
                {WEEKDAY_PICKER_OPTIONS.map((day) => {
                  const selected = textValue === day.value;
                  return (
                    <Button
                      key={day.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => onTextChange(day.value)}
                      className={cn(
                        "min-w-0 px-1 py-2 text-xs font-medium sm:text-sm",
                        selected
                          ? "border-indigo-400 bg-indigo-600 text-white hover:bg-indigo-500 hover:text-white"
                          : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                      )}
                    >
                      {day.label}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-500">
                Pick the day for this row; other columns use it with the selected week tab to set the
                saved date.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="weekly-cell-text">Text</Label>
              <textarea
                id="weekly-cell-text"
                required
                value={textValue}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Enter details for this cell"
                className="min-h-24 w-full rounded-lg border border-neutral-700 bg-neutral-800/60 px-2.5 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus-visible:border-indigo-400 focus-visible:ring-3 focus-visible:ring-indigo-500/30"
              />
            </div>
          )}

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <DialogFooter className="-mx-0 -mb-0 rounded-b-lg border-neutral-800 bg-neutral-900/80 p-0 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-500 text-white hover:bg-indigo-400"
            >
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
