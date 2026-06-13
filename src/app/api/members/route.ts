import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { name: "asc" },
      include: {
        tasks: true,
      },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error("GET /api/members error:", error);
    return NextResponse.json({ error: "Erro ao buscar membros" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const member = await prisma.member.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        role: body.role?.trim() || "Membro do time",
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }
    console.error("POST /api/members error:", error);
    return NextResponse.json({ error: "Erro ao criar membro" }, { status: 500 });
  }
}
