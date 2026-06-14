import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/dashboard`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

export default async function DashboardPage() {
  const kpis = await getDashboardData();
  return <DashboardClient kpis={kpis} />;
}
