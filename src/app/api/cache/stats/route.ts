import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cacheManager } from '@/lib/cache-manager';

/**
 * GET /api/cache/stats
 * 
 * Retorna estatísticas do cache
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
    
    const stats = cacheManager.getStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Erro ao obter estatísticas do cache:', error);
    return NextResponse.json(
      { error: 'Erro ao obter estatísticas' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cache/stats
 * 
 * Limpa o cache
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    cacheManager.clear();
    
    return NextResponse.json({
      success: true,
      message: 'Cache limpo com sucesso',
    });
    
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar cache' },
      { status: 500 }
    );
  }
}
