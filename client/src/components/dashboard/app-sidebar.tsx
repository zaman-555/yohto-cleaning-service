"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronsUpDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Trash2,
  Users,
} from "lucide-react";
import type { CurrentUser, TeamMember } from "@/features/dashboard/types";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

type AppSidebarProps = {
  user: CurrentUser | null;
  manageableMembers: TeamMember[];
  pendingApprovalIds: Set<number>;
  pendingDeleteIds: Set<number>;
  onToggleApproval: (id: number, currentStatus: boolean) => void;
  onDeleteUser: (id: number) => void;
  onLogout: () => void;
};

const NAV_ITEMS = [
  { href: "/", label: "Main dashboard", icon: LayoutDashboard },
  { href: "/weekly", label: "Weekly showcase", icon: CalendarDays },
] as const;

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function AppSidebar({
  user,
  manageableMembers,
  pendingApprovalIds,
  pendingDeleteIds,
  onToggleApproval,
  onDeleteUser,
  onLogout,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const confirmDelete = () => {
    if (!memberToDelete) return;
    onDeleteUser(memberToDelete.id);
    setMemberToDelete(null);
  };

  return (
    <Sidebar collapsible="icon" className="border-neutral-800">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-extrabold text-white">
                  Y
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Yohto</span>
                  <span className="truncate text-xs text-neutral-400">
                    Team dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.isAdmin && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              <Users className="mr-1.5" />
              Manage users
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-col gap-1">
                {manageableMembers.map((member) => {
                  const isPending = pendingApprovalIds.has(member.id);
                  const isDeleting = pendingDeleteIds.has(member.id);
                  const isBusy = isPending || isDeleting;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent"
                    >
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium">
                          {member.name}
                        </span>
                        <span className="truncate text-xs text-neutral-500">
                          {member.email}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {isBusy ? (
                          <Loader2
                            className="size-4 animate-spin text-neutral-400"
                            aria-hidden
                          />
                        ) : null}
                        <Switch
                          checked={member.isApproved}
                          disabled={isBusy}
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
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isBusy || member.isApproved}
                          onClick={() => setMemberToDelete(member)}
                          className="text-neutral-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                          aria-label={`Delete ${member.name}`}
                          title={
                            member.isApproved
                              ? "Unapprove this user before deleting"
                              : `Delete ${member.name}`
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {manageableMembers.length === 0 && (
                  <p className="px-2 py-1.5 text-sm text-neutral-500">
                    No users found.
                  </p>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-neutral-800 text-xs font-bold text-neutral-100">
                    {user ? initials(user.name) : "?"}
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name ?? "Account"}
                    </span>
                    <span className="truncate text-xs text-neutral-400">
                      {user?.email ?? ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                align="end"
                className="w-[min(16rem,calc(100vw-2rem))] border-neutral-800 bg-neutral-900 text-neutral-200"
              >
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium text-neutral-100">
                    {user?.name ?? "Account"}
                  </span>
                  <span className="truncate text-xs font-normal text-neutral-500">
                    {user?.email ?? ""}
                  </span>
                  {user?.isAdmin && (
                    <span className="mt-1 w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Admin
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-800" />
                <DropdownMenuItem
                  onSelect={() => onLogout()}
                  className="text-neutral-200 focus:!bg-neutral-800/70 focus:!text-neutral-100"
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />

      <Dialog
        open={memberToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setMemberToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {memberToDelete?.name}
              </span>{" "}
              ({memberToDelete?.email}) and all of their scheduled tasks. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="size-4" />
              Delete user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
