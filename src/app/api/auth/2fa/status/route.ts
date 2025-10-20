import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export const dynamic = 'force-dynamic';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { countBackupCodes } from '@/lib/two-factor';

/**
 * GET /api/auth/2fa/status
 * 
 * Obter status do 2FA do usuário
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: true,
      },
    });
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    const backupCodesCount = usuario.twoFactorBackupCodes
      ? countBackupCodes(usuario.twoFactorBackupCodes)
      : 0;
    
    return NextResponse.json({
      enabled: usuario.twoFactorEnabled,
      backupCodesCount,
    });
    
  } catch (error) {
    console.error('Erro ao obter status 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao obter status' },
      { status: 500 }
    );
  }
}
