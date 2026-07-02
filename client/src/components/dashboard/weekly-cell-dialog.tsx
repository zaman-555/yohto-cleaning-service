import type { FormEvent } from "react";
import { ChevronDown } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RichTextEditorLazy } from "@/components/ui/rich-text-editor-lazy";
import type { User } from "@/features/dashboard/types";
import {
  getUserLastName,
  userPickerLabelFromIds,
  WEEKDAY_PICKER_OPTIONS,
  WEEKDAY_THEME,
} from "./weekly-weekday-picker";

export type WeeklyCellDialogInputVariant = "text" | "weekday";

type WeeklyCellDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  inputVariant?: WeeklyCellDialogInputVariant;
  textValue: string;
  onTextChange: (value: string) => void;
  users?: User[];
  selectedUserIds?: number[];
  onSelectedUserIdsChange?: (ids: number[]) => void;
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
  users = [],
  selectedUserIds = [],
  onSelectedUserIdsChange,
  error,
  isSubmitting = false,
  onSubmit,
}: WeeklyCellDialogProps) {
  const isWeekday = inputVariant === "weekday";

  const toggleUserId = (userId: number) => {
    if (!onSelectedUserIdsChange) return;
    if (selectedUserIds.includes(userId)) {
      onSelectedUserIdsChange(selectedUserIds.filter((id) => id !== userId));
      return;
    }
    onSelectedUserIdsChange([...selectedUserIds, userId]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-neutral-100">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-neutral-400">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {isWeekday ? (
            <>
              <div className="space-y-2">
                <Label id="weekly-weekday-label">Day of week</Label>
                <div
                  role="radiogroup"
                  aria-labelledby="weekly-weekday-label"
                  className="grid grid-cols-2 gap-2 sm:grid-cols-3"
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
                          "min-w-0 justify-center px-3 py-2.5 text-sm font-medium",
                          selected ? WEEKDAY_THEME.selected : WEEKDAY_THEME.unselected
                        )}
                      >
                        {day.label}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-neutral-500">
                  Pick the day for this row; other columns use it with the selected week tab to set
                  the saved date.
                </p>
              </div>

              <div className="space-y-2">
                <Label id="weekly-users-label">Users</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting || users.length === 0}
                      aria-labelledby="weekly-users-label"
                      className="w-full justify-between border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                    >
                      <span className="truncate">
                        {userPickerLabelFromIds(selectedUserIds, users)}
                      </span>
                      <ChevronDown className="ml-2 size-4 shrink-0 opacity-60" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto border-neutral-700 bg-neutral-900 text-neutral-100"
                  >
                    <DropdownMenuLabel className="text-neutral-400">
                      Assign users to this row (last name)
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-700" />
                    {users.length === 0 ? (
                      <p className="px-2 py-1.5 text-sm text-neutral-500">No users available.</p>
                    ) : (
                      users.map((user) => (
                        <DropdownMenuCheckboxItem
                          key={user.id}
                          checked={selectedUserIds.includes(user.id)}
                          disabled={isSubmitting}
                          onCheckedChange={() => toggleUserId(user.id)}
                          className="text-neutral-100 focus:bg-neutral-800 focus:text-neutral-100"
                        >
                          {getUserLastName(user.name)}
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-xs text-neutral-500">
                  Optional. Last names are saved in the Weekday / date column with the chosen day.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="weekly-cell-text">Text</Label>
              {open ? (
                <RichTextEditorLazy
                  id="weekly-cell-text"
                  value={textValue}
                  onChange={onTextChange}
                  placeholder="Enter details for this cell"
                  disabled={isSubmitting}
                />
              ) : null}
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
