/**
 * Sistema de Monitoramento Básico
 * 
 * Implementação simples para tracking de performance e erros
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
}

interface ErrorMetric {
  error: Error;
  context: Record<string, any>;
  timestamp: Date;
  userId?: string;
  ip?: string;
}

class MonitoringService {
  private static metrics: PerformanceMetric[] = [];
  private static errors: ErrorMetric[] = [];
  private static readonly MAX_METRICS = 1000;
  private static readonly MAX_ERRORS = 500;

  /**
   * Track performance de operações
   */
  static trackPerformance(
    operation: string,
    duration: number,
    success: boolean = true,
    metadata?: Record<string, any>
  ) {
    const metric: PerformanceMetric = {
      operation,
      duration,
      success,
      timestamp: new Date(),
      metadata,
    };

    this.metrics.push(metric);
    
    // Manter apenas os últimos N métricas
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log para console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${operation}: ${duration}ms`, { success, metadata });
    }

    // Alertar se performance está ruim
    if (duration > 5000) {
      console.warn(`[SLOW] ${operation} took ${duration}ms`);
    }
  }

  /**
   * Track erros do sistema
   */
  static trackError(
    error: Error,
    context: Record<string, any> = {},
    userId?: string,
    ip?: string
  ) {
    const errorMetric: ErrorMetric = {
      error,
      context,
      timestamp: new Date(),
      userId,
      ip,
    };

    this.errors.push(errorMetric);
    
    // Manter apenas os últimos N erros
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_ERRORS);
    }

    // Log detalhado do erro
    console.error(`[ERROR] ${error.message}`, {
      stack: error.stack,
      context,
      userId,
      ip,
      timestamp: errorMetric.timestamp,
    });
  }

  /**
   * Obter estatísticas de performance
   */
  static getPerformanceStats(operation?: string) {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return null;
    }

    const durations = filteredMetrics.map(m => m.duration);
    const successCount = filteredMetrics.filter(m => m.success).length;
    
    return {
      operation,
      count: filteredMetrics.length,
      successRate: (successCount / filteredMetrics.length) * 100,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p95Duration: this.percentile(durations, 95),
      p99Duration: this.percentile(durations, 99),
    };
  }

  /**
   * Obter estatísticas de erros
   */
  static getErrorStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last1h = new Date(now.getTime() - 60 * 60 * 1000);

    const errors24h = this.errors.filter(e => e.timestamp >= last24h);
    const errors1h = this.errors.filter(e => e.timestamp >= last1h);

    const errorsByType = this.errors.reduce((acc, error) => {
      const type = error.error.constructor.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errors.length,
      last24h: errors24h.length,
      last1h: errors1h.length,
      errorsByType,
      recentErrors: this.errors.slice(-10).map(e => ({
        message: e.error.message,
        timestamp: e.timestamp,
        context: e.context,
      })),
    };
  }

  /**
   * Obter health check do sistema
   */
  static getHealthCheck() {
    const stats = this.getPerformanceStats();
    const errorStats = this.getErrorStats();
    
    const isHealthy = (
      (stats?.successRate || 100) > 95 &&
      (stats?.avgDuration || 0) < 2000 &&
      errorStats.last1h < 10
    );

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      performance: stats,
      errors: errorStats,
    };
  }

  /**
   * Limpar métricas antigas
   */
  static cleanup() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h atrás
    
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
    this.errors = this.errors.filter(e => e.timestamp >= cutoff);
  }

  /**
   * Calcular percentil
   */
  private static percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
}

/**
 * Decorator para tracking automático de performance
 */
export function trackPerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      let success = true;
      
      try {
        const result = await method.apply(this, args);
        return result;
      } catch (error) {
        success = false;
        MonitoringService.trackError(error as Error, { operation, args });
        throw error;
      } finally {
        const duration = Date.now() - start;
        MonitoringService.trackPerformance(operation, duration, success);
      }
    };
  };
}

/**
 * Middleware para tracking de requests
 */
export function createMonitoringMiddleware() {
  return (req: Request, res: Response, next: Function) => {
    const start = Date.now();
    const operation = `${req.method} ${req.url}`;
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const success = res.statusCode < 400;
      
      MonitoringService.trackPerformance(operation, duration, success, {
        statusCode: res.statusCode,
        userAgent: req.headers['user-agent'],
      });
    });
    
    next();
  };
}

// Limpeza automática a cada hora
if (typeof window === 'undefined') {
  setInterval(() => {
    MonitoringService.cleanup();
  }, 60 * 60 * 1000); // 1 hora
}

export { MonitoringService };
export default MonitoringService;