import { useEffect, useState, type FormEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditorLazy } from "@/components/ui/rich-text-editor-lazy";
import type { User } from "@/features/dashboard/types";
import {
  combineInstructionsContent,
  splitInstructionsContent,
} from "@/features/dashboard/weekly-instructions";
import {
  getUserLastName,
  userPickerLabelFromIds,
  WEEKDAY_PICKER_OPTIONS,
  WEEKDAY_THEME,
} from "./weekly-weekday-picker";

export type WeeklyCellDialogInputVariant = "text" | "weekday" | "instructions";

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
  const isInstructions = inputVariant === "instructions";
  const [instructionsBody, setInstructionsBody] = useState("");
  const [driveUrl, setDriveUrl] = useState("");

  useEffect(() => {
    if (!open || !isInstructions) return;
    const split = splitInstructionsContent(textValue);
    setInstructionsBody(split.bodyHtml);
    setDriveUrl(split.driveUrl);
  }, [open, isInstructions, textValue]);

  const toggleUserId = (userId: number) => {
    if (!onSelectedUserIdsChange) return;
    if (selectedUserIds.includes(userId)) {
      onSelectedUserIdsChange(selectedUserIds.filter((id) => id !== userId));
      return;
    }
    onSelectedUserIdsChange([...selectedUserIds, userId]);
  };

  const syncInstructions = (body: string, drive: string) => {
    setInstructionsBody(body);
    setDriveUrl(drive);
    onTextChange(combineInstructionsContent(body, drive));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
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
                <p className="text-xs text-muted-foreground">
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
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {userPickerLabelFromIds(selectedUserIds, users)}
                      </span>
                      <ChevronDown className="ml-2 size-4 shrink-0 opacity-60" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                  >
                    <DropdownMenuLabel>
                      Assign users to this row (last name)
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {users.length === 0 ? (
                      <p className="px-2 py-1.5 text-sm text-muted-foreground">
                        No users available.
                      </p>
                    ) : (
                      users.map((user) => (
                        <DropdownMenuCheckboxItem
                          key={user.id}
                          checked={selectedUserIds.includes(user.id)}
                          disabled={isSubmitting}
                          onCheckedChange={() => toggleUserId(user.id)}
                        >
                          {getUserLastName(user.name)}
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-xs text-muted-foreground">
                  Optional. Last names are saved in the Weekday / date column with the chosen day.
                </p>
              </div>
            </>
          ) : isInstructions ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="weekly-instructions-text">Information</Label>
                {open ? (
                  <RichTextEditorLazy
                    id="weekly-instructions-text"
                    value={instructionsBody}
                    onChange={(body) => syncInstructions(body, driveUrl)}
                    placeholder="Write site instructions, notes, and details…"
                    disabled={isSubmitting}
                  />
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Add the information text staff need for this job.
                </p>
              </div>
              <div className="space-y-2 border-t border-border pt-4">
                <Label htmlFor="weekly-instructions-drive">
                  Google Drive document (share link)
                </Label>
                <Input
                  id="weekly-instructions-drive"
                  type="url"
                  inputMode="url"
                  placeholder="https://drive.google.com/…"
                  value={driveUrl}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    syncInstructions(instructionsBody, event.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Paste a shared Google Drive / Docs link. It appears under the text. Opens in
                  this tab — use the browser <span className="font-medium">Back</span> button to
                  return to Extra Team.
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

          <DialogFooter className="-mx-0 -mb-0 p-0 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
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
