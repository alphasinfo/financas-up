/**
 * Logger Seguro
 * 
 * Previne logging de informações sensíveis em produção
 * e sanitiza dados antes de logar.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Lista de campos sensíveis que nunca devem ser logados
const SENSITIVE_FIELDS = [
  'senha',
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'refreshToken',
  'sessionToken',
  'creditCard',
  'cvv',
  'ssn',
  'cpf',
];

/**
 * Sanitizar objeto removendo campos sensíveis
 */
function sanitizeObject(obj: any, depth: number = 0): any {
  if (depth > 5) return '[Max Depth]'; // Prevenir recursão infinita
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    
    // Verificar se é campo sensível
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      keyLower.includes(field.toLowerCase())
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Verificar se deve logar (apenas em desenvolvimento)
 */
function shouldLog(level: LogLevel): boolean {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, apenas erros e warnings
    return level === 'error' || level === 'warn';
  }
  return true;
}

/**
 * Logger seguro
 */
export const safeLogger = {
  /**
   * Log de informação
   */
  info(...args: any[]) {
    if (!shouldLog('info')) return;
    
    const sanitized = args.map(arg => 
      typeof arg === 'object' ? sanitizeObject(arg) : arg
    );
    
    console.log('[INFO]', ...sanitized);
  },
  
  /**
   * Log de warning
   */
  warn(...args: any[]) {
    if (!shouldLog('warn')) return;
    
    const sanitized = args.map(arg => 
      typeof arg === 'object' ? sanitizeObject(arg) : arg
    );
    
    console.warn('[WARN]', ...sanitized);
  },
  
  /**
   * Log de erro
   */
  error(...args: any[]) {
    if (!shouldLog('error')) return;
    
    const sanitized = args.map(arg => {
      if (arg instanceof Error) {
        return {
          message: arg.message,
          name: arg.name,
          stack: process.env.NODE_ENV === 'development' ? arg.stack : undefined,
        };
      }
      return typeof arg === 'object' ? sanitizeObject(arg) : arg;
    });
    
    console.error('[ERROR]', ...sanitized);
  },
  
  /**
   * Log de debug (apenas desenvolvimento)
   */
  debug(...args: any[]) {
    if (!shouldLog('debug')) return;
    
    const sanitized = args.map(arg => 
      typeof arg === 'object' ? sanitizeObject(arg) : arg
    );
    
    console.debug('[DEBUG]', ...sanitized);
  },
  
  /**
   * Log de autenticação (sanitizado)
   */
  auth(action: string, data: any) {
    if (!shouldLog('info')) return;
    
    const sanitized = sanitizeObject(data);
    console.log(`[AUTH] ${action}:`, sanitized);
  },
  
  /**
   * Log de API (sanitizado)
   */
  api(method: string, path: string, data?: any) {
    if (!shouldLog('info')) return;
    
    const sanitized = data ? sanitizeObject(data) : undefined;
    console.log(`[API] ${method} ${path}`, sanitized || '');
  },
};

/**
 * Middleware para sanitizar logs do console
 * (Opcional - pode ser usado para interceptar console.log global)
 */
export function setupSafeLogging() {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, substituir console.log por função vazia
    const originalLog = console.log;
    const originalDebug = console.debug;
    
    console.log = (...args: any[]) => {
      // Não logar nada em produção via console.log direto
    };
    
    console.debug = (...args: any[]) => {
      // Não logar debug em produção
    };
    
    // Manter error e warn
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeObject(arg) : arg
      );
      originalError(...sanitized);
    };
    
    console.warn = (...args: any[]) => {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeObject(arg) : arg
      );
      originalWarn(...sanitized);
    };
  }
}
