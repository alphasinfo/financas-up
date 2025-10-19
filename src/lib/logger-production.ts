/**
 * Logger Production-Safe
 * Substitui console.log para evitar logs sensíveis em produção
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class ProductionSafeLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  log(...args: any[]) {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  info(...args: any[]) {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }

  warn(...args: any[]) {
    // Warnings sempre aparecem
    console.warn(...args);
  }

  error(...args: any[]) {
    // Errors sempre aparecem
    console.error(...args);
  }

  debug(...args: any[]) {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Log condicional baseado no ambiente
   */
  dev(...args: any[]) {
    if (this.isDevelopment) {
      console.log('[DEV]', ...args);
    }
  }

  /**
   * Log de produção (apenas erros críticos)
   */
  prod(...args: any[]) {
    if (!this.isDevelopment) {
      console.error('[PROD]', ...args);
    }
  }
}

export const logger = new ProductionSafeLogger();

// Exportar também como default
export default logger;
