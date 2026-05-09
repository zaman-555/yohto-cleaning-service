"use server";

export async function updateUserApproval(userId: number, isApproved: boolean): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}/approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}
