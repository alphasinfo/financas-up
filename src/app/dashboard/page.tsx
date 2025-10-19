import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, TrendingUp, TrendingDown, DollarSign, Target, Plus, FileText, BarChart3, CheckCircle, Edit, Clock, PiggyBank, TrendingDownIcon } from "lucide-react";
import { DashboardGraficosAbas } from "@/components/dashboard-graficos-abas";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

// Desabilitar cache para sempre buscar dados atualizados
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Importar função otimizada com cache
import { getDashboardDataOptimized } from "@/lib/dashboard-optimized";

// Manter função antiga como fallback (comentada)
async function getDashboardDataLegacy(usuarioId: string) {
  // Buscar dados em paralelo para melhor performance
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const fimMes = new Date();
  fimMes.setMonth(fimMes.getMonth() + 1);
  fimMes.setDate(0);
  fimMes.setHours(23, 59, 59, 999);

  const [contas, cartoes, transacoesMes, transacoesCartao, metas, emprestimos, orcamentos, investimentos] = await Promise.all([
    prisma.contaBancaria.findMany({
      where: { usuarioId, ativa: true },
      select: { saldoAtual: true, temLimiteCredito: true, limiteCredito: true },
    }),
    prisma.cartaoCredito.findMany({
      where: { usuarioId, ativo: true },
      select: { limiteTotal: true, limiteDisponivel: true },
    }),
    prisma.transacao.findMany({
      where: {
        usuarioId,
        dataCompetencia: { gte: inicioMes, lte: fimMes },
      },
      select: { tipo: true, status: true, valor: true },
    }),
    // Buscar transações de cartão em paralelo
    prisma.transacao.findMany({
      where: {
        usuarioId,
        cartaoCreditoId: { not: null },
        dataCompetencia: { gte: inicioMes, lte: fimMes },
      },
      select: { valor: true },
    }),
    prisma.meta.findMany({
      where: { usuarioId },
      select: { id: true, titulo: true, valorAlvo: true, valorAtual: true, status: true, dataPrazo: true },
    }),
    prisma.emprestimo.findMany({
      where: { usuarioId },
      select: { id: true, instituicao: true, descricao: true, valorTotal: true, valorParcela: true, numeroParcelas: true, parcelasPagas: true, status: true },
    }),
    prisma.orcamento.findMany({
      where: {
        usuarioId,
        mesReferencia: inicioMes.getMonth() + 1,
        anoReferencia: inicioMes.getFullYear(),
      },
      select: { id: true, nome: true, valorLimite: true, valorGasto: true },
    }),
    prisma.investimento.findMany({
      where: { usuarioId },
      select: { id: true, nome: true, tipo: true, valorAplicado: true, valorAtual: true },
    }),
  ]);

  const totalContas = contas.reduce((acc: number, conta: any) => acc + conta.saldoAtual, 0);

  // Calcular crédito especial
  const contasComCredito = contas.filter((c: any) => c.temLimiteCredito);
  const totalLimiteCredito = contasComCredito.reduce((acc: number, conta: any) => acc + conta.limiteCredito, 0);
  const totalCreditoUsado = contasComCredito.reduce((acc: number, conta: any) => {
    return acc + Math.max(0, -conta.saldoAtual);
  }, 0);
  const totalCreditoDisponivel = contasComCredito.reduce((acc: number, conta: any) => {
    return acc + (conta.limiteCredito + Math.min(0, conta.saldoAtual));
  }, 0);

  const limiteTotal = cartoes.reduce((acc: number, cartao: any) => acc + cartao.limiteTotal, 0);
  const limiteDisponivel = cartoes.reduce((acc: number, cartao: any) => acc + cartao.limiteDisponivel, 0);
  const limiteUtilizado = limiteTotal - limiteDisponivel;

  // Calcular total de parcelas de cartão (já buscado no Promise.all)
  const totalParcelasCartao = transacoesCartao.reduce((acc: number, t: any) => acc + t.valor, 0);

  const receitasMes = transacoesMes
    .filter((t: any) => t.tipo === "RECEITA" && (t.status === "RECEBIDO" || t.status === "PAGO"))
    .reduce((acc: number, t: any) => acc + t.valor, 0);

  const despesasMes = transacoesMes
    .filter((t: any) => t.tipo === "DESPESA" && (t.status === "PAGO" || t.status === "RECEBIDO"))
    .reduce((acc: number, t: any) => acc + t.valor, 0);

  const saldoMes = receitasMes - despesasMes;

  const totalInvestido = investimentos.reduce((acc: number, inv: any) => acc + inv.valorAplicado, 0);

  const metasAtivas = metas.filter((m: any) => m.status === "EM_ANDAMENTO");
  const totalMetas = metasAtivas.reduce((acc: number, meta: any) => acc + meta.valorAlvo, 0);
  const totalEconomizado = metasAtivas.reduce((acc: number, meta: any) => acc + meta.valorAtual, 0);

  const emprestimosAtivos = emprestimos.filter((e: any) => e.status === "ATIVO");
  const totalEmprestimos = emprestimosAtivos.reduce((acc: number, emp: any) => acc + emp.valorTotal, 0);
  const totalPagoEmprestimos = emprestimosAtivos.reduce((acc: number, emp: any) => acc + (emp.parcelasPagas * emp.valorParcela), 0);
  const totalRestanteEmprestimos = totalEmprestimos - totalPagoEmprestimos;

  const totalOrcado = orcamentos.reduce((acc: number, orc: any) => acc + orc.valorLimite, 0);
  const totalGastoOrcamento = orcamentos.reduce((acc: number, orc: any) => acc + orc.valorGasto, 0);

  // Buscar próximos vencimentos (próximos 7 dias)
  const hoje = new Date();
  const daquiA7Dias = new Date();
  daquiA7Dias.setDate(daquiA7Dias.getDate() + 7);

  const proximosVencimentos = await prisma.transacao.findMany({
    where: {
      usuarioId,
      status: {
        in: ["PENDENTE", "AGENDADO"]
      },
      dataCompetencia: {
        gte: hoje,
        lte: daquiA7Dias,
      },
    },
    orderBy: { dataCompetencia: "asc" },
    take: 5,
    include: {
      categoria: true,
      contaBancaria: true,
      cartaoCredito: true,
    },
  });

  // Buscar contas vencidas (data anterior a hoje e status PENDENTE)
  // IMPORTANTE: Não incluir despesas de cartão, apenas faturas vencidas
  const contasVencidas = await prisma.transacao.findMany({
    where: {
      usuarioId,
      status: {
        in: ["PENDENTE", "AGENDADO"]
      },
      dataCompetencia: {
        lt: hoje,
      },
      // Excluir transações de cartão de crédito
      cartaoCreditoId: null,
    },
    orderBy: { dataCompetencia: "asc" },
    take: 10,
    include: {
      categoria: true,
      contaBancaria: true,
      cartaoCredito: true,
    },
  });

  // Buscar faturas vencidas de cartão
  const faturasVencidas = await prisma.fatura.findMany({
    where: {
      cartao: {
        usuarioId,
      },
      status: {
        in: ["ABERTA", "FECHADA"]
      },
      dataVencimento: {
        lt: hoje,
      },
    },
    include: {
      cartao: true,
    },
    orderBy: { dataVencimento: "asc" },
    take: 10,
  });

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
    quantidadeContas: contas.length,
    quantidadeCartoes: cartoes.length,
    quantidadeMetas: metas.length,
    proximosVencimentos,
    contasVencidas,
    faturasVencidas,
    // Crédito especial
    totalLimiteCredito,
    totalCreditoUsado,
    totalCreditoDisponivel,
    quantidadeContasComCredito: contasComCredito.length,
    // Metas
    totalMetas,
    totalEconomizado,
    metas,
    // Empréstimos
    quantidadeEmprestimos: emprestimos.length,
    totalEmprestimos,
    totalPagoEmprestimos,
    totalRestanteEmprestimos,
    emprestimos,
    // Orçamentos
    quantidadeOrcamentos: orcamentos.length,
    totalOrcado,
    totalGastoOrcamento,
    orcamentos,
    // Investimentos
    investimentos,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user) {
    notFound();
  }

  const dados = await getDashboardDataOptimized(session.user.id);

  const cards = [
    {
      titulo: "Saldo Total em Contas",
      valor: dados.totalContas,
      icone: Wallet,
      cor: "text-blue-600",
      bgCor: "bg-blue-50",
      descricao: `${dados.quantidadeContas} conta(s) ativa(s)`,
    },
    {
      titulo: "Limite Utilizado (Cartões)",
      valor: dados.limiteUtilizado,
      icone: CreditCard,
      cor: "text-orange-600",
      bgCor: "bg-orange-50",
      descricao: `${dados.quantidadeCartoes} cartão(ões) • Parcelas: ${formatarMoeda(dados.totalParcelasCartao)}`,
    },
    {
      titulo: "Receitas do Mês",
      valor: dados.receitasMes,
      icone: TrendingUp,
      cor: "text-green-600",
      bgCor: "bg-green-50",
      descricao: "Mês atual",
    },
    {
      titulo: "Despesas do Mês",
      valor: dados.despesasMes,
      icone: TrendingDown,
      cor: "text-red-600",
      bgCor: "bg-red-50",
      descricao: "Mês atual",
    },
    {
      titulo: "Saldo do Mês",
      valor: dados.saldoMes,
      icone: DollarSign,
      cor: dados.saldoMes >= 0 ? "text-green-600" : "text-red-600",
      bgCor: dados.saldoMes >= 0 ? "bg-green-50" : "bg-red-50",
      descricao: "Receitas - Despesas",
    },
    {
      titulo: "Total Investido",
      valor: dados.totalInvestido,
      icone: Target,
      cor: "text-purple-600",
      bgCor: "bg-purple-50",
      descricao: "Investimentos ativos",
      link: "/dashboard/investimentos",
    },
  ];

  // Adicionar cards de crédito especial se houver contas com crédito
  if (dados.quantidadeContasComCredito > 0) {
    cards.push({
      titulo: "Crédito Especial Disponível",
      valor: dados.totalCreditoDisponivel,
      icone: DollarSign,
      cor: "text-purple-600",
      bgCor: "bg-purple-50",
      descricao: `${dados.quantidadeContasComCredito} conta(s) com crédito`,
    });

    if (dados.totalCreditoUsado > 0) {
      cards.push({
        titulo: "Crédito Especial Usado",
        valor: dados.totalCreditoUsado,
        icone: CreditCard,
        cor: "text-red-600",
        bgCor: "bg-red-50",
        descricao: `De R$ ${formatarMoeda(dados.totalLimiteCredito)} disponíveis`,
      });
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header com Ações Rápidas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Visão geral das suas finanças</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/financeiro/nova-receita">
            <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
              <Plus className="h-4 w-4 mr-1" />
              Receita
            </Button>
          </Link>
          <Link href="/dashboard/financeiro/nova-despesa">
            <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200">
              <Plus className="h-4 w-4 mr-1" />
              Despesa
            </Button>
          </Link>
          <Link href="/dashboard/relatorios">
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" />
              Relatórios
            </Button>
          </Link>
          <Link href="/dashboard/financeiro">
            <Button size="sm" variant="outline">
              <BarChart3 className="h-4 w-4 mr-1" />
              Financeiro
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {cards.map((card, index) => {
          const Icon = card.icone;
          const cardLink = (card as any).link;
          
          const cardContent = (
            <Card className={cardLink ? "hover:shadow-lg transition-shadow cursor-pointer" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.titulo}
                </CardTitle>
                <div className={`${card.bgCor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${card.cor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(card.valor)}
                </div>
                <p className="text-xs text-gray-500 mt-1">{card.descricao}</p>
              </CardContent>
            </Card>
          );
          
          return cardLink ? (
            <Link key={index} href={cardLink} className="block">
              {cardContent}
            </Link>
          ) : (
            <div key={index}>
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Próximos Vencimentos e Contas Vencidas lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Próximos Vencimentos */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base md:text-lg text-blue-700 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximos Vencimentos (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dados.proximosVencimentos.length === 0 ? (
              <p className="text-sm text-blue-600">
                ✅ Nenhum vencimento nos próximos 7 dias
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dados.proximosVencimentos.map((transacao: any) => (
                  <div key={transacao.id} className="flex items-start justify-between p-3 bg-white rounded-lg border border-blue-200 hover:shadow-sm transition-shadow">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{transacao.descricao}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        📅 {new Date(transacao.dataCompetencia).toLocaleDateString('pt-BR')}
                        {transacao.categoria && ` • ${transacao.categoria.nome}`}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {transacao.status === 'AGENDADO' ? '🕐 Agendado' : '⏳ Pendente'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-2">
                      <p className={`text-sm font-bold whitespace-nowrap ${transacao.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                        {transacao.tipo === 'RECEITA' ? '+' : '-'}{formatarMoeda(transacao.valor)}
                      </p>
                      <div className="flex gap-1">
                        <Link href={`/dashboard/financeiro/editar/${transacao.id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        {transacao.tipo === 'RECEITA' ? (
                          <Link href={`/dashboard/financeiro/pagar/${transacao.id}`}>
                            <Button size="sm" className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Receber
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/dashboard/financeiro/pagar/${transacao.id}`}>
                            <Button size="sm" className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Pagar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contas Vencidas */}
        <Card className={`${(dados.contasVencidas.length + dados.faturasVencidas.length) > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <CardHeader>
            <CardTitle className={`text-base md:text-lg flex items-center gap-2 ${
              (dados.contasVencidas.length + dados.faturasVencidas.length) > 0 ? 'text-red-700' : 'text-green-700'
            }`}>
              {(dados.contasVencidas.length + dados.faturasVencidas.length) > 0 ? (
                <>
                  <span>⚠️</span> Contas Vencidas ({dados.contasVencidas.length + dados.faturasVencidas.length})
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" /> Nenhuma Conta Vencida
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(dados.contasVencidas.length + dados.faturasVencidas.length) === 0 ? (
              <p className="text-sm text-green-600">
                🎉 Parabéns! Você está em dia com suas contas.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {/* Faturas de Cartão Vencidas */}
                {dados.faturasVencidas.map((fatura: any) => (
                  <div key={`fatura-${fatura.id}`} className="flex items-start justify-between p-3 bg-white rounded-lg border border-red-200 hover:shadow-sm transition-shadow">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        💳 Fatura {fatura.cartao.apelido} - {fatura.mesReferencia}/{fatura.anoReferencia}
                      </p>
                      <p className="text-xs text-red-600 font-medium mt-1">
                        ⚠️ Venceu em: {new Date(fatura.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.floor((new Date().getTime() - new Date(fatura.dataVencimento).getTime()) / (1000 * 60 * 60 * 24))} dias de atraso
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-2">
                      <p className="text-sm font-bold whitespace-nowrap text-red-600">
                        -{formatarMoeda(fatura.valorTotal)}
                      </p>
                      <Link href={`/dashboard/cartoes/${fatura.cartaoId}`}>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-red-600 text-white hover:bg-red-700">
                          Pagar
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {/* Contas Normais Vencidas */}
                {dados.contasVencidas.map((transacao: any) => (
                  <div key={transacao.id} className="flex items-start justify-between p-3 bg-white rounded-lg border border-red-200 hover:shadow-sm transition-shadow">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{transacao.descricao}</p>
                      <p className="text-xs text-red-600 font-medium mt-1">
                        ⚠️ Venceu em: {new Date(transacao.dataCompetencia).toLocaleDateString('pt-BR')}
                        {transacao.categoria && ` • ${transacao.categoria.nome}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.floor((new Date().getTime() - new Date(transacao.dataCompetencia).getTime()) / (1000 * 60 * 60 * 24))} dias de atraso
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-2">
                      <p className={`text-sm font-bold whitespace-nowrap ${transacao.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                        {transacao.tipo === 'RECEITA' ? '+' : '-'}{formatarMoeda(transacao.valor)}
                      </p>
                      <div className="flex gap-1">
                        <Link href={`/dashboard/financeiro/editar/${transacao.id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        {transacao.tipo === 'RECEITA' ? (
                          <Link href={`/dashboard/financeiro/pagar/${transacao.id}`}>
                            <Button size="sm" className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Receber
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/dashboard/financeiro/pagar/${transacao.id}`}>
                            <Button size="sm" className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Pagar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cards Grandes de Metas e Orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Card de Metas */}
        <Card className="border-pink-200 bg-pink-50">
          <CardHeader>
            <CardTitle className="text-base md:text-lg text-pink-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Metas Financeiras
              </span>
              <Link href="/dashboard/metas">
                <Button size="sm" variant="outline" className="bg-white hover:bg-pink-100">
                  Ver Todas
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-pink-600 mb-1 truncate">Metas Ativas</p>
                <p className="text-xl md:text-2xl font-bold text-pink-700">{dados.quantidadeMetas}</p>
              </div>
              <div className="text-center overflow-hidden">
                <p className="text-xs text-pink-600 mb-1 truncate">Progresso Total</p>
                <p className="text-sm md:text-xl font-bold text-pink-700 truncate">{formatarMoeda(dados.totalEconomizado)}</p>
              </div>
              <div className="text-center overflow-hidden">
                <p className="text-xs text-pink-600 mb-1 truncate">Faltam</p>
                <p className="text-sm md:text-xl font-bold text-orange-600 truncate">{formatarMoeda(dados.totalMetas - dados.totalEconomizado)}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-pink-600 mb-1">
                <span>Progresso Geral</span>
                <span>{dados.totalMetas > 0 ? ((dados.totalEconomizado / dados.totalMetas) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="h-3 bg-pink-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-600 transition-all duration-300"
                  style={{ width: `${dados.totalMetas > 0 ? Math.min((dados.totalEconomizado / dados.totalMetas) * 100, 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-pink-600 mt-2">
                Meta Total: {formatarMoeda(dados.totalMetas)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Orçamentos */}
        <Card className={`${dados.totalGastoOrcamento <= dados.totalOrcado ? 'border-teal-200 bg-teal-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader>
            <CardTitle className={`text-base md:text-lg flex items-center justify-between ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'text-teal-700' : 'text-red-700'}`}>
              <span className="flex items-center gap-2">
                <TrendingDownIcon className="h-5 w-5" />
                Orçamentos do Mês
              </span>
              <Link href="/dashboard/orcamentos">
                <Button size="sm" variant="outline" className="bg-white hover:bg-teal-100">
                  Ver Todos
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-xs mb-1 ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'text-teal-600' : 'text-red-600'}`}>Orçamentos</p>
                <p className={`text-2xl font-bold ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'text-teal-700' : 'text-red-700'}`}>{dados.quantidadeOrcamentos}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs mb-1 ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'text-teal-600' : 'text-red-600'}`}>Total Gasto</p>
                <p className={`text-2xl font-bold ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'text-teal-700' : 'text-red-700'}`}>{formatarMoeda(dados.totalGastoOrcamento)}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs mb-1 ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'text-teal-600' : 'text-red-600'}`}>Disponível</p>
                <p className={`text-2xl font-bold ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarMoeda(Math.max(0, dados.totalOrcado - dados.totalGastoOrcamento))}
                </p>
              </div>
            </div>
            <div>
              <div className={`flex justify-between text-xs mb-1 ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'text-teal-600' : 'text-red-600'}`}>
                <span>Utilização</span>
                <span>{dados.totalOrcado > 0 ? ((dados.totalGastoOrcamento / dados.totalOrcado) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'bg-teal-200' : 'bg-red-200'}`}>
                <div
                  className={`h-full transition-all duration-300 ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'bg-teal-600' : 'bg-red-600'}`}
                  style={{ width: `${dados.totalOrcado > 0 ? Math.min((dados.totalGastoOrcamento / dados.totalOrcado) * 100, 100) : 0}%` }}
                />
              </div>
              <p className={`text-xs mt-2 ${dados.totalGastoOrcamento <= dados.totalOrcado ? 'text-teal-600' : 'text-red-600'}`}>
                Orçamento Total: {formatarMoeda(dados.totalOrcado)}
                {dados.totalGastoOrcamento > dados.totalOrcado && (
                  <span className="ml-2 font-medium">⚠️ Orçamento excedido!</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análises Gráficas com Abas */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Análises e Gráficos</h2>
        <DashboardGraficosAbas
          dados={dados}
          metas={dados.metas}
          orcamentos={dados.orcamentos}
          emprestimos={dados.emprestimos}
          investimentos={dados.investimentos}
        />
      </div>
    </div>
  );
}
