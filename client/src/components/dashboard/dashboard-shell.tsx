"use client";

import type { CSSProperties, ReactNode } from "react";
import type { CurrentUser, TeamMember } from "@/features/dashboard/types";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ScrollToTop } from "./scroll-to-top";

const SIDEBAR_DARK_THEME = {
  "--sidebar": "oklch(0.205 0 0)",
  "--sidebar-foreground": "oklch(0.922 0 0)",
  "--sidebar-primary": "oklch(0.585 0.2 277)",
  "--sidebar-primary-foreground": "oklch(0.985 0 0)",
  "--sidebar-accent": "oklch(0.269 0 0)",
  "--sidebar-accent-foreground": "oklch(0.985 0 0)",
  "--sidebar-border": "oklch(0.269 0 0)",
  "--sidebar-ring": "oklch(0.6 0.15 264)",
} as CSSProperties;

type DashboardShellProps = {
  user: CurrentUser | null;
  manageableMembers: TeamMember[];
  pendingApprovalIds: Set<number>;
  pendingDeleteIds: Set<number>;
  onToggleApproval: (id: number, currentStatus: boolean) => void;
  onDeleteUser: (id: number) => void;
  onLogout: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function DashboardShell({
  user,
  manageableMembers,
  pendingApprovalIds,
  pendingDeleteIds,
  onToggleApproval,
  onDeleteUser,
  onLogout,
  title,
  subtitle,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={SIDEBAR_DARK_THEME}
      className="bg-neutral-950 font-sans text-neutral-100 selection:bg-indigo-500/30"
    >
      <AppSidebar
        user={user}
        manageableMembers={manageableMembers}
        pendingApprovalIds={pendingApprovalIds}
        pendingDeleteIds={pendingDeleteIds}
        onToggleApproval={onToggleApproval}
        onDeleteUser={onDeleteUser}
        onLogout={onLogout}
      />
      <SidebarInset className="bg-neutral-950 text-neutral-100">
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-950/80 px-4 py-3 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="border-0 bg-transparent text-neutral-400 shadow-none hover:bg-transparent hover:text-white" />
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl">
              {title}
            </h1>
            <p className="truncate text-xs text-neutral-400 sm:text-sm">
              {subtitle}
            </p>
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
            {children}
          </div>
        </div>
      </SidebarInset>
      <ScrollToTop />
    </SidebarProvider>
  );
}
