import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export const dynamic = 'force-dynamic';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateSecret,
  generateQRCode,
  generateBackupCodes,
  hashBackupCodes,
} from '@/lib/two-factor';

/**
 * POST /api/auth/2fa/setup
 * 
 * Iniciar configuração de 2FA
 * Gera secret e QR code
 */
export async function POST() {
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
        id: true,
        email: true,
        twoFactorEnabled: true,
      },
    });
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se 2FA já está ativado
    if (usuario.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA já está ativado' },
        { status: 400 }
      );
    }
    
    // Gerar secret
    const secret = generateSecret();
    
    // Gerar QR code
    const qrCode = await generateQRCode(usuario.email, secret);
    
    // Gerar códigos de backup
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = hashBackupCodes(backupCodes);
    
    // Salvar secret temporário (não ativar ainda)
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        twoFactorSecret: secret,
        twoFactorBackupCodes: hashedBackupCodes,
        twoFactorEnabled: false, // Só ativar após verificação
      },
    });
    
    return NextResponse.json({
      success: true,
      secret,
      qrCode,
      backupCodes,
    });
    
  } catch (error) {
    console.error('Erro ao configurar 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao configurar 2FA' },
      { status: 500 }
    );
  }
}
