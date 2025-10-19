import { prisma } from "@/lib/prisma";
import { withCache, getDashboardCacheKey } from "@/lib/cache";

/**
 * Função otimizada para buscar dados do dashboard
 * - Usa cache com TTL de 2 minutos
 * - Queries otimizadas com select específico
 * - Agregações no banco de dados
 */
export async function getDashboardDataOptimized(usuarioId: string) {
  const cacheKey = getDashboardCacheKey(usuarioId);
  
  return withCache(cacheKey, async () => {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const fimMes = new Date();
    fimMes.setMonth(fimMes.getMonth() + 1);
    fimMes.setDate(0);
    fimMes.setHours(23, 59, 59, 999);

    const hoje = new Date();
    const daquiA7Dias = new Date();
    daquiA7Dias.setDate(daquiA7Dias.getDate() + 7);

    // Executar todas as queries em paralelo
    const [
      contasAggregate,
      cartoesAggregate,
      transacoesAggregate,
      transacoesCartaoAggregate,
      metasData,
      emprestimosData,
      orcamentosData,
      investimentosAggregate,
      proximosVencimentos,
      contasVencidas,
      faturasVencidas,
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
      }),

      // Agregação de transações de cartão
      prisma.transacao.aggregate({
        where: {
          usuarioId,
          cartaoCreditoId: { not: null },
          dataCompetencia: { gte: inicioMes, lte: fimMes },
        },
        _sum: { valor: true },
      }),

      // Metas (precisamos dos dados completos)
      prisma.meta.findMany({
        where: { usuarioId },
        select: {
          id: true,
          titulo: true,
          valorAlvo: true,
          valorAtual: true,
          status: true,
          dataPrazo: true,
        },
      }),

      // Empréstimos (precisamos dos dados completos)
      prisma.emprestimo.findMany({
        where: { usuarioId },
        select: {
          id: true,
          instituicao: true,
          descricao: true,
          valorTotal: true,
          valorParcela: true,
          numeroParcelas: true,
          parcelasPagas: true,
          status: true,
        },
      }),

      // Orçamentos
      prisma.orcamento.findMany({
        where: {
          usuarioId,
          mesReferencia: inicioMes.getMonth() + 1,
          anoReferencia: inicioMes.getFullYear(),
        },
        select: {
          id: true,
          nome: true,
          valorLimite: true,
          valorGasto: true,
        },
      }),

      // Agregação de investimentos
      prisma.investimento.aggregate({
        where: { usuarioId },
        _sum: { valorAplicado: true, valorAtual: true },
        _count: true,
      }),

      // Próximos vencimentos
      prisma.transacao.findMany({
        where: {
          usuarioId,
          status: { in: ["PENDENTE", "AGENDADO"] },
          dataCompetencia: { gte: hoje, lte: daquiA7Dias },
        },
        orderBy: { dataCompetencia: "asc" },
        take: 5,
        select: {
          id: true,
          descricao: true,
          valor: true,
          tipo: true,
          status: true,
          dataCompetencia: true,
          categoria: { select: { nome: true } },
        },
      }),

      // Contas vencidas
      prisma.transacao.findMany({
        where: {
          usuarioId,
          status: { in: ["PENDENTE", "AGENDADO"] },
          dataCompetencia: { lt: hoje },
          cartaoCreditoId: null,
        },
        orderBy: { dataCompetencia: "asc" },
        take: 10,
        select: {
          id: true,
          descricao: true,
          valor: true,
          tipo: true,
          status: true,
          dataCompetencia: true,
          categoria: { select: { nome: true } },
        },
      }),

      // Faturas vencidas
      prisma.fatura.findMany({
        where: {
          cartao: { usuarioId },
          status: { in: ["ABERTA", "FECHADA"] },
          dataVencimento: { lt: hoje },
        },
        include: {
          cartao: { select: { id: true, apelido: true } },
        },
        orderBy: { dataVencimento: "asc" },
        take: 10,
      }),
    ]);

    // Processar dados agregados
    const totalContas = contasAggregate._sum.saldoAtual || 0;
    const quantidadeContas = contasAggregate._count || 0;

    const limiteTotal = cartoesAggregate._sum.limiteTotal || 0;
    const limiteDisponivel = cartoesAggregate._sum.limiteDisponivel || 0;
    const limiteUtilizado = limiteTotal - limiteDisponivel;
    const quantidadeCartoes = cartoesAggregate._count || 0;

    const totalParcelasCartao = transacoesCartaoAggregate._sum.valor || 0;

    // Calcular receitas e despesas do mês
    let receitasMes = 0;
    let despesasMes = 0;

    transacoesAggregate.forEach((group) => {
      const valor = group._sum.valor || 0;
      if (
        group.tipo === "RECEITA" &&
        (group.status === "RECEBIDO" || group.status === "PAGO")
      ) {
        receitasMes += valor;
      } else if (
        group.tipo === "DESPESA" &&
        (group.status === "PAGO" || group.status === "RECEBIDO")
      ) {
        despesasMes += valor;
      }
    });

    const saldoMes = receitasMes - despesasMes;

    const totalInvestido = investimentosAggregate._sum.valorAplicado || 0;
    const quantidadeInvestimentos = investimentosAggregate._count || 0;

    // Processar metas
    const metasAtivas = metasData.filter((m) => m.status === "EM_ANDAMENTO");
    const totalMetas = metasAtivas.reduce((acc, meta) => acc + meta.valorAlvo, 0);
    const totalEconomizado = metasAtivas.reduce(
      (acc, meta) => acc + meta.valorAtual,
      0
    );

    // Processar empréstimos
    const emprestimosAtivos = emprestimosData.filter((e) => e.status === "ATIVO");
    const totalEmprestimos = emprestimosAtivos.reduce(
      (acc, emp) => acc + emp.valorTotal,
      0
    );
    const totalPagoEmprestimos = emprestimosAtivos.reduce(
      (acc, emp) => acc + emp.parcelasPagas * emp.valorParcela,
      0
    );
    const totalRestanteEmprestimos = totalEmprestimos - totalPagoEmprestimos;

    // Processar orçamentos
    const totalOrcado = orcamentosData.reduce(
      (acc, orc) => acc + orc.valorLimite,
      0
    );
    const totalGastoOrcamento = orcamentosData.reduce(
      (acc, orc) => acc + orc.valorGasto,
      0
    );

    return {
      totalContas,
      limiteUtilizado,
      limiteDisponivel,
      limiteTotal,
      totalParcelasCartao,
      receitasMes,
      despesasMes,
      saldoMes,
      totalInvestido,
      quantidadeContas,
      quantidadeCartoes,
      quantidadeMetas: metasData.length,
      proximosVencimentos,
      contasVencidas,
      faturasVencidas,
      totalLimiteCredito: contasAggregate._sum.limiteCredito || 0,
      totalCreditoUsado: 0, // Calculado depois se necessário
      totalCreditoDisponivel: 0, // Calculado depois se necessário
      quantidadeContasComCredito: 0, // Calculado depois se necessário
      totalMetas,
      totalEconomizado,
      metas: metasData,
      quantidadeEmprestimos: emprestimosData.length,
      totalEmprestimos,
      totalPagoEmprestimos,
      totalRestanteEmprestimos,
      emprestimos: emprestimosData,
      quantidadeOrcamentos: orcamentosData.length,
      totalOrcado,
      totalGastoOrcamento,
      orcamentos: orcamentosData,
      investimentos: [], // Não precisamos dos dados completos
      quantidadeInvestimentos,
    };
  }, 2 * 60 * 1000); // Cache de 2 minutos
}
