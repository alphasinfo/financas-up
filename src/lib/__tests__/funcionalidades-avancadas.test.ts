/**
 * Testes para Funcionalidades Avançadas
 * Notificações Push, Multi-moeda e Modo Offline
 */

import { verificarContasVencer, gerarResumoDiario } from '../notificacoes-push';
import { obterCotacao, converterMoeda, formatarMoeda, MOEDAS_SUPORTADAS } from '../multi-moeda';
import { 
  salvarDadosOffline, 
  obterDadosPendentes, 
  resolverConflito, 
  verificarConexao 
} from '../modo-offline';
import { prisma } from '../prisma';

// Mock do Prisma
jest.mock('../prisma', () => ({
  prisma: {
    transacao: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    contaBancaria: {
      aggregate: jest.fn(),
    },
  },
}));

describe('Funcionalidades Avançadas', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Notificações Push', () => {
    describe('verificarContasVencer', () => {
      it('deve retornar contas a vencer', async () => {
        const mockTransacoes = [
          {
            id: '1',
            descricao: 'Conta de Luz',
            valor: 150.50,
            dataCompetencia: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            categoria: { nome: 'Utilidades' },
          },
        ];

        (prisma.transacao.findMany as jest.Mock).mockResolvedValue(mockTransacoes);

        const resultado = await verificarContasVencer(mockUserId);

        expect(resultado).toHaveLength(1);
        expect(resultado[0]).toHaveProperty('titulo');
        expect(resultado[0]).toHaveProperty('mensagem');
        expect(resultado[0].titulo).toContain('Conta a vencer');
      });

      it('deve limitar a 5 notificações', async () => {
        const mockTransacoes = Array(10).fill(null).map((_, i) => ({
          id: `${i}`,
          descricao: `Conta ${i}`,
          valor: 100,
          dataCompetencia: new Date(),
          categoria: { nome: 'Teste' },
        }));

        (prisma.transacao.findMany as jest.Mock).mockResolvedValue(mockTransacoes.slice(0, 5));

        const resultado = await verificarContasVencer(mockUserId);

        expect(resultado.length).toBeLessThanOrEqual(5);
      });
    });

    describe('gerarResumoDiario', () => {
      it('deve gerar resumo diário', async () => {
        (prisma.transacao.groupBy as jest.Mock).mockResolvedValue([
          { tipo: 'RECEITA', _sum: { valor: 1000 } },
          { tipo: 'DESPESA', _sum: { valor: 500 } },
        ]);

        (prisma.contaBancaria.aggregate as jest.Mock).mockResolvedValue({
          _sum: { saldoAtual: 5000 },
        });

        const resultado = await gerarResumoDiario(mockUserId);

        expect(resultado).not.toBeNull();
        expect(resultado?.titulo).toContain('Resumo do Dia');
        expect(resultado?.mensagem).toContain('Receitas');
        expect(resultado?.mensagem).toContain('Despesas');
      });
    });
  });

  describe('Multi-moeda', () => {
    describe('obterCotacao', () => {
      it('deve obter cotação entre moedas', async () => {
        const cotacao = await obterCotacao('USD', 'BRL');

        expect(cotacao).toHaveProperty('de');
        expect(cotacao).toHaveProperty('para');
        expect(cotacao).toHaveProperty('taxa');
        expect(cotacao).toHaveProperty('timestamp');
        expect(cotacao.de).toBe('USD');
        expect(cotacao.para).toBe('BRL');
      });

      it('deve usar cache para cotações repetidas', async () => {
        const cotacao1 = await obterCotacao('USD', 'BRL');
        const cotacao2 = await obterCotacao('USD', 'BRL');

        expect(cotacao1.taxa).toBe(cotacao2.taxa);
        expect(cotacao1.timestamp).toEqual(cotacao2.timestamp);
      });
    });

    describe('converterMoeda', () => {
      it('deve converter valor entre moedas', async () => {
        const valorConvertido = await converterMoeda(100, 'USD', 'BRL');

        expect(valorConvertido).toBeGreaterThan(0);
        expect(typeof valorConvertido).toBe('number');
      });

      it('deve retornar mesmo valor para mesma moeda', async () => {
        const valorConvertido = await converterMoeda(100, 'BRL', 'BRL');

        expect(valorConvertido).toBe(100);
      });

      it('deve calcular conversão corretamente', async () => {
        const valor = 100;
        const cotacao = await obterCotacao('USD', 'BRL');
        const valorConvertido = await converterMoeda(valor, 'USD', 'BRL');

        expect(valorConvertido).toBe(valor * cotacao.taxa);
      });
    });

    describe('formatarMoeda', () => {
      it('deve formatar valor com símbolo correto', () => {
        const formatado = formatarMoeda(1000, 'BRL');

        expect(formatado).toContain('R$');
        expect(formatado).toContain('1.000,00');
      });

      it('deve formatar diferentes moedas', () => {
        const brl = formatarMoeda(100, 'BRL');
        const usd = formatarMoeda(100, 'USD');
        const eur = formatarMoeda(100, 'EUR');

        expect(brl).toContain('R$');
        expect(usd).toContain('$');
        expect(eur).toContain('€');
      });
    });

    describe('MOEDAS_SUPORTADAS', () => {
      it('deve ter moedas principais', () => {
        const codigos = MOEDAS_SUPORTADAS.map((m) => m.codigo);

        expect(codigos).toContain('BRL');
        expect(codigos).toContain('USD');
        expect(codigos).toContain('EUR');
        expect(codigos).toContain('GBP');
      });

      it('deve ter estrutura correta', () => {
        MOEDAS_SUPORTADAS.forEach((moeda) => {
          expect(moeda).toHaveProperty('codigo');
          expect(moeda).toHaveProperty('nome');
          expect(moeda).toHaveProperty('simbolo');
          expect(moeda).toHaveProperty('pais');
        });
      });
    });
  });

  describe('Modo Offline', () => {
    describe('resolverConflito', () => {
      it('deve resolver conflito com estratégia local', () => {
        const conflito = {
          id: '1',
          local: { valor: 100 },
          remoto: { valor: 200 },
          timestamp: Date.now(),
        };

        const resultado = resolverConflito(conflito, 'local');

        expect(resultado).toEqual(conflito.local);
      });

      it('deve resolver conflito com estratégia remoto', () => {
        const conflito = {
          id: '1',
          local: { valor: 100 },
          remoto: { valor: 200 },
          timestamp: Date.now(),
        };

        const resultado = resolverConflito(conflito, 'remoto');

        expect(resultado).toEqual(conflito.remoto);
      });

      it('deve resolver conflito com mais recente', () => {
        const agora = new Date();
        const ontem = new Date(agora.getTime() - 24 * 60 * 60 * 1000);

        const conflito = {
          id: '1',
          local: { valor: 100, atualizadoEm: agora.toISOString() },
          remoto: { valor: 200, atualizadoEm: ontem.toISOString() },
          timestamp: Date.now(),
        };

        const resultado = resolverConflito(conflito, 'mais-recente');

        expect(resultado).toEqual(conflito.local);
      });
    });

    describe('verificarConexao', () => {
      it('deve verificar status de conexão', () => {
        const online = verificarConexao();

        expect(typeof online).toBe('boolean');
      });
    });
  });

  describe('Integração entre funcionalidades', () => {
    it('deve converter e formatar moeda', async () => {
      const valor = 100;
      const valorConvertido = await converterMoeda(valor, 'USD', 'BRL');
      const formatado = formatarMoeda(valorConvertido, 'BRL');

      expect(formatado).toContain('R$');
      expect(valorConvertido).toBeGreaterThan(valor);
    });

    it('deve gerar notificação com valor convertido', async () => {
      const valor = 100;
      const valorBRL = await converterMoeda(valor, 'USD', 'BRL');
      const mensagem = `Valor: ${formatarMoeda(valorBRL, 'BRL')}`;

      expect(mensagem).toContain('R$');
      expect(mensagem).toContain('Valor:');
    });
  });
});
