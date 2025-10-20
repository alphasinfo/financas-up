/**
 * Sistema de Backup Automático
 * 
 * Agendador de backups automáticos com diferentes estratégias
 */

import { logger } from './logger';
import { alertManager, AlertSeverity, AlertType } from './alerts';

export interface BackupConfig {
  enabled: boolean;
  schedule: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    hourly?: boolean; // Para desenvolvimento
  };
  retention: {
    daily: number;    // dias
    weekly: number;   // semanas
    monthly: number;  // meses
  };
  storage: {
    local: boolean;
    cloud?: {
      provider: 'aws' | 'gcp' | 'azure';
      bucket: string;
      region: string;
    };
  };
  compression: boolean;
  encryption: boolean;
}

export interface BackupJob {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'manual';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  size?: number;
  error?: string;
  metadata: Record<string, any>;
}

class BackupScheduler {
  private config: BackupConfig;
  private jobs: BackupJob[] = [];
  private intervals: NodeJS.Timeout[] = [];
  private readonly maxJobs = 100;

  constructor(config?: Partial<BackupConfig>) {
    this.config = {
      enabled: true,
      schedule: {
        daily: true,
        weekly: true,
        monthly: true,
        hourly: process.env.NODE_ENV === 'development',
      },
      retention: {
        daily: 7,    // 7 dias
        weekly: 4,   // 4 semanas
        monthly: 12, // 12 meses
      },
      storage: {
        local: true,
        cloud: process.env.BACKUP_CLOUD_PROVIDER ? {
          provider: process.env.BACKUP_CLOUD_PROVIDER as any,
          bucket: process.env.BACKUP_CLOUD_BUCKET || '',
          region: process.env.BACKUP_CLOUD_REGION || '',
        } : undefined,
      },
      compression: true,
      encryption: true,
      ...config,
    };

    if (this.config.enabled) {
      this.startScheduler();
    }
  }

  /**
   * Iniciar agendador de backups
   */
  private startScheduler() {
    logger.info('Backup scheduler started', { config: this.config });

    // Backup diário às 2:00 AM
    if (this.config.schedule.daily) {
      this.scheduleDaily();
    }

    // Backup semanal aos domingos às 3:00 AM
    if (this.config.schedule.weekly) {
      this.scheduleWeekly();
    }

    // Backup mensal no dia 1 às 4:00 AM
    if (this.config.schedule.monthly) {
      this.scheduleMonthly();
    }

    // Backup de hora em hora (apenas desenvolvimento)
    if (this.config.schedule.hourly && process.env.NODE_ENV === 'development') {
      this.scheduleHourly();
    }

    // Limpeza de backups antigos a cada 6 horas
    this.scheduleCleanup();
  }

  /**
   * Agendar backup diário
   */
  private scheduleDaily() {
    const now = new Date();
    const target = new Date();
    target.setHours(2, 0, 0, 0); // 2:00 AM

    // Se já passou das 2:00 hoje, agendar para amanhã
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      this.executeBackup('daily');
      
      // Reagendar para o próximo dia
      const interval = setInterval(() => {
        this.executeBackup('daily');
      }, 24 * 60 * 60 * 1000); // 24 horas
      
      this.intervals.push(interval);
    }, delay);

    logger.info('Daily backup scheduled', { 
      nextRun: target.toISOString(),
      delayMs: delay,
    });
  }

  /**
   * Agendar backup semanal
   */
  private scheduleWeekly() {
    const now = new Date();
    const target = new Date();
    
    // Próximo domingo às 3:00 AM
    const daysUntilSunday = (7 - now.getDay()) % 7;
    target.setDate(now.getDate() + daysUntilSunday);
    target.setHours(3, 0, 0, 0);

    // Se é domingo e já passou das 3:00, agendar para próximo domingo
    if (daysUntilSunday === 0 && now.getHours() >= 3) {
      target.setDate(target.getDate() + 7);
    }

    const delay = target.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      this.executeBackup('weekly');
      
      // Reagendar para a próxima semana
      const interval = setInterval(() => {
        this.executeBackup('weekly');
      }, 7 * 24 * 60 * 60 * 1000); // 7 dias
      
      this.intervals.push(interval);
    }, delay);

    logger.info('Weekly backup scheduled', { 
      nextRun: target.toISOString(),
      delayMs: delay,
    });
  }

  /**
   * Agendar backup mensal
   */
  private scheduleMonthly() {
    const now = new Date();
    const target = new Date();
    
    // Primeiro dia do próximo mês às 4:00 AM
    target.setMonth(now.getMonth() + 1, 1);
    target.setHours(4, 0, 0, 0);

    const delay = target.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      this.executeBackup('monthly');
      
      // Reagendar para o próximo mês
      const scheduleNext = () => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
        nextMonth.setHours(4, 0, 0, 0);
        
        const nextDelay = nextMonth.getTime() - Date.now();
        setTimeout(() => {
          this.executeBackup('monthly');
          scheduleNext();
        }, nextDelay);
      };
      
      scheduleNext();
    }, delay);

    logger.info('Monthly backup scheduled', { 
      nextRun: target.toISOString(),
      delayMs: delay,
    });
  }

  /**
   * Agendar backup de hora em hora (desenvolvimento)
   */
  private scheduleHourly() {
    const interval = setInterval(() => {
      this.executeBackup('daily'); // Usar tipo daily para desenvolvimento
    }, 60 * 60 * 1000); // 1 hora

    this.intervals.push(interval);

    logger.info('Hourly backup scheduled (development mode)');
  }

  /**
   * Agendar limpeza de backups antigos
   */
  private scheduleCleanup() {
    const interval = setInterval(() => {
      this.cleanupOldBackups();
    }, 6 * 60 * 60 * 1000); // 6 horas

    this.intervals.push(interval);

    logger.info('Backup cleanup scheduled (every 6 hours)');
  }

  /**
   * Executar backup
   */
  private async executeBackup(type: 'daily' | 'weekly' | 'monthly' | 'manual') {
    const job: BackupJob = {
      id: `${type}-${Date.now()}`,
      type,
      status: 'pending',
      startTime: new Date(),
      metadata: {
        config: this.config,
        environment: process.env.NODE_ENV,
      },
    };

    this.jobs.push(job);
    
    // Manter apenas os últimos N jobs
    if (this.jobs.length > this.maxJobs) {
      this.jobs = this.jobs.slice(-this.maxJobs);
    }

    logger.info(`Starting ${type} backup`, { jobId: job.id });

    try {
      job.status = 'running';
      
      // Executar backup
      const result = await this.performBackup(job);
      
      job.status = 'completed';
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime!.getTime();
      job.size = result.size;
      job.metadata.result = result;

      logger.info(`Backup completed successfully`, {
        jobId: job.id,
        type,
        duration: job.duration,
        size: job.size,
      });

    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      job.duration = job.endTime.getTime() - job.startTime!.getTime();
      job.error = error instanceof Error ? error.message : String(error);

      logger.error(`Backup failed`, {
        jobId: job.id,
        type,
        error: error instanceof Error ? error.message : String(error),
        duration: job.duration,
      });

      // Criar alerta para backup falhado
      alertManager.addRule({
        id: `backup-failed-${job.id}`,
        name: `Backup ${type} Falhou`,
        type: AlertType.SYSTEM,
        severity: AlertSeverity.HIGH,
        condition: () => true, // Já sabemos que falhou
        message: () => `Backup ${type} falhou: ${error instanceof Error ? error.message : String(error)}`,
        cooldown: 0,
        enabled: true,
      });
    }
  }

  /**
   * Realizar o backup efetivamente
   */
  private async performBackup(job: BackupJob): Promise<{ size: number; path: string; checksum?: string }> {
    const startTime = Date.now();
    
    // Simular backup (implementação real dependeria do banco de dados usado)
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos
    
    // Em uma implementação real, aqui seria:
    // 1. Dump do banco de dados
    // 2. Compressão (se habilitada)
    // 3. Criptografia (se habilitada)
    // 4. Upload para storage (local/cloud)
    // 5. Verificação de integridade

    const mockResult = {
      size: Math.floor(Math.random() * 1000000) + 100000, // 100KB - 1MB
      path: `/backups/${job.type}/${job.id}.sql.gz`,
      checksum: 'sha256:' + Math.random().toString(36).substring(7),
    };

    // Log detalhado do backup
    logger.info('Backup operation details', {
      jobId: job.id,
      type: job.type,
      compression: this.config.compression,
      encryption: this.config.encryption,
      storage: this.config.storage,
      result: mockResult,
    });

    return mockResult;
  }

  /**
   * Executar backup manual
   */
  async executeManualBackup(): Promise<BackupJob> {
    logger.info('Manual backup requested');
    
    const promise = new Promise<BackupJob>((resolve, reject) => {
      const job: BackupJob = {
        id: `manual-${Date.now()}`,
        type: 'manual',
        status: 'pending',
        startTime: new Date(),
        metadata: {
          manual: true,
          config: this.config,
        },
      };

      this.executeBackup('manual').then(() => {
        const completedJob = this.jobs.find(j => j.id === job.id);
        if (completedJob?.status === 'completed') {
          resolve(completedJob);
        } else {
          reject(new Error(completedJob?.error || 'Backup failed'));
        }
      }).catch(reject);
    });

    return promise;
  }

  /**
   * Limpar backups antigos
   */
  private async cleanupOldBackups() {
    logger.info('Starting backup cleanup');

    try {
      const now = new Date();
      let cleaned = 0;

      // Limpar backups diários antigos
      const dailyCutoff = new Date(now.getTime() - this.config.retention.daily * 24 * 60 * 60 * 1000);
      const weeklysCutoff = new Date(now.getTime() - this.config.retention.weekly * 7 * 24 * 60 * 60 * 1000);
      const monthlyCutoff = new Date(now.getTime() - this.config.retention.monthly * 30 * 24 * 60 * 60 * 1000);

      // Em uma implementação real, aqui seria feita a limpeza dos arquivos físicos
      // Por enquanto, apenas simulamos
      
      const oldJobs = this.jobs.filter(job => {
        if (!job.endTime) return false;
        
        switch (job.type) {
          case 'daily':
            return job.endTime < dailyCutoff;
          case 'weekly':
            return job.endTime < weeklysCutoff;
          case 'monthly':
            return job.endTime < monthlyCutoff;
          default:
            return false;
        }
      });

      cleaned = oldJobs.length;

      // Remover jobs antigos da lista
      this.jobs = this.jobs.filter(job => !oldJobs.includes(job));

      logger.info('Backup cleanup completed', {
        cleaned,
        remaining: this.jobs.length,
        retention: this.config.retention,
      });

    } catch (error) {
      logger.error('Backup cleanup failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Obter status dos backups
   */
  getBackupStatus(): {
    enabled: boolean;
    lastBackups: {
      daily?: BackupJob;
      weekly?: BackupJob;
      monthly?: BackupJob;
    };
    stats: {
      total: number;
      completed: number;
      failed: number;
      running: number;
    };
    nextScheduled: {
      daily?: Date;
      weekly?: Date;
      monthly?: Date;
    };
  } {
    const lastBackups: any = {};
    const stats = { total: 0, completed: 0, failed: 0, running: 0 };

    // Encontrar últimos backups por tipo
    ['daily', 'weekly', 'monthly'].forEach(type => {
      const lastJob = this.jobs
        .filter(job => job.type === type)
        .sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0))[0];
      
      if (lastJob) {
        lastBackups[type] = lastJob;
      }
    });

    // Calcular estatísticas
    this.jobs.forEach(job => {
      stats.total++;
      switch (job.status) {
        case 'completed':
          stats.completed++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'running':
          stats.running++;
          break;
      }
    });

    // Calcular próximos agendamentos (simplificado)
    const now = new Date();
    const nextScheduled: any = {};

    if (this.config.schedule.daily) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0);
      nextScheduled.daily = tomorrow;
    }

    return {
      enabled: this.config.enabled,
      lastBackups,
      stats,
      nextScheduled,
    };
  }

  /**
   * Obter histórico de jobs
   */
  getJobHistory(limit: number = 50): BackupJob[] {
    return this.jobs
      .sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0))
      .slice(0, limit);
  }

  /**
   * Parar agendador
   */
  stop() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    logger.info('Backup scheduler stopped');
  }

  /**
   * Atualizar configuração
   */
  updateConfig(newConfig: Partial<BackupConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Reiniciar agendador se necessário
    if (this.config.enabled) {
      this.stop();
      this.startScheduler();
    }
    
    logger.info('Backup configuration updated', { config: this.config });
  }
}

// Instância global do agendador de backup
export const backupScheduler = new BackupScheduler();

export default backupScheduler;