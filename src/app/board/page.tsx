export const dynamic = "force-dynamic";

async function getData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const [tasksRes, membersRes] = await Promise.all([
    fetch(`${baseUrl}/api/tasks`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/members`, { cache: "no-store" }),
  ]);
  const [tasks, members] = await Promise.all([tasksRes.json(), membersRes.json()]);
  return { tasks, members };
}