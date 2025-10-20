/**
 * Sistema Avançado de Notificações Push
 * 
 * Funcionalidades:
 * - Notificações push inteligentes
 * - Segmentação de usuários
 * - Templates personalizáveis
 * - Agendamento de notificações
 * - Analytics de engajamento
 * - Integração com múltiplos provedores
 */

import { logger } from './logger';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
  vibrate?: number[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface UserSegment {
  id: string;
  name: string;
  conditions: SegmentCondition[];
  userIds?: string[];
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface ScheduledNotification {
  id: string;
  templateId: string;
  segmentId?: string;
  userIds?: string[];
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: Date;
  sentAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationAnalytics {
  notificationId: string;
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  conversionRate: number;
  engagementRate: number;
  timestamp: Date;
}

export interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  lastUsed?: Date;
  active: boolean;
}

class NotificationService {
  private templates: Map<string, NotificationTemplate> = new Map();
  private segments: Map<string, UserSegment> = new Map();
  private subscriptions: Map<string, PushSubscription[]> = new Map();
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private analytics: Map<string, NotificationAnalytics> = new Map();
  private vapidKeys?: { publicKey: string; privateKey: string };

  constructor() {
    this.initializeDefaultTemplates();
    this.initializeDefaultSegments();
    this.startScheduler();
  }

  /**
   * Configurar chaves VAPID para push notifications
   */
  setVapidKeys(publicKey: string, privateKey: string) {
    this.vapidKeys = { publicKey, privateKey };
    logger.info('VAPID keys configured for push notifications');
  }

  /**
   * Registrar template de notificação
   */
  registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
    logger.info(`Notification template registered: ${template.name}`, {
      templateId: template.id,
    });
  }

  /**
   * Criar segmento de usuários
   */
  createSegment(segment: UserSegment): void {
    this.segments.set(segment.id, segment);
    logger.info(`User segment created: ${segment.name}`, {
      segmentId: segment.id,
      conditions: segment.conditions.length,
    });
  }

  /**
   * Registrar subscription de push
   */
  async registerSubscription(userId: string, subscription: Omit<PushSubscription, 'userId' | 'createdAt' | 'active'>): Promise<void> {
    const userSubscriptions = this.subscriptions.get(userId) || [];
    
    // Verificar se já existe uma subscription similar
    const existingIndex = userSubscriptions.findIndex(sub => sub.endpoint === subscription.endpoint);
    
    const newSubscription: PushSubscription = {
      ...subscription,
      userId,
      createdAt: new Date(),
      active: true,
    };

    if (existingIndex >= 0) {
      userSubscriptions[existingIndex] = newSubscription;
    } else {
      userSubscriptions.push(newSubscription);
    }

    this.subscriptions.set(userId, userSubscriptions);
    
    logger.info('Push subscription registered', {
      userId,
      endpoint: subscription.endpoint.substring(0, 50) + '...',
    });
  }

  /**
   * Remover subscription
   */
  async unregisterSubscription(userId: string, endpoint: string): Promise<void> {
    const userSubscriptions = this.subscriptions.get(userId) || [];
    const filteredSubscriptions = userSubscriptions.filter(sub => sub.endpoint !== endpoint);
    
    if (filteredSubscriptions.length !== userSubscriptions.length) {
      this.subscriptions.set(userId, filteredSubscriptions);
      logger.info('Push subscription removed', { userId, endpoint: endpoint.substring(0, 50) + '...' });
    }
  }

  /**
   * Enviar notificação imediata
   */
  async sendNotification(
    templateId: string,
    userIds: string[],
    customData?: Record<string, any>
  ): Promise<{ sent: number; failed: number }> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.sendToUser(userId, template, customData);
        sent++;
      } catch (error) {
        failed++;
        logger.error(`Failed to send notification to user ${userId}`, {
          templateId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Registrar analytics
    const notificationId = `${templateId}-${Date.now()}`;
    this.analytics.set(notificationId, {
      notificationId,
      sent,
      delivered: 0, // Será atualizado quando recebermos confirmações
      clicked: 0,
      dismissed: 0,
      conversionRate: 0,
      engagementRate: 0,
      timestamp: new Date(),
    });

    logger.info('Notification batch sent', {
      templateId,
      sent,
      failed,
      totalUsers: userIds.length,
    });

    return { sent, failed };
  }

  /**
   * Agendar notificação
   */
  scheduleNotification(
    templateId: string,
    scheduledFor: Date,
    segmentId?: string,
    userIds?: string[],
    metadata?: Record<string, any>
  ): string {
    const notificationId = `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const scheduledNotification: ScheduledNotification = {
      id: notificationId,
      templateId,
      segmentId,
      userIds,
      scheduledFor,
      status: 'pending',
      createdAt: new Date(),
      metadata,
    };

    this.scheduledNotifications.set(notificationId, scheduledNotification);

    logger.info('Notification scheduled', {
      notificationId,
      templateId,
      scheduledFor: scheduledFor.toISOString(),
      segmentId,
      userCount: userIds?.length,
    });

    return notificationId;
  }

  /**
   * Cancelar notificação agendada
   */
  cancelScheduledNotification(notificationId: string): boolean {
    const notification = this.scheduledNotifications.get(notificationId);
    if (!notification || notification.status !== 'pending') {
      return false;
    }

    notification.status = 'cancelled';
    this.scheduledNotifications.set(notificationId, notification);

    logger.info('Scheduled notification cancelled', { notificationId });
    return true;
  }

  /**
   * Obter usuários de um segmento
   */
  private async getUsersFromSegment(segmentId: string): Promise<string[]> {
    const segment = this.segments.get(segmentId);
    if (!segment) {
      throw new Error(`Segment not found: ${segmentId}`);
    }

    // Se o segmento tem userIds específicos, usar eles
    if (segment.userIds && segment.userIds.length > 0) {
      return segment.userIds;
    }

    // Caso contrário, aplicar condições (implementação simplificada)
    // Em um sistema real, isso consultaria o banco de dados
    const allUserIds = Array.from(this.subscriptions.keys());
    
    // Para este exemplo, retornamos todos os usuários
    // Em produção, implementar lógica de filtro baseada nas condições
    return allUserIds;
  }

  /**
   * Enviar notificação para um usuário específico
   */
  private async sendToUser(
    userId: string,
    template: NotificationTemplate,
    customData?: Record<string, any>
  ): Promise<void> {
    const userSubscriptions = this.subscriptions.get(userId) || [];
    const activeSubscriptions = userSubscriptions.filter(sub => sub.active);

    if (activeSubscriptions.length === 0) {
      throw new Error(`No active subscriptions for user: ${userId}`);
    }

    const payload = {
      title: template.title,
      body: template.body,
      icon: template.icon || '/icon-192x192.png',
      badge: template.badge || '/badge-72x72.png',
      image: template.image,
      data: { ...template.data, ...customData },
      actions: template.actions,
      requireInteraction: template.requireInteraction,
      silent: template.silent,
      tag: template.tag,
      timestamp: template.timestamp || Date.now(),
      vibrate: template.vibrate,
    };

    // Simular envio de push notification
    // Em produção, usar web-push ou similar
    for (const subscription of activeSubscriptions) {
      try {
        // await webpush.sendNotification(subscription, JSON.stringify(payload));
        subscription.lastUsed = new Date();
        logger.debug('Push notification sent', {
          userId,
          endpoint: subscription.endpoint.substring(0, 50) + '...',
        });
      } catch (error) {
        // Marcar subscription como inativa se falhar
        subscription.active = false;
        logger.warn('Push subscription marked as inactive', {
          userId,
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Processar notificações agendadas
   */
  private async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const pendingNotifications = Array.from(this.scheduledNotifications.values())
      .filter(notification => 
        notification.status === 'pending' && 
        notification.scheduledFor <= now
      );

    for (const notification of pendingNotifications) {
      try {
        let userIds: string[] = [];

        if (notification.userIds) {
          userIds = notification.userIds;
        } else if (notification.segmentId) {
          userIds = await this.getUsersFromSegment(notification.segmentId);
        }

        if (userIds.length > 0) {
          await this.sendNotification(notification.templateId, userIds, notification.metadata);
          notification.status = 'sent';
          notification.sentAt = new Date();
        } else {
          notification.status = 'failed';
          logger.warn('No users found for scheduled notification', {
            notificationId: notification.id,
          });
        }
      } catch (error) {
        notification.status = 'failed';
        logger.error('Failed to send scheduled notification', {
          notificationId: notification.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      this.scheduledNotifications.set(notification.id, notification);
    }
  }

  /**
   * Registrar evento de analytics
   */
  trackEvent(notificationId: string, event: 'delivered' | 'clicked' | 'dismissed'): void {
    const analytics = this.analytics.get(notificationId);
    if (!analytics) {
      return;
    }

    switch (event) {
      case 'delivered':
        analytics.delivered++;
        break;
      case 'clicked':
        analytics.clicked++;
        break;
      case 'dismissed':
        analytics.dismissed++;
        break;
    }

    // Recalcular métricas
    analytics.engagementRate = analytics.sent > 0 ? 
      ((analytics.clicked + analytics.dismissed) / analytics.sent) * 100 : 0;
    analytics.conversionRate = analytics.sent > 0 ? 
      (analytics.clicked / analytics.sent) * 100 : 0;

    this.analytics.set(notificationId, analytics);
  }

  /**
   * Obter analytics de notificação
   */
  getAnalytics(notificationId: string): NotificationAnalytics | undefined {
    return this.analytics.get(notificationId);
  }

  /**
   * Obter todas as analytics
   */
  getAllAnalytics(): NotificationAnalytics[] {
    return Array.from(this.analytics.values());
  }

  /**
   * Obter estatísticas gerais
   */
  getStats(): {
    totalTemplates: number;
    totalSegments: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    scheduledNotifications: number;
    totalSent: number;
    averageEngagementRate: number;
  } {
    const allSubscriptions = Array.from(this.subscriptions.values()).flat();
    const activeSubscriptions = allSubscriptions.filter(sub => sub.active);
    const pendingScheduled = Array.from(this.scheduledNotifications.values())
      .filter(n => n.status === 'pending');
    
    const allAnalytics = Array.from(this.analytics.values());
    const totalSent = allAnalytics.reduce((sum, a) => sum + a.sent, 0);
    const averageEngagementRate = allAnalytics.length > 0 ?
      allAnalytics.reduce((sum, a) => sum + a.engagementRate, 0) / allAnalytics.length : 0;

    return {
      totalTemplates: this.templates.size,
      totalSegments: this.segments.size,
      totalSubscriptions: allSubscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      scheduledNotifications: pendingScheduled.length,
      totalSent,
      averageEngagementRate,
    };
  }

  /**
   * Inicializar templates padrão
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'transaction-alert',
        name: 'Alerta de Transação',
        title: 'Nova Transação Registrada',
        body: 'Uma nova transação foi adicionada à sua conta.',
        icon: '/icons/transaction.png',
        tag: 'transaction',
        actions: [
          { action: 'view', title: 'Ver Detalhes', icon: '/icons/view.png' },
          { action: 'dismiss', title: 'Dispensar' }
        ]
      },
      {
        id: 'budget-warning',
        name: 'Aviso de Orçamento',
        title: 'Orçamento Próximo do Limite',
        body: 'Você já gastou 80% do seu orçamento mensal.',
        icon: '/icons/warning.png',
        tag: 'budget',
        requireInteraction: true,
        actions: [
          { action: 'view-budget', title: 'Ver Orçamento' },
          { action: 'adjust', title: 'Ajustar Limite' }
        ]
      },
      {
        id: 'bill-reminder',
        name: 'Lembrete de Conta',
        title: 'Conta a Vencer',
        body: 'Você tem uma conta vencendo em 3 dias.',
        icon: '/icons/bill.png',
        tag: 'bill',
        vibrate: [200, 100, 200],
        actions: [
          { action: 'pay', title: 'Pagar Agora' },
          { action: 'remind-later', title: 'Lembrar Depois' }
        ]
      },
      {
        id: 'goal-achievement',
        name: 'Meta Alcançada',
        title: 'Parabéns! Meta Alcançada! 🎉',
        body: 'Você atingiu sua meta de economia mensal!',
        icon: '/icons/achievement.png',
        tag: 'achievement',
        requireInteraction: true,
        actions: [
          { action: 'celebrate', title: 'Ver Conquista' },
          { action: 'new-goal', title: 'Nova Meta' }
        ]
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    logger.info(`Initialized ${defaultTemplates.length} default notification templates`);
  }

  /**
   * Inicializar segmentos padrão
   */
  private initializeDefaultSegments(): void {
    const defaultSegments: UserSegment[] = [
      {
        id: 'active-users',
        name: 'Usuários Ativos',
        conditions: [
          { field: 'lastLogin', operator: 'greater_than', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        id: 'high-spenders',
        name: 'Grandes Gastadores',
        conditions: [
          { field: 'monthlySpending', operator: 'greater_than', value: 5000 }
        ]
      },
      {
        id: 'budget-users',
        name: 'Usuários com Orçamento',
        conditions: [
          { field: 'hasBudget', operator: 'equals', value: true }
        ]
      },
      {
        id: 'new-users',
        name: 'Usuários Novos',
        conditions: [
          { field: 'createdAt', operator: 'greater_than', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        ]
      }
    ];

    defaultSegments.forEach(segment => {
      this.segments.set(segment.id, segment);
    });

    logger.info(`Initialized ${defaultSegments.length} default user segments`);
  }

  /**
   * Iniciar scheduler para notificações agendadas
   */
  private startScheduler(): void {
    // Processar notificações agendadas a cada minuto
    setInterval(() => {
      this.processScheduledNotifications().catch(error => {
        logger.error('Error processing scheduled notifications', {
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }, 60 * 1000); // 1 minuto

    logger.info('Notification scheduler started');
  }

  /**
   * Limpeza de dados antigos
   */
  cleanup(): void {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias

    // Limpar analytics antigas
    for (const [id, analytics] of this.analytics.entries()) {
      if (analytics.timestamp < cutoff) {
        this.analytics.delete(id);
      }
    }

    // Limpar notificações agendadas antigas
    for (const [id, notification] of this.scheduledNotifications.entries()) {
      if (notification.createdAt < cutoff && notification.status !== 'pending') {
        this.scheduledNotifications.delete(id);
      }
    }

    // Limpar subscriptions inativas antigas
    for (const [userId, subscriptions] of this.subscriptions.entries()) {
      const activeSubscriptions = subscriptions.filter(sub => 
        sub.active || (sub.lastUsed && sub.lastUsed > cutoff)
      );
      
      if (activeSubscriptions.length !== subscriptions.length) {
        this.subscriptions.set(userId, activeSubscriptions);
      }
    }

    logger.info('Notification service cleanup completed');
  }
}

// Instância singleton
export const notificationService = new NotificationService();

// Limpeza automática a cada 6 horas
if (typeof window === 'undefined') {
  setInterval(() => {
    notificationService.cleanup();
  }, 6 * 60 * 60 * 1000);
}

export default notificationService;