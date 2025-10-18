import winston from 'winston';

// Formato customizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para console (desenvolvimento)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { 
    service: 'financas-up',
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console (sempre ativo)
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development' ? consoleFormat : customFormat,
    }),
  ],
});

// Adicionar transporte de arquivo apenas em produção
if (process.env.NODE_ENV === 'production') {
  // Erros
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Todos os logs
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Helper functions para logs estruturados
export const log = {
  /**
   * Log de informação
   */
  info: (message: string, meta?: Record<string, any>) => {
    logger.info(message, meta);
  },

  /**
   * Log de erro
   */
  error: (message: string, error?: Error | unknown, meta?: Record<string, any>) => {
    if (error instanceof Error) {
      logger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        ...meta,
      });
    } else {
      logger.error(message, { error, ...meta });
    }
  },

  /**
   * Log de warning
   */
  warn: (message: string, meta?: Record<string, any>) => {
    logger.warn(message, meta);
  },

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug: (message: string, meta?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(message, meta);
    }
  },

  /**
   * Log de requisição HTTP
   */
  http: (method: string, url: string, statusCode: number, duration: number, meta?: Record<string, any>) => {
    logger.http('HTTP Request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ...meta,
    });
  },

  /**
   * Log de query do banco de dados
   */
  query: (query: string, duration: number, meta?: Record<string, any>) => {
    logger.debug('Database Query', {
      query: query.substring(0, 200), // Limitar tamanho
      duration: `${duration}ms`,
      ...meta,
    });
  },

  /**
   * Log de autenticação
   */
  auth: (action: 'login' | 'logout' | 'register', userId?: string, meta?: Record<string, any>) => {
    logger.info(`Auth: ${action}`, {
      action,
      userId,
      ...meta,
    });
  },

  /**
   * Log de performance
   */
  performance: (operation: string, duration: number, meta?: Record<string, any>) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger.log(level, `Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      slow: duration > 1000,
      ...meta,
    });
  },
};

export default logger;
