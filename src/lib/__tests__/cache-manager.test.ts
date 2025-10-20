import { cacheManager, CacheKeys, invalidateUserCache } from '../cache-manager';

describe('Cache Manager', () => {
  beforeEach(() => {
    cacheManager.clear();
  });

  afterAll(() => {
    cacheManager.destroy();
  });

  describe('Operações Básicas', () => {
    it('deve armazenar e recuperar valor', () => {
      cacheManager.set('test-key', 'test-value', 60);
      
      const value = cacheManager.get('test-key');
      expect(value).toBe('test-value');
    });

    it('deve retornar null para chave inexistente', () => {
      const value = cacheManager.get('non-existent');
      expect(value).toBeNull();
    });

    it('deve verificar se chave existe', () => {
      cacheManager.set('test-key', 'value', 60);
      
      expect(cacheManager.has('test-key')).toBe(true);
      expect(cacheManager.has('non-existent')).toBe(false);
    });

    it('deve deletar chave', () => {
      cacheManager.set('test-key', 'value', 60);
      expect(cacheManager.has('test-key')).toBe(true);
      
      cacheManager.delete('test-key');
      expect(cacheManager.has('test-key')).toBe(false);
    });

    it('deve limpar todo o cache', () => {
      cacheManager.set('key1', 'value1', 60);
      cacheManager.set('key2', 'value2', 60);
      
      cacheManager.clear();
      
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
    });
  });

  describe('Expiração (TTL)', () => {
    it('deve expirar após TTL', async () => {
      cacheManager.set('test-key', 'value', 0.1); // 100ms
      
      expect(cacheManager.get('test-key')).toBe('value');
      
      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheManager.get('test-key')).toBeNull();
    });

    it('não deve retornar valor expirado', async () => {
      cacheManager.set('test-key', 'value', 0.05); // 50ms
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cacheManager.get('test-key')).toBeNull();
    });
  });

  describe('Padrões de Invalidação', () => {
    it('deve invalidar por padrão exato', () => {
      cacheManager.set('user:123:data', 'value1', 60);
      cacheManager.set('user:123:profile', 'value2', 60);
      cacheManager.set('user:456:data', 'value3', 60);
      
      const count = cacheManager.invalidatePattern('user:123:*');
      
      expect(count).toBe(2);
      expect(cacheManager.get('user:123:data')).toBeNull();
      expect(cacheManager.get('user:123:profile')).toBeNull();
      expect(cacheManager.get('user:456:data')).toBe('value3');
    });

    it('deve invalidar por padrão com wildcard no meio', () => {
      cacheManager.set('dashboard:user:123', 'value1', 60);
      cacheManager.set('dashboard:user:456', 'value2', 60);
      cacheManager.set('stats:user:123', 'value3', 60);
      
      const count = cacheManager.invalidatePattern('dashboard:*');
      
      expect(count).toBe(2);
      expect(cacheManager.get('stats:user:123')).toBe('value3');
    });

    it('deve invalidar cache de usuário', () => {
      cacheManager.set('dashboard:123', 'value1', 60);
      cacheManager.set('transactions:123:page:1', 'value2', 60);
      cacheManager.set('accounts:123', 'value3', 60);
      cacheManager.set('dashboard:456', 'value4', 60);
      
      const count = invalidateUserCache('123');
      
      expect(count).toBe(3);
      expect(cacheManager.get('dashboard:456')).toBe('value4');
    });
  });

  describe('Estatísticas', () => {
    it('deve rastrear hits e misses', () => {
      cacheManager.set('key1', 'value1', 60);
      
      // Hit
      cacheManager.get('key1');
      cacheManager.get('key1');
      
      // Miss
      cacheManager.get('non-existent');
      
      const stats = cacheManager.getStats();
      
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });

    it('deve rastrear tamanho do cache', () => {
      cacheManager.set('key1', 'value1', 60);
      cacheManager.set('key2', 'value2', 60);
      
      const stats = cacheManager.getStats();
      expect(stats.size).toBe(2);
    });

    it('deve resetar estatísticas ao limpar', () => {
      cacheManager.set('key1', 'value1', 60);
      cacheManager.get('key1');
      cacheManager.get('non-existent');
      
      cacheManager.clear();
      
      const stats = cacheManager.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getOrSet', () => {
    it('deve buscar do cache se existir', async () => {
      const factory = jest.fn().mockResolvedValue('computed-value');
      
      cacheManager.set('test-key', 'cached-value', 60);
      
      const result = await cacheManager.getOrSet('test-key', factory, 60);
      
      expect(result).toBe('cached-value');
      expect(factory).not.toHaveBeenCalled();
    });

    it('deve computar e cachear se não existir', async () => {
      const factory = jest.fn().mockResolvedValue('computed-value');
      
      const result = await cacheManager.getOrSet('test-key', factory, 60);
      
      expect(result).toBe('computed-value');
      expect(factory).toHaveBeenCalledTimes(1);
      expect(cacheManager.get('test-key')).toBe('computed-value');
    });

    it('deve recomputar após expiração', async () => {
      const factory = jest.fn()
        .mockResolvedValueOnce('value1')
        .mockResolvedValueOnce('value2');
      
      // Primeira chamada
      const result1 = await cacheManager.getOrSet('test-key', factory, 0.05); // 50ms
      expect(result1).toBe('value1');
      
      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Segunda chamada (deve recomputar)
      const result2 = await cacheManager.getOrSet('test-key', factory, 60);
      expect(result2).toBe('value2');
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe('CacheKeys', () => {
    it('deve gerar chave de dashboard', () => {
      const key = CacheKeys.dashboard('user-123');
      expect(key).toBe('dashboard:user-123');
    });

    it('deve gerar chave de transações', () => {
      const key = CacheKeys.transactions('user-123', 2);
      expect(key).toBe('transactions:user-123:page:2');
    });

    it('deve gerar chave de transações com filtros', () => {
      const key = CacheKeys.transactionsFiltered('user-123', {
        tipo: 'DESPESA',
        status: 'PAGO',
      });
      expect(key).toContain('transactions:user-123');
      expect(key).toContain('status:PAGO');
      expect(key).toContain('tipo:DESPESA');
    });

    it('deve gerar chaves consistentes para filtros', () => {
      const key1 = CacheKeys.transactionsFiltered('user-123', {
        tipo: 'DESPESA',
        status: 'PAGO',
      });
      
      const key2 = CacheKeys.transactionsFiltered('user-123', {
        status: 'PAGO',
        tipo: 'DESPESA',
      });
      
      expect(key1).toBe(key2);
    });

    it('deve gerar chave de estatísticas do dashboard', () => {
      const key = CacheKeys.dashboardStats('user-123', 'monthly');
      expect(key).toBe('dashboard:stats:user-123:monthly');
    });
  });

  describe('Limpeza Automática', () => {
    it('deve limpar entradas expiradas', async () => {
      cacheManager.set('key1', 'value1', 0.05); // 50ms
      cacheManager.set('key2', 'value2', 60);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cleaned = cacheManager.cleanup();
      
      expect(cleaned).toBe(1);
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBe('value2');
    });
  });

  describe('Tipos de Dados', () => {
    it('deve cachear objetos', () => {
      const obj = { name: 'Test', value: 123 };
      cacheManager.set('obj-key', obj, 60);
      
      const cached = cacheManager.get('obj-key');
      expect(cached).toEqual(obj);
    });

    it('deve cachear arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      cacheManager.set('arr-key', arr, 60);
      
      const cached = cacheManager.get('arr-key');
      expect(cached).toEqual(arr);
    });

    it('deve cachear valores primitivos', () => {
      cacheManager.set('string', 'test', 60);
      cacheManager.set('number', 123, 60);
      cacheManager.set('boolean', true, 60);
      
      expect(cacheManager.get('string')).toBe('test');
      expect(cacheManager.get('number')).toBe(123);
      expect(cacheManager.get('boolean')).toBe(true);
    });
  });
});
