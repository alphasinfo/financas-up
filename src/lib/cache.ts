/**
 * Sistema de cache em memória para otimização de performance
 * Cache com TTL (Time To Live) configurável
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;
    
    // Limpar cache expirado a cada 5 minutos
    if (typeof window === 'undefined') {
      this.startCleanup();
    }
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  /**
   * Obter valor do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Verificar se expirou
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Definir valor no cache
   * @param key Chave do cache
   * @param data Dados a serem armazenados
   * @param ttl Tempo de vida em milissegundos (padrão: 5 minutos)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidar cache por chave
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidar cache por padrão (regex)
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obter tamanho do cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Destruir cache e limpar interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Singleton
export const cache = new MemoryCache();

/**
 * Helper para cache de funções assíncronas
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // Tentar obter do cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Executar função e cachear resultado
  const result = await fn();
  cache.set(key, result, ttl);
  return result;
}

/**
 * Invalidar cache relacionado a um usuário
 */
export function invalidateUserCache(usuarioId: string): void {
  cache.invalidatePattern(new RegExp(`^user:${usuarioId}:`));
}

/**
 * Gerar chave de cache para dashboard
 */
export function getDashboardCacheKey(usuarioId: string): string {
  const hoje = new Date();
  const dia = hoje.toISOString().split('T')[0];
  return `user:${usuarioId}:dashboard:${dia}`;
}

/**
 * Gerar chave de cache para relatórios
 */
export function getRelatoriosCacheKey(usuarioId: string, mesAno: string): string {
  return `user:${usuarioId}:relatorios:${mesAno}`;
}
