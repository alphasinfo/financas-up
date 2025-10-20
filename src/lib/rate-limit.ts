/**
 * Rate Limiting System
 * 
 * Sistema de rate limiting em memória para controlar
 * o número de requisições por IP/usuário
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

type RateLimitType = 'READ' | 'WRITE' | 'PUBLIC';

// Armazenamento em memória (em produção usar Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configurações de rate limiting
export const RATE_LIMITS = {
  READ: {
    maxRequests: 500,
    interval: 60 * 1000, // 1 minuto
  },
  WRITE: {
    maxRequests: 200,
    interval: 60 * 1000, // 1 minuto
  },
  PUBLIC: {
    maxRequests: 100,
    interval: 60 * 1000, // 1 minuto
  },
  AUTHENTICATED: {
    maxRequests: 300,
    interval: 60 * 1000, // 1 minuto
  },
};

/**
 * Função principal de rate limiting (compatível com testes)
 */
export function rateLimit(
  identifier: string,
  config: { interval: number; maxRequests: number }
): { success: boolean; remaining: number; resetTime: number; limit: number } {
  const key = identifier;
  const now = Date.now();
  
  // Obter entrada atual
  const entry = rateLimitStore.get(key);
  
  // Se não existe ou expirou, criar nova
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.interval,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
      limit: config.maxRequests,
    };
  }
  
  // Verificar se excedeu o limite
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      limit: config.maxRequests,
    };
  }
  
  // Incrementar contador
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
    limit: config.maxRequests,
  };
}

/**
 * Verificar rate limit
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'READ'
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[type];
  const key = `${type}:${identifier}`;
  const now = Date.now();
  
  // Obter entrada atual
  const entry = rateLimitStore.get(key);
  
  // Se não existe ou expirou, criar nova
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.interval,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
      limit: config.maxRequests,
    };
  }
  
  // Verificar se excedeu o limite
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      limit: config.maxRequests,
    };
  }
  
  // Incrementar contador
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
    limit: config.maxRequests,
  };
}

/**
 * Registrar uma requisição
 */
export async function recordRequest(
  identifier: string,
  type: RateLimitType = 'READ'
): Promise<void> {
  await checkRateLimit(identifier, type);
}

/**
 * Obter requisições restantes
 */
export async function getRemainingRequests(
  identifier: string,
  type: RateLimitType = 'READ'
): Promise<number> {
  const result = await checkRateLimit(identifier, type);
  return result.remaining;
}

/**
 * Verificar se está limitado
 */
export async function isRateLimited(
  identifier: string,
  type: RateLimitType = 'READ'
): Promise<boolean> {
  const result = await checkRateLimit(identifier, type);
  return !result.allowed;
}

/**
 * Resetar rate limit para um identificador
 */
export function resetRateLimit(identifier: string, type?: RateLimitType): void {
  if (type) {
    const key = `${type}:${identifier}`;
    rateLimitStore.delete(key);
  } else {
    // Resetar todos os tipos para o identificador
    const keys = Array.from(rateLimitStore.keys()).filter(key => 
      key.endsWith(`:${identifier}`)
    );
    keys.forEach(key => rateLimitStore.delete(key));
  }
}

/**
 * Limpar entradas expiradas
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  
  return cleaned;
}

/**
 * Obter estatísticas do rate limiting
 */
export function getRateLimitStats(): {
  totalEntries: number;
  entriesByType: Record<RateLimitType, number>;
  memoryUsage: number;
} {
  const entriesByType: Record<RateLimitType, number> = {
    READ: 0,
    WRITE: 0,
    PUBLIC: 0,
  };
  
  for (const key of rateLimitStore.keys()) {
    const type = key.split(':')[0] as RateLimitType;
    if (type in entriesByType) {
      entriesByType[type]++;
    }
  }
  
  return {
    totalEntries: rateLimitStore.size,
    entriesByType,
    memoryUsage: rateLimitStore.size * 64, // Estimativa em bytes
  };
}

/**
 * Configurar limpeza automática
 */
let cleanupInterval: NodeJS.Timeout | null = null;

export function startAutoCleanup(intervalMs: number = 5 * 60 * 1000): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  cleanupInterval = setInterval(() => {
    const cleaned = cleanupExpiredEntries();
    if (cleaned > 0) {
      console.log(`[RateLimit] Limpeza automática: ${cleaned} entradas removidas`);
    }
  }, intervalMs);
}

export function stopAutoCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

// Iniciar limpeza automática por padrão
if (typeof window === 'undefined') {
  startAutoCleanup();
}

/**
 * Obter identificador do cliente (compatível com imports existentes)
 */
export function getClientIdentifier(request: Request): string {
  // Tentar obter IP do cabeçalho X-Forwarded-For
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Tentar obter IP do cabeçalho X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback para user-agent + timestamp (para desenvolvimento)
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${userAgent}-${Date.now()}`;
}