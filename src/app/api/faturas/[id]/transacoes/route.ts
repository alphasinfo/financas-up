import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/faturas/[id]/transacoes
 * Buscar todas as transações de uma fatura
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const faturaId = params.id;

    // Verificar se a fatura pertence ao usuário
    const fatura = await prisma.fatura.findFirst({
      where: {
        id: faturaId,
        cartao: {
          usuarioId: session.user.id,
        },
      },
    });

    if (!fatura) {
      return NextResponse.json({ erro: "Fatura não encontrada" }, { status: 404 });
    }

    // Buscar transações da fatura
    const transacoes = await prisma.transacao.findMany({
      where: {
        faturaId,
        usuarioId: session.user.id,
      },
      orderBy: {
        dataCompetencia: "desc",
      },
      include: {
        categoria: {
          select: {
            nome: true,
            icone: true,
          },
        },
      },
    });

    return NextResponse.json(transacoes);
  } catch (error: any) {
    console.error("Erro ao buscar transações da fatura:", error);
    return NextResponse.json(
      { erro: "Erro ao buscar transações", detalhes: error?.message },
      { status: 500 }
    );
  }
}
