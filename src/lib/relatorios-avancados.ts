/**
 * Relatórios Avançados
 * Gráficos interativos, comparação mês a mês e previsões com IA
 */

import { prisma } from './prisma';
import { logger } from './logger-production';

export interface ComparacaoMensal {
  mes: string;
  ano: number;
  receitas: number;
  despesas: number;
  saldo: number;
  economia: number;
  crescimentoReceita: number;
  crescimentoDespesa: number;
}

export interface PrevisaoFinanceira {
  mes: string;
  ano: number;
  receitaPrevista: number;
  despesaPrevista: number;
  saldoPrevisto: number;
  confianca: number; // 0-100%
}

export interface InsightFinanceiro {
  tipo: 'positivo' | 'negativo' | 'neutro';
  titulo: string;
  descricao: string;
  valor?: number;
  categoria?: string;
  recomendacao?: string;
}

/**
 * Comparar dados financeiros mês a mês
 */
export async function compararMesesAMes(
  userId: string,
  mesesAtras: number = 6
): Promise<ComparacaoMensal[]> {
  try {
    logger.dev('Comparando meses para usuário:', userId);

    const comparacoes: ComparacaoMensal[] = [];
    const hoje = new Date();

    for (let i = 0; i < mesesAtras; i++) {
      const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const dataFim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0, 23, 59, 59);

      // Buscar transações do mês
      const transacoes = await prisma.transacao.groupBy({
        by: ['tipo', 'status'],
        where: {
          usuarioId: userId,
          dataCompetencia: {
            gte: dataInicio,
            lte: dataFim,
          },
        },
        _sum: {
          valor: true,
        },
      });

      const receitas = transacoes
        .filter((t) => t.tipo === 'RECEITA' && t.status === 'RECEBIDO')
        .reduce((acc, t) => acc + (t._sum.valor || 0), 0);

      const despesas = transacoes
        .filter((t) => t.tipo === 'DESPESA' && t.status === 'PAGO')
        .reduce((acc, t) => acc + (t._sum.valor || 0), 0);

      const saldo = receitas - despesas;
      const economia = receitas > 0 ? (saldo / receitas) * 100 : 0;

      // Calcular crescimento em relação ao mês anterior
      let crescimentoReceita = 0;
      let crescimentoDespesa = 0;

      if (i < mesesAtras - 1 && comparacoes.length > 0) {
        const mesAnterior = comparacoes[comparacoes.length - 1];
        crescimentoReceita = mesAnterior.receitas > 0
          ? ((receitas - mesAnterior.receitas) / mesAnterior.receitas) * 100
          : 0;
        crescimentoDespesa = mesAnterior.despesas > 0
          ? ((despesas - mesAnterior.despesas) / mesAnterior.despesas) * 100
          : 0;
      }

      comparacoes.push({
        mes: dataInicio.toLocaleDateString('pt-BR', { month: 'long' }),
        ano: dataInicio.getFullYear(),
        receitas,
        despesas,
        saldo,
        economia,
        crescimentoReceita,
        crescimentoDespesa,
      });
    }

    return comparacoes.reverse(); // Ordem cronológica
  } catch (error) {
    logger.error('Erro ao comparar meses:', error);
    throw new Error('Falha ao comparar meses');
  }
}

/**
 * Gerar previsões financeiras usando média móvel simples
 */
export async function gerarPrevisoes(
  userId: string,
  mesesFuturos: number = 3
): Promise<PrevisaoFinanceira[]> {
  try {
    logger.dev('Gerando previsões para usuário:', userId);

    // Buscar dados dos últimos 6 meses para calcular média
    const historico = await compararMesesAMes(userId, 6);

    if (historico.length === 0) {
      return [];
    }

    // Calcular médias
    const mediaReceitas = historico.reduce((acc, m) => acc + m.receitas, 0) / historico.length;
    const mediaDespesas = historico.reduce((acc, m) => acc + m.despesas, 0) / historico.length;

    // Calcular tendência (crescimento médio)
    const tendenciaReceita = historico.reduce((acc, m) => acc + m.crescimentoReceita, 0) / historico.length;
    const tendenciaDespesa = historico.reduce((acc, m) => acc + m.crescimentoDespesa, 0) / historico.length;

    // Calcular desvio padrão para confiança
    const desvioReceitas = Math.sqrt(
      historico.reduce((acc, m) => acc + Math.pow(m.receitas - mediaReceitas, 2), 0) / historico.length
    );
    const desvioDespesas = Math.sqrt(
      historico.reduce((acc, m) => acc + Math.pow(m.despesas - mediaDespesas, 2), 0) / historico.length
    );

    const previsoes: PrevisaoFinanceira[] = [];
    const hoje = new Date();

    for (let i = 1; i <= mesesFuturos; i++) {
      const dataFutura = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);

      // Aplicar tendência
      const receitaPrevista = mediaReceitas * (1 + (tendenciaReceita / 100) * i);
      const despesaPrevista = mediaDespesas * (1 + (tendenciaDespesa / 100) * i);
      const saldoPrevisto = receitaPrevista - despesaPrevista;

      // Calcular confiança (diminui com o tempo)
      const confiancaBase = 100 - (desvioReceitas / mediaReceitas) * 50 - (desvioDespesas / mediaDespesas) * 50;
      const confianca = Math.max(0, Math.min(100, confiancaBase - (i * 10)));

      previsoes.push({
        mes: dataFutura.toLocaleDateString('pt-BR', { month: 'long' }),
        ano: dataFutura.getFullYear(),
        receitaPrevista,
        despesaPrevista,
        saldoPrevisto,
        confianca: Math.round(confianca),
      });
    }

    return previsoes;
  } catch (error) {
    logger.error('Erro ao gerar previsões:', error);
    throw new Error('Falha ao gerar previsões');
  }
}

/**
 * Gerar insights financeiros com IA (regras baseadas em dados)
 */
export async function gerarInsights(userId: string): Promise<InsightFinanceiro[]> {
  try {
    logger.dev('Gerando insights para usuário:', userId);

    const insights: InsightFinanceiro[] = [];
    const comparacao = await compararMesesAMes(userId, 3);

    if (comparacao.length < 2) {
      return insights;
    }

    const mesAtual = comparacao[comparacao.length - 1];
    const mesAnterior = comparacao[comparacao.length - 2];

    // Insight 1: Crescimento de receita
    if (mesAtual.crescimentoReceita > 10) {
      insights.push({
        tipo: 'positivo',
        titulo: 'Receita em crescimento! 📈',
        descricao: `Suas receitas cresceram ${mesAtual.crescimentoReceita.toFixed(1)}% em relação ao mês anterior.`,
        valor: mesAtual.receitas,
        recomendacao: 'Continue assim! Considere investir o excedente.',
      });
    }

    // Insight 2: Aumento de despesas
    if (mesAtual.crescimentoDespesa > 15) {
      insights.push({
        tipo: 'negativo',
        titulo: 'Atenção: Despesas aumentaram 📊',
        descricao: `Suas despesas cresceram ${mesAtual.crescimentoDespesa.toFixed(1)}% em relação ao mês anterior.`,
        valor: mesAtual.despesas,
        recomendacao: 'Revise seus gastos e identifique onde pode economizar.',
      });
    }

    // Insight 3: Taxa de economia
    if (mesAtual.economia > 20) {
      insights.push({
        tipo: 'positivo',
        titulo: 'Excelente taxa de economia! 💰',
        descricao: `Você está economizando ${mesAtual.economia.toFixed(1)}% da sua receita.`,
        valor: mesAtual.saldo,
        recomendacao: 'Sua saúde financeira está ótima! Continue assim.',
      });
    } else if (mesAtual.economia < 10 && mesAtual.economia > 0) {
      insights.push({
        tipo: 'neutro',
        titulo: 'Taxa de economia pode melhorar 📊',
        descricao: `Você está economizando apenas ${mesAtual.economia.toFixed(1)}% da sua receita.`,
        valor: mesAtual.saldo,
        recomendacao: 'Tente economizar pelo menos 20% da sua receita mensal.',
      });
    }

    // Insight 4: Saldo negativo
    if (mesAtual.saldo < 0) {
      insights.push({
        tipo: 'negativo',
        titulo: 'Atenção: Saldo negativo! ⚠️',
        descricao: `Suas despesas superaram suas receitas em R$ ${Math.abs(mesAtual.saldo).toFixed(2)}.`,
        valor: mesAtual.saldo,
        recomendacao: 'Urgente: Revise seus gastos e busque aumentar sua receita.',
      });
    }

    // Insight 5: Buscar categoria com maior gasto
    const categoriasMaisGastas = await prisma.transacao.groupBy({
      by: ['categoriaId'],
      where: {
        usuarioId: userId,
        tipo: 'DESPESA',
        status: 'PAGO',
        dataCompetencia: {
          gte: new Date(mesAtual.ano, new Date().getMonth(), 1),
        },
      },
      _sum: {
        valor: true,
      },
      orderBy: {
        _sum: {
          valor: 'desc',
        },
      },
      take: 1,
    });

    if (categoriasMaisGastas.length > 0 && categoriasMaisGastas[0].categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: categoriasMaisGastas[0].categoriaId },
      });

      if (categoria) {
        const valorCategoria = categoriasMaisGastas[0]._sum.valor || 0;
        const percentual = mesAtual.despesas > 0 ? (valorCategoria / mesAtual.despesas) * 100 : 0;

        insights.push({
          tipo: 'neutro',
          titulo: `Maior gasto: ${categoria.nome} 🏷️`,
          descricao: `${percentual.toFixed(1)}% das suas despesas são em ${categoria.nome}.`,
          valor: valorCategoria,
          categoria: categoria.nome,
          recomendacao: percentual > 30 ? 'Considere reduzir gastos nesta categoria.' : undefined,
        });
      }
    }

    return insights;
  } catch (error) {
    logger.error('Erro ao gerar insights:', error);
    throw new Error('Falha ao gerar insights');
  }
}

/**
 * Gerar dados para gráfico de evolução patrimonial
 */
export async function gerarGraficoPatrimonial(
  userId: string,
  meses: number = 12
): Promise<{ mes: string; patrimonio: number }[]> {
  try {
    const dados: { mes: string; patrimonio: number }[] = [];
    const hoje = new Date();

    for (let i = meses - 1; i >= 0; i--) {
      const dataFim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);

      // Calcular patrimônio até esta data
      const [contas, investimentos, emprestimos] = await Promise.all([
        prisma.contaBancaria.aggregate({
          where: { usuarioId: userId, ativa: true },
          _sum: { saldoAtual: true },
        }),
        prisma.investimento.aggregate({
          where: { usuarioId: userId },
          _sum: { valorAtual: true },
        }),
        prisma.emprestimo.aggregate({
          where: { usuarioId: userId, status: 'ATIVO' },
          _sum: { valorTotal: true },
        }),
      ]);

      const totalContas = contas._sum.saldoAtual || 0;
      const totalInvestimentos = investimentos._sum.valorAtual || 0;
      const totalDividas = emprestimos._sum.valorTotal || 0;
      const patrimonio = totalContas + totalInvestimentos - totalDividas;

      dados.push({
        mes: dataFim.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        patrimonio,
      });
    }

    return dados;
  } catch (error) {
    logger.error('Erro ao gerar gráfico patrimonial:', error);
    throw new Error('Falha ao gerar gráfico patrimonial');
  }
}
