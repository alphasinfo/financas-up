import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, subMonths, addMonths } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const meses = parseInt(searchParams.get('meses') || '3');

    // Buscar transações dos últimos 6 meses para calcular média
    const inicio = startOfMonth(subMonths(new Date(), 6));
    
    const transacoes = await prisma.transacao.findMany({
      where: {
        usuarioId: session.user.id,
        dataCompetencia: {
          gte: inicio,
        },
      },
    });

    // Calcular médias
    const totalReceitas = transacoes
      .filter(t => t.tipo === 'RECEITA')
      .reduce((acc, t) => acc + t.valor, 0);
    const totalDespesas = transacoes
      .filter(t => t.tipo === 'DESPESA')
      .reduce((acc, t) => acc + t.valor, 0);

    const mediaReceitas = totalReceitas / 6;
    const mediaDespesas = totalDespesas / 6;

    // Gerar previsões
    const previsoes = [];
    const hoje = new Date();

    for (let i = 1; i <= meses; i++) {
      const mesPrevisao = addMonths(hoje, i);
      
      // Adicionar variação aleatória de -5% a +5%
      const variacaoReceitas = 1 + (Math.random() * 0.1 - 0.05);
      const variacaoDespesas = 1 + (Math.random() * 0.1 - 0.05);

      previsoes.push({
        mes: mesPrevisao.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        receitasPrevistas: mediaReceitas * variacaoReceitas,
        despesasPrevistas: mediaDespesas * variacaoDespesas,
        saldoPrevisto: (mediaReceitas * variacaoReceitas) - (mediaDespesas * variacaoDespesas),
      });
    }

    return NextResponse.json(previsoes);
  } catch (error) {
    console.error('Erro ao buscar previsões:', error);
    return NextResponse.json({ error: 'Erro ao buscar previsões' }, { status: 500 });
  }
}
