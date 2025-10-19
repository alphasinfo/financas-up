import { createBackup, BackupData } from '../backup';
import { prisma } from '../prisma';

// Mock do Prisma
jest.mock('../prisma', () => ({
  prisma: {
    contaBancaria: {
      findMany: jest.fn(),
    },
    cartaoCredito: {
      findMany: jest.fn(),
    },
    transacao: {
      findMany: jest.fn(),
    },
    categoria: {
      findMany: jest.fn(),
    },
    emprestimo: {
      findMany: jest.fn(),
    },
    investimento: {
      findMany: jest.fn(),
    },
    orcamento: {
      findMany: jest.fn(),
    },
    meta: {
      findMany: jest.fn(),
    },
  },
}));

describe('Sistema de Backup', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBackup', () => {
    it('deve criar backup com estrutura correta', async () => {
      // Mock dos dados
      (prisma.contaBancaria.findMany as jest.Mock).mockResolvedValue([
        { id: '1', nome: 'Conta 1', saldoAtual: 1000 },
      ]);
      (prisma.cartaoCredito.findMany as jest.Mock).mockResolvedValue([
        { id: '1', nome: 'Cartão 1', limiteTotal: 5000, faturas: [] },
      ]);
      (prisma.transacao.findMany as jest.Mock).mockResolvedValue([
        { id: '1', descricao: 'Transação 1', valor: 100, categoria: {} },
      ]);
      (prisma.categoria.findMany as jest.Mock).mockResolvedValue([
        { id: '1', nome: 'Categoria 1' },
      ]);
      (prisma.emprestimo.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.investimento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.orcamento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.meta.findMany as jest.Mock).mockResolvedValue([]);

      const backup = await createBackup(mockUserId);

      expect(backup).toHaveProperty('version');
      expect(backup).toHaveProperty('timestamp');
      expect(backup).toHaveProperty('userId');
      expect(backup).toHaveProperty('data');
      expect(backup).toHaveProperty('metadata');
      expect(backup.userId).toBe(mockUserId);
    });

    it('deve incluir todos os tipos de dados', async () => {
      // Mock dos dados
      (prisma.contaBancaria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.cartaoCredito.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.transacao.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.emprestimo.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.investimento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.orcamento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.meta.findMany as jest.Mock).mockResolvedValue([]);

      const backup = await createBackup(mockUserId);

      expect(backup.data).toHaveProperty('contas');
      expect(backup.data).toHaveProperty('cartoes');
      expect(backup.data).toHaveProperty('transacoes');
      expect(backup.data).toHaveProperty('categorias');
      expect(backup.data).toHaveProperty('emprestimos');
      expect(backup.data).toHaveProperty('investimentos');
      expect(backup.data).toHaveProperty('orcamentos');
      expect(backup.data).toHaveProperty('metas');
    });

    it('deve calcular metadata corretamente', async () => {
      // Mock dos dados
      (prisma.contaBancaria.findMany as jest.Mock).mockResolvedValue([{}, {}]);
      (prisma.cartaoCredito.findMany as jest.Mock).mockResolvedValue([{}]);
      (prisma.transacao.findMany as jest.Mock).mockResolvedValue([{}, {}, {}]);
      (prisma.categoria.findMany as jest.Mock).mockResolvedValue([{}]);
      (prisma.emprestimo.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.investimento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.orcamento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.meta.findMany as jest.Mock).mockResolvedValue([]);

      const backup = await createBackup(mockUserId);

      expect(backup.metadata.totalContas).toBe(2);
      expect(backup.metadata.totalCartoes).toBe(1);
      expect(backup.metadata.totalTransacoes).toBe(3);
      expect(backup.metadata.totalCategorias).toBe(1);
    });

    it('deve ter timestamp válido', async () => {
      // Mock dos dados
      (prisma.contaBancaria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.cartaoCredito.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.transacao.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.emprestimo.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.investimento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.orcamento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.meta.findMany as jest.Mock).mockResolvedValue([]);

      const backup = await createBackup(mockUserId);

      const timestamp = new Date(backup.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('deve ter versão definida', async () => {
      // Mock dos dados
      (prisma.contaBancaria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.cartaoCredito.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.transacao.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.emprestimo.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.investimento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.orcamento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.meta.findMany as jest.Mock).mockResolvedValue([]);

      const backup = await createBackup(mockUserId);

      expect(backup.version).toBe('1.0.0');
    });

    it('deve lançar erro em caso de falha', async () => {
      (prisma.contaBancaria.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(createBackup(mockUserId)).rejects.toThrow('Falha ao criar backup');
    });
  });

  describe('Estrutura do Backup', () => {
    it('deve ser serializável em JSON', async () => {
      // Mock dos dados
      (prisma.contaBancaria.findMany as jest.Mock).mockResolvedValue([
        { id: '1', nome: 'Conta 1' },
      ]);
      (prisma.cartaoCredito.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.transacao.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.emprestimo.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.investimento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.orcamento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.meta.findMany as jest.Mock).mockResolvedValue([]);

      const backup = await createBackup(mockUserId);
      const json = JSON.stringify(backup);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual(backup);
    });

    it('deve incluir relacionamentos (faturas, parcelas)', async () => {
      // Mock dos dados com relacionamentos
      (prisma.contaBancaria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.cartaoCredito.findMany as jest.Mock).mockResolvedValue([
        { id: '1', nome: 'Cartão', faturas: [{ id: 'f1', valor: 100 }] },
      ]);
      (prisma.transacao.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.emprestimo.findMany as jest.Mock).mockResolvedValue([
        { id: '1', valor: 10000, parcelas: [{ id: 'p1', valor: 500 }] },
      ]);
      (prisma.investimento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.orcamento.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.meta.findMany as jest.Mock).mockResolvedValue([]);

      const backup = await createBackup(mockUserId);

      expect(backup.data.cartoes[0]).toHaveProperty('faturas');
      expect(backup.data.emprestimos[0]).toHaveProperty('parcelas');
    });
  });
});
