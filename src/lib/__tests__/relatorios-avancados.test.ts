import {
  compararMesesAMes,
  gerarPrevisoes,
  gerarInsights,
  gerarGraficoPatrimonial,
} from '../relatorios-avancados';
import { prisma } from '../prisma';

// Mock do Prisma
jest.mock('../prisma', () => ({
  prisma: {
    transacao: {
      groupBy: jest.fn(),
    },
    categoria: {
      findUnique: jest.fn(),
    },
    contaBancaria: {
      aggregate: jest.fn(),
    },
    investimento: {
      aggregate: jest.fn(),
    },
    emprestimo: {
      aggregate: jest.fn(),
    },
  },
}));

describe('Relatórios Avançados', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('compararMesesAMes', () => {
    it('deve retornar comparação de meses', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 5000 } },
        { tipo: 'DESPESA', status: 'PAGO', _sum: { valor: 3000 } },
      ]);

      const resultado = await compararMesesAMes(mockUserId, 3);

      expect(resultado).toHaveLength(3);
      expect(resultado[0]).toHaveProperty('mes');
      expect(resultado[0]).toHaveProperty('ano');
      expect(resultado[0]).toHaveProperty('receitas');
      expect(resultado[0]).toHaveProperty('despesas');
      expect(resultado[0]).toHaveProperty('saldo');
      expect(resultado[0]).toHaveProperty('economia');
    });

    it('deve calcular saldo corretamente', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 10000 } },
        { tipo: 'DESPESA', status: 'PAGO', _sum: { valor: 6000 } },
      ]);

      const resultado = await compararMesesAMes(mockUserId, 1);

      expect(resultado[0].receitas).toBe(10000);
      expect(resultado[0].despesas).toBe(6000);
      expect(resultado[0].saldo).toBe(4000);
    });

    it('deve calcular taxa de economia', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 10000 } },
        { tipo: 'DESPESA', status: 'PAGO', _sum: { valor: 7000 } },
      ]);

      const resultado = await compararMesesAMes(mockUserId, 1);

      expect(resultado[0].economia).toBe(30); // (3000/10000) * 100
    });

    it('deve retornar em ordem cronológica', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([]);

      const resultado = await compararMesesAMes(mockUserId, 3);

      expect(resultado).toHaveLength(3);
      // Primeiro item deve ser o mais antigo
      const primeiroMes = new Date(resultado[0].ano, 0, 1);
      const ultimoMes = new Date(resultado[2].ano, 0, 1);
      expect(primeiroMes.getTime()).toBeLessThanOrEqual(ultimoMes.getTime());
    });
  });

  describe('gerarPrevisoes', () => {
    it('deve gerar previsões futuras', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 5000 } },
        { tipo: 'DESPESA', status: 'PAGO', _sum: { valor: 3000 } },
      ]);

      const resultado = await gerarPrevisoes(mockUserId, 3);

      expect(resultado).toHaveLength(3);
      expect(resultado[0]).toHaveProperty('mes');
      expect(resultado[0]).toHaveProperty('ano');
      expect(resultado[0]).toHaveProperty('receitaPrevista');
      expect(resultado[0]).toHaveProperty('despesaPrevista');
      expect(resultado[0]).toHaveProperty('saldoPrevisto');
      expect(resultado[0]).toHaveProperty('confianca');
    });

    it('deve ter confiança entre 0 e 100', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 5000 } },
        { tipo: 'DESPESA', status: 'PAGO', _sum: { valor: 3000 } },
      ]);

      const resultado = await gerarPrevisoes(mockUserId, 3);

      resultado.forEach((previsao) => {
        expect(previsao.confianca).toBeGreaterThanOrEqual(0);
        expect(previsao.confianca).toBeLessThanOrEqual(100);
      });
    });

    it('deve gerar previsões mesmo sem histórico', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([]);

      const resultado = await gerarPrevisoes(mockUserId, 3);

      expect(resultado).toHaveLength(3);
      // Sem histórico, previsões devem ser zero
      expect(resultado[0].receitaPrevista).toBe(0);
      expect(resultado[0].despesaPrevista).toBe(0);
    });

    it('deve calcular saldo previsto', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 10000 } },
        { tipo: 'DESPESA', status: 'PAGO', _sum: { valor: 6000 } },
      ]);

      const resultado = await gerarPrevisoes(mockUserId, 1);

      expect(resultado[0].saldoPrevisto).toBe(
        resultado[0].receitaPrevista - resultado[0].despesaPrevista
      );
    });
  });

  describe('gerarInsights', () => {
    it('deve gerar insights financeiros', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 5000 } },
        { tipo: 'DESPESA', status: 'PAGO', _sum: { valor: 3000 } },
      ]);

      const resultado = await gerarInsights(mockUserId);

      expect(Array.isArray(resultado)).toBe(true);
      if (resultado.length > 0) {
        expect(resultado[0]).toHaveProperty('tipo');
        expect(resultado[0]).toHaveProperty('titulo');
        expect(resultado[0]).toHaveProperty('descricao');
      }
    });

    it('deve identificar crescimento de receita', async () => {
      (prisma.transacao.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 5000 } },
        ])
        .mockResolvedValueOnce([
          { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 6000 } },
        ])
        .mockResolvedValueOnce([
          { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 7000 } },
        ]);

      const resultado = await gerarInsights(mockUserId);

      const insightPositivo = resultado.find((i) => i.tipo === 'positivo');
      expect(insightPositivo).toBeDefined();
    });

    it('deve ter tipos válidos', async () => {
      (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
        { tipo: 'RECEITA', status: 'RECEBIDO', _sum: { valor: 5000 } },
        { tipo: 'DESPESA', status: 'PAGO', _sum: { valor: 3000 } },
      ]);

      const resultado = await gerarInsights(mockUserId);

      resultado.forEach((insight) => {
        expect(['positivo', 'negativo', 'neutro']).toContain(insight.tipo);
      });
    });
  });

  describe('gerarGraficoPatrimonial', () => {
    it('deve gerar dados para gráfico', async () => {
      (prisma.contaBancaria.aggregate as jest.Mock).mockResolvedValue({
        _sum: { saldoAtual: 10000 },
      });
      (prisma.investimento.aggregate as jest.Mock).mockResolvedValue({
        _sum: { valorAtual: 5000 },
      });
      (prisma.emprestimo.aggregate as jest.Mock).mockResolvedValue({
        _sum: { valorTotal: 2000 },
      });

      const resultado = await gerarGraficoPatrimonial(mockUserId, 6);

      expect(resultado).toHaveLength(6);
      expect(resultado[0]).toHaveProperty('mes');
      expect(resultado[0]).toHaveProperty('patrimonio');
    });

    it('deve calcular patrimônio líquido', async () => {
      (prisma.contaBancaria.aggregate as jest.Mock).mockResolvedValue({
        _sum: { saldoAtual: 10000 },
      });
      (prisma.investimento.aggregate as jest.Mock).mockResolvedValue({
        _sum: { valorAtual: 5000 },
      });
      (prisma.emprestimo.aggregate as jest.Mock).mockResolvedValue({
        _sum: { valorTotal: 2000 },
      });

      const resultado = await gerarGraficoPatrimonial(mockUserId, 1);

      // Patrimônio = Contas + Investimentos - Dívidas
      expect(resultado[0].patrimonio).toBe(13000); // 10000 + 5000 - 2000
    });

    it('deve retornar número correto de meses', async () => {
      (prisma.contaBancaria.aggregate as jest.Mock).mockResolvedValue({
        _sum: { saldoAtual: 0 },
      });
      (prisma.investimento.aggregate as jest.Mock).mockResolvedValue({
        _sum: { valorAtual: 0 },
      });
      (prisma.emprestimo.aggregate as jest.Mock).mockResolvedValue({
        _sum: { valorTotal: 0 },
      });

      const resultado = await gerarGraficoPatrimonial(mockUserId, 12);

      expect(resultado).toHaveLength(12);
    });
  });
});
