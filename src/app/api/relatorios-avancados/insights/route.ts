import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, subMonths } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar transações dos últimos 3 meses
    const inicio = startOfMonth(subMonths(new Date(), 3));
    
    const transacoes = await prisma.transacao.findMany({
      where: {
        usuarioId: session.user.id,
        dataCompetencia: {
          gte: inicio,
        },
      },
      include: {
        categoria: true,
      },
    });

    // Análise de gastos por categoria
    const gastosPorCategoria: Record<string, number> = {};
    transacoes
      .filter(t => t.tipo === 'DESPESA')
      .forEach(t => {
        const categoria = t.categoria?.nome || 'Sem categoria';
        gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + t.valor;
      });

    // Encontrar categoria com maior gasto
    const categoriaComMaiorGasto = Object.entries(gastosPorCategoria)
      .sort(([, a], [, b]) => b - a)[0];

    // Calcular média mensal
    const totalDespesas = transacoes
      .filter(t => t.tipo === 'DESPESA')
      .reduce((acc, t) => acc + t.valor, 0);
    const mediaMensal = totalDespesas / 3;

    // Insights
    const insights = [
      {
        tipo: 'categoria_maior_gasto',
        titulo: 'Maior Gasto',
        descricao: `Você gastou mais em ${categoriaComMaiorGasto?.[0] || 'N/A'}`,
        valor: categoriaComMaiorGasto?.[1] || 0,
        icone: 'TrendingUp',
      },
      {
        tipo: 'media_mensal',
        titulo: 'Média Mensal',
        descricao: 'Sua média de gastos mensais',
        valor: mediaMensal,
        icone: 'DollarSign',
      },
      {
        tipo: 'total_transacoes',
        titulo: 'Total de Transações',
        descricao: 'Transações nos últimos 3 meses',
        valor: transacoes.length,
        icone: 'Activity',
      },
    ];

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Erro ao buscar insights:', error);
    return NextResponse.json({ error: 'Erro ao buscar insights' }, { status: 500 });
  }
}
