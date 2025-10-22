/**
 * Testes do Sistema de Cache
 * 
 * Testa funcionalidades básicas de cache em memória
 * - Set/Get básico
 * - TTL (Time To Live)
 * - Invalidação
 * - Estatísticas
 */

import { cacheManager, CacheKeys } from '../../src/lib/cache-manager';

describe('Sistema de Cache', () => {
  beforeEach(() => {
    cacheManager.clear();
  });

  describe('Operações Básicas', () => {
    it('deve armazenar e recuperar valores', () => {
      const key = 'test-key';
      const value = { data: 'test-data' };

      cacheManager.set(key, value, 60);
      const retrieved = cacheManager.get(key);

      expect(retrieved).toEqual(value);
    });

    it('deve retornar null para chaves inexistentes', () => {
      const result = cacheManager.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('deve sobrescrever valores existentes', () => {
      const key = 'test-key';
      const value1 = { data: 'first' };
      const value2 = { data: 'second' };

      cacheManager.set(key, value1, 60);
      cacheManager.set(key, value2, 60);

      const result = cacheManager.get(key);
      expect(result).toEqual(value2);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('deve expirar valores após TTL', async () => {
      const key = 'expiring-key';
      const value = { data: 'expiring-data' };

      // TTL de 1 segundo
      cacheManager.set(key, value, 1);

      // Deve estar disponível imediatamente
      expect(cacheManager.get(key)).toEqual(value);

      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Deve ter expirado
      expect(cacheManager.get(key)).toBeNull();
    });

    it('deve aceitar TTL em segundos', () => {
      const key = 'ttl-key';
      const value = { data: 'ttl-data' };

      cacheManager.set(key, value, 3600); // 1 hora
      const result = cacheManager.get(key);

      expect(result).toEqual(value);
    });
  });

  describe('Invalidação', () => {
    it('deve invalidar por padrão simples', () => {
      cacheManager.set('user:123:data', { name: 'User 1' }, 60);
      cacheManager.set('user:456:data', { name: 'User 2' }, 60);
      cacheManager.set('product:789', { name: 'Product 1' }, 60);

      const invalidated = cacheManager.invalidatePattern('user:*');

      expect(invalidated).toBe(2);
      expect(cacheManager.get('user:123:data')).toBeNull();
      expect(cacheManager.get('user:456:data')).toBeNull();
      expect(cacheManager.get('product:789')).not.toBeNull();
    });

    it('deve invalidar por padrão complexo', () => {
      cacheManager.set('dashboard:user:123', { data: 1 }, 60);
      cacheManager.set('dashboard:user:456', { data: 2 }, 60);
      cacheManager.set('transactions:user:123', { data: 3 }, 60);

      const invalidated = cacheManager.invalidatePattern('*:user:123');

      expect(invalidated).toBe(2);
      expect(cacheManager.get('dashboard:user:123')).toBeNull();
      expect(cacheManager.get('transactions:user:123')).toBeNull();
      expect(cacheManager.get('dashboard:user:456')).not.toBeNull();
    });
  });

  describe('Estatísticas', () => {
    it('deve contar hits e misses', () => {
      const key = 'stats-key';
      const value = { data: 'stats-data' };

      // Miss
      cacheManager.get(key);

      // Set
      cacheManager.set(key, value, 60);

      // Hit
      cacheManager.get(key);
      cacheManager.get(key);

      const stats = cacheManager.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(66.67);
    });

    it('deve contar tamanho do cache', () => {
      cacheManager.set('key1', 'value1', 60);
      cacheManager.set('key2', 'value2', 60);
      cacheManager.set('key3', 'value3', 60);

      const stats = cacheManager.getStats();
      expect(stats.size).toBe(3);
    });
  });

  describe('getOrSet', () => {
    it('deve executar função se não estiver em cache', async () => {
      const key = 'getOrSet-key';
      const mockFn = jest.fn().mockResolvedValue({ data: 'computed' });

      const result = await cacheManager.getOrSet(key, mockFn, 60);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: 'computed' });
    });

    it('deve retornar valor do cache se existir', async () => {
      const key = 'getOrSet-cached';
      const cachedValue = { data: 'cached' };
      const mockFn = jest.fn().mockResolvedValue({ data: 'computed' });

      cacheManager.set(key, cachedValue, 60);
      const result = await cacheManager.getOrSet(key, mockFn, 60);

      expect(mockFn).not.toHaveBeenCalled();
      expect(result).toEqual(cachedValue);
    });
  });

  describe('CacheKeys', () => {
    it('deve gerar chave de dashboard', () => {
      const userId = 'user-123';
      const key = CacheKeys.dashboard(userId);
      expect(key).toBe('dashboard:user-123');
    });

    it('deve gerar chave de transações', () => {
      const userId = 'user-123';
      const page = 2;
      const key = CacheKeys.transactions(userId, page);
      expect(key).toBe('transactions:user-123:page:2');
    });

    it('deve gerar chave de transações com filtros', () => {
      const userId = 'user-123';
      const filters = { tipo: 'DESPESA', status: 'PAGO' };
      const key = CacheKeys.transactionsFiltered(userId, filters);
      expect(key).toBe('transactions:user-123:status:PAGO:tipo:DESPESA');
    });

    it('deve gerar chave de contas', () => {
      const userId = 'user-123';
      const key = CacheKeys.accounts(userId);
      expect(key).toBe('accounts:user-123');
    });

    it('deve gerar chave de cartões', () => {
      const userId = 'user-123';
      const key = CacheKeys.cards(userId);
      expect(key).toBe('cards:user-123');
    });
  });

  describe('Limpeza', () => {
    it('deve limpar todo o cache', () => {
      cacheManager.set('key1', 'value1', 60);
      cacheManager.set('key2', 'value2', 60);

      cacheManager.clear();

      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
      expect(cacheManager.getStats().size).toBe(0);
    });
  });

  describe('Tipos de Dados', () => {
    it('deve suportar objetos', () => {
      const obj = { name: 'Test', age: 30, active: true };
      cacheManager.set('object-key', obj, 60);
      expect(cacheManager.get('object-key')).toEqual(obj);
    });

    it('deve suportar arrays', () => {
      const arr = [1, 2, 3, 'test', { nested: true }];
      cacheManager.set('array-key', arr, 60);
      expect(cacheManager.get('array-key')).toEqual(arr);
    });

    it('deve suportar primitivos', () => {
      cacheManager.set('string-key', 'test string', 60);
      cacheManager.set('number-key', 42, 60);
      cacheManager.set('boolean-key', true, 60);

      expect(cacheManager.get('string-key')).toBe('test string');
      expect(cacheManager.get('number-key')).toBe(42);
      expect(cacheManager.get('boolean-key')).toBe(true);
    });
  });
});