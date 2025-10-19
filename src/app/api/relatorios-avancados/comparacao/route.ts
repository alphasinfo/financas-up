import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('[Comparação] Sessão inválida');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    console.log('[Comparação] Buscando dados para usuário:', session.user.id);

    const { searchParams } = new URL(request.url);
    const meses = parseInt(searchParams.get('meses') || '6');

    const comparacoes = [];
    const hoje = new Date();

    for (let i = 0; i < meses; i++) {
      const mesAtual = subMonths(hoje, i);
      const inicio = startOfMonth(mesAtual);
      const fim = endOfMonth(mesAtual);

      const transacoes = await prisma.transacao.findMany({
        where: {
          usuarioId: session.user.id,
          dataCompetencia: {
            gte: inicio,
            lte: fim,
          },
        },
      });

      const receitas = transacoes
        .filter(t => t.tipo === 'RECEITA')
        .reduce((acc, t) => acc + t.valor, 0);

      const despesas = transacoes
        .filter(t => t.tipo === 'DESPESA')
        .reduce((acc, t) => acc + t.valor, 0);

      comparacoes.push({
        mes: mesAtual.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        receitas,
        despesas,
        saldo: receitas - despesas,
      });
    }

    return NextResponse.json(comparacoes.reverse());
  } catch (error: any) {
    console.error('[Comparação] Erro completo:', error);
    console.error('[Comparação] Stack:', error?.stack);
    return NextResponse.json({ 
      error: 'Erro ao buscar comparações',
      details: error?.message || 'Erro desconhecido'
    }, { status: 500 });
  }
}
