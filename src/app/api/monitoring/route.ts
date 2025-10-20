/**
 * API de Monitoramento
 * 
 * Endpoint para obter métricas do sistema
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MonitoringService from '@/lib/monitoring';
import { simpleCache, dbCache, sessionCache, apiCache } from '@/lib/simple-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação (apenas admins podem ver métricas)
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // TODO: Verificar se usuário é admin
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Acesso negado' },
    //     { status: 403 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let data: any = {};

    switch (type) {
      case 'health':
        data = MonitoringService.getHealthCheck();
        break;
        
      case 'performance':
        const operation = searchParams.get('operation');
        data = MonitoringService.getPerformanceStats(operation || undefined);
        break;
        
      case 'errors':
        data = MonitoringService.getErrorStats();
        break;
        
      case 'cache':
        data = {
          main: simpleCache.getStats(),
          database: dbCache.getStats(),
          session: sessionCache.getStats(),
          api: apiCache.getStats(),
        };
        break;
        
      case 'system':
        data = {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid,
        };
        break;
        
      case 'all':
      default:
        data = {
          health: MonitoringService.getHealthCheck(),
          performance: MonitoringService.getPerformanceStats(),
          errors: MonitoringService.getErrorStats(),
          cache: {
            main: simpleCache.getStats(),
            database: dbCache.getStats(),
            session: sessionCache.getStats(),
            api: apiCache.getStats(),
          },
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            platform: process.platform,
            nodeVersion: process.version,
          },
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Limpar métricas (apenas para admins)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'cache';

    switch (type) {
      case 'cache':
        simpleCache.clear();
        dbCache.clear();
        sessionCache.clear();
        apiCache.clear();
        break;
        
      case 'metrics':
        MonitoringService.cleanup();
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo de limpeza inválido' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${type} limpo com sucesso`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro ao limpar métricas:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}