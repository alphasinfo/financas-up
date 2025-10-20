/**
 * Cache Manager
 * 
 * Sistema de cache em memória com TTL (Time To Live)
 * Para produção, migrar para Redis
 * 
 * Funcionalidades:
 * - Cache com expiração automática
 * - Invalidação por padrão de chave
 * - Estatísticas de hit/miss
 * - Limpeza automática
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
  };
  
  // Limpar cache expirado a cada 5 minutos
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // 5 minutos
  }
  
  /**
   * Obter valor do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Incrementar contador de hits
    entry.hits++;
    this.stats.hits++;
    
    return entry.value as T;
  }
  
  /**
   * Definir valor no cache
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const now = Date.now();
    
    this.cache.set(key, {
      value,
      expiresAt: now + (ttlSeconds * 1000),
      createdAt: now,
      hits: 0,
    });
  }
  
  /**
   * Verificar se chave existe e não expirou
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Deletar chave específica
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Invalidar cache por padrão
   * Exemplo: invalidatePattern('user:123:*') remove todas chaves que começam com 'user:123:'
   */
  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Limpar cache expirado
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[Cache] Limpou ${cleaned} entradas expiradas`);
    }
    
    return cleaned;
  }
  
  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }
  
  /**
   * Obter estatísticas do cache
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }
  
  /**
   * Obter ou definir (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Tentar obter do cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Se não existe, buscar e cachear
    const value = await factory();
    this.set(key, value, ttlSeconds);
    
    return value;
  }
  
  /**
   * Destruir cache manager (limpar interval)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Singleton
export const cacheManager = new CacheManager();

/**
 * Helper para criar chaves de cache consistentes
 */
export const CacheKeys = {
  /**
   * Dashboard do usuário
   */
  dashboard: (userId: string) => `dashboard:${userId}`,
  
  /**
   * Transações do usuário
   */
  transactions: (userId: string, page: number = 1) => 
    `transactions:${userId}:page:${page}`,
  
  /**
   * Transações com filtros
   */
  transactionsFiltered: (userId: string, filters: Record<string, any>) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(':');
    return `transactions:${userId}:${filterStr}`;
  },
  
  /**
   * Contas do usuário
   */
  accounts: (userId: string) => `accounts:${userId}`,
  
  /**
   * Conta específica
   */
  account: (accountId: string) => `account:${accountId}`,
  
  /**
   * Cartões do usuário
   */
  cards: (userId: string) => `cards:${userId}`,
  
  /**
   * Cartão específico
   */
  card: (cardId: string) => `card:${cardId}`,
  
  /**
   * Categorias do usuário
   */
  categories: (userId: string) => `categories:${userId}`,
  
  /**
   * Estatísticas do dashboard
   */
  dashboardStats: (userId: string, period: string) => 
    `dashboard:stats:${userId}:${period}`,
  
  /**
   * Relatórios
   */
  report: (userId: string, type: string, params: string) => 
    `report:${userId}:${type}:${params}`,
};

/**
 * Decorator para cachear resultados de funções
 */
export function Cacheable(ttlSeconds: number = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      return cacheManager.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        ttlSeconds
      );
    };
    
    return descriptor;
  };
}

/**
 * Helper para invalidar cache relacionado a um usuário
 */
export function invalidateUserCache(userId: string): number {
  return cacheManager.invalidatePattern(`*:${userId}*`);
}

/**
 * Helper para invalidar cache de transações
 */
export function invalidateTransactionsCache(userId: string): number {
  return cacheManager.invalidatePattern(`transactions:${userId}*`);
}

/**
 * Helper para invalidar cache do dashboard
 */
export function invalidateDashboardCache(userId: string): number {
  return cacheManager.invalidatePattern(`dashboard*:${userId}*`);
}
