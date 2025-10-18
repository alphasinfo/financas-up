import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json(
        { erro: "Você precisa estar logado para aceitar o convite" },
        { status: 401 }
      );
    }

    const convite = await prisma.conviteCompartilhamento.findUnique({
      where: { token: params.token },
    });

    if (!convite) {
      return NextResponse.json(
        { erro: "Convite não encontrado" },
        { status: 404 }
      );
    }

    if (convite.email !== session.user.email) {
      return NextResponse.json(
        { erro: "Este convite não é para você" },
        { status: 403 }
      );
    }

    if (convite.aceito) {
      return NextResponse.json(
        { erro: "Este convite já foi aceito" },
        { status: 400 }
      );
    }

    if (convite.expiraEm < new Date()) {
      return NextResponse.json(
        { erro: "Este convite expirou" },
        { status: 400 }
      );
    }

    // Marcar convite como aceito
    await prisma.conviteCompartilhamento.update({
      where: { id: convite.id },
      data: {
        aceito: true,
        aceitoEm: new Date(),
      },
    });

    // Criar compartilhamento baseado no tipo
    if (convite.tipo === "CONTA" && convite.recursoId) {
      await prisma.compartilhamentoConta.create({
        data: {
          contaId: convite.recursoId,
          usuarioId: session.user.id,
          permissao: convite.permissao,
          criadoPor: convite.criadoPor,
          ativo: true,
        },
      });
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Convite aceito com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao aceitar convite:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao aceitar convite" },
      { status: 500 }
    );
  }
}
