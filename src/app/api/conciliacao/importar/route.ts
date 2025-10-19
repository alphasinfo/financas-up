import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-retry";
import { arredondarValor } from "@/lib/formatters";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const transacaoImportSchema = z.object({
  descricao: z.string(),
  valor: z.number(),
  tipo: z.enum(["RECEITA", "DESPESA"]),
  dataCompetencia: z.coerce.date(),
  contaBancariaId: z.string(),
  categoriaId: z.string().optional(),
});

const importarSchema = z.object({
  transacoes: z.array(transacaoImportSchema),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validacao = importarSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: validacao.error.errors[0].message },
        { status: 400 }
      );
    }

    const { transacoes } = validacao.data;

    // Verificar contas ANTES da transação para reduzir tempo de lock
    const contasIds = [...new Set(transacoes.map(t => t.contaBancariaId))];
    const contas = await withRetry(() =>
      prisma.contaBancaria.findMany({
        where: {
          id: { in: contasIds },
          usuarioId: session.user.id,
        },
      })
    );

    // Validar que todas as contas existem
    for (const contaId of contasIds) {
      if (!contas.find(c => c.id === contaId)) {
        return NextResponse.json(
          { erro: `Conta bancária não encontrada: ${contaId}` },
          { status: 400 }
        );
      }
    }

    // Importar transações com retry e timeout aumentado
    const resultado = await withRetry(() =>
      prisma.$transaction(
        async (tx) => {
          const transacoesCriadas = [];

          for (const transacao of transacoes) {
            const conta = contas.find(c => c.id === transacao.contaBancariaId)!;

            // Arredondar valor para evitar problemas de precisão
            const valorArredondado = arredondarValor(transacao.valor);

            // Criar transação
            const novaTransacao = await tx.transacao.create({
              data: {
                descricao: transacao.descricao,
                valor: valorArredondado,
                tipo: transacao.tipo,
                dataCompetencia: transacao.dataCompetencia,
                dataLiquidacao: transacao.dataCompetencia,
                status: transacao.tipo === "RECEITA" ? "RECEBIDO" : "PAGO",
                contaBancariaId: transacao.contaBancariaId,
                categoriaId: transacao.categoriaId,
                usuarioId: session.user.id,
              },
            });

            // Atualizar saldo da conta com arredondamento
            const novoSaldo = arredondarValor(
              transacao.tipo === "RECEITA"
                ? conta.saldoAtual + valorArredondado
                : conta.saldoAtual - valorArredondado
            );

            const novoSaldoDisponivel = arredondarValor(
              transacao.tipo === "RECEITA"
                ? conta.saldoDisponivel + valorArredondado
                : conta.saldoDisponivel - valorArredondado
            );

            await tx.contaBancaria.update({
              where: { id: transacao.contaBancariaId },
              data: { 
                saldoAtual: novoSaldo,
                saldoDisponivel: novoSaldoDisponivel,
              },
            });

            // Atualizar saldo local para próximas iterações
            conta.saldoAtual = novoSaldo;
            conta.saldoDisponivel = novoSaldoDisponivel;

            transacoesCriadas.push(novaTransacao);
          }

          return transacoesCriadas;
        },
        {
          maxWait: 10000, // Máximo 10s esperando para iniciar (dobrado)
          timeout: 30000, // Máximo 30s para executar (triplicado)
        }
      )
    );

    // Revalidar páginas que usam transações
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/financeiro');
    revalidatePath('/dashboard/calendario');

    return NextResponse.json({
      sucesso: true,
      quantidade: resultado.length,
      mensagem: `${resultado.length} transações importadas com sucesso`,
    });
  } catch (error: any) {
    console.error("Erro ao importar transações:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao importar transações" },
      { status: 500 }
    );
  }
}
