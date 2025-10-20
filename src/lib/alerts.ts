/**
 * Sistema de Alertas Automáticos
 * 
 * Sistema para detectar problemas e enviar alertas automáticos
 */

import { logger } from './logger';
import MonitoringService from './monitoring';

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertType {
  PERFORMANCE = 'performance',
  ERROR_RATE = 'error_rate',
  SYSTEM = 'system',
  SECURITY = 'security',
  BUSINESS = 'business',
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
  actions?: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  severity: AlertSeverity;
  condition: (data: any) => boolean;
  message: (data: any) => string;
  cooldown: number; // minutos
  enabled: boolean;
}

export interface AlertChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'console';
  config: Record<string, any>;
  enabled: boolean;
  severityFilter: AlertSeverity[];
}

class AlertManager {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private channels: AlertChannel[] = [];
  private lastAlertTime: Map<string, Date> = new Map();
  private readonly maxAlerts = 1000;

  constructor() {
    this.setupDefaultRules();
    this.setupDefaultChannels();
    this.startMonitoring();
  }

  /**
   * Configurar regras padrão de alerta
   */
  private setupDefaultRules() {
    this.rules = [
      // Performance - Tempo de resposta alto
      {
        id: 'high-response-time',
        name: 'Tempo de Resposta Alto',
        type: AlertType.PERFORMANCE,
        severity: AlertSeverity.HIGH,
        condition: (data) => {
          const stats = MonitoringService.getPerformanceStats();
          return Boolean(stats && stats.avgDuration > 5000); // > 5 segundos
        },
        message: (data) => `Tempo de resposta médio alto: ${data.avgDuration}ms`,
        cooldown: 15, // 15 minutos
        enabled: true,
      },

      // Performance - Taxa de sucesso baixa
      {
        id: 'low-success-rate',
        name: 'Taxa de Sucesso Baixa',
        type: AlertType.PERFORMANCE,
        severity: AlertSeverity.HIGH,
        condition: (data) => {
          const stats = MonitoringService.getPerformanceStats();
          return Boolean(stats && stats.successRate < 95); // < 95%
        },
        message: (data) => `Taxa de sucesso baixa: ${data.successRate}%`,
        cooldown: 10,
        enabled: true,
      },

      // Erros - Taxa de erro alta
      {
        id: 'high-error-rate',
        name: 'Taxa de Erro Alta',
        type: AlertType.ERROR_RATE,
        severity: AlertSeverity.CRITICAL,
        condition: (data) => {
          const errorStats = MonitoringService.getErrorStats();
          return errorStats.last1h > 50; // > 50 erros na última hora
        },
        message: (data) => `Taxa de erro alta: ${data.last1h} erros na última hora`,
        cooldown: 5,
        enabled: true,
      },

      // Sistema - Uso de memória alto
      {
        id: 'high-memory-usage',
        name: 'Uso de Memória Alto',
        type: AlertType.SYSTEM,
        severity: AlertSeverity.MEDIUM,
        condition: (data) => {
          const memoryUsage = process.memoryUsage();
          const percentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
          return percentage > 85; // > 85%
        },
        message: (data) => `Uso de memória alto: ${data.memoryPercentage}%`,
        cooldown: 30,
        enabled: true,
      },

      // Sistema - Health check degradado
      {
        id: 'system-degraded',
        name: 'Sistema Degradado',
        type: AlertType.SYSTEM,
        severity: AlertSeverity.HIGH,
        condition: (data) => {
          const health = MonitoringService.getHealthCheck();
          return health.status === 'degraded';
        },
        message: () => 'Sistema em estado degradado',
        cooldown: 20,
        enabled: true,
      },

      // Segurança - Muitas tentativas de login falharam
      {
        id: 'failed-login-attempts',
        name: 'Tentativas de Login Suspeitas',
        type: AlertType.SECURITY,
        severity: AlertSeverity.HIGH,
        condition: (data) => {
          // TODO: Implementar contagem de tentativas de login
          return false; // Placeholder
        },
        message: (data) => `Muitas tentativas de login falharam: ${data.attempts}`,
        cooldown: 60,
        enabled: false, // Desabilitado até implementar contagem
      },
    ];
  }

  /**
   * Configurar canais padrão de alerta
   */
  private setupDefaultChannels() {
    this.channels = [
      // Console (sempre ativo em desenvolvimento)
      {
        id: 'console',
        name: 'Console',
        type: 'console',
        config: {},
        enabled: process.env.NODE_ENV === 'development',
        severityFilter: [AlertSeverity.LOW, AlertSeverity.MEDIUM, AlertSeverity.HIGH, AlertSeverity.CRITICAL],
      },

      // Email (configurar SMTP)
      {
        id: 'email',
        name: 'Email',
        type: 'email',
        config: {
          to: process.env.ALERT_EMAIL || 'admin@example.com',
          from: process.env.FROM_EMAIL || 'alerts@financas-up.com',
        },
        enabled: !!process.env.SMTP_HOST,
        severityFilter: [AlertSeverity.HIGH, AlertSeverity.CRITICAL],
      },

      // Webhook genérico
      {
        id: 'webhook',
        name: 'Webhook',
        type: 'webhook',
        config: {
          url: process.env.ALERT_WEBHOOK_URL,
        },
        enabled: !!process.env.ALERT_WEBHOOK_URL,
        severityFilter: [AlertSeverity.MEDIUM, AlertSeverity.HIGH, AlertSeverity.CRITICAL],
      },
    ];
  }

  /**
   * Iniciar monitoramento automático
   */
  private startMonitoring() {
    // Verificar alertas a cada 2 minutos
    setInterval(() => {
      this.checkAlerts();
    }, 2 * 60 * 1000);

    // Limpeza de alertas antigos a cada hora
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Verificar todas as regras de alerta
   */
  private checkAlerts() {
    this.rules
      .filter(rule => rule.enabled)
      .forEach(rule => {
        try {
          this.checkRule(rule);
        } catch (error) {
          logger.error(`Erro ao verificar regra de alerta: ${rule.name}`, {
            ruleId: rule.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });
  }

  /**
   * Verificar uma regra específica
   */
  private checkRule(rule: AlertRule) {
    // Verificar cooldown
    const lastAlert = this.lastAlertTime.get(rule.id);
    if (lastAlert) {
      const cooldownMs = rule.cooldown * 60 * 1000;
      if (Date.now() - lastAlert.getTime() < cooldownMs) {
        return; // Ainda em cooldown
      }
    }

    // Obter dados para a condição
    const data = this.getDataForRule(rule);
    
    // Verificar condição
    if (rule.condition(data)) {
      this.triggerAlert(rule, data);
    }
  }

  /**
   * Obter dados necessários para uma regra
   */
  private getDataForRule(rule: AlertRule): any {
    switch (rule.type) {
      case AlertType.PERFORMANCE:
        const perfStats = MonitoringService.getPerformanceStats();
        return {
          ...perfStats,
          health: MonitoringService.getHealthCheck(),
        };

      case AlertType.ERROR_RATE:
        return MonitoringService.getErrorStats();

      case AlertType.SYSTEM:
        const memoryUsage = process.memoryUsage();
        return {
          memory: memoryUsage,
          memoryPercentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
          uptime: process.uptime(),
          health: MonitoringService.getHealthCheck(),
        };

      case AlertType.SECURITY:
        // TODO: Implementar dados de segurança
        return {};

      case AlertType.BUSINESS:
        // TODO: Implementar métricas de negócio
        return {};

      default:
        return {};
    }
  }

  /**
   * Disparar um alerta
   */
  private triggerAlert(rule: AlertRule, data: any) {
    const alert: Alert = {
      id: `${rule.id}-${Date.now()}`,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message: rule.message(data),
      timestamp: new Date(),
      resolved: false,
      metadata: {
        ruleId: rule.id,
        data,
      },
      actions: this.getActionsForAlert(rule),
    };

    // Adicionar à lista de alertas
    this.alerts.push(alert);
    
    // Manter apenas os últimos N alertas
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }

    // Atualizar tempo do último alerta
    this.lastAlertTime.set(rule.id, new Date());

    // Log do alerta
    logger.logSecurity(`Alert triggered: ${rule.name}`, rule.severity, {
      alertId: alert.id,
      ruleId: rule.id,
      data,
    });

    // Enviar para canais
    this.sendAlert(alert);
  }

  /**
   * Obter ações sugeridas para um alerta
   */
  private getActionsForAlert(rule: AlertRule): string[] {
    const actions: string[] = [];

    switch (rule.id) {
      case 'high-response-time':
        actions.push('Verificar queries lentas no banco de dados');
        actions.push('Analisar uso de CPU e memória');
        actions.push('Verificar cache e otimizações');
        break;

      case 'low-success-rate':
        actions.push('Verificar logs de erro recentes');
        actions.push('Analisar falhas de conexão');
        actions.push('Verificar dependências externas');
        break;

      case 'high-error-rate':
        actions.push('Analisar logs de erro imediatamente');
        actions.push('Verificar integridade do sistema');
        actions.push('Considerar rollback se necessário');
        break;

      case 'high-memory-usage':
        actions.push('Verificar vazamentos de memória');
        actions.push('Analisar uso de cache');
        actions.push('Considerar restart da aplicação');
        break;

      case 'system-degraded':
        actions.push('Verificar health check detalhado');
        actions.push('Analisar componentes críticos');
        actions.push('Verificar conectividade externa');
        break;

      default:
        actions.push('Investigar causa raiz');
        actions.push('Verificar logs do sistema');
        break;
    }

    return actions;
  }

  /**
   * Enviar alerta para todos os canais apropriados
   */
  private sendAlert(alert: Alert) {
    this.channels
      .filter(channel => 
        channel.enabled && 
        channel.severityFilter.includes(alert.severity)
      )
      .forEach(channel => {
        try {
          this.sendToChannel(alert, channel);
        } catch (error) {
          logger.error(`Erro ao enviar alerta para canal: ${channel.name}`, {
            channelId: channel.id,
            alertId: alert.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });
  }

  /**
   * Enviar alerta para um canal específico
   */
  private sendToChannel(alert: Alert, channel: AlertChannel) {
    switch (channel.type) {
      case 'console':
        this.sendToConsole(alert);
        break;

      case 'email':
        this.sendToEmail(alert, channel.config);
        break;

      case 'webhook':
        this.sendToWebhook(alert, channel.config);
        break;

      case 'slack':
        this.sendToSlack(alert, channel.config);
        break;

      default:
        logger.warn(`Tipo de canal não suportado: ${channel.type}`);
    }
  }

  /**
   * Enviar para console
   */
  private sendToConsole(alert: Alert) {
    const emoji = {
      [AlertSeverity.LOW]: '🟡',
      [AlertSeverity.MEDIUM]: '🟠',
      [AlertSeverity.HIGH]: '🔴',
      [AlertSeverity.CRITICAL]: '🚨',
    };

    console.log(`\n${emoji[alert.severity]} ALERTA ${alert.severity.toUpperCase()}`);
    console.log(`📋 ${alert.title}`);
    console.log(`💬 ${alert.message}`);
    console.log(`🕐 ${alert.timestamp.toISOString()}`);
    
    if (alert.actions && alert.actions.length > 0) {
      console.log(`🔧 Ações sugeridas:`);
      alert.actions.forEach((action, index) => {
        console.log(`   ${index + 1}. ${action}`);
      });
    }
    console.log('');
  }

  /**
   * Enviar por email
   */
  private async sendToEmail(alert: Alert, config: any) {
    // TODO: Implementar envio de email
    logger.info('Email alert would be sent', {
      to: config.to,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      alert,
    });
  }

  /**
   * Enviar para webhook
   */
  private async sendToWebhook(alert: Alert, config: any) {
    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert,
          timestamp: alert.timestamp.toISOString(),
          severity: alert.severity,
          message: alert.message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.info('Webhook alert sent successfully', {
        url: config.url,
        alertId: alert.id,
      });
    } catch (error) {
      logger.error('Failed to send webhook alert', {
        url: config.url,
        alertId: alert.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Enviar para Slack
   */
  private async sendToSlack(alert: Alert, config: any) {
    // TODO: Implementar integração com Slack
    logger.info('Slack alert would be sent', {
      webhook: config.webhook,
      alert,
    });
  }

  /**
   * Obter alertas recentes
   */
  getRecentAlerts(limit: number = 50): Alert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Obter alertas por severidade
   */
  getAlertsBySeverity(severity: AlertSeverity, limit: number = 50): Alert[] {
    return this.alerts
      .filter(alert => alert.severity === severity)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Obter alertas não resolvidos
   */
  getUnresolvedAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolver um alerta
   */
  resolveAlert(alertId: string, resolvedBy?: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      alert.metadata.resolvedBy = resolvedBy;

      logger.info(`Alert resolved: ${alert.title}`, {
        alertId,
        resolvedBy,
      });
    }
  }

  /**
   * Obter estatísticas de alertas
   */
  getAlertStats(): {
    total: number;
    unresolved: number;
    bySeverity: Record<AlertSeverity, number>;
    byType: Record<AlertType, number>;
    last24h: number;
  } {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const bySeverity: Record<AlertSeverity, number> = {
      [AlertSeverity.LOW]: 0,
      [AlertSeverity.MEDIUM]: 0,
      [AlertSeverity.HIGH]: 0,
      [AlertSeverity.CRITICAL]: 0,
    };

    const byType: Record<AlertType, number> = {
      [AlertType.PERFORMANCE]: 0,
      [AlertType.ERROR_RATE]: 0,
      [AlertType.SYSTEM]: 0,
      [AlertType.SECURITY]: 0,
      [AlertType.BUSINESS]: 0,
    };

    let unresolved = 0;
    let last24hCount = 0;

    this.alerts.forEach(alert => {
      bySeverity[alert.severity]++;
      byType[alert.type]++;
      
      if (!alert.resolved) unresolved++;
      if (alert.timestamp >= last24h) last24hCount++;
    });

    return {
      total: this.alerts.length,
      unresolved,
      bySeverity,
      byType,
      last24h: last24hCount,
    };
  }

  /**
   * Limpar alertas antigos
   */
  private cleanup() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás
    this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoff);
  }

  /**
   * Adicionar regra customizada
   */
  addRule(rule: AlertRule) {
    this.rules.push(rule);
    logger.info(`Alert rule added: ${rule.name}`, { ruleId: rule.id });
  }

  /**
   * Adicionar canal customizado
   */
  addChannel(channel: AlertChannel) {
    this.channels.push(channel);
    logger.info(`Alert channel added: ${channel.name}`, { channelId: channel.id });
  }
}

// Instância global do gerenciador de alertas
export const alertManager = new AlertManager();

export default alertManager;