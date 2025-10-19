import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { obterCotacao, converterMoeda, obterTodasCotacoes, MOEDAS_SUPORTADAS } from '@/lib/multi-moeda';
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * GET - Obter cotações ou converter moeda
 * Query params:
 * - acao: 'cotacao' | 'converter' | 'listar'
 * - de: código da moeda origem
 * - para: código da moeda destino
 * - valor: valor a converter (apenas para converter)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 });
    }

    const identifier = getClientIdentifier(request);
    const limit = rateLimit(identifier, RATE_LIMITS.READ);
    if (!limit.success) {
      return NextResponse.json({ erro: 'Muitas requisições' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const acao = searchParams.get('acao') || 'listar';

    if (acao === 'listar') {
      return NextResponse.json({ moedas: MOEDAS_SUPORTADAS });
    }

    const de = searchParams.get('de');
    const para = searchParams.get('para');

    if (!de || !para) {
      return NextResponse.json({ erro: 'Parâmetros de e para são obrigatórios' }, { status: 400 });
    }

    if (acao === 'cotacao') {
      const cacheKey = `cotacao:${de}:${para}`;
      const cotacao = await withCache(cacheKey, () => obterCotacao(de, para), 300000); // 5 min
      return NextResponse.json({ cotacao });
    }

    if (acao === 'converter') {
      const valorStr = searchParams.get('valor');
      if (!valorStr) {
        return NextResponse.json({ erro: 'Parâmetro valor é obrigatório' }, { status: 400 });
      }

      const valor = parseFloat(valorStr);
      const valorConvertido = await converterMoeda(valor, de, para);
      return NextResponse.json({ de, para, valor, valorConvertido });
    }

    if (acao === 'todas') {
      const cacheKey = `cotacoes:${de}`;
      const cotacoes = await withCache(cacheKey, () => obterTodasCotacoes(de), 300000);
      return NextResponse.json({ cotacoes });
    }

    return NextResponse.json({ erro: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API multi-moeda:', error);
    return NextResponse.json({ erro: 'Erro ao processar requisição' }, { status: 500 });
  }
}
