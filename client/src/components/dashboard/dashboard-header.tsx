"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";

type DashboardHeaderProps = {
  user: CurrentUser | null;
  manageableMembers: TeamMember[];
  pendingApprovalIds: Set<number>;
  onToggleApproval: (id: number, currentStatus: boolean) => void;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
};

function navLinkClass(active: boolean) {
  return active
    ? "font-medium text-cyan-300 underline decoration-cyan-500/50 underline-offset-4"
    : "text-neutral-400 transition-colors hover:text-neutral-200";
}

export function DashboardHeader({
  user,
  manageableMembers,
  pendingApprovalIds,
  onToggleApproval,
  onLogout,
  title = "Employee Dashboard",
  subtitle = "Manage your team's availability and schedule at a glance.",
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const onMain = pathname === "/";
  const onWeekly = pathname === "/weekly";

  return (
    <header className="relative flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:absolute sm:right-0 sm:top-0 sm:z-50 sm:justify-end sm:gap-4">
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
              <DropdownMenuContent className="w-[min(18rem,calc(100vw-2rem))] border-neutral-800 bg-neutral-900 text-neutral-200">
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
                        <div className="flex min-w-0 flex-1 flex-col pr-4">
                          <span className="truncate font-medium">{member.name}</span>
                          <span className="truncate text-xs text-neutral-500">{member.email}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {isPending ? (
                            <Loader2
                              className="size-4 animate-spin text-neutral-400"
                              aria-hidden
                            />
                          ) : null}
                          <Switch
                            checked={member.isApproved}
                            disabled={isPending}
                            onCheckedChange={() =>
                              onToggleApproval(member.id, member.isApproved)
                            }
                            className="disabled:cursor-wait disabled:opacity-80"
                            aria-label={
                              isPending
                                ? `Updating ${member.name}'s approval`
                                : `Toggle ${member.name}'s approval`
                            }
                          />
                        </div>
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
          variant="ghost"
          className="text-neutral-400 hover:bg-neutral-800 hover:text-white"
          onClick={() => void onLogout()}
        >
          Log Out
        </Button>
      </div>
      <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
        {title}
      </h1>
      <p className="text-base text-neutral-400 sm:text-lg">{subtitle}</p>
      <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm">
        <Link href="/" className={navLinkClass(onMain)}>
          Main dashboard
        </Link>
        <span className="text-neutral-600" aria-hidden>
          ·
        </span>
        <Link href="/weekly" className={navLinkClass(onWeekly)}>
          Weekly showcase
        </Link>
      </nav>
    </header>
  );
}
