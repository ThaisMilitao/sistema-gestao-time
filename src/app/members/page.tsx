export const dynamic = "force-dynamic";

async function getMembers() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/members`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
}
