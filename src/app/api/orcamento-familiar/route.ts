import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  criarOrcamentoFamiliar, 
  adicionarMembro, 
  obterRelatorioFamiliar,
  enviarMensagem,
  obterMensagens 
} from '@/lib/compartilhamento-avancado';
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET - Obter orçamento familiar ou mensagens
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
    const acao = searchParams.get('acao') || 'relatorio';

    if (acao === 'mensagens') {
      const outroUserId = searchParams.get('userId');
      if (!outroUserId) {
        return NextResponse.json({ erro: 'userId é obrigatório' }, { status: 400 });
      }

      const mensagens = await obterMensagens(session.user.id, outroUserId);
      return NextResponse.json({ mensagens });
    }

    if (acao === 'relatorio') {
      const orcamentoId = searchParams.get('orcamentoId');
      const membrosIds = searchParams.get('membros')?.split(',') || [session.user.id];

      const relatorio = await obterRelatorioFamiliar(orcamentoId || 'default', membrosIds);
      return NextResponse.json({ relatorio });
    }

    return NextResponse.json({ erro: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de orçamento familiar:', error);
    return NextResponse.json({ erro: 'Erro ao processar requisição' }, { status: 500 });
  }
}

/**
 * POST - Criar orçamento ou enviar mensagem
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

    const body = await request.json();
    const { acao } = body;

    if (acao === 'criar-orcamento') {
      const { nome, orcamentoTotal } = body;
      if (!nome || !orcamentoTotal) {
        return NextResponse.json({ erro: 'Nome e orçamento total são obrigatórios' }, { status: 400 });
      }

      const orcamento = await criarOrcamentoFamiliar(session.user.id, nome, orcamentoTotal);
      return NextResponse.json({ orcamento }, { status: 201 });
    }

    if (acao === 'adicionar-membro') {
      const { orcamentoId, email, papel } = body;
      if (!orcamentoId || !email) {
        return NextResponse.json({ erro: 'Orçamento ID e email são obrigatórios' }, { status: 400 });
      }

      const membro = await adicionarMembro(orcamentoId, email, papel);
      return NextResponse.json({ membro }, { status: 201 });
    }

    if (acao === 'enviar-mensagem') {
      const { destinatarioId, mensagem } = body;
      if (!destinatarioId || !mensagem) {
        return NextResponse.json({ erro: 'Destinatário e mensagem são obrigatórios' }, { status: 400 });
      }

      const novaMensagem = await enviarMensagem(session.user.id, destinatarioId, mensagem);
      return NextResponse.json({ mensagem: novaMensagem }, { status: 201 });
    }

    return NextResponse.json({ erro: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API de orçamento familiar:', error);
    return NextResponse.json({ erro: 'Erro ao processar requisição' }, { status: 500 });
  }
}
