/**
 * Sistema de Logging Estruturado
 * 
 * Logger centralizado com diferentes níveis e formatação estruturada
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  stack?: string;
  duration?: number;
}

class StructuredLogger {
  private minLevel: LogLevel;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }

  /**
   * Log de debug (desenvolvimento)
   */
  debug(message: string, context?: Record<string, any>, meta?: Partial<LogEntry>) {
    this.log(LogLevel.DEBUG, message, context, meta);
  }

  /**
   * Log de informação
   */
  info(message: string, context?: Record<string, any>, meta?: Partial<LogEntry>) {
    this.log(LogLevel.INFO, message, context, meta);
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: Record<string, any>, meta?: Partial<LogEntry>) {
    this.log(LogLevel.WARN, message, context, meta);
  }

  /**
   * Log de erro
   */
  error(message: string, context?: Record<string, any>, meta?: Partial<LogEntry>) {
    this.log(LogLevel.ERROR, message, context, meta);
  }

  /**
   * Log de erro fatal
   */
  fatal(message: string, context?: Record<string, any>, meta?: Partial<LogEntry>) {
    this.log(LogLevel.FATAL, message, context, meta);
  }

  /**
   * Log com erro completo
   */
  logError(error: Error, context?: Record<string, any>, meta?: Partial<LogEntry>) {
    this.log(LogLevel.ERROR, error.message, {
      ...context,
      errorName: error.name,
      errorStack: error.stack,
    }, {
      ...meta,
      stack: error.stack,
    });
  }

  /**
   * Log de performance
   */
  logPerformance(operation: string, duration: number, success: boolean, context?: Record<string, any>) {
    this.log(LogLevel.INFO, `Performance: ${operation}`, {
      ...context,
      operation,
      duration,
      success,
      performance: true,
    }, {
      duration,
    });
  }

  /**
   * Log de request HTTP
   */
  logRequest(method: string, url: string, statusCode: number, duration: number, meta?: Partial<LogEntry>) {
    const level = statusCode >= 500 ? LogLevel.ERROR : 
                  statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(level, `${method} ${url} ${statusCode}`, {
      method,
      url,
      statusCode,
      duration,
      request: true,
    }, {
      ...meta,
      duration,
    });
  }

  /**
   * Log de autenticação
   */
  logAuth(event: string, userId?: string, success: boolean = true, context?: Record<string, any>) {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    
    this.log(level, `Auth: ${event}`, {
      ...context,
      event,
      success,
      auth: true,
    }, {
      userId,
    });
  }

  /**
   * Log de segurança
   */
  logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>, meta?: Partial<LogEntry>) {
    const level = severity === 'critical' ? LogLevel.FATAL :
                  severity === 'high' ? LogLevel.ERROR :
                  severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(level, `Security: ${event}`, {
      ...context,
      event,
      severity,
      security: true,
    }, meta);
  }

  /**
   * Método principal de logging
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, meta?: Partial<LogEntry>) {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context,
      ...meta,
    };

    // Adicionar à lista de logs
    this.logs.push(entry);
    
    // Manter apenas os últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output para console baseado no ambiente
    this.outputToConsole(level, entry);

    // Em produção, enviar para serviços externos
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry);
    }
  }

  /**
   * Output para console
   */
  private outputToConsole(level: LogLevel, entry: LogEntry) {
    const { timestamp, level: levelStr, message, context, stack } = entry;
    
    const logMessage = `[${timestamp}] ${levelStr}: ${message}`;
    const logData = {
      ...context,
      ...(stack && { stack }),
    };

    switch (level) {
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, logData);
        }
        break;
      case LogLevel.INFO:
        console.log(logMessage, logData);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, logData);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage, logData);
        break;
    }
  }

  /**
   * Enviar para serviços externos (Sentry, LogRocket, etc.)
   */
  private sendToExternalService(entry: LogEntry) {
    // TODO: Implementar integração com serviços externos
    // Exemplos: Sentry, LogRocket, DataDog, etc.
    
    // Por enquanto, apenas salvar em arquivo em produção
    if (typeof window === 'undefined') {
      // Server-side: salvar em arquivo
      this.saveToFile(entry);
    }
  }

  /**
   * Salvar em arquivo (server-side)
   */
  private saveToFile(entry: LogEntry) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
      
      // Criar diretório se não existir
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // Escrever log
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Erro ao salvar log em arquivo:', error);
    }
  }

  /**
   * Obter logs recentes
   */
  getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Obter logs por nível
   */
  getLogsByLevel(level: LogLevel, limit: number = 100): LogEntry[] {
    return this.logs
      .filter(log => LogLevel[log.level as keyof typeof LogLevel] === level)
      .slice(-limit);
  }

  /**
   * Obter logs por contexto
   */
  getLogsByContext(key: string, value: any, limit: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.context && log.context[key] === value)
      .slice(-limit);
  }

  /**
   * Obter estatísticas de logs
   */
  getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    last24h: number;
    last1h: number;
  } {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last1h = new Date(now.getTime() - 60 * 60 * 1000);

    const byLevel: Record<string, number> = {};
    let last24hCount = 0;
    let last1hCount = 0;

    this.logs.forEach(log => {
      // Contar por nível
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      
      // Contar por tempo
      const logTime = new Date(log.timestamp);
      if (logTime >= last24h) last24hCount++;
      if (logTime >= last1h) last1hCount++;
    });

    return {
      total: this.logs.length,
      byLevel,
      last24h: last24hCount,
      last1h: last1hCount,
    };
  }

  /**
   * Limpar logs antigos
   */
  cleanup() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h atrás
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoff);
  }

  /**
   * Definir nível mínimo de log
   */
  setMinLevel(level: LogLevel) {
    this.minLevel = level;
  }
}

// Instância global do logger
export const logger = new StructuredLogger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

/**
 * Middleware para logging de requests
 */
export function createLoggingMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    // Adicionar requestId ao request
    req.requestId = requestId;
    
    // Log do início da request
    logger.info(`Request started: ${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    }, {
      requestId,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    
    // Interceptar o final da response
    const originalSend = res.send;
    res.send = function(data: any) {
      const duration = Date.now() - start;
      
      // Log do final da request
      logger.logRequest(req.method, req.url, res.statusCode, duration, {
        requestId,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * Decorator para logging automático de funções
 */
export function logFunction(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      
      logger.debug(`Starting ${operation}`, { args });
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        
        logger.logPerformance(operation, duration, true, { result });
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        
        logger.logPerformance(operation, duration, false, { error: error instanceof Error ? error.message : String(error) });
        logger.logError(error as Error, { operation, args });
        
        throw error;
      }
    };
  };
}

// Limpeza automática a cada hora
if (typeof window === 'undefined') {
  setInterval(() => {
    logger.cleanup();
  }, 60 * 60 * 1000); // 1 hora
}

export default logger;