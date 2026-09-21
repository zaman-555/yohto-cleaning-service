"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronsUpDown,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  LogOut,
  Moon,
  Sun,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
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
  SidebarSeparator,
  SidebarTrigger,
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
  { href: "/my-tasks", label: "My work", adminLabel: "Staffs", icon: ClipboardList },
  { href: "/kpi", label: "Staff KPI", icon: BarChart3, adminOnly: true },
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
  const { isMobile, setOpen, state } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const showExpandedThemeToggle = isMobile || state === "expanded";
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [usersAccordion, setUsersAccordion] = useState("");

  const pendingApprovalCount = useMemo(
    () => manageableMembers.filter((member) => !member.isApproved).length,
    [manageableMembers]
  );

  useEffect(() => {
    if (pendingApprovalCount > 0) {
      setUsersAccordion("manage-users");
    }
  }, [pendingApprovalCount]);

  const openManageUsers = () => {
    setOpen(true);
    setUsersAccordion("manage-users");
  };

  const sortedMembers = useMemo(
    () =>
      [...manageableMembers].sort((a, b) => {
        if (a.isApproved !== b.isApproved) return a.isApproved ? 1 : -1;
        return a.name.localeCompare(b.name);
      }),
    [manageableMembers]
  );

  const confirmDelete = () => {
    if (!memberToDelete) return;
    onDeleteUser(memberToDelete.id);
    setMemberToDelete(null);
  };

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-1">
            <SidebarMenuButton
              size="lg"
              asChild
              className="flex-1 group-data-[collapsible=icon]:hidden"
            >
              <Link href="/">
                <img
                  src="/favicon.ico"
                  alt="Extra team"
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-lg object-contain"
                />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Extra team</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Team dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
            <SidebarTrigger className="shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {NAV_ITEMS.map((item) => {
                if ("adminOnly" in item && item.adminOnly && !user?.isAdmin) {
                  return null;
                }
                const active = pathname === item.href;
                const Icon = item.icon;
                const label =
                  "adminLabel" in item && user?.isAdmin ? item.adminLabel : item.label;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.isAdmin && (
          <>
            <SidebarSeparator className="my-2" />

            {/* Collapsed: Users icon with pending count badge */}
            <SidebarGroup className="py-0 group-data-[state=expanded]:hidden">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem className="relative">
                    <SidebarMenuButton
                      tooltip={
                        pendingApprovalCount > 0
                          ? `Manage users (${pendingApprovalCount} pending)`
                          : "Manage users"
                      }
                      onClick={openManageUsers}
                    >
                      <Users />
                      <span>Manage users</span>
                    </SidebarMenuButton>
                    {pendingApprovalCount > 0 ? (
                      <span
                        className="pointer-events-none absolute top-0.5 right-0.5 z-10 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold leading-none text-white tabular-nums"
                        aria-label={`${pendingApprovalCount} pending approval requests`}
                      >
                        {pendingApprovalCount}
                      </span>
                    ) : null}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="py-0 group-data-[state=collapsed]:hidden">
              <SidebarGroupContent>
                <Accordion
                  type="single"
                  collapsible
                  value={usersAccordion}
                  onValueChange={setUsersAccordion}
                >
                  <AccordionItem value="manage-users" className="border-b-0">
                    <AccordionTrigger className="px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground hover:no-underline **:data-[slot=accordion-trigger-icon]:text-muted-foreground">
                      <span className="flex min-w-0 flex-1 items-center gap-1.5">
                        <Users className="size-4 shrink-0" />
                        <span className="truncate">Manage users</span>
                        {pendingApprovalCount > 0 ? (
                          <span className="inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold tabular-nums text-white">
                            {pendingApprovalCount}
                          </span>
                        ) : null}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <div className="flex flex-col gap-1">
                        {pendingApprovalCount > 0 ? (
                          <p className="px-2 pb-1 text-xs text-muted-foreground">
                            {pendingApprovalCount} user{pendingApprovalCount === 1 ? "" : "s"}{" "}
                            waiting for approval
                          </p>
                        ) : null}
                        {sortedMembers.map((member) => {
                          const isPending = pendingApprovalIds.has(member.id);
                          const isDeleting = pendingDeleteIds.has(member.id);
                          const isBusy = isPending || isDeleting;
                          return (
                            <div
                              key={member.id}
                              className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent ${
                                !member.isApproved
                                  ? "border border-amber-500/30 bg-amber-500/5"
                                  : ""
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate text-sm font-medium">
                                    {member.name}
                                  </span>
                                  {!member.isApproved ? (
                                    <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                                      Pending
                                    </span>
                                  ) : null}
                                </div>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {member.email}
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                {isBusy ? (
                                  <Loader2
                                    className="size-4 animate-spin text-muted-foreground"
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
                                  className="text-muted-foreground hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
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
                        {sortedMembers.length === 0 ? (
                          <p className="px-2 py-1.5 text-sm text-muted-foreground">
                            No users found.
                          </p>
                        ) : null}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        {showExpandedThemeToggle ? (
          <div className="px-2 pb-2">
            <ThemeToggle showLabel className="w-full justify-start border-sidebar-border" />
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={isDark ? "Light mode" : "Dark mode"}
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun /> : <Moon />}
                <span>{isDark ? "Light mode" : "Dark mode"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
                    {user ? initials(user.name) : "?"}
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name ?? "Account"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email ?? ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                align="end"
                className="w-[min(16rem,calc(100vw-2rem))]"
              >
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium">{user?.name ?? "Account"}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user?.email ?? ""}
                  </span>
                  {user?.isAdmin && (
                    <span className="mt-1 w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Admin
                    </span>
                  )}
                  {user?.isAdmin && pendingApprovalCount > 0 ? (
                    <span className="mt-1 w-fit rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-amber-600 dark:text-amber-300">
                      {pendingApprovalCount} pending approval
                      {pendingApprovalCount === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onLogout()}>
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
