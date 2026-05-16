import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserApproval } from "@/features/dashboard/actions";
import type { CurrentUser, TeamMember, User } from "@/features/dashboard/types";

export function useDashboardShell(
  initialTeamMembers: TeamMember[],
  users: User[]
) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [pendingApprovalIds, setPendingApprovalIds] = useState<Set<number>>(
    () => new Set()
  );
  const router = useRouter();

  useEffect(() => {
    const storedUserStr = localStorage.getItem("user");
    if (!storedUserStr) {
      router.push("/login");
      return;
    }

    const storedUser = JSON.parse(storedUserStr) as CurrentUser;
    setUser(storedUser);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    setTeamMembers(initialTeamMembers);
    setPendingApprovalIds((current) => (current.size === 0 ? current : new Set()));
  }, [initialTeamMembers, users]);

  const manageableMembers = teamMembers.filter((member) => !member.isAdmin);

  const toggleApproval = useCallback(
    async (id: number, currentStatus: boolean) => {
      if (pendingApprovalIds.has(id)) return;

      const nextStatus = !currentStatus;

      setPendingApprovalIds((current) => {
        const next = new Set(current);
        next.add(id);
        return next;
      });

      setTeamMembers((members) =>
        members.map((member) =>
          member.id === id ? { ...member, isApproved: nextStatus } : member
        )
      );

      const clearPending = () =>
        setPendingApprovalIds((current) => {
          if (!current.has(id)) return current;
          const next = new Set(current);
          next.delete(id);
          return next;
        });

      try {
        const success = await updateUserApproval(id, nextStatus);
        if (!success) {
          setTeamMembers((members) =>
            members.map((member) =>
              member.id === id ? { ...member, isApproved: currentStatus } : member
            )
          );
          clearPending();
          return;
        }

        router.refresh();
      } catch (err) {
        setTeamMembers((members) =>
          members.map((member) =>
            member.id === id ? { ...member, isApproved: currentStatus } : member
          )
        );
        clearPending();
        console.error("Failed to update approval", err);
      }
    },
    [pendingApprovalIds, router]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
  }, []);

  return {
    user,
    loading,
    manageableMembers,
    pendingApprovalIds,
    toggleApproval,
    handleLogout,
  };
}
