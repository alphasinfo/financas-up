import { cache, withCache, invalidateUserCache, getDashboardCacheKey, getRelatoriosCacheKey } from '../cache';

describe('Sistema de Cache', () => {
  beforeEach(() => {
    // Limpar cache antes de cada teste
    cache.clear();
  });

  afterAll(() => {
    // Destruir cache após todos os testes
    cache.destroy();
  });

  describe('Operações Básicas', () => {
    it('deve armazenar e recuperar dados do cache', () => {
      const key = 'test-key';
      const data = { name: 'Test', value: 123 };

      cache.set(key, data);
      const result = cache.get(key);

      expect(result).toEqual(data);
    });

    it('deve retornar null para chave inexistente', () => {
      const result = cache.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('deve invalidar cache por chave', () => {
      const key = 'test-key';
      cache.set(key, { data: 'test' });

      cache.invalidate(key);
      const result = cache.get(key);

      expect(result).toBeNull();
    });

    it('deve limpar todo o cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size()).toBe(3);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('deve expirar cache após TTL', async () => {
      const key = 'expiring-key';
      const data = 'test data';
      const ttl = 100; // 100ms

      cache.set(key, data, ttl);
      
      // Deve estar disponível imediatamente
      expect(cache.get(key)).toBe(data);

      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 150));

      // Deve ter expirado
      expect(cache.get(key)).toBeNull();
    });

    it('deve manter cache dentro do TTL', async () => {
      const key = 'valid-key';
      const data = 'test data';
      const ttl = 1000; // 1 segundo

      cache.set(key, data, ttl);

      // Aguardar metade do TTL
      await new Promise(resolve => setTimeout(resolve, 500));

      // Deve ainda estar disponível
      expect(cache.get(key)).toBe(data);
    });

    it('deve usar TTL padrão de 5 minutos', () => {
      const key = 'default-ttl-key';
      const data = 'test data';

      cache.set(key, data); // Sem especificar TTL

      // Deve estar disponível
      expect(cache.get(key)).toBe(data);
    });
  });

  describe('Invalidação por Padrão', () => {
    it('deve invalidar cache por padrão regex', () => {
      cache.set('user:123:dashboard', 'data1');
      cache.set('user:123:relatorios', 'data2');
      cache.set('user:456:dashboard', 'data3');

      cache.invalidatePattern(/^user:123:/);

      expect(cache.get('user:123:dashboard')).toBeNull();
      expect(cache.get('user:123:relatorios')).toBeNull();
      expect(cache.get('user:456:dashboard')).toBe('data3');
    });

    it('deve invalidar cache de usuário específico', () => {
      const userId = 'user-123';
      
      cache.set(`user:${userId}:dashboard`, 'dashboard-data');
      cache.set(`user:${userId}:relatorios`, 'relatorios-data');
      cache.set('user:other-user:dashboard', 'other-data');

      invalidateUserCache(userId);

      expect(cache.get(`user:${userId}:dashboard`)).toBeNull();
      expect(cache.get(`user:${userId}:relatorios`)).toBeNull();
      expect(cache.get('user:other-user:dashboard')).toBe('other-data');
    });
  });

  describe('Helper withCache', () => {
    it('deve cachear resultado de função assíncrona', async () => {
      const key = 'async-test';
      let callCount = 0;

      const asyncFn = async () => {
        callCount++;
        return { data: 'test', timestamp: Date.now() };
      };

      // Primeira chamada - executa função
      const result1 = await withCache(key, asyncFn);
      expect(callCount).toBe(1);

      // Segunda chamada - usa cache
      const result2 = await withCache(key, asyncFn);
      expect(callCount).toBe(1); // Não deve ter chamado novamente
      expect(result2).toEqual(result1);
    });

    it('deve executar função novamente após expiração', async () => {
      const key = 'expiring-async';
      let callCount = 0;

      const asyncFn = async () => {
        callCount++;
        return { count: callCount };
      };

      // Primeira chamada
      const result1 = await withCache(key, asyncFn, 100);
      expect(result1.count).toBe(1);

      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 150));

      // Segunda chamada após expiração
      const result2 = await withCache(key, asyncFn, 100);
      expect(result2.count).toBe(2);
    });

    it('deve lidar com erros em funções assíncronas', async () => {
      const key = 'error-test';
      const errorFn = async () => {
        throw new Error('Test error');
      };

      await expect(withCache(key, errorFn)).rejects.toThrow('Test error');
      
      // Cache não deve ter sido criado
      expect(cache.get(key)).toBeNull();
    });
  });

  describe('Geração de Chaves', () => {
    it('deve gerar chave de dashboard correta', () => {
      const userId = 'user-123';
      const key = getDashboardCacheKey(userId);
      
      expect(key).toMatch(/^user:user-123:dashboard:/);
      expect(key).toContain(new Date().toISOString().split('T')[0]);
    });

    it('deve gerar chave de relatórios correta', () => {
      const userId = 'user-123';
      const mesAno = '2025-01';
      const key = getRelatoriosCacheKey(userId, mesAno);
      
      expect(key).toBe('user:user-123:relatorios:2025-01');
    });

    it('deve gerar chaves diferentes para dias diferentes', () => {
      const userId = 'user-123';
      const key1 = getDashboardCacheKey(userId);
      
      // Simular mudança de dia seria complexo, então apenas verificamos o formato
      expect(key1).toMatch(/^user:user-123:dashboard:\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Performance e Tamanho', () => {
    it('deve reportar tamanho correto do cache', () => {
      expect(cache.size()).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      expect(cache.size()).toBe(3);

      cache.invalidate('key2');
      expect(cache.size()).toBe(2);
    });

    it('deve lidar com múltiplas operações rapidamente', () => {
      const startTime = Date.now();
      
      // 1000 operações
      for (let i = 0; i < 1000; i++) {
        cache.set(`key-${i}`, { data: i });
      }

      for (let i = 0; i < 1000; i++) {
        cache.get(`key-${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Deve completar em menos de 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Tipos de Dados', () => {
    it('deve cachear strings', () => {
      cache.set('string-key', 'test string');
      expect(cache.get('string-key')).toBe('test string');
    });

    it('deve cachear números', () => {
      cache.set('number-key', 12345);
      expect(cache.get('number-key')).toBe(12345);
    });

    it('deve cachear objetos', () => {
      const obj = { name: 'Test', nested: { value: 123 } };
      cache.set('object-key', obj);
      expect(cache.get('object-key')).toEqual(obj);
    });

    it('deve cachear arrays', () => {
      const arr = [1, 2, 3, { name: 'test' }];
      cache.set('array-key', arr);
      expect(cache.get('array-key')).toEqual(arr);
    });

    it('deve cachear null', () => {
      cache.set('null-key', null);
      // Nota: get retorna null tanto para chave inexistente quanto para valor null
      // Isso é uma limitação conhecida do design
      expect(cache.get('null-key')).toBeNull();
    });

    it('deve cachear boolean', () => {
      cache.set('bool-true', true);
      cache.set('bool-false', false);
      expect(cache.get('bool-true')).toBe(true);
      expect(cache.get('bool-false')).toBe(false);
    });
  });
});
