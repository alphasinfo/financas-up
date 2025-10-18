import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Marcar como rota dinâmica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar todos os dados do usuário
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
      prisma.usuario.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          nome: true,
          email: true,
          criadoEm: true,
        },
      }),
      prisma.contaBancaria.findMany({
        where: { usuarioId: session.user.id },
      }),
      prisma.cartaoCredito.findMany({
        where: { usuarioId: session.user.id },
        include: {
          faturas: true,
        },
      }),
      prisma.transacao.findMany({
        where: { usuarioId: session.user.id },
        include: {
          categoria: true,
        },
      }),
      prisma.categoria.findMany({
        where: { usuarioId: session.user.id },
      }),
      prisma.emprestimo.findMany({
        where: { usuarioId: session.user.id },
        include: {
          parcelas: true,
        },
      }),
      prisma.investimento.findMany({
        where: { usuarioId: session.user.id },
      }),
      prisma.orcamento.findMany({
        where: { usuarioId: session.user.id },
      }),
      prisma.meta.findMany({
        where: { usuarioId: session.user.id },
      }),
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
