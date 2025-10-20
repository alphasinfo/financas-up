/**
 * API de Alertas
 * 
 * Endpoint para gerenciar alertas do sistema
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { alertManager, AlertSeverity } from '@/lib/alerts';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '50');
    const severity = searchParams.get('severity') as AlertSeverity;

    let data: any = {};

    switch (type) {
      case 'recent':
        data = {
          alerts: alertManager.getRecentAlerts(limit),
          stats: alertManager.getAlertStats(),
        };
        break;
        
      case 'unresolved':
        data = {
          alerts: alertManager.getUnresolvedAlerts(),
          count: alertManager.getUnresolvedAlerts().length,
        };
        break;
        
      case 'severity':
        if (!severity) {
          return NextResponse.json(
            { error: 'Parâmetro severity é obrigatório' },
            { status: 400 }
          );
        }
        data = {
          alerts: alertManager.getAlertsBySeverity(severity, limit),
          severity,
        };
        break;
        
      case 'stats':
        data = alertManager.getAlertStats();
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo de consulta inválido' },
          { status: 400 }
        );
    }

    // Log da consulta
    logger.info('Alerts API accessed', {
      type,
      limit,
      severity,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.logError(error as Error, {
      endpoint: '/api/alerts',
      method: 'GET',
    });
    
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
 * Resolver um alerta
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { alertId, action } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId é obrigatório' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'resolve':
        alertManager.resolveAlert(alertId, session.user.id);
        
        logger.info('Alert resolved via API', {
          alertId,
          resolvedBy: session.user.id,
        });
        
        return NextResponse.json({
          success: true,
          message: 'Alerta resolvido com sucesso',
          timestamp: new Date().toISOString(),
        });
        
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.logError(error as Error, {
      endpoint: '/api/alerts',
      method: 'PATCH',
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

/**
 * Criar alerta manual (para testes ou situações especiais)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, message, severity = 'medium', type = 'business' } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title e message são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar alerta manual
    const alert = {
      id: `manual-${Date.now()}`,
      type,
      severity,
      title,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata: {
        manual: true,
        createdBy: session.user.id,
      },
      actions: ['Investigar situação reportada'],
    };

    // TODO: Adicionar à lista de alertas
    // Por enquanto, apenas log
    logger.logSecurity(`Manual alert created: ${title}`, severity, {
      alertId: alert.id,
      createdBy: session.user.id,
      message,
    });

    return NextResponse.json({
      success: true,
      alert,
      message: 'Alerta criado com sucesso',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.logError(error as Error, {
      endpoint: '/api/alerts',
      method: 'POST',
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}