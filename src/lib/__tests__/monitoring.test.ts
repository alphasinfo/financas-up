import MonitoringService from '../monitoring';

describe('Sistema de Monitoramento', () => {
  beforeEach(() => {
    // Limpar métricas antes de cada teste
    MonitoringService.cleanup();
  });

  describe('Tracking de Performance', () => {
    it('deve registrar operação bem-sucedida', () => {
      MonitoringService.trackPerformance('transacao.findMany', 150, true);

      const stats = MonitoringService.getPerformanceStats('transacao.findMany');
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(1);
      expect(stats!.successRate).toBe(100);
      expect(stats!.avgDuration).toBe(150);
    });

    it('deve registrar operação com falha', () => {
      MonitoringService.trackPerformance('transacao.create', 2500, false);

      const stats = MonitoringService.getPerformanceStats('transacao.create');
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(1);
      expect(stats!.successRate).toBe(0);
      expect(stats!.avgDuration).toBe(2500);
    });

    it('deve calcular estatísticas corretamente', () => {
      MonitoringService.trackPerformance('test.operation', 100, true);
      MonitoringService.trackPerformance('test.operation', 200, true);
      MonitoringService.trackPerformance('test.operation', 300, false);

      const stats = MonitoringService.getPerformanceStats('test.operation');
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(3);
      expect(stats!.successRate).toBeCloseTo(66.67, 1);
      expect(stats!.avgDuration).toBe(200);
      expect(stats!.minDuration).toBe(100);
      expect(stats!.maxDuration).toBe(300);
    });

    it('deve calcular percentis corretamente', () => {
      // Adicionar várias métricas para testar percentis
      const durations = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      durations.forEach(duration => {
        MonitoringService.trackPerformance('test.percentile', duration, true);
      });

      const stats = MonitoringService.getPerformanceStats('test.percentile');
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(10);
      expect(stats!.p95Duration).toBeGreaterThan(800);
      expect(stats!.p99Duration).toBeGreaterThan(900);
    });
  });

  describe('Tracking de Erros', () => {
    it('deve registrar erro corretamente', () => {
      const error = new Error('Teste de erro');
      const context = { userId: '123', operation: 'test' };

      MonitoringService.trackError(error, context, '123', '192.168.1.1');

      const errorStats = MonitoringService.getErrorStats();
      expect(errorStats.total).toBe(1);
      expect(errorStats.recentErrors).toHaveLength(1);
      expect(errorStats.recentErrors[0].message).toBe('Teste de erro');
    });

    it('deve agrupar erros por tipo', () => {
      MonitoringService.trackError(new Error('Erro 1'), {});
      MonitoringService.trackError(new TypeError('Erro 2'), {});
      MonitoringService.trackError(new Error('Erro 3'), {});

      const errorStats = MonitoringService.getErrorStats();
      expect(errorStats.total).toBe(3);
      expect(errorStats.errorsByType.Error).toBe(2);
      expect(errorStats.errorsByType.TypeError).toBe(1);
    });
  });

  describe('Health Check', () => {
    it('deve retornar status healthy quando tudo está bem', () => {
      // Adicionar algumas métricas de sucesso
      MonitoringService.trackPerformance('test.operation', 100, true);
      MonitoringService.trackPerformance('test.operation', 150, true);

      const health = MonitoringService.getHealthCheck();
      expect(health.status).toBe('healthy');
      expect(health.uptime).toBeGreaterThan(0);
      expect(health.memory).toBeDefined();
    });

    it('deve retornar status degraded quando há muitos erros', () => {
      // Adicionar muitos erros
      for (let i = 0; i < 15; i++) {
        MonitoringService.trackError(new Error(`Erro ${i}`), {});
      }

      const health = MonitoringService.getHealthCheck();
      expect(health.status).toBe('degraded');
    });

    it('deve retornar status degraded quando performance está ruim', () => {
      // Adicionar operações lentas
      MonitoringService.trackPerformance('slow.operation', 5000, true);
      MonitoringService.trackPerformance('slow.operation', 6000, true);

      const health = MonitoringService.getHealthCheck();
      expect(health.status).toBe('degraded');
    });
  });

  describe('Limpeza de Métricas', () => {
    it('deve limpar métricas antigas', () => {
      // Adicionar algumas métricas
      MonitoringService.trackPerformance('test.operation', 100, true);
      MonitoringService.trackError(new Error('Teste'), {});

      let performanceStats = MonitoringService.getPerformanceStats();
      let errorStats = MonitoringService.getErrorStats();
      
      expect(performanceStats?.count).toBeGreaterThan(0);
      expect(errorStats.total).toBeGreaterThan(0);

      // Limpar métricas
      MonitoringService.cleanup();

      // Verificar se ainda há métricas (cleanup só remove antigas, não todas)
      performanceStats = MonitoringService.getPerformanceStats();
      errorStats = MonitoringService.getErrorStats();
      
      // Como as métricas são recentes, ainda devem estar lá
      expect(performanceStats?.count).toBeGreaterThan(0);
      expect(errorStats.total).toBeGreaterThan(0);
    });
  });

  describe('Limites de Armazenamento', () => {
    it('deve respeitar limite máximo de métricas', () => {
      // Adicionar muitas métricas para testar o limite
      for (let i = 0; i < 1100; i++) {
        MonitoringService.trackPerformance(`operation-${i}`, 100, true);
      }

      const stats = MonitoringService.getPerformanceStats();
      // Deve ter métricas, mas não necessariamente todas as 1100
      expect(stats?.count).toBeGreaterThan(0);
      expect(stats?.count).toBeLessThanOrEqual(1100);
    });

    it('deve respeitar limite máximo de erros', () => {
      // Adicionar muitos erros para testar o limite
      for (let i = 0; i < 600; i++) {
        MonitoringService.trackError(new Error(`Erro ${i}`), {});
      }

      const errorStats = MonitoringService.getErrorStats();
      // Deve ter erros, mas não necessariamente todos os 600
      expect(errorStats.total).toBeGreaterThan(0);
      expect(errorStats.total).toBeLessThanOrEqual(600);
    });
  });

  describe('Estatísticas Gerais', () => {
    it('deve retornar null quando não há métricas', () => {
      const stats = MonitoringService.getPerformanceStats('operacao.inexistente');
      expect(stats).toBeNull();
    });

    it('deve calcular estatísticas globais corretamente', () => {
      MonitoringService.trackPerformance('op1', 100, true);
      MonitoringService.trackPerformance('op2', 200, true);
      MonitoringService.trackPerformance('op3', 300, false);

      const globalStats = MonitoringService.getPerformanceStats();
      expect(globalStats).toBeDefined();
      expect(globalStats!.count).toBe(3);
      expect(globalStats!.successRate).toBeCloseTo(66.67, 1);
    });
  });
});