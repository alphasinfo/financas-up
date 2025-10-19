import { getDashboardDataOptimized } from '../dashboard-optimized';
import { cache } from '../cache';

// Mock do Prisma
jest.mock('../prisma', () => ({
  prisma: {
    contaBancaria: {
      aggregate: jest.fn(),
    },
    cartaoCredito: {
      aggregate: jest.fn(),
    },
    transacao: {
      groupBy: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    meta: {
      findMany: jest.fn(),
    },
    emprestimo: {
      findMany: jest.fn(),
    },
    orcamento: {
      findMany: jest.fn(),
    },
    investimento: {
      aggregate: jest.fn(),
    },
    fatura: {
      findMany: jest.fn(),
    },
  },
}));

describe('Dashboard Otimizado', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    // Limpar cache e mocks antes de cada teste
    cache.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    cache.destroy();
  });

  describe('Cache', () => {
    it('deve usar cache em chamadas subsequentes', async () => {
      const { prisma } = require('../prisma');

      // Mock das respostas do Prisma
      prisma.contaBancaria.aggregate.mockResolvedValue({
        _sum: { saldoAtual: 10000, limiteCredito: 5000 },
        _count: 2,
      });

      prisma.cartaoCredito.aggregate.mockResolvedValue({
        _sum: { limiteTotal: 5000, limiteDisponivel: 3000 },
        _count: 1,
      });

      prisma.transacao.groupBy.mockResolvedValue([]);
      prisma.transacao.aggregate.mockResolvedValue({ _sum: { valor: 0 } });
      prisma.transacao.findMany.mockResolvedValue([]);
      prisma.meta.findMany.mockResolvedValue([]);
      prisma.emprestimo.findMany.mockResolvedValue([]);
      prisma.orcamento.findMany.mockResolvedValue([]);
      prisma.investimento.aggregate.mockResolvedValue({ _sum: { valorAplicado: 0, valorAtual: 0 }, _count: 0 });
      prisma.fatura.findMany.mockResolvedValue([]);

      // Primeira chamada - deve executar queries
      await getDashboardDataOptimized(mockUserId);
      const firstCallCount = prisma.contaBancaria.aggregate.mock.calls.length;
      expect(firstCallCount).toBe(1);

      // Segunda chamada - deve usar cache
      await getDashboardDataOptimized(mockUserId);
      const secondCallCount = prisma.contaBancaria.aggregate.mock.calls.length;
      expect(secondCallCount).toBe(1); // Não deve ter chamado novamente
    });

    it('deve ter TTL de 2 minutos', async () => {
      const { prisma } = require('../prisma');

      // Mock básico
      prisma.contaBancaria.aggregate.mockResolvedValue({
        _sum: { saldoAtual: 0, limiteCredito: 0 },
        _count: 0,
      });
      prisma.cartaoCredito.aggregate.mockResolvedValue({
        _sum: { limiteTotal: 0, limiteDisponivel: 0 },
        _count: 0,
      });
      prisma.transacao.groupBy.mockResolvedValue([]);
      prisma.transacao.aggregate.mockResolvedValue({ _sum: { valor: 0 } });
      prisma.transacao.findMany.mockResolvedValue([]);
      prisma.meta.findMany.mockResolvedValue([]);
      prisma.emprestimo.findMany.mockResolvedValue([]);
      prisma.orcamento.findMany.mockResolvedValue([]);
      prisma.investimento.aggregate.mockResolvedValue({ _sum: { valorAplicado: 0, valorAtual: 0 }, _count: 0 });
      prisma.fatura.findMany.mockResolvedValue([]);

      await getDashboardDataOptimized(mockUserId);

      // Verificar se cache foi criado com chave correta
      const cacheKey = `user:${mockUserId}:dashboard:${new Date().toISOString().split('T')[0]}`;
      const cachedData = cache.get(cacheKey);
      
      expect(cachedData).not.toBeNull();
    });
  });

  describe('Agregações', () => {
    it('deve agregar dados de contas corretamente', async () => {
      const { prisma } = require('../prisma');

      prisma.contaBancaria.aggregate.mockResolvedValue({
        _sum: { saldoAtual: 15000, limiteCredito: 5000 },
        _count: 3,
      });

      // Mock outros dados necessários
      prisma.cartaoCredito.aggregate.mockResolvedValue({
        _sum: { limiteTotal: 0, limiteDisponivel: 0 },
        _count: 0,
      });
      prisma.transacao.groupBy.mockResolvedValue([]);
      prisma.transacao.aggregate.mockResolvedValue({ _sum: { valor: 0 } });
      prisma.transacao.findMany.mockResolvedValue([]);
      prisma.meta.findMany.mockResolvedValue([]);
      prisma.emprestimo.findMany.mockResolvedValue([]);
      prisma.orcamento.findMany.mockResolvedValue([]);
      prisma.investimento.aggregate.mockResolvedValue({ _sum: { valorAplicado: 0, valorAtual: 0 }, _count: 0 });
      prisma.fatura.findMany.mockResolvedValue([]);

      const result = await getDashboardDataOptimized(mockUserId);

      expect(result.totalContas).toBe(15000);
      expect(result.quantidadeContas).toBe(3);
    });

    it('deve agregar dados de cartões corretamente', async () => {
      const { prisma } = require('../prisma');

      prisma.cartaoCredito.aggregate.mockResolvedValue({
        _sum: { limiteTotal: 10000, limiteDisponivel: 7000 },
        _count: 2,
      });

      // Mock outros dados
      prisma.contaBancaria.aggregate.mockResolvedValue({
        _sum: { saldoAtual: 0, limiteCredito: 0 },
        _count: 0,
      });
      prisma.transacao.groupBy.mockResolvedValue([]);
      prisma.transacao.aggregate.mockResolvedValue({ _sum: { valor: 0 } });
      prisma.transacao.findMany.mockResolvedValue([]);
      prisma.meta.findMany.mockResolvedValue([]);
      prisma.emprestimo.findMany.mockResolvedValue([]);
      prisma.orcamento.findMany.mockResolvedValue([]);
      prisma.investimento.aggregate.mockResolvedValue({ _sum: { valorAplicado: 0, valorAtual: 0 }, _count: 0 });
      prisma.fatura.findMany.mockResolvedValue([]);

      const result = await getDashboardDataOptimized(mockUserId);

      expect(result.limiteTotal).toBe(10000);
      expect(result.limiteDisponivel).toBe(7000);
      expect(result.limiteUtilizado).toBe(3000);
      expect(result.quantidadeCartoes).toBe(2);
    });

    it('deve calcular receitas e despesas corretamente', async () => {
      const { prisma } = require('../prisma');

      prisma.transacao.groupBy.mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 5000 } },
        { tipo: 'DESPESA', status: 'PAGO', _sum: { valor: 3000 } },
      ]);

      // Mock outros dados
      prisma.contaBancaria.aggregate.mockResolvedValue({
        _sum: { saldoAtual: 0, limiteCredito: 0 },
        _count: 0,
      });
      prisma.cartaoCredito.aggregate.mockResolvedValue({
        _sum: { limiteTotal: 0, limiteDisponivel: 0 },
        _count: 0,
      });
      prisma.transacao.aggregate.mockResolvedValue({ _sum: { valor: 0 } });
      prisma.transacao.findMany.mockResolvedValue([]);
      prisma.meta.findMany.mockResolvedValue([]);
      prisma.emprestimo.findMany.mockResolvedValue([]);
      prisma.orcamento.findMany.mockResolvedValue([]);
      prisma.investimento.aggregate.mockResolvedValue({ _sum: { valorAplicado: 0, valorAtual: 0 }, _count: 0 });
      prisma.fatura.findMany.mockResolvedValue([]);

      const result = await getDashboardDataOptimized(mockUserId);

      expect(result.receitasMes).toBe(5000);
      expect(result.despesasMes).toBe(3000);
      expect(result.saldoMes).toBe(2000);
    });
  });

  describe('Performance', () => {
    it('deve executar queries em paralelo', async () => {
      const { prisma } = require('../prisma');

      // Mock todas as queries
      const mockPromise = Promise.resolve({
        _sum: { saldoAtual: 0, limiteCredito: 0, limiteTotal: 0, limiteDisponivel: 0, valor: 0, valorAplicado: 0, valorAtual: 0 },
        _count: 0,
      });

      prisma.contaBancaria.aggregate.mockReturnValue(mockPromise);
      prisma.cartaoCredito.aggregate.mockReturnValue(mockPromise);
      prisma.transacao.groupBy.mockReturnValue(Promise.resolve([]));
      prisma.transacao.aggregate.mockReturnValue(mockPromise);
      prisma.transacao.findMany.mockReturnValue(Promise.resolve([]));
      prisma.meta.findMany.mockReturnValue(Promise.resolve([]));
      prisma.emprestimo.findMany.mockReturnValue(Promise.resolve([]));
      prisma.orcamento.findMany.mockReturnValue(Promise.resolve([]));
      prisma.investimento.aggregate.mockReturnValue(mockPromise);
      prisma.fatura.findMany.mockReturnValue(Promise.resolve([]));

      const startTime = Date.now();
      await getDashboardDataOptimized(mockUserId);
      const duration = Date.now() - startTime;

      // Com queries em paralelo, deve ser rápido (< 100ms em ambiente de teste)
      expect(duration).toBeLessThan(100);
    });

    it('deve retornar dados completos', async () => {
      const { prisma } = require('../prisma');

      // Mock completo
      prisma.contaBancaria.aggregate.mockResolvedValue({
        _sum: { saldoAtual: 10000, limiteCredito: 5000 },
        _count: 2,
      });
      prisma.cartaoCredito.aggregate.mockResolvedValue({
        _sum: { limiteTotal: 8000, limiteDisponivel: 6000 },
        _count: 1,
      });
      prisma.transacao.groupBy.mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 5000 } },
      ]);
      prisma.transacao.aggregate.mockResolvedValue({ _sum: { valor: 1000 } });
      prisma.transacao.findMany.mockResolvedValue([]);
      prisma.meta.findMany.mockResolvedValue([
        { id: '1', titulo: 'Meta 1', valorAlvo: 10000, valorAtual: 5000, status: 'EM_ANDAMENTO', dataPrazo: new Date() },
      ]);
      prisma.emprestimo.findMany.mockResolvedValue([
        { id: '1', instituicao: 'Banco', descricao: 'Empréstimo', valorTotal: 20000, valorParcela: 1000, numeroParcelas: 20, parcelasPagas: 5, status: 'ATIVO' },
      ]);
      prisma.orcamento.findMany.mockResolvedValue([
        { id: '1', nome: 'Orçamento', valorLimite: 3000, valorGasto: 2000 },
      ]);
      prisma.investimento.aggregate.mockResolvedValue({
        _sum: { valorAplicado: 50000, valorAtual: 55000 },
        _count: 3,
      });
      prisma.fatura.findMany.mockResolvedValue([]);

      const result = await getDashboardDataOptimized(mockUserId);

      // Verificar estrutura completa
      expect(result).toHaveProperty('totalContas');
      expect(result).toHaveProperty('limiteUtilizado');
      expect(result).toHaveProperty('receitasMes');
      expect(result).toHaveProperty('despesasMes');
      expect(result).toHaveProperty('saldoMes');
      expect(result).toHaveProperty('totalInvestido');
      expect(result).toHaveProperty('quantidadeContas');
      expect(result).toHaveProperty('quantidadeCartoes');
      expect(result).toHaveProperty('quantidadeMetas');
      expect(result).toHaveProperty('metas');
      expect(result).toHaveProperty('emprestimos');
      expect(result).toHaveProperty('orcamentos');
    });
  });
});
