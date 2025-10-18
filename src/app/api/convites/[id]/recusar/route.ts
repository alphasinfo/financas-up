import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const convite = await prisma.conviteCompartilhamento.findUnique({
      where: { id: params.id },
    });

    if (!convite) {
      return NextResponse.json({ erro: "Convite não encontrado" }, { status: 404 });
    }

    if (convite.email !== session.user.email) {
      return NextResponse.json({ erro: "Este convite não é para você" }, { status: 403 });
    }

    // Deletar o convite
    await prisma.conviteCompartilhamento.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ 
      sucesso: true,
      mensagem: "Convite recusado" 
    });
  } catch (error: any) {
    console.error("Erro ao recusar convite:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao recusar convite" },
      { status: 500 }
    );
  }
}
