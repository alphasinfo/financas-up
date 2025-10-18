import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const pagamentoSchema = z.object({
  valorPago: z.number().positive("Valor deve ser maior que zero"),
  contaBancariaId: z.string().optional().nullable(),
  dataPagamento: z.string().transform((val) => new Date(val)),
  observacoes: z.string().optional().nullable(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validacao = pagamentoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const dados = validacao.data;
    const faturaId = params.id;

    // Buscar fatura
    const fatura = await prisma.fatura.findFirst({
      where: {
        id: faturaId,
        cartao: {
          usuarioId: session.user.id,
        },
      },
      include: {
        cartao: true,
      },
    });

    if (!fatura) {
      return NextResponse.json({ erro: "Fatura não encontrada" }, { status: 404 });
    }

    // Verificar se o valor pago não excede o valor da fatura
    const valorRestante = fatura.valorTotal - fatura.valorPago;
    
    if (dados.valorPago > valorRestante) {
      return NextResponse.json(
        { 
          erro: "Valor pago não pode ser maior que o valor restante da fatura",
          valorRestante 
        },
        { status: 400 }
      );
    }

    // Atualizar fatura
    const novoValorPago = fatura.valorPago + dados.valorPago;
    const novoStatus = novoValorPago >= fatura.valorTotal ? "PAGA" : "PARCIAL";

    const faturaAtualizada = await prisma.fatura.update({
      where: { id: faturaId },
      data: {
        valorPago: novoValorPago,
        status: novoStatus,
      },
    });

    // Liberar limite do cartão proporcionalmente ao valor pago
    await prisma.cartaoCredito.update({
      where: { id: fatura.cartaoId },
      data: {
        limiteDisponivel: {
          increment: dados.valorPago,
        },
      },
    });

    // Se foi informada uma conta bancária, criar transação de débito
    if (dados.contaBancariaId) {
      const conta = await prisma.contaBancaria.findFirst({
        where: {
          id: dados.contaBancariaId,
          usuarioId: session.user.id,
        },
      });

      if (conta) {
        // Criar transação de pagamento
        await prisma.transacao.create({
          data: {
            tipo: "DESPESA",
            descricao: `Pagamento fatura ${fatura.cartao.nome} - ${fatura.mesReferencia + 1}/${fatura.anoReferencia}`,
            valor: dados.valorPago,
            dataCompetencia: dados.dataPagamento,
            status: "PAGO",
            contaBancariaId: dados.contaBancariaId,
            observacoes: dados.observacoes,
            usuarioId: session.user.id,
          },
        });

        // Atualizar saldo da conta
        await prisma.contaBancaria.update({
          where: { id: dados.contaBancariaId },
          data: {
            saldoAtual: {
              decrement: dados.valorPago,
            },
            saldoDisponivel: {
              decrement: dados.valorPago,
            },
          },
        });
      }
    }

    return NextResponse.json({
      mensagem: novoStatus === "PAGA" 
        ? "Fatura paga completamente!" 
        : "Pagamento parcial registrado com sucesso",
      fatura: faturaAtualizada,
      valorPago: dados.valorPago,
      valorRestante: fatura.valorTotal - novoValorPago,
      limiteDisponivel: fatura.cartao.limiteDisponivel + dados.valorPago,
    });
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
