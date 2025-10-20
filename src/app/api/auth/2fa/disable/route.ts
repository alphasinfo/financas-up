import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export const dynamic = 'force-dynamic';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

/**
 * POST /api/auth/2fa/disable
 * 
 * Desativar 2FA (requer senha)
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
    
    const { senha } = await request.json();
    
    if (!senha) {
      return NextResponse.json(
        { error: 'Senha é obrigatória para desativar 2FA' },
        { status: 400 }
      );
    }
    
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        senha: true,
        twoFactorEnabled: true,
      },
    });
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    if (!usuario.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA não está ativado' },
        { status: 400 }
      );
    }
    
    // Verificar senha
    if (!usuario.senha) {
      return NextResponse.json(
        { error: 'Usuário sem senha (login OAuth)' },
        { status: 400 }
      );
    }
    
    const senhaValida = await compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }
    
    // Desativar 2FA
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: '2FA desativado com sucesso',
    });
    
  } catch (error) {
    console.error('Erro ao desativar 2FA:', error);
    return NextResponse.json(
      { error: 'Erro ao desativar 2FA' },
      { status: 500 }
    );
  }
}
