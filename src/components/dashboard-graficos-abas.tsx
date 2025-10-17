"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, PiggyBank, HandCoins, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";

interface DashboardGraficosAbasProps {
  dados: any;
  metas: any[];
  orcamentos: any[];
  emprestimos: any[];
  investimentos: any[];
}

export function DashboardGraficosAbas({ dados, metas, orcamentos, emprestimos, investimentos }: DashboardGraficosAbasProps) {
  const [activeTab, setActiveTab] = useState("geral");

  const tabs = [
    { id: "geral", label: "Geral", icon: BarChart3 },
    { id: "bancos", label: "Bancos", icon: TrendingDown },
    { id: "cartoes", label: "Cartões", icon: PieChart },
    { id: "metas", label: "Metas", icon: Target },
    { id: "orcamentos", label: "Orçamentos", icon: PiggyBank },
    { id: "emprestimos", label: "Empréstimos", icon: HandCoins },
    { id: "investimentos", label: "Investimentos", icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === "geral" && <AbaGeral dados={dados} />}
        {activeTab === "bancos" && <AbaBancos dados={dados} />}
        {activeTab === "cartoes" && <AbaCartoes dados={dados} />}
        {activeTab === "metas" && <MetasGraficos metas={metas} />}
        {activeTab === "orcamentos" && <OrcamentosGraficos orcamentos={orcamentos} />}
        {activeTab === "emprestimos" && <EmprestimosGraficos emprestimos={emprestimos} />}
        {activeTab === "investimentos" && <InvestimentosGraficos investimentos={investimentos} />}
      </div>
    </div>
  );
}

// ============================================
// ABA GERAL
// ============================================
function AbaGeral({ dados }: { dados: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visão Geral Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Saldo Total</p>
              <p className="text-2xl font-bold text-blue-700">{formatarMoeda(dados.totalContas)}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Investido</p>
              <p className="text-2xl font-bold text-purple-600">{formatarMoeda(dados.totalInvestido)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-green-600 mb-1">Receitas (Mês)</p>
              <p className="text-xl font-bold text-green-600">{formatarMoeda(dados.receitasMes)}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-red-600 mb-1">Despesas (Mês)</p>
              <p className="text-xl font-bold text-red-600">{formatarMoeda(dados.despesasMes)}</p>
            </div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
            <p className="text-xs text-blue-600 mb-1">Saldo do Mês</p>
            <p className={`text-3xl font-bold ${dados.saldoMes >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatarMoeda(dados.saldoMes)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Resumo por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Contas Bancárias</span>
              <span className="font-bold">{dados.quantidadeContas}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cartões de Crédito</span>
              <span className="font-bold">{dados.quantidadeCartoes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Metas Ativas</span>
              <span className="font-bold">{dados.quantidadeMetas}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Empréstimos Ativos</span>
              <span className="font-bold">{dados.quantidadeEmprestimos}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Orçamentos</span>
              <span className="font-bold">{dados.quantidadeOrcamentos}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// ABA BANCOS
// ============================================
function AbaBancos({ dados }: { dados: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Resumo de Contas Bancárias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
            <p className="text-xs text-green-600 mb-1">Saldo Total</p>
            <p className="text-4xl font-bold text-green-700">{formatarMoeda(dados.totalContas)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-green-600 mb-1">Contas Ativas</p>
              <p className="text-2xl font-bold text-green-700">{dados.quantidadeContas}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-green-600 mb-1">Com Crédito Especial</p>
              <p className="text-2xl font-bold text-green-700">{dados.quantidadeContasComCredito}</p>
            </div>
          </div>

          {dados.quantidadeContasComCredito > 0 && (
            <div className="pt-3 border-t border-green-200">
              <p className="text-sm font-medium text-green-700 mb-2">Crédito Especial</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Limite</p>
                  <p className="font-bold text-sm">{formatarMoeda(dados.totalLimiteCredito)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Usado</p>
                  <p className="font-bold text-sm text-red-600">{formatarMoeda(dados.totalCreditoUsado)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Disponível</p>
                  <p className="font-bold text-sm text-green-600">{formatarMoeda(dados.totalCreditoDisponivel)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Movimentação do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Receitas</span>
              <span className="font-bold text-green-600">{formatarMoeda(dados.receitasMes)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Despesas</span>
              <span className="font-bold text-red-600">{formatarMoeda(dados.despesasMes)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600" 
                style={{ width: dados.receitasMes > 0 ? `${(dados.despesasMes / dados.receitasMes) * 100}%` : "0%" }} 
              />
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Saldo</span>
              <span className={`font-bold text-lg ${dados.saldoMes >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatarMoeda(dados.saldoMes)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// ABA CARTÕES
// ============================================
function AbaCartoes({ dados }: { dados: any }) {
  const percentualUtilizado = dados.limiteTotal > 0 ? (dados.limiteUtilizado / dados.limiteTotal) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-700 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Resumo de Cartões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-orange-600 mb-1">Cartões</p>
              <p className="text-2xl font-bold text-orange-700">{dados.quantidadeCartoes}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-orange-600 mb-1">Limite Total</p>
              <p className="text-xl font-bold text-orange-700">{formatarMoeda(dados.limiteTotal)}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-orange-600 mb-1">Utilizado</p>
              <p className="text-xl font-bold text-red-600">{formatarMoeda(dados.limiteUtilizado)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-orange-700">Utilização</span>
              <span className="font-bold text-orange-700">{percentualUtilizado.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-orange-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-600" style={{ width: `${Math.min(percentualUtilizado, 100)}%` }} />
            </div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border-2 border-orange-200">
            <p className="text-xs text-orange-600 mb-1">Limite Disponível</p>
            <p className="text-3xl font-bold text-green-600">{formatarMoeda(dados.limiteDisponivel)}</p>
          </div>

          {dados.totalParcelasCartao !== undefined && (
            <div className="pt-3 border-t border-orange-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-700">Parcelas do Mês</span>
                <span className="font-bold text-orange-700">{formatarMoeda(dados.totalParcelasCartao)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Limite Utilizado</span>
              <span className="font-bold text-red-600">{formatarMoeda(dados.limiteUtilizado)}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-600" style={{ width: `${percentualUtilizado}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Limite Disponível</span>
              <span className="font-bold text-green-600">{formatarMoeda(dados.limiteDisponivel)}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600" style={{ width: `${100 - percentualUtilizado}%` }} />
            </div>
          </div>

          <div className="pt-3 border-t">
            <p className="text-xs text-gray-600 mb-2">Status</p>
            <div className="flex items-center gap-2">
              {percentualUtilizado < 50 && (
                <span className="text-sm text-green-600 font-medium">✓ Uso saudável</span>
              )}
              {percentualUtilizado >= 50 && percentualUtilizado < 80 && (
                <span className="text-sm text-orange-600 font-medium">⚠ Atenção ao uso</span>
              )}
              {percentualUtilizado >= 80 && (
                <span className="text-sm text-red-600 font-medium">⚠ Limite quase esgotado</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// METAS - GRÁFICOS E ANÁLISES
// ============================================
function MetasGraficos({ metas }: { metas: any[] }) {
  const metasAtivas = metas.filter(m => m.status === "EM_ANDAMENTO");
  const metasConcluidas = metas.filter(m => m.status === "CONCLUIDA");
  const totalAlvo = metasAtivas.reduce((acc, m) => acc + m.valorAlvo, 0);
  const totalAtual = metasAtivas.reduce((acc, m) => acc + m.valorAtual, 0);
  const totalFalta = totalAlvo - totalAtual;
  const percentualGeral = totalAlvo > 0 ? (totalAtual / totalAlvo) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Card de Resumo */}
      <Card className="bg-pink-50 border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-700 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Resumo Geral de Metas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-pink-600 mb-1">Metas Ativas</p>
              <p className="text-3xl font-bold text-pink-700">{metasAtivas.length}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-pink-600 mb-1">Concluídas</p>
              <p className="text-3xl font-bold text-green-600">{metasConcluidas.length}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-pink-700">Progresso Total</span>
              <span className="font-bold text-pink-700">{percentualGeral.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-pink-200 rounded-full overflow-hidden">
              <div className="h-full bg-pink-600 transition-all" style={{ width: `${Math.min(percentualGeral, 100)}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-pink-200">
            <div className="text-center">
              <p className="text-xs text-pink-600">Meta Total</p>
              <p className="font-bold text-pink-700">{formatarMoeda(totalAlvo)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-pink-600">Economizado</p>
              <p className="font-bold text-green-600">{formatarMoeda(totalAtual)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-pink-600">Falta</p>
              <p className="font-bold text-orange-600">{formatarMoeda(totalFalta)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Metas Individuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Metas em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metasAtivas.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma meta ativa</p>
            ) : (
              metasAtivas.slice(0, 5).map((meta) => {
                const perc = (meta.valorAtual / meta.valorAlvo) * 100;
                return (
                  <div key={meta.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{meta.titulo}</span>
                      <span className="text-xs text-gray-600">{perc.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-600" style={{ width: `${Math.min(perc, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatarMoeda(meta.valorAtual)}</span>
                      <span>{formatarMoeda(meta.valorAlvo)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// ORÇAMENTOS - GRÁFICOS E ANÁLISES
// ============================================
function OrcamentosGraficos({ orcamentos }: { orcamentos: any[] }) {
  const totalLimite = orcamentos.reduce((acc, o) => acc + o.valorLimite, 0);
  const totalGasto = orcamentos.reduce((acc, o) => acc + o.valorGasto, 0);
  const totalDisponivel = totalLimite - totalGasto;
  const percentualGeral = totalLimite > 0 ? (totalGasto / totalLimite) * 100 : 0;
  const estourado = percentualGeral > 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Card de Resumo */}
      <Card className={estourado ? "bg-red-50 border-red-200" : "bg-teal-50 border-teal-200"}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${estourado ? "text-red-700" : "text-teal-700"}`}>
            <PieChart className="h-5 w-5" />
            Resumo de Orçamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className={`text-xs mb-1 ${estourado ? "text-red-600" : "text-teal-600"}`}>Total Orçado</p>
              <p className={`text-3xl font-bold ${estourado ? "text-red-700" : "text-teal-700"}`}>{formatarMoeda(totalLimite)}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className={`text-xs mb-1 ${estourado ? "text-red-600" : "text-teal-600"}`}>Total Gasto</p>
              <p className={`text-3xl font-bold ${estourado ? "text-red-700" : "text-orange-600"}`}>{formatarMoeda(totalGasto)}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={estourado ? "text-red-700" : "text-teal-700"}>Utilização</span>
              <span className={`font-bold ${estourado ? "text-red-700" : "text-teal-700"}`}>{percentualGeral.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${estourado ? "bg-red-600" : "bg-teal-600"}`} style={{ width: `${Math.min(percentualGeral, 100)}%` }} />
            </div>
          </div>

          <div className="text-center pt-3 border-t border-teal-200">
            <p className="text-xs text-teal-600">Disponível</p>
            <p className={`text-2xl font-bold ${totalDisponivel >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatarMoeda(Math.abs(totalDisponivel))}
              {totalDisponivel < 0 && " (excedido)"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Orçamentos Individuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Orçamentos por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orcamentos.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum orçamento cadastrado</p>
            ) : (
              orcamentos.slice(0, 5).map((orc) => {
                const perc = (orc.valorGasto / orc.valorLimite) * 100;
                const alerta = perc > 80;
                const excedido = perc > 100;
                return (
                  <div key={orc.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{orc.nome}</span>
                      <span className={`text-xs ${excedido ? "text-red-600 font-bold" : alerta ? "text-orange-600" : "text-gray-600"}`}>
                        {perc.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${excedido ? "bg-red-600" : alerta ? "bg-orange-500" : "bg-teal-600"}`} style={{ width: `${Math.min(perc, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatarMoeda(orc.valorGasto)}</span>
                      <span>{formatarMoeda(orc.valorLimite)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// EMPRÉSTIMOS - GRÁFICOS E ANÁLISES
// ============================================
function EmprestimosGraficos({ emprestimos }: { emprestimos: any[] }) {
  const emprestimosAtivos = emprestimos.filter(e => e.status === "ATIVO");
  const totalEmprestado = emprestimosAtivos.reduce((acc, e) => acc + e.valorTotal, 0);
  const totalPago = emprestimosAtivos.reduce((acc, e) => acc + (e.parcelasPagas * e.valorParcela), 0);
  const totalRestante = totalEmprestado - totalPago;
  const percentualPago = totalEmprestado > 0 ? (totalPago / totalEmprestado) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Card de Resumo */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-700 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Resumo de Empréstimos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-amber-600 mb-1">Empréstimos Ativos</p>
              <p className="text-3xl font-bold text-amber-700">{emprestimosAtivos.length}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-amber-600 mb-1">Total Emprestado</p>
              <p className="text-3xl font-bold text-amber-700">{formatarMoeda(totalEmprestado)}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-700">Progresso de Pagamento</span>
              <span className="font-bold text-amber-700">{percentualPago.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 transition-all" style={{ width: `${Math.min(percentualPago, 100)}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-amber-200">
            <div className="text-center">
              <p className="text-xs text-amber-600">Total Pago</p>
              <p className="font-bold text-green-600">{formatarMoeda(totalPago)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-amber-600">Saldo Devedor</p>
              <p className="font-bold text-red-600">{formatarMoeda(totalRestante)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Empréstimos Individuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progresso por Empréstimo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emprestimosAtivos.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum empréstimo ativo</p>
            ) : (
              emprestimosAtivos.slice(0, 5).map((emp) => {
                const perc = (emp.parcelasPagas / emp.numeroParcelas) * 100;
                return (
                  <div key={emp.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{emp.instituicao}</span>
                      <span className="text-xs text-gray-600">{emp.parcelasPagas}/{emp.numeroParcelas}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-600" style={{ width: `${Math.min(perc, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{perc.toFixed(0)}% pago</span>
                      <span>{formatarMoeda(emp.valorParcela)}/mês</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// INVESTIMENTOS - GRÁFICOS E ANÁLISES
// ============================================
function InvestimentosGraficos({ investimentos }: { investimentos: any[] }) {
  const totalAplicado = investimentos.reduce((acc, i) => acc + i.valorAplicado, 0);
  const totalAtual = investimentos.reduce((acc, i) => acc + (i.valorAtual || i.valorAplicado), 0);
  const rendimento = totalAtual - totalAplicado;
  const percentualRendimento = totalAplicado > 0 ? (rendimento / totalAplicado) * 100 : 0;

  // Agrupar por tipo
  const porTipo = investimentos.reduce((acc: any, inv) => {
    const tipo = inv.tipo || "Outros";
    if (!acc[tipo]) {
      acc[tipo] = { total: 0, count: 0 };
    }
    acc[tipo].total += inv.valorAtual || inv.valorAplicado;
    acc[tipo].count += 1;
    return acc;
  }, {});

  const tiposOrdenados = Object.entries(porTipo)
    .map(([tipo, data]: [string, any]) => ({ tipo, ...data }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Card de Resumo */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo de Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Total Aplicado</p>
              <p className="text-3xl font-bold text-purple-700">{formatarMoeda(totalAplicado)}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Valor Atual</p>
              <p className="text-3xl font-bold text-purple-700">{formatarMoeda(totalAtual)}</p>
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-200">
            <p className="text-xs text-purple-600 mb-1">Rendimento Total</p>
            <p className={`text-4xl font-bold ${rendimento >= 0 ? "text-green-600" : "text-red-600"}`}>
              {rendimento >= 0 ? "+" : ""}{formatarMoeda(rendimento)}
            </p>
            <p className={`text-lg font-bold mt-1 ${rendimento >= 0 ? "text-green-600" : "text-red-600"}`}>
              {rendimento >= 0 ? "+" : ""}{percentualRendimento.toFixed(2)}%
            </p>
          </div>

          <div className="text-center pt-3 border-t border-purple-200">
            <p className="text-xs text-purple-600">Total de Investimentos</p>
            <p className="text-2xl font-bold text-purple-700">{investimentos.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Distribuição por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tiposOrdenados.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum investimento cadastrado</p>
            ) : (
              tiposOrdenados.map(({ tipo, total, count }) => {
                const perc = totalAtual > 0 ? (total / totalAtual) * 100 : 0;
                return (
                  <div key={tipo} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{tipo}</span>
                      <span className="text-xs text-gray-600">{count} investimento(s)</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600" style={{ width: `${perc}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatarMoeda(total)}</span>
                      <span>{perc.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
