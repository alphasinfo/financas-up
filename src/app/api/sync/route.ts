import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sincronizarDados, obterDadosPendentes } from '@/lib/modo-offline';
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET - Obter dados pendentes de sincronização
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

    const dadosPendentes = await obterDadosPendentes();
    return NextResponse.json({ pendentes: dadosPendentes.length, dados: dadosPendentes });
  } catch (error) {
    console.error('Erro ao obter dados pendentes:', error);
    return NextResponse.json({ erro: 'Erro ao obter dados pendentes' }, { status: 500 });
  }
}

/**
 * POST - Sincronizar dados offline
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 });
    }

    const identifier = getClientIdentifier(request);
    const limit = rateLimit(identifier, RATE_LIMITS.WRITE);
    if (!limit.success) {
      return NextResponse.json({ erro: 'Muitas requisições' }, { status: 429 });
    }

    const resultado = await sincronizarDados();

    return NextResponse.json({
      mensagem: 'Sincronização concluída',
      sucesso: resultado.sucesso,
      falhas: resultado.falhas,
    });
  } catch (error) {
    console.error('Erro ao sincronizar dados:', error);
    return NextResponse.json({ erro: 'Erro ao sincronizar dados' }, { status: 500 });
  }
}
