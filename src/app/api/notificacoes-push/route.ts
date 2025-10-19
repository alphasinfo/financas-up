import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verificarContasVencer, gerarResumoDiario, agendarNotificacoes } from '@/lib/notificacoes-push';
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET - Obter notificações pendentes
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
    const tipo = searchParams.get('tipo') || 'contas-vencer';

    let notificacoes;
    if (tipo === 'contas-vencer') {
      notificacoes = await verificarContasVencer(session.user.id);
    } else if (tipo === 'resumo-diario') {
      const resumo = await gerarResumoDiario(session.user.id);
      notificacoes = resumo ? [resumo] : [];
    }

    return NextResponse.json({ notificacoes });
  } catch (error) {
    console.error('Erro ao obter notificações:', error);
    return NextResponse.json({ erro: 'Erro ao obter notificações' }, { status: 500 });
  }
}

/**
 * POST - Agendar notificações
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

    await agendarNotificacoes(session.user.id);

    return NextResponse.json({ mensagem: 'Notificações agendadas com sucesso' });
  } catch (error) {
    console.error('Erro ao agendar notificações:', error);
    return NextResponse.json({ erro: 'Erro ao agendar notificações' }, { status: 500 });
  }
}
