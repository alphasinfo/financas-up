// Rate Limiting simples sem dependências externas
// Usa Map em memória (para produção, considere Redis)

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Limpar entradas antigas a cada 1 minuto
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

export interface RateLimitConfig {
  interval: number; // em milissegundos
  maxRequests: number;
}

export function rateLimit(identifier: string, config: RateLimitConfig): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Nova janela de tempo
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.interval,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Limite excedido
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Incrementar contador
  entry.count++;
  rateLimitMap.set(identifier, entry);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

// Configurações pré-definidas (limites muito permissivos para desenvolvimento)
export const RATE_LIMITS = {
  // APIs públicas (login, cadastro)
  PUBLIC: {
    interval: 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 req/min
  },
  // APIs autenticadas
  AUTHENTICATED: {
    interval: 60 * 1000, // 1 minuto
    maxRequests: 300, // 300 req/min
  },
  // APIs de escrita (POST, PUT, DELETE)
  WRITE: {
    interval: 60 * 1000, // 1 minuto
    maxRequests: 200, // 200 req/min
  },
  // APIs de leitura (GET)
  READ: {
    interval: 60 * 1000, // 1 minuto
    maxRequests: 500, // 500 req/min
  },
};

// Helper para extrair IP do request
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}
