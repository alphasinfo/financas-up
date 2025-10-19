import { monitoring, monitorarQuery } from '../monitoring';

describe('Sistema de Monitoramento', () => {
  beforeEach(() => {
    // Resetar métricas antes de cada teste
    monitoring.reset();
  });

  describe('Monitoramento de Queries', () => {
    it('deve registrar query bem-sucedida', () => {
      monitoring.registrarQuery({
        nome: 'transacao.findMany',
        duracao: 150,
        sucesso: true,
        tentativas: 1,
        timestamp: new Date(),
      });

      const stats = monitoring.getEstatisticasQueries();
      expect(stats.total).toBe(1);
      expect(stats.sucesso).toBe(1);
      expect(stats.falhas).toBe(0);
      expect(stats.taxaSucesso).toBe(100);
    });

    it('deve registrar query com falha', () => {
      monitoring.registrarQuery({
        nome: 'transacao.create',
        duracao: 2500,
        sucesso: false,
        tentativas: 3,
        erro: 'Timeout',
        timestamp: new Date(),
      });

      const stats = monitoring.getEstatisticasQueries();
      expect(stats.total).toBe(1);
      expect(stats.sucesso).toBe(0);
      expect(stats.falhas).toBe(1);
      expect(stats.taxaSucesso).toBe(0);
    });

    it('deve registrar query com retry', () => {
      monitoring.registrarQuery({
        nome: 'transacao.update',
        duracao: 500,
        sucesso: true,
        tentativas: 2,
        timestamp: new Date(),
      });

      const stats = monitoring.getEstatisticasQueries();
      expect(stats.comRetry).toBe(1);
      expect(stats.taxaRetry).toBe(100);
    });

    it('deve calcular estatísticas corretamente', () => {
      // Adicionar várias queries
      monitoring.registrarQuery({
        nome: 'query1',
        duracao: 100,
        sucesso: true,
        tentativas: 1,
        timestamp: new Date(),
      });

      monitoring.registrarQuery({
        nome: 'query2',
        duracao: 200,
        sucesso: true,
        tentativas: 1,
        timestamp: new Date(),
      });

      monitoring.registrarQuery({
        nome: 'query3',
        duracao: 300,
        sucesso: false,
        tentativas: 3,
        erro: 'Erro',
        timestamp: new Date(),
      });

      const stats = monitoring.getEstatisticasQueries();
      expect(stats.total).toBe(3);
      expect(stats.sucesso).toBe(2);
      expect(stats.falhas).toBe(1);
      expect(stats.taxaSucesso).toBeCloseTo(66.67, 1);
      expect(stats.duracaoMedia).toBe(200);
      expect(stats.duracaoMax).toBe(300);
      expect(stats.duracaoMin).toBe(100);
    });

    it('deve retornar queries mais lentas', () => {
      monitoring.registrarQuery({
        nome: 'query-rapida',
        duracao: 50,
        sucesso: true,
        tentativas: 1,
        timestamp: new Date(),
      });

      monitoring.registrarQuery({
        nome: 'query-lenta',
        duracao: 5000,
        sucesso: true,
        tentativas: 1,
        timestamp: new Date(),
      });

      monitoring.registrarQuery({
        nome: 'query-media',
        duracao: 500,
        sucesso: true,
        tentativas: 1,
        timestamp: new Date(),
      });

      const lentas = monitoring.getQueriesLentas(2);
      expect(lentas).toHaveLength(2);
      expect(lentas[0].nome).toBe('query-lenta');
      expect(lentas[0].duracao).toBe(5000);
      expect(lentas[1].nome).toBe('query-media');
      expect(lentas[1].duracao).toBe(500);
    });

    it('deve retornar erros recentes', () => {
      monitoring.registrarQuery({
        nome: 'query-erro',
        duracao: 1000,
        sucesso: false,
        tentativas: 3,
        erro: 'Connection timeout',
        timestamp: new Date(),
      });

      const erros = monitoring.getErrosRecentes(10);
      expect(erros).toHaveLength(1);
      expect(erros[0].nome).toBe('query-erro');
      expect(erros[0].erro).toBe('Connection timeout');
      expect(erros[0].tentativas).toBe(3);
    });
  });

  describe('Monitoramento de APIs', () => {
    it('deve registrar API bem-sucedida', () => {
      monitoring.registrarAPI({
        rota: '/api/transacoes',
        metodo: 'GET',
        statusCode: 200,
        duracao: 350,
        timestamp: new Date(),
      });

      const stats = monitoring.getEstatisticasAPIs();
      expect(stats.total).toBe(1);
      expect(stats.sucesso).toBe(1);
      expect(stats.falhas).toBe(0);
      expect(stats.taxaSucesso).toBe(100);
    });

    it('deve registrar API com erro', () => {
      monitoring.registrarAPI({
        rota: '/api/transacoes',
        metodo: 'POST',
        statusCode: 500,
        duracao: 2000,
        erro: 'Erro interno',
        timestamp: new Date(),
      });

      const stats = monitoring.getEstatisticasAPIs();
      expect(stats.total).toBe(1);
      expect(stats.sucesso).toBe(0);
      expect(stats.falhas).toBe(1);
      expect(stats.taxaSucesso).toBe(0);
    });

    it('deve calcular top rotas', () => {
      // Adicionar várias chamadas
      monitoring.registrarAPI({
        rota: '/api/transacoes',
        metodo: 'GET',
        statusCode: 200,
        duracao: 100,
        timestamp: new Date(),
      });

      monitoring.registrarAPI({
        rota: '/api/transacoes',
        metodo: 'GET',
        statusCode: 200,
        duracao: 150,
        timestamp: new Date(),
      });

      monitoring.registrarAPI({
        rota: '/api/contas',
        metodo: 'GET',
        statusCode: 200,
        duracao: 80,
        timestamp: new Date(),
      });

      const stats = monitoring.getEstatisticasAPIs();
      expect(stats.topRotas).toHaveLength(2);
      expect(stats.topRotas[0].rota).toBe('/api/transacoes');
      expect(stats.topRotas[0].count).toBe(2);
      expect(stats.topRotas[1].rota).toBe('/api/contas');
      expect(stats.topRotas[1].count).toBe(1);
    });

    it('deve retornar APIs mais lentas', () => {
      monitoring.registrarAPI({
        rota: '/api/rapida',
        metodo: 'GET',
        statusCode: 200,
        duracao: 50,
        timestamp: new Date(),
      });

      monitoring.registrarAPI({
        rota: '/api/lenta',
        metodo: 'GET',
        statusCode: 200,
        duracao: 5000,
        timestamp: new Date(),
      });

      const lentas = monitoring.getAPIsLentas(1);
      expect(lentas).toHaveLength(1);
      expect(lentas[0].rota).toBe('/api/lenta');
      expect(lentas[0].duracao).toBe(5000);
    });
  });

  describe('monitorarQuery', () => {
    it('deve monitorar query bem-sucedida', async () => {
      const mockQuery = jest.fn().mockResolvedValue({ id: 1, nome: 'Teste' });

      const resultado = await monitorarQuery('teste.findOne', mockQuery, 1);

      expect(resultado).toEqual({ id: 1, nome: 'Teste' });
      expect(mockQuery).toHaveBeenCalledTimes(1);

      const stats = monitoring.getEstatisticasQueries();
      expect(stats.total).toBe(1);
      expect(stats.sucesso).toBe(1);
    });

    it('deve fazer retry em caso de falha', async () => {
      const mockQuery = jest
        .fn()
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({ id: 1, nome: 'Teste' });

      const resultado = await monitorarQuery('teste.findOne', mockQuery, 2);

      expect(resultado).toEqual({ id: 1, nome: 'Teste' });
      expect(mockQuery).toHaveBeenCalledTimes(2);

      const stats = monitoring.getEstatisticasQueries();
      expect(stats.total).toBe(1);
      expect(stats.sucesso).toBe(1);
      expect(stats.comRetry).toBe(1);
    });

    it('deve falhar após todas as tentativas', async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error('Erro permanente'));

      await expect(
        monitorarQuery('teste.findOne', mockQuery, 3)
      ).rejects.toThrow('Erro permanente');

      expect(mockQuery).toHaveBeenCalledTimes(3);

      const stats = monitoring.getEstatisticasQueries();
      expect(stats.total).toBe(1);
      expect(stats.sucesso).toBe(0);
      expect(stats.falhas).toBe(1);
    });
  });

  describe('Limpeza de métricas', () => {
    it('deve resetar todas as métricas', () => {
      monitoring.registrarQuery({
        nome: 'query1',
        duracao: 100,
        sucesso: true,
        tentativas: 1,
        timestamp: new Date(),
      });

      monitoring.registrarAPI({
        rota: '/api/test',
        metodo: 'GET',
        statusCode: 200,
        duracao: 100,
        timestamp: new Date(),
      });

      let statsQueries = monitoring.getEstatisticasQueries();
      let statsAPIs = monitoring.getEstatisticasAPIs();
      expect(statsQueries.total).toBe(1);
      expect(statsAPIs.total).toBe(1);

      monitoring.reset();

      statsQueries = monitoring.getEstatisticasQueries();
      statsAPIs = monitoring.getEstatisticasAPIs();
      expect(statsQueries.total).toBe(0);
      expect(statsAPIs.total).toBe(0);
    });

    it('deve limpar métricas antigas', () => {
      const dataAntiga = new Date();
      dataAntiga.setHours(dataAntiga.getHours() - 25); // 25 horas atrás

      const dataNova = new Date();

      monitoring.registrarQuery({
        nome: 'query-antiga',
        duracao: 100,
        sucesso: true,
        tentativas: 1,
        timestamp: dataAntiga,
      });

      monitoring.registrarQuery({
        nome: 'query-nova',
        duracao: 100,
        sucesso: true,
        tentativas: 1,
        timestamp: dataNova,
      });

      monitoring.limparMetricasAntigas();

      const stats = monitoring.getEstatisticasQueries();
      expect(stats.total).toBe(1);
    });
  });

  describe('Limites de métricas', () => {
    it('não deve exceder o limite máximo de métricas', () => {
      // Adicionar mais de 1000 métricas
      for (let i = 0; i < 1100; i++) {
        monitoring.registrarQuery({
          nome: `query-${i}`,
          duracao: 100,
          sucesso: true,
          tentativas: 1,
          timestamp: new Date(),
        });
      }

      const stats = monitoring.getEstatisticasQueries();
      expect(stats.total).toBeLessThanOrEqual(1000);
    });
  });
});
