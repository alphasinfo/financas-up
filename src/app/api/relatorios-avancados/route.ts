import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  compararMesesAMes,
  gerarPrevisoes,
  gerarInsights,
  gerarGraficoPatrimonial,
} from '@/lib/relatorios-avancados';
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * GET - Obter relatórios avançados
 * Query params:
 * - tipo: 'comparacao' | 'previsoes' | 'insights' | 'patrimonial'
 * - meses: número de meses (opcional)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 });
    }

    // Rate limiting
    const identifier = getClientIdentifier(request);
    const limit = rateLimit(identifier, RATE_LIMITS.READ);
    if (!limit.success) {
      return NextResponse.json(
        { erro: 'Muitas requisições' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'comparacao';
    const meses = parseInt(searchParams.get('meses') || '6');

    // Cache de 5 minutos para relatórios
    const cacheKey = `relatorios:${session.user.id}:${tipo}:${meses}`;

    let dados;

    switch (tipo) {
      case 'comparacao':
        dados = await withCache(
          cacheKey,
          () => compararMesesAMes(session.user.id, meses),
          300000 // 5 minutos
        );
        break;

      case 'previsoes':
        dados = await withCache(
          cacheKey,
          () => gerarPrevisoes(session.user.id, meses),
          300000
        );
        break;

      case 'insights':
        dados = await withCache(
          cacheKey,
          () => gerarInsights(session.user.id),
          300000
        );
        break;

      case 'patrimonial':
        dados = await withCache(
          cacheKey,
          () => gerarGraficoPatrimonial(session.user.id, meses),
          300000
        );
        break;

      default:
        return NextResponse.json(
          { erro: 'Tipo de relatório inválido' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      tipo,
      dados,
      geradoEm: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao gerar relatório avançado:', error);
    return NextResponse.json(
      { erro: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
