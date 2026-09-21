import type { FormEvent } from "react";
import type { TaskInput } from "@/features/dashboard/types";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditorLazy } from "@/components/ui/rich-text-editor-lazy";
import { TimeRangePicker } from "./time-range-picker";
import { TRANSPORT_TYPE_META, TRANSPORT_TYPES } from "./transport-constants";
import type { TimeRange } from "./task-utils";
import type { SelectedTaskUserState } from "./types";

type TaskFormState = Omit<TaskInput, "userId" | "date" | "shift">;

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTaskId: number | null;
  selectedTaskUser: SelectedTaskUserState | null;
  taskShift: TimeRange;
  onTaskShiftChange: (value: TimeRange) => void;
  taskForm: TaskFormState;
  onTaskFormChange: (updater: (prev: TaskFormState) => TaskFormState) => void;
  taskSubmitError: string | null;
  isSubmittingTask: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function TaskDialog({
  open,
  onOpenChange,
  editingTaskId,
  selectedTaskUser,
  taskShift,
  onTaskShiftChange,
  taskForm,
  onTaskFormChange,
  taskSubmitError,
  isSubmittingTask,
  onSubmit,
}: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingTaskId != null ? "Update task" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {selectedTaskUser
              ? editingTaskId != null
                ? `Edit task for ${selectedTaskUser.userName}. Date comes from the cell you selected.`
                : `Add a task for ${selectedTaskUser.userName}. Date comes from the cell you clicked.`
              : "Add a task."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-1">
            <div className="space-y-2">
              <Label>Date</Label>
              <div
                className="flex h-8 w-full items-center rounded-lg border border-input bg-muted px-2.5 text-sm text-foreground"
                aria-live="polite"
              >
                {selectedTaskUser?.dateLabel ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                Set from the row you selected; it cannot be changed here.
              </p>
            </div>

            <TimeRangePicker
              idPrefix="task-shift"
              value={taskShift}
              onChange={onTaskShiftChange}
              disabled={isSubmittingTask}
            />

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                required
                value={taskForm.companyName}
                onChange={(e) =>
                  onTaskFormChange((prev) => ({ ...prev, companyName: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskText">Task</Label>
              {open ? (
                <RichTextEditorLazy
                  id="taskText"
                  value={taskForm.task}
                  onChange={(task) =>
                    onTaskFormChange((prev) => ({ ...prev, task }))
                  }
                  placeholder="Describe the task"
                  disabled={isSubmittingTask}
                />
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="carName">Car Name</Label>
              <Input
                id="carName"
                required
                value={taskForm.carName}
                onChange={(e) =>
                  onTaskFormChange((prev) => ({ ...prev, carName: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label id="transport-type-label">Transport</Label>
              <div
                role="radiogroup"
                aria-labelledby="transport-type-label"
                className="flex flex-wrap items-center gap-3"
              >
                {TRANSPORT_TYPES.map((t) => {
                  const meta = TRANSPORT_TYPE_META[t];
                  const selected = taskForm.transportType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      title={meta.label}
                      onClick={() =>
                        onTaskFormChange((prev) => ({ ...prev, transportType: t }))
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        meta.borderClass,
                        selected
                          ? "bg-muted font-medium text-foreground ring-2 ring-indigo-400 ring-offset-2 ring-offset-background"
                          : "bg-background text-muted-foreground hover:bg-muted/60"
                      )}
                    >
                      <span className={cn("block size-2.5 rounded-full", meta.dotClass)} />
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location URL</Label>
              {open ? (
                <RichTextEditorLazy
                  id="location"
                  value={taskForm.location}
                  onChange={(location) =>
                    onTaskFormChange((prev) => ({ ...prev, location }))
                  }
                  placeholder="https://example.com/location"
                  disabled={isSubmittingTask}
                />
              ) : null}
              <p className="text-xs text-muted-foreground">
                Enter a URL or use the link tool; formatting and colors are saved with the task.
              </p>
            </div>

            {taskSubmitError ? (
              <p className="text-sm text-destructive">{taskSubmitError}</p>
            ) : null}
          </div>

          <DialogFooter className="-mx-4 -mb-4 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingTask || !selectedTaskUser}
              className="bg-indigo-500 text-white hover:bg-indigo-600"
            >
              {isSubmittingTask
                ? "Saving..."
                : editingTaskId != null
                  ? "Update task"
                  : "Save Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
