import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Buscar faturas vencendo nos próximos 7 dias
    const hoje = new Date();
    const seteDias = new Date();
    seteDias.setDate(seteDias.getDate() + 7);

    const faturas = await prisma.fatura.findMany({
      where: {
        cartao: {
          usuarioId: session.user.id,
        },
        dataVencimento: {
          gte: hoje,
          lte: seteDias,
        },
        status: {
          in: ["ABERTA", "FECHADA"],
        },
      },
      include: {
        cartao: true,
      },
      orderBy: {
        dataVencimento: "asc",
      },
    });

    // Buscar transações vencidas
    const transacoesVencidas = await prisma.transacao.findMany({
      where: {
        usuarioId: session.user.id,
        status: "PENDENTE",
        dataCompetencia: {
          lt: hoje,
        },
      },
      take: 5,
      orderBy: {
        dataCompetencia: "desc",
      },
    });

    // Criar notificações
    const notificacoes = [];

    // Notificações de faturas
    faturas.forEach((fatura) => {
      const diasRestantes = Math.ceil(
        (new Date(fatura.dataVencimento).getTime() - hoje.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      notificacoes.push({
        id: `fatura-${fatura.id}`,
        tipo: "FATURA",
        titulo: `Fatura ${fatura.cartao.nome}`,
        mensagem: `Vence em ${diasRestantes} dia${
          diasRestantes !== 1 ? "s" : ""
        } - R$ ${fatura.valorTotal.toFixed(2)}`,
        lida: false,
        criadoEm: new Date().toISOString(),
        dados: fatura,
      });
    });

    // Notificações de transações vencidas
    if (transacoesVencidas.length > 0) {
      notificacoes.push({
        id: "transacoes-vencidas",
        tipo: "ALERTA",
        titulo: "Transações Vencidas",
        mensagem: `Você tem ${transacoesVencidas.length} transação${
          transacoesVencidas.length !== 1 ? "ões" : ""
        } pendente${transacoesVencidas.length !== 1 ? "s" : ""} vencida${
          transacoesVencidas.length !== 1 ? "s" : ""
        }`,
        lida: false,
        criadoEm: new Date().toISOString(),
        dados: transacoesVencidas,
      });
    }

    return NextResponse.json(notificacoes);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
