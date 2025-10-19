import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-retry";

// Marcar como rota dinâmica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar todos os dados do usuário com retry
    const [
      usuario,
      contas,
      cartoes,
      transacoes,
      categorias,
      emprestimos,
      investimentos,
      orcamentos,
      metas,
    ] = await Promise.all([
      withRetry(() =>
        prisma.usuario.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            nome: true,
            email: true,
            criadoEm: true,
          },
        })
      ),
      withRetry(() =>
        prisma.contaBancaria.findMany({
          where: { usuarioId: session.user.id },
        })
      ),
      withRetry(() =>
        prisma.cartaoCredito.findMany({
          where: { usuarioId: session.user.id },
          include: {
            faturas: true,
          },
        })
      ),
      withRetry(() =>
        prisma.transacao.findMany({
          where: { usuarioId: session.user.id },
          take: 5000, // Limite para evitar timeout
          orderBy: { dataCompetencia: 'desc' },
          select: {
            id: true,
            descricao: true,
            valor: true,
            tipo: true,
            status: true,
            dataCompetencia: true,
            dataLiquidacao: true,
            parcelado: true,
            parcelaAtual: true,
            parcelaTotal: true,
            categoria: {
              select: {
                nome: true,
                tipo: true,
                cor: true,
              },
            },
          },
        })
      ),
      withRetry(() =>
        prisma.categoria.findMany({
          where: { usuarioId: session.user.id },
        })
      ),
      withRetry(() =>
        prisma.emprestimo.findMany({
          where: { usuarioId: session.user.id },
          include: {
            parcelas: true,
          },
        })
      ),
      withRetry(() =>
        prisma.investimento.findMany({
          where: { usuarioId: session.user.id },
        })
      ),
      withRetry(() =>
        prisma.orcamento.findMany({
          where: { usuarioId: session.user.id },
        })
      ),
      withRetry(() =>
        prisma.meta.findMany({
          where: { usuarioId: session.user.id },
        })
      ),
    ]);

    // Montar objeto com todos os dados
    const dadosCompletos = {
      versao: "1.0.0",
      dataExportacao: new Date().toISOString(),
      usuario,
      dados: {
        contas,
        cartoes,
        transacoes,
        categorias,
        emprestimos,
        investimentos,
        orcamentos,
        metas,
      },
      estatisticas: {
        totalContas: contas.length,
        totalCartoes: cartoes.length,
        totalTransacoes: transacoes.length,
        totalCategorias: categorias.length,
        totalEmprestimos: emprestimos.length,
        totalInvestimentos: investimentos.length,
        totalOrcamentos: orcamentos.length,
        totalMetas: metas.length,
      },
    };

    return NextResponse.json(dadosCompletos);
  } catch (error) {
    console.error("Erro ao exportar dados:", error);
    return NextResponse.json(
      { error: "Erro ao exportar dados" },
      { status: 500 }
    );
  }
}
