import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { CurrentUser, TeamMember } from "@/features/dashboard/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";

type DashboardHeaderProps = {
  user: CurrentUser | null;
  manageableMembers: TeamMember[];
  pendingApprovalIds: Set<number>;
  onToggleApproval: (id: number, currentStatus: boolean) => void;
  onLogout: () => void;
};

export function DashboardHeader({
  user,
  manageableMembers,
  pendingApprovalIds,
  onToggleApproval,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="relative flex flex-col gap-2">
      <div className="absolute right-0 top-0 z-50 flex items-center gap-4">
        {user?.isAdmin && (
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Admin
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300"
                >
                  Manage Users
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 border-neutral-800 bg-neutral-900 text-neutral-200">
                <DropdownMenuLabel className="uppercase tracking-wider text-neutral-500">
                  Team Members
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-800" />
                <div className="max-h-60 overflow-y-auto">
                  {manageableMembers.map((member) => {
                    const isPending = pendingApprovalIds.has(member.id);
                    return (
                      <DropdownMenuItem
                        key={member.id}
                        className="flex items-center justify-between focus:!bg-neutral-800/70 focus:!text-neutral-100 focus:**:!text-current"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex flex-col pr-4">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-xs text-neutral-500">{member.email}</span>
                        </div>
                        <Toggle
                          pressed={member.isApproved}
                          disabled={isPending}
                          onPressedChange={() =>
                            onToggleApproval(member.id, member.isApproved)
                          }
                          className={
                            member.isApproved
                              ? "min-w-24 justify-center !bg-emerald-500 !text-white hover:!bg-emerald-600 data-[state=on]:!bg-emerald-500 data-[state=on]:!text-white data-[state=on]:hover:!bg-emerald-600 disabled:cursor-wait disabled:opacity-80"
                              : "min-w-24 justify-center border border-neutral-700 !bg-neutral-900 !text-neutral-300 hover:!bg-neutral-800 hover:!text-neutral-100 hover:border-neutral-600 disabled:cursor-wait disabled:opacity-80"
                          }
                          size="sm"
                          aria-label={
                            isPending
                              ? `Updating ${member.name}'s approval`
                              : `Toggle ${member.name}'s approval`
                          }
                        >
                          {isPending ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : member.isApproved ? (
                            "Approved"
                          ) : (
                            "Pending"
                          )}
                        </Toggle>
                      </DropdownMenuItem>
                    );
                  })}
                  {manageableMembers.length === 0 && (
                    <DropdownMenuItem disabled className="text-neutral-500">
                      No users found.
                    </DropdownMenuItem>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <Button
          asChild
          variant="ghost"
          className="text-neutral-400 hover:bg-neutral-800 hover:text-white"
          onClick={onLogout}
        >
          <Link href="/login">Log Out</Link>
        </Button>
      </div>
      <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
        Employee Dashboard
      </h1>
      <p className="text-lg text-neutral-400">
        Manage your team&apos;s availability and schedule at a glance.
      </p>
    </header>
  );
}
