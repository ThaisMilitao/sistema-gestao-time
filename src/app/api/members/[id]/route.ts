import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest, 
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params;

  try {
    const member = await prisma.member.findUnique({
      where: { id }, 
      include: { tasks: { include: { member: true } } },
    });

    if (!member) {
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("GET /api/members/[id] error:", error);
    return NextResponse.json({ error: "Erro ao buscar membro" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params; 

  try {
    const body = await request.json();

    const member = await prisma.member.update({
      where: { id }, 
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.email ? { email: body.email.trim().toLowerCase() } : {}),
        ...(body.role !== undefined ? { role: body.role?.trim() || "Membro do time" } : {}),
      },
    });

    return NextResponse.json(member);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }
    console.error("PATCH /api/members/[id] error:", error);
    return NextResponse.json({ error: "Erro ao atualizar membro" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params; 

  try {
    await prisma.task.updateMany({
      where: { memberId: id }, 
      data: { memberId: null },
    });

    await prisma.member.delete({ 
      where: { id } 
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/members/[id] error:", error);
    return NextResponse.json({ error: "Erro ao remover membro" }, { status: 500 });
  }
}