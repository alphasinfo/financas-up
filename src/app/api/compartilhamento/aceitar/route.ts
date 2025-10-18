import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ erro: "Token é obrigatório" }, { status: 400 });
    }

    // Buscar convite
    const convite = await prisma.conviteCompartilhamento.findUnique({
      where: { token },
      include: {
        criador: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!convite) {
      return NextResponse.json({ erro: "Convite não encontrado" }, { status: 404 });
    }

    // Verificar se o convite é para o usuário logado
    if (convite.email !== session.user.email) {
      return NextResponse.json(
        { erro: "Este convite não é para você" },
        { status: 403 }
      );
    }

    // Verificar se já foi aceito
    if (convite.aceito) {
      return NextResponse.json(
        { erro: "Este convite já foi aceito" },
        { status: 400 }
      );
    }

    // Verificar se expirou
    if (new Date() > convite.expiraEm) {
      return NextResponse.json({ erro: "Este convite expirou" }, { status: 400 });
    }

    // Aceitar convite
    await prisma.$transaction(async (tx) => {
      // Marcar convite como aceito
      await tx.conviteCompartilhamento.update({
        where: { id: convite.id },
        data: {
          aceito: true,
          aceitoEm: new Date(),
        },
      });

      // Criar compartilhamento baseado no tipo
      if (convite.tipo === "CONTA" && convite.recursoId) {
        await tx.compartilhamentoConta.create({
          data: {
            contaId: convite.recursoId,
            usuarioId: session.user.id,
            permissao: convite.permissao,
            criadoPor: convite.criadoPor,
          },
        });
      }

      // TODO: Implementar para CARTAO e SISTEMA
    });

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
