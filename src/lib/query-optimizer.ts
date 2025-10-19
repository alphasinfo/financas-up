/**
 * Query Optimizer
 * Helpers para evitar N+1 queries e otimizar performance
 */

import { Prisma } from '@prisma/client';

/**
 * Selects otimizados para queries comuns
 * Busca apenas os campos necessários
 */
export const optimizedSelects = {
  /**
   * Transação com dados mínimos
   */
  transacaoMinima: {
    id: true,
    descricao: true,
    valor: true,
    tipo: true,
    status: true,
    dataCompetencia: true,
    categoria: {
      select: {
        id: true,
        nome: true,
        tipo: true,
        cor: true,
      },
    },
  } satisfies Prisma.TransacaoSelect,

  /**
   * Transação completa otimizada
   */
  transacaoCompleta: {
    id: true,
    descricao: true,
    valor: true,
    tipo: true,
    status: true,
    dataCompetencia: true,
    dataLiquidacao: true,
    parcelado: true,
    parcelaAtual: true,
    parcelaTotal: true,
    observacoes: true,
    categoria: {
      select: {
        id: true,
        nome: true,
        tipo: true,
        cor: true,
        icone: true,
      },
    },
    contaBancaria: {
      select: {
        id: true,
        nome: true,
        instituicao: true,
      },
    },
    cartaoCredito: {
      select: {
        id: true,
        nome: true,
        bandeira: true,
      },
    },
  } satisfies Prisma.TransacaoSelect,

  /**
   * Conta bancária mínima
   */
  contaMinima: {
    id: true,
    nome: true,
    instituicao: true,
    saldoAtual: true,
    ativa: true,
  } satisfies Prisma.ContaBancariaSelect,

  /**
   * Cartão de crédito mínimo
   */
  cartaoMinimo: {
    id: true,
    nome: true,
    bandeira: true,
    limiteTotal: true,
    limiteDisponivel: true,
    ativo: true,
  } satisfies Prisma.CartaoCreditoSelect,

  /**
   * Categoria mínima
   */
  categoriaMinima: {
    id: true,
    nome: true,
    tipo: true,
    cor: true,
    icone: true,
  } satisfies Prisma.CategoriaSelect,

  /**
   * Usuário público (sem dados sensíveis)
   */
  usuarioPublico: {
    id: true,
    nome: true,
    email: true,
    imagem: true,
  } satisfies Prisma.UsuarioSelect,
};

/**
 * Includes otimizados para evitar N+1
 */
export const optimizedIncludes = {
  /**
   * Transação com relações necessárias
   */
  transacaoComRelacoes: {
    categoria: {
      select: optimizedSelects.categoriaMinima,
    },
    contaBancaria: {
      select: optimizedSelects.contaMinima,
    },
    cartaoCredito: {
      select: optimizedSelects.cartaoMinimo,
    },
  } satisfies Prisma.TransacaoInclude,

  /**
   * Fatura com transações
   */
  faturaComTransacoes: {
    cartao: {
      select: optimizedSelects.cartaoMinimo,
    },
    transacoes: {
      select: optimizedSelects.transacaoMinima,
      orderBy: {
        dataCompetencia: 'desc' as const,
      },
    },
  } satisfies Prisma.FaturaInclude,

  /**
   * Empréstimo com parcelas
   */
  emprestimoComParcelas: {
    parcelas: {
      orderBy: {
        numeroParcela: 'asc' as const,
      },
      select: {
        id: true,
        numeroParcela: true,
        valor: true,
        dataVencimento: true,
        dataPagamento: true,
        status: true,
      },
    },
  } satisfies Prisma.EmprestimoInclude,
};

/**
 * Queries otimizadas comuns
 */
export const optimizedQueries = {
  /**
   * Buscar transações do mês com agregações
   */
  async transacoesDoMes(
    prisma: any,
    usuarioId: string,
    mesAno: { mes: number; ano: number }
  ) {
    const inicioMes = new Date(mesAno.ano, mesAno.mes - 1, 1);
    const fimMes = new Date(mesAno.ano, mesAno.mes, 0, 23, 59, 59);

    // Query única com agregação
    const [transacoes, totais] = await Promise.all([
      prisma.transacao.findMany({
        where: {
          usuarioId,
          dataCompetencia: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
        select: optimizedSelects.transacaoCompleta,
        orderBy: { dataCompetencia: 'desc' },
      }),
      prisma.transacao.groupBy({
        by: ['tipo', 'status'],
        where: {
          usuarioId,
          dataCompetencia: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
        _sum: {
          valor: true,
        },
        _count: true,
      }),
    ]);

    return { transacoes, totais };
  },

  /**
   * Dashboard otimizado com agregações
   */
  async dashboardData(prisma: any, usuarioId: string) {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const fimMes = new Date();
    fimMes.setMonth(fimMes.getMonth() + 1);
    fimMes.setDate(0);
    fimMes.setHours(23, 59, 59, 999);

    // Todas as queries em paralelo
    const [
      contasAggregate,
      cartoesAggregate,
      transacoesAggregate,
      transacoesRecentes,
      metas,
      emprestimos,
    ] = await Promise.all([
      // Agregação de contas
      prisma.contaBancaria.aggregate({
        where: { usuarioId, ativa: true },
        _sum: { saldoAtual: true, limiteCredito: true },
        _count: true,
      }),
      // Agregação de cartões
      prisma.cartaoCredito.aggregate({
        where: { usuarioId, ativo: true },
        _sum: { limiteTotal: true, limiteDisponivel: true },
        _count: true,
      }),
      // Agregação de transações do mês
      prisma.transacao.groupBy({
        by: ['tipo', 'status'],
        where: {
          usuarioId,
          dataCompetencia: { gte: inicioMes, lte: fimMes },
        },
        _sum: { valor: true },
        _count: true,
      }),
      // Transações recentes (apenas 10)
      prisma.transacao.findMany({
        where: { usuarioId },
        select: optimizedSelects.transacaoMinima,
        orderBy: { dataCompetencia: 'desc' },
        take: 10,
      }),
      // Metas ativas
      prisma.meta.findMany({
        where: { usuarioId, status: 'EM_ANDAMENTO' },
        select: {
          id: true,
          titulo: true,
          valorAlvo: true,
          valorAtual: true,
          dataPrazo: true,
        },
        take: 5,
      }),
      // Empréstimos ativos
      prisma.emprestimo.findMany({
        where: { usuarioId, status: 'ATIVO' },
        select: {
          id: true,
          instituicao: true,
          valorTotal: true,
          valorParcela: true,
          parcelasPagas: true,
          numeroParcelas: true,
        },
        take: 5,
      }),
    ]);

    return {
      contas: contasAggregate,
      cartoes: cartoesAggregate,
      transacoes: transacoesAggregate,
      transacoesRecentes,
      metas,
      emprestimos,
    };
  },
};

/**
 * Batch loader para evitar N+1
 * Útil quando não é possível usar include
 */
export class BatchLoader<K, V> {
  private cache = new Map<K, Promise<V>>();
  private batch: K[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(
    private loader: (keys: K[]) => Promise<V[]>,
    private batchDelay = 10
  ) {}

  async load(key: K): Promise<V> {
    const cached = this.cache.get(key);
    if (cached) return cached;

    const promise = new Promise<V>((resolve, reject) => {
      this.batch.push(key);

      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.executeBatch().then(
            (results) => {
              results.forEach((result, index) => {
                const batchKey = this.batch[index];
                const cachedPromise = this.cache.get(batchKey);
                if (cachedPromise) {
                  resolve(result);
                }
              });
            },
            (error) => reject(error)
          );
        }, this.batchDelay);
      }
    });

    this.cache.set(key, promise);
    return promise;
  }

  private async executeBatch(): Promise<V[]> {
    const currentBatch = [...this.batch];
    this.batch = [];
    this.batchTimeout = null;

    return this.loader(currentBatch);
  }
}

/**
 * Exemplo de uso do BatchLoader:
 * 
 * const categoriaLoader = new BatchLoader(async (ids: string[]) => {
 *   return prisma.categoria.findMany({
 *     where: { id: { in: ids } },
 *   });
 * });
 * 
 * // Em vez de N queries:
 * for (const transacao of transacoes) {
 *   const categoria = await prisma.categoria.findUnique({ where: { id: transacao.categoriaId } });
 * }
 * 
 * // Usar 1 query em batch:
 * for (const transacao of transacoes) {
 *   const categoria = await categoriaLoader.load(transacao.categoriaId);
 * }
 */
