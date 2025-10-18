import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    const session = await getServerSession(authOptions);

    if (!session) {
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

    // Importar transações em uma transação do banco
    const resultado = await prisma.$transaction(async (tx) => {
      const transacoesCriadas = [];

      for (const transacao of transacoes) {
        // Verificar se a conta existe e pertence ao usuário
        const conta = await tx.contaBancaria.findFirst({
          where: {
            id: transacao.contaBancariaId,
            usuarioId: session.user.id,
          },
        });

        if (!conta) {
          throw new Error(`Conta bancária não encontrada: ${transacao.contaBancariaId}`);
        }

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

        transacoesCriadas.push(novaTransacao);
      }

      return transacoesCriadas;
    });

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
