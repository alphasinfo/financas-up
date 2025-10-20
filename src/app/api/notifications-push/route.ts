/**
 * API para Sistema de Notificações Push
 * 
 * Endpoints:
 * - GET: Listar templates, segmentos e analytics
 * - POST: Enviar notificação ou registrar subscription
 * - PUT: Atualizar template ou segmento
 * - DELETE: Remover subscription ou cancelar notificação
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import notificationService from '@/lib/notification-service';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Schemas de validação
const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userAgent: z.string().optional(),
});

const sendNotificationSchema = z.object({
  templateId: z.string(),
  userIds: z.array(z.string()).optional(),
  segmentId: z.string().optional(),
  customData: z.record(z.any()).optional(),
  scheduledFor: z.string().datetime().optional(),
});

const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  image: z.string().optional(),
  requireInteraction: z.boolean().optional(),
  silent: z.boolean().optional(),
  tag: z.string().optional(),
  vibrate: z.array(z.number()).optional(),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().optional(),
  })).optional(),
  data: z.record(z.any()).optional(),
});

const segmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in']),
    value: z.any(),
  })),
  userIds: z.array(z.string()).optional(),
});

/**
 * GET - Listar dados do sistema de notificações
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    logger.info('Notification data requested', {
      userId: session.user.id,
      type,
    });

    switch (type) {
      case 'stats':
        const stats = notificationService.getStats();
        return NextResponse.json({ stats });

      case 'analytics':
        const notificationId = searchParams.get('notificationId');
        if (notificationId) {
          const analytics = notificationService.getAnalytics(notificationId);
          return NextResponse.json({ analytics });
        } else {
          const allAnalytics = notificationService.getAllAnalytics();
          return NextResponse.json({ analytics: allAnalytics });
        }

      case 'templates':
        // Em produção, filtrar templates por usuário/organização
        return NextResponse.json({ 
          templates: Array.from((notificationService as any).templates.values()) 
        });

      case 'segments':
        // Em produção, filtrar segmentos por usuário/organização
        return NextResponse.json({ 
          segments: Array.from((notificationService as any).segments.values()) 
        });

      default:
        const allStats = notificationService.getStats();
        return NextResponse.json({
          stats: allStats,
          message: 'Sistema de notificações funcionando',
        });
    }

  } catch (error) {
    logger.error('Error fetching notification data', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST - Enviar notificação ou registrar subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    logger.info('Notification action requested', {
      userId: session.user.id,
      action,
    });

    switch (action) {
      case 'subscribe':
        const subscriptionData = subscriptionSchema.parse(body);
        await notificationService.registerSubscription(session.user.id, subscriptionData);
        
        return NextResponse.json({
          success: true,
          message: 'Subscription registrada com sucesso',
        });

      case 'send':
        const sendData = sendNotificationSchema.parse(body);
        
        if (sendData.scheduledFor) {
          // Agendar notificação
          const scheduledFor = new Date(sendData.scheduledFor);
          const notificationId = notificationService.scheduleNotification(
            sendData.templateId,
            scheduledFor,
            sendData.segmentId,
            sendData.userIds,
            sendData.customData
          );
          
          return NextResponse.json({
            success: true,
            notificationId,
            message: 'Notificação agendada com sucesso',
            scheduledFor: scheduledFor.toISOString(),
          });
        } else {
          // Enviar imediatamente
          let userIds = sendData.userIds || [];
          
          if (sendData.segmentId && userIds.length === 0) {
            // Em produção, buscar usuários do segmento no banco de dados
            userIds = [session.user.id]; // Placeholder
          }
          
          if (userIds.length === 0) {
            userIds = [session.user.id]; // Enviar para o próprio usuário como teste
          }
          
          const result = await notificationService.sendNotification(
            sendData.templateId,
            userIds,
            sendData.customData
          );
          
          return NextResponse.json({
            success: true,
            result,
            message: `Notificação enviada para ${result.sent} usuários`,
          });
        }

      case 'template':
        const templateData = templateSchema.parse(body);
        notificationService.registerTemplate(templateData);
        
        return NextResponse.json({
          success: true,
          message: 'Template criado com sucesso',
        });

      case 'segment':
        const segmentData = segmentSchema.parse(body);
        // Garantir que todas as condições tenham valor
        const validatedSegment = {
          ...segmentData,
          conditions: segmentData.conditions.map(condition => ({
            ...condition,
            value: condition.value ?? null,
          })),
        };
        notificationService.createSegment(validatedSegment);
        
        return NextResponse.json({
          success: true,
          message: 'Segmento criado com sucesso',
        });

      case 'track':
        const { notificationId, event } = body;
        if (!notificationId || !event) {
          return NextResponse.json(
            { error: 'notificationId e event são obrigatórios' },
            { status: 400 }
          );
        }
        
        notificationService.trackEvent(notificationId, event);
        
        return NextResponse.json({
          success: true,
          message: 'Evento registrado com sucesso',
        });

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Error in notification action', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remover subscription ou cancelar notificação
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const endpoint = searchParams.get('endpoint');
    const notificationId = searchParams.get('notificationId');

    logger.info('Notification deletion requested', {
      userId: session.user.id,
      action,
      endpoint: endpoint?.substring(0, 50),
      notificationId,
    });

    switch (action) {
      case 'unsubscribe':
        if (!endpoint) {
          return NextResponse.json(
            { error: 'Endpoint é obrigatório' },
            { status: 400 }
          );
        }
        
        await notificationService.unregisterSubscription(session.user.id, endpoint);
        
        return NextResponse.json({
          success: true,
          message: 'Subscription removida com sucesso',
        });

      case 'cancel':
        if (!notificationId) {
          return NextResponse.json(
            { error: 'notificationId é obrigatório' },
            { status: 400 }
          );
        }
        
        const cancelled = notificationService.cancelScheduledNotification(notificationId);
        
        if (cancelled) {
          return NextResponse.json({
            success: true,
            message: 'Notificação cancelada com sucesso',
          });
        } else {
          return NextResponse.json(
            { error: 'Notificação não encontrada ou não pode ser cancelada' },
            { status: 404 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in notification deletion', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}