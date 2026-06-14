import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CreateTaskInput } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const status = searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where: {
        ...(memberId ? { memberId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: { member: true },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });

    const now = new Date();

    const sortedTasks = tasks.sort((a, b) => {
      const aOverdue = a.dueDate && new Date(a.dueDate) < now && a.status !== "DONE"; // Adapte o "DONE" se necessário
      const bOverdue = b.dueDate && new Date(b.dueDate) < now && b.status !== "DONE";

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      return 0;
    });

    return NextResponse.json(sortedTasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskInput = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        status: body.status ?? "TODO",
        priority: body.priority ?? "MEDIUM",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        memberId: body.memberId || null,
      },
      include: { member: true },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 });
  }
}
