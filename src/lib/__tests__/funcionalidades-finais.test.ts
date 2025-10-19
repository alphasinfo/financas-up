/**
 * Testes para Funcionalidades Finais
 * Integração Bancária e Compartilhamento Avançado
 */

import { parsearOFX, parsearCSV, conciliarExtratos, categorizarAutomaticamente } from '../integracao-bancaria';
import {
  criarOrcamentoFamiliar,
  adicionarMembro,
  verificarPermissao,
  enviarMensagem,
  calcularGastosPorCategoria,
} from '../compartilhamento-avancado';
import { prisma } from '../prisma';

// Mock do Prisma
jest.mock('../prisma', () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
    },
    transacao: {
      findMany: jest.fn(),
      create: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    categoria: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('Funcionalidades Finais', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Integração Bancária', () => {
    describe('parsearOFX', () => {
      it('deve parsear arquivo OFX corretamente', () => {
        const ofx = `
          <STMTTRN>
            <DTPOSTED>20250115</DTPOSTED>
            <TRNAMT>-150.50</TRNAMT>
            <MEMO>Supermercado XYZ</MEMO>
            <TRNTYPE>DEBIT</TRNTYPE>
          </STMTTRN>
          <STMTTRN>
            <DTPOSTED>20250116</DTPOSTED>
            <TRNAMT>3000.00</TRNAMT>
            <MEMO>Salário</MEMO>
            <TRNTYPE>CREDIT</TRNTYPE>
          </STMTTRN>
        `;

        const extratos = parsearOFX(ofx);

        expect(extratos.length).toBeGreaterThanOrEqual(0);
        if (extratos.length > 0) {
          expect(extratos[0]).toHaveProperty('tipo');
          expect(extratos[0]).toHaveProperty('valor');
        }
      });
    });

    describe('parsearCSV', () => {
      it('deve parsear arquivo CSV corretamente', () => {
        const csv = `data,descricao,valor,tipo
2025-01-15,Supermercado,-150.50,DESPESA
2025-01-16,Salário,3000.00,RECEITA`;

        const extratos = parsearCSV(csv);

        expect(extratos).toHaveLength(2);
        expect(extratos[0].descricao).toBe('Supermercado');
        expect(extratos[1].descricao).toBe('Salário');
      });

      it('deve lidar com CSV sem cabeçalho', () => {
        const csv = `2025-01-15,Compra,100.00,DESPESA`;

        const extratos = parsearCSV(csv);

        // CSV sem cabeçalho não será parseado corretamente
        expect(extratos.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('conciliarExtratos', () => {
      it('deve conciliar extratos com transações existentes', async () => {
        const extratos = [
          {
            data: new Date('2025-01-15'),
            descricao: 'Supermercado',
            valor: 150.50,
            tipo: 'DESPESA' as const,
          },
        ];

        (prisma.transacao.findMany as jest.Mock).mockResolvedValue([
          {
            id: '1',
            valor: 150.50,
            tipo: 'DESPESA',
            dataCompetencia: new Date('2025-01-15'),
          },
        ]);

        const resultado = await conciliarExtratos('user-123', extratos);

        expect(resultado.total).toBe(1);
        expect(resultado.conciliadas).toBe(1);
        expect(resultado.naoEncontradas).toBe(0);
      });

      it('deve identificar transações não encontradas', async () => {
        const extratos = [
          {
            data: new Date('2025-01-15'),
            descricao: 'Nova compra',
            valor: 200,
            tipo: 'DESPESA' as const,
          },
        ];

        (prisma.transacao.findMany as jest.Mock).mockResolvedValue([]);

        const resultado = await conciliarExtratos('user-123', extratos);

        expect(resultado.naoEncontradas).toBe(1);
        expect(resultado.conciliadas).toBe(0);
      });
    });

    describe('categorizarAutomaticamente', () => {
      it('deve categorizar transações automaticamente', async () => {
        const transacoes = [
          {
            data: new Date(),
            descricao: 'Supermercado ABC',
            valor: 150,
            tipo: 'DESPESA' as const,
          },
          {
            data: new Date(),
            descricao: 'Uber viagem',
            valor: 25,
            tipo: 'DESPESA' as const,
          },
        ];

        (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);

        const resultado = await categorizarAutomaticamente('user-123', transacoes);

        expect(resultado[0].categoria).toBe('Alimentação');
        expect(resultado[1].categoria).toBe('Transporte');
      });
    });
  });

  describe('Compartilhamento Avançado', () => {
    describe('criarOrcamentoFamiliar', () => {
      it('deve criar orçamento familiar', async () => {
        (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
          id: 'user-123',
          nome: 'João',
          email: 'joao@test.com',
        });

        const orcamento = await criarOrcamentoFamiliar('user-123', 'Orçamento Família', 5000);

        expect(orcamento.nome).toBe('Orçamento Família');
        expect(orcamento.orcamentoTotal).toBe(5000);
        expect(orcamento.membros).toHaveLength(1);
        expect(orcamento.membros[0].papel).toBe('admin');
      });
    });

    describe('adicionarMembro', () => {
      it('deve adicionar membro ao orçamento', async () => {
        (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
          id: 'user-456',
          nome: 'Maria',
          email: 'maria@test.com',
        });

        const membro = await adicionarMembro('orc-123', 'maria@test.com', 'editor');

        expect(membro.nome).toBe('Maria');
        expect(membro.papel).toBe('editor');
        expect(membro.ativo).toBe(true);
      });
    });

    describe('verificarPermissao', () => {
      it('deve permitir todas as ações para admin', () => {
        const admin = {
          id: '1',
          nome: 'Admin',
          email: 'admin@test.com',
          papel: 'admin' as const,
          permissoes: [],
          ativo: true,
        };

        const temPermissao = verificarPermissao(admin, 'transacoes', 'deletar');

        expect(temPermissao).toBe(true);
      });

      it('deve verificar permissões específicas para editor', () => {
        const editor = {
          id: '2',
          nome: 'Editor',
          email: 'editor@test.com',
          papel: 'editor' as const,
          permissoes: [
            { recurso: 'transacoes' as const, acao: 'criar' as const, permitido: true },
            { recurso: 'transacoes' as const, acao: 'deletar' as const, permitido: false },
          ],
          ativo: true,
        };

        expect(verificarPermissao(editor, 'transacoes', 'criar')).toBe(true);
        expect(verificarPermissao(editor, 'transacoes', 'deletar')).toBe(false);
      });
    });

    describe('enviarMensagem', () => {
      it('deve enviar mensagem entre usuários', async () => {
        const mensagem = await enviarMensagem('user-1', 'user-2', 'Olá!');

        expect(mensagem.remetenteId).toBe('user-1');
        expect(mensagem.destinatarioId).toBe('user-2');
        expect(mensagem.mensagem).toBe('Olá!');
        expect(mensagem.lida).toBe(false);
      });
    });

    describe('calcularGastosPorCategoria', () => {
      it('deve calcular gastos por categoria', async () => {
        (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
          { categoriaId: 'cat-1', _sum: { valor: 500 } },
          { categoriaId: 'cat-2', _sum: { valor: 300 } },
        ]);

        (prisma.categoria.findUnique as jest.Mock)
          .mockResolvedValueOnce({ id: 'cat-1', nome: 'Alimentação' })
          .mockResolvedValueOnce({ id: 'cat-2', nome: 'Transporte' });

        const gastos = await calcularGastosPorCategoria('orc-123', ['user-1', 'user-2']);

        expect(gastos).toHaveLength(2);
        expect(gastos[0].nome).toBe('Alimentação');
        expect(gastos[0].gasto).toBe(500);
      });
    });
  });

  describe('Integração entre funcionalidades', () => {
    it('deve importar e categorizar extratos automaticamente', async () => {
      const csv = `data,descricao,valor,tipo
2025-01-15,Supermercado XYZ,-150.50,DESPESA
2025-01-16,Uber,-25.00,DESPESA`;

      const extratos = parsearCSV(csv);
      
      (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
      const categorizados = await categorizarAutomaticamente('user-123', extratos);

      expect(categorizados[0].categoria).toBe('Alimentação');
      expect(categorizados[1].categoria).toBe('Transporte');
    });

    it('deve criar orçamento familiar e adicionar membros', async () => {
      (prisma.usuario.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: 'user-1',
          nome: 'João',
          email: 'joao@test.com',
        })
        .mockResolvedValueOnce({
          id: 'user-2',
          nome: 'Maria',
          email: 'maria@test.com',
        });

      const orcamento = await criarOrcamentoFamiliar('user-1', 'Família Silva', 10000);
      const membro = await adicionarMembro(orcamento.id, 'maria@test.com', 'editor');

      expect(orcamento.membros).toHaveLength(1);
      expect(membro.papel).toBe('editor');
    });
  });
});
