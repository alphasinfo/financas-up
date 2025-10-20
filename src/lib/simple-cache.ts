/**
 * Sistema de Cache Simples
 * 
 * Cache em memória com TTL para melhorar performance
 */

interface CacheItem<T> {
  value: T;
  expires: number;
  created: number;
  hits: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
}

class SimpleCacheService {
  private cache = new Map<string, CacheItem<any>>();
  private stats = { hits: 0, misses: 0 };
  private readonly maxSize: number;
  private readonly defaultTTL: number;

  constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) { // 5 minutos padrão
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Limpeza automática a cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Obter valor do cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Verificar se expirou
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Incrementar hits
    item.hits++;
    this.stats.hits++;
    
    return item.value;
  }

  /**
   * Definir valor no cache
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL;
    const now = Date.now();
    
    // Verificar limite de tamanho
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    const item: CacheItem<T> = {
      value,
      expires: now + ttl,
      created: now,
      hits: 0,
    };
    
    this.cache.set(key, item);
  }

  /**
   * Remover item do cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Verificar se chave existe
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    // Verificar se expirou
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Limpar cache completamente
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Obter ou definir (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const value = await factory();
    this.set(key, value, ttlMs);
    
    return value;
  }

  /**
   * Invalidar por padrão
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Obter estatísticas do cache
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    // Estimar uso de memória (aproximado)
    const memoryUsage = this.cache.size * 200; // ~200 bytes por item (estimativa)
    
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage,
    };
  }

  /**
   * Obter informações detalhadas
   */
  getInfo(): Record<string, any> {
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      created: new Date(item.created),
      expires: new Date(item.expires),
      hits: item.hits,
      ttl: item.expires - Date.now(),
    }));
    
    return {
      stats: this.getStats(),
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL,
      items: items.slice(0, 10), // Apenas os primeiros 10 para não sobrecarregar
    };
  }

  /**
   * Limpeza de itens expirados
   */
  private cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Remover item menos usado (LRU)
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruHits = Infinity;
    let lruCreated = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      // Priorizar por menor número de hits, depois por mais antigo
      if (item.hits < lruHits || (item.hits === lruHits && item.created < lruCreated)) {
        lruKey = key;
        lruHits = item.hits;
        lruCreated = item.created;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
}

// Instância global do cache
export const simpleCache = new SimpleCacheService();

/**
 * Decorator para cache automático
 */
export function cached(ttlMs?: number, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
      
      return simpleCache.getOrSet(key, () => method.apply(this, args), ttlMs);
    };
  };
}

/**
 * Cache específico para queries do banco
 */
export const dbCache = new SimpleCacheService(500, 2 * 60 * 1000); // 2 minutos

/**
 * Cache específico para sessões de usuário
 */
export const sessionCache = new SimpleCacheService(1000, 30 * 60 * 1000); // 30 minutos

/**
 * Cache específico para dados de API externa
 */
export const apiCache = new SimpleCacheService(200, 10 * 60 * 1000); // 10 minutos

export default simpleCache;