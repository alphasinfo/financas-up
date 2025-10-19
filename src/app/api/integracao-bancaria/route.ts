import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parsearOFX, parsearCSV, conciliarExtratos, importarNaoEncontrados } from '@/lib/integracao-bancaria';
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST - Importar extrato bancário
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
    const { conteudo, formato, contaId, autoImportar } = body;

    if (!conteudo || !formato) {
      return NextResponse.json({ erro: 'Conteúdo e formato são obrigatórios' }, { status: 400 });
    }

    // Parsear extrato
    let extratos;
    if (formato === 'ofx') {
      extratos = parsearOFX(conteudo);
    } else if (formato === 'csv') {
      extratos = parsearCSV(conteudo);
    } else {
      return NextResponse.json({ erro: 'Formato não suportado' }, { status: 400 });
    }

    // Conciliar com transações existentes
    const resultado = await conciliarExtratos(session.user.id, extratos);

    // Auto-importar não encontrados se solicitado
    if (autoImportar && contaId && resultado.naoEncontradas > 0) {
      const naoEncontrados = resultado.transacoes
        .filter(t => t.status === 'nao-encontrada')
        .map(t => t.extrato);
      
      const importados = await importarNaoEncontrados(session.user.id, contaId, naoEncontrados);
      
      return NextResponse.json({
        mensagem: 'Extrato processado e importado',
        resultado,
        importados,
      });
    }

    return NextResponse.json({
      mensagem: 'Extrato processado',
      resultado,
    });
  } catch (error) {
    console.error('Erro ao processar extrato:', error);
    return NextResponse.json({ erro: 'Erro ao processar extrato' }, { status: 500 });
  }
}
