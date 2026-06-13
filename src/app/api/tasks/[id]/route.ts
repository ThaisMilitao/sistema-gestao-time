import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UpdateTaskInput } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params; 
  try {
    const task = await prisma.task.findUnique({
      where: { id }, 
      include: { member: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Erro ao buscar tarefa" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params; 
  try {
    const body: UpdateTaskInput = await request.json();

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    let completedAt = body.completedAt !== undefined ? body.completedAt : undefined;
    if (body.status === "DONE" && existing.status !== "DONE" && completedAt === undefined) {
      completedAt = new Date().toISOString();
    }
    if (body.status && body.status !== "DONE" && existing.status === "DONE") {
      completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.priority !== undefined ? { priority: body.priority } : {}),
        ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
        ...(body.memberId !== undefined ? { memberId: body.memberId || null } : {}),
        ...(completedAt !== undefined ? { completedAt: completedAt ? new Date(completedAt) : null } : {}),
      },
      include: { member: true },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params; 

  try {
    await prisma.task.delete({ where: { id } }); 
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Erro ao deletar tarefa" }, { status: 500 });
  }
}