import "server-only";

import type { TeamMember } from "./types";

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch("http://localhost:5000/api/users", {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TeamMember[];
  } catch {
    return [];
  }
}

export async function fetchApprovedTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch("http://localhost:5000/api/users?approved=true", {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TeamMember[];
  } catch {
    return [];
  }
}
