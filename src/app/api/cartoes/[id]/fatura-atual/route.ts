import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularFaturaCartao } from "@/lib/formatters";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const cartaoId = params.id;

    // Verificar se o cartão pertence ao usuário
    const cartao = await prisma.cartaoCredito.findFirst({
      where: {
        id: cartaoId,
        usuarioId: session.user.id,
      },
    });

    if (!cartao) {
      return NextResponse.json({ erro: "Cartão não encontrado" }, { status: 404 });
    }

    // Prioridade: tentar fatura do ciclo correto baseado na data atual e diaFechamento
    const hoje = new Date();
    const { mes, ano } = calcularFaturaCartao(hoje, cartao.diaFechamento);

    // 1) Tentar fatura do período calculado
    let fatura = await prisma.fatura.findUnique({
      where: {
        cartaoId_mesReferencia_anoReferencia: {
          cartaoId,
          mesReferencia: mes,
          anoReferencia: ano,
        },
      },
    });

    // 2) Se não existir, pegar a fatura aberta/parcial mais recente
    if (!fatura) {
      fatura = await prisma.fatura.findFirst({
        where: {
          cartaoId,
          status: {
            in: ["ABERTA", "PARCIAL"],
          },
        },
        orderBy: [
          { anoReferencia: "desc" },
          { mesReferencia: "desc" },
        ],
      });
    }

    // 3) Se ainda não existir, pegar a fatura mais recente (qualquer status)
    if (!fatura) {
      fatura = await prisma.fatura.findFirst({
        where: { cartaoId },
        orderBy: [
          { anoReferencia: "desc" },
          { mesReferencia: "desc" },
        ],
      });
    }

    if (!fatura) {
      return NextResponse.json({ erro: "Nenhuma fatura encontrada para este cartão" }, { status: 404 });
    }

    return NextResponse.json(fatura);
  } catch (_error) {
    console.error("Erro ao buscar fatura atual:", _error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
