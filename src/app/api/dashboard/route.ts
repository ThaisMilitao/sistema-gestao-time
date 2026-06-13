import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";
import type { DashboardKPIs, WorkloadItem } from "@/types";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const [allTasks, allMembers] = await Promise.all([
      prisma.task.findMany({
        include: { member: true },
        orderBy: { dueDate: "asc" },
      }),
      prisma.member.findMany({ orderBy: { name: "asc" } }),
    ]);

    // --- KPI 1: Taxa de conclusão no prazo ---
    // Tasks concluídas: quantas foram entregues antes ou na data de vencimento?
    const doneTasks = allTasks.filter((t) => t.status === "DONE" && t.dueDate && t.completedAt);
    const onTimeTasks = doneTasks.filter(
      (t) => t.completedAt! <= t.dueDate!
    );
    const onTimeRate =
      doneTasks.length > 0
        ? Math.round((onTimeTasks.length / doneTasks.length) * 100)
        : 0;

    // --- KPI 2: Tarefas atrasadas agora ---
    const overdueTasks = allTasks.filter(
      (t) => t.status !== "DONE" && t.dueDate && t.dueDate < now
    );
    const overdueUrgent = overdueTasks
      .filter((t) => t.priority === "URGENT" || t.priority === "HIGH")
      .slice(0, 5);

    // --- KPI 3: Velocidade semanal ---
    const weeklyDone = allTasks.filter(
      (t) => t.status === "DONE" && t.completedAt && t.completedAt >= sevenDaysAgo
    );
    const weeklyVelocity = weeklyDone.length;

    // --- KPI 4: Distribuição de carga por membro ---
    const workloadByMember: WorkloadItem[] = allMembers.map((member) => {
      const memberTasks = allTasks.filter((t) => t.memberId === member.id);
      const memberOverdue = memberTasks.filter(
        (t) => t.status !== "DONE" && t.dueDate && t.dueDate < now
      );

      return {
        member: {
          ...member,
          createdAt: member.createdAt.toISOString(),
          updatedAt: member.updatedAt.toISOString(),
          avatarUrl: member.avatarUrl,
        },
        todo: memberTasks.filter((t) => t.status === "TODO").length,
        inProgress: memberTasks.filter((t) => t.status === "IN_PROGRESS").length,
        done: memberTasks.filter((t) => t.status === "DONE").length,
        blocked: memberTasks.filter((t) => t.status === "BLOCKED").length,
        total: memberTasks.filter((t) => t.status !== "DONE").length,
        overdue: memberOverdue.length,
      };
    });

    // --- Status breakdown ---
    const statusBreakdown = {
      todo: allTasks.filter((t) => t.status === "TODO").length,
      inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: allTasks.filter((t) => t.status === "DONE").length,
      blocked: allTasks.filter((t) => t.status === "BLOCKED").length,
    };

    // --- Due soon (next 48h, not done) ---
    const dueSoonTasks = allTasks
      .filter(
        (t) =>
          t.status !== "DONE" &&
          t.dueDate &&
          t.dueDate >= now &&
          t.dueDate <= in48h
      )
      .slice(0, 6);

    const kpis: DashboardKPIs = {
      onTimeRate,
      overdueCount: overdueTasks.length,
      overdueUrgent: overdueUrgent.map((t) => ({
        ...t,
        dueDate: t.dueDate?.toISOString() ?? null,
        completedAt: t.completedAt?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        member: t.member
          ? {
              ...t.member,
              createdAt: t.member.createdAt.toISOString(),
              updatedAt: t.member.updatedAt.toISOString(),
            }
          : null,
      })),
      weeklyVelocity,
      workloadByMember,
      statusBreakdown,
      dueSoonTasks: dueSoonTasks.map((t) => ({
        ...t,
        dueDate: t.dueDate?.toISOString() ?? null,
        completedAt: t.completedAt?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        member: t.member
          ? {
              ...t.member,
              createdAt: t.member.createdAt.toISOString(),
              updatedAt: t.member.updatedAt.toISOString(),
            }
          : null,
      })),
    };

    return NextResponse.json(kpis);
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Erro ao calcular KPIs" }, { status: 500 });
  }
}
