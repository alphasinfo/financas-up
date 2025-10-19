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

    console.log(`[Conciliação] Iniciando importação de ${transacoes.length} transações`);

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

    console.log(`[Conciliação] Encontradas ${contas.length} contas`);

    // Validar que todas as contas existem
    for (const contaId of contasIds) {
      if (!contas.find(c => c.id === contaId)) {
        return NextResponse.json(
          { erro: `Conta bancária não encontrada: ${contaId}` },
          { status: 400 }
        );
      }
    }

    // Processar em lotes de 50 transações para evitar timeout
    const TAMANHO_LOTE = 50;
    const totalLotes = Math.ceil(transacoes.length / TAMANHO_LOTE);
    const todasTransacoesCriadas = [];

    console.log(`[Conciliação] Processando em ${totalLotes} lotes de até ${TAMANHO_LOTE} transações`);

    for (let i = 0; i < totalLotes; i++) {
      const inicio = i * TAMANHO_LOTE;
      const fim = Math.min((i + 1) * TAMANHO_LOTE, transacoes.length);
      const lote = transacoes.slice(inicio, fim);

      console.log(`[Conciliação] Processando lote ${i + 1}/${totalLotes} (${lote.length} transações)`);

      // Importar lote com retry e timeout aumentado
      const resultadoLote = await withRetry(() =>
        prisma.$transaction(
          async (tx) => {
            const transacoesCriadas = [];

            for (const transacao of lote) {
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
            maxWait: 30000, // Máximo 30s esperando para iniciar
            timeout: 120000, // Máximo 2 minutos para executar cada lote
          }
        )
      );

      todasTransacoesCriadas.push(...resultadoLote);
      console.log(`[Conciliação] Lote ${i + 1}/${totalLotes} concluído (${resultadoLote.length} transações)`);
    }

    const resultado = todasTransacoesCriadas;

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
