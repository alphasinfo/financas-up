import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const adicionarValorSchema = z.object({
  valor: z.number().positive("Valor deve ser positivo"),
  contaId: z.string().min(1, "Conta é obrigatória"),
  descricao: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validacao = adicionarValorSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { valor, contaId, descricao } = validacao.data;

    // Buscar meta
    const meta = await prisma.meta.findUnique({
      where: { id: params.id },
    });

    if (!meta) {
      return NextResponse.json({ erro: "Meta não encontrada" }, { status: 404 });
    }

    if (meta.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    if (meta.status !== "EM_ANDAMENTO") {
      return NextResponse.json(
        { erro: "Meta não está em andamento" },
        { status: 400 }
      );
    }

    // Buscar conta
    const conta = await prisma.contaBancaria.findUnique({
      where: { id: contaId },
    });

    if (!conta) {
      return NextResponse.json({ erro: "Conta não encontrada" }, { status: 404 });
    }

    if (conta.usuarioId !== session.user.id) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
    }

    if (!conta.ativa) {
      return NextResponse.json(
        { erro: "Conta não está ativa" },
        { status: 400 }
      );
    }

    // Verificar saldo suficiente
    if (conta.saldoAtual < valor) {
      return NextResponse.json(
        { erro: "Saldo insuficiente na conta" },
        { status: 400 }
      );
    }

    // Verificar se não vai ultrapassar o valor alvo
    const novoValorAtual = meta.valorAtual + valor;
    if (novoValorAtual > meta.valorAlvo) {
      return NextResponse.json(
        { erro: `Valor ultrapassa o alvo da meta. Máximo permitido: R$ ${(meta.valorAlvo - meta.valorAtual).toFixed(2)}` },
        { status: 400 }
      );
    }

    // Realizar transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar saldo da conta (deduzir)
      const contaAtualizada = await tx.contaBancaria.update({
        where: { id: contaId },
        data: {
          saldoAtual: {
            decrement: valor,
          },
          saldoDisponivel: {
            decrement: valor,
          },
        },
      });

      // Atualizar valor atual da meta (adicionar)
      const metaAtualizada = await tx.meta.update({
        where: { id: params.id },
        data: {
          valorAtual: {
            increment: valor,
          },
        },
      });

      // Verificar se a meta foi concluída
      if (metaAtualizada.valorAtual >= metaAtualizada.valorAlvo) {
        await tx.meta.update({
          where: { id: params.id },
          data: {
            status: "CONCLUIDA",
          },
        });
      }

      // Criar transação de registro (para histórico)
      const transacao = await tx.transacao.create({
        data: {
          tipo: "DESPESA",
          descricao: descricao || `Transferência para meta: ${meta.titulo}`,
          valor: valor,
          dataCompetencia: new Date(),
          status: "PAGO",
          usuarioId: session.user.id,
          contaBancariaId: contaId,
          categoriaId: null, // Pode criar uma categoria especial "Transferência para Meta"
        },
      });

      return {
        conta: contaAtualizada,
        meta: metaAtualizada,
        transacao,
      };
    });

    console.log('✅ Valor adicionado à meta:', {
      metaId: params.id,
      valor,
      contaId,
      novoValorMeta: resultado.meta.valorAtual,
      novoSaldoConta: resultado.conta.saldoAtual,
    });

    return NextResponse.json({
      mensagem: "Valor adicionado à meta com sucesso",
      meta: resultado.meta,
      conta: resultado.conta,
      transacao: resultado.transacao,
    });
  } catch (error: any) {
    console.error("Erro ao adicionar valor à meta:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor", detalhes: error?.message },
      { status: 500 }
    );
  }
}
