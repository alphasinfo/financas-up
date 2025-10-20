import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export const dynamic = 'force-dynamic';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyToken, formatTokenInput, isValidTokenFormat } from '@/lib/two-factor';

/**
 * POST /api/auth/2fa/verify
 * 
 * Verificar token 2FA e ativar
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }
    
    // Formatar token
    const formattedToken = formatTokenInput(token);
    
    // Validar formato
    if (!isValidTokenFormat(formattedToken)) {
      return NextResponse.json(
        { error: 'Token inválido. Deve conter 6 dígitos.' },
        { status: 400 }
      );
    }
    
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    if (!usuario.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA não foi configurado. Execute /api/auth/2fa/setup primeiro.' },
        { status: 400 }
      );
    }
    
    // Verificar token
    const isValid = verifyToken(formattedToken, usuario.twoFactorSecret);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }
    
    // Ativar 2FA
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        twoFactorEnabled: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: '2FA ativado com sucesso!',
    });
    
  } catch (error) {
    console.error('Erro ao verificar 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar 2FA' },
      { status: 500 }
    );
  }
}
