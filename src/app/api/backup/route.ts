import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createBackup, saveBackupToSupabase, listBackups } from '@/lib/backup';
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET - Listar backups disponíveis
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

    const backups = await listBackups(session.user.id);

    return NextResponse.json({ backups });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    return NextResponse.json(
      { erro: 'Erro ao listar backups' },
      { status: 500 }
    );
  }
}

/**
 * POST - Criar novo backup
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 });
    }

    // Rate limiting (mais restritivo para criação)
    const identifier = getClientIdentifier(request);
    const limit = rateLimit(identifier, { interval: 60000, maxRequests: 5 }); // 5 por minuto
    if (!limit.success) {
      return NextResponse.json(
        { erro: 'Muitas requisições. Aguarde antes de criar outro backup.' },
        { status: 429 }
      );
    }

    // Criar backup
    const backup = await createBackup(session.user.id);

    // Salvar no Supabase
    const filename = await saveBackupToSupabase(session.user.id, backup);

    return NextResponse.json({
      mensagem: 'Backup criado com sucesso',
      backup: {
        filename,
        timestamp: backup.timestamp,
        metadata: backup.metadata,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return NextResponse.json(
      { erro: 'Erro ao criar backup' },
      { status: 500 }
    );
  }
}
