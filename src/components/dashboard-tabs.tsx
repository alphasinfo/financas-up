"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, PiggyBank, HandCoins, TrendingUp } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";

interface DashboardTabsProps {
  metas: any[];
  orcamentos: any[];
  emprestimos: any[];
  investimentos: any[];
}

export function DashboardTabs({ metas, orcamentos, emprestimos, investimentos }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("metas");

  const tabs = [
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
        {activeTab === "metas" && <MetasTab metas={metas} />}
        {activeTab === "orcamentos" && <OrcamentosTab orcamentos={orcamentos} />}
        {activeTab === "emprestimos" && <EmprestimosTab emprestimos={emprestimos} />}
        {activeTab === "investimentos" && <InvestimentosTab investimentos={investimentos} />}
      </div>
    </div>
  );
}

function MetasTab({ metas }: { metas: any[] }) {
  const metasAtivas = metas.filter(m => m.status === "EM_ANDAMENTO");
  const totalAlvo = metasAtivas.reduce((acc, m) => acc + m.valorAlvo, 0);
  const totalAtual = metasAtivas.reduce((acc, m) => acc + m.valorAtual, 0);
  const percentual = totalAlvo > 0 ? (totalAtual / totalAlvo) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo de Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Metas Ativas</p>
              <p className="text-2xl font-bold">{metasAtivas.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Economizado</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalAtual)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Meta Total</p>
              <p className="text-2xl font-bold">{formatarMoeda(totalAlvo)}</p>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-pink-600" style={{ width: `${Math.min(percentual, 100)}%` }} />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">{percentual.toFixed(1)}% alcançado</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metasAtivas.slice(0, 4).map((meta) => {
          const perc = (meta.valorAtual / meta.valorAlvo) * 100;
          return (
            <Card key={meta.id}>
              <CardHeader>
                <CardTitle className="text-base">{meta.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span className="font-bold">{perc.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-600" style={{ width: `${Math.min(perc, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{formatarMoeda(meta.valorAtual)}</span>
                    <span>{formatarMoeda(meta.valorAlvo)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function OrcamentosTab({ orcamentos }: { orcamentos: any[] }) {
  const totalLimite = orcamentos.reduce((acc, o) => acc + o.valorLimite, 0);
  const totalGasto = orcamentos.reduce((acc, o) => acc + o.valorGasto, 0);
  const percentual = totalLimite > 0 ? (totalGasto / totalLimite) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo de Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Orçamentos</p>
              <p className="text-2xl font-bold">{orcamentos.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Gasto</p>
              <p className="text-2xl font-bold text-orange-600">{formatarMoeda(totalGasto)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Limite</p>
              <p className="text-2xl font-bold">{formatarMoeda(totalLimite)}</p>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${percentual > 100 ? 'bg-red-600' : 'bg-teal-600'}`} style={{ width: `${Math.min(percentual, 100)}%` }} />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">{percentual.toFixed(1)}% utilizado</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orcamentos.slice(0, 4).map((orc) => {
          const perc = (orc.valorGasto / orc.valorLimite) * 100;
          const estourado = perc > 100;
          return (
            <Card key={orc.id}>
              <CardHeader>
                <CardTitle className="text-base">{orc.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilização</span>
                    <span className={`font-bold ${estourado ? 'text-red-600' : ''}`}>{perc.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${estourado ? 'bg-red-600' : 'bg-teal-600'}`} style={{ width: `${Math.min(perc, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{formatarMoeda(orc.valorGasto)}</span>
                    <span>{formatarMoeda(orc.valorLimite)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function EmprestimosTab({ emprestimos }: { emprestimos: any[] }) {
  const emprestimosAtivos = emprestimos.filter(e => e.status === "ATIVO");
  const totalEmprestado = emprestimosAtivos.reduce((acc, e) => acc + e.valorTotal, 0);
  const totalPago = emprestimosAtivos.reduce((acc, e) => acc + (e.parcelasPagas * e.valorParcela), 0);
  const percentual = totalEmprestado > 0 ? (totalPago / totalEmprestado) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo de Empréstimos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Empréstimos</p>
              <p className="text-2xl font-bold">{emprestimosAtivos.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Pago</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalPago)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{formatarMoeda(totalEmprestado)}</p>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600" style={{ width: `${Math.min(percentual, 100)}%` }} />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">{percentual.toFixed(1)}% pago</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emprestimosAtivos.slice(0, 4).map((emp) => {
          const perc = (emp.parcelasPagas / emp.numeroParcelas) * 100;
          return (
            <Card key={emp.id}>
              <CardHeader>
                <CardTitle className="text-base">{emp.instituicao}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span className="font-bold">{perc.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600" style={{ width: `${Math.min(perc, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{emp.parcelasPagas}/{emp.numeroParcelas} parcelas</span>
                    <span>{formatarMoeda(emp.valorParcela)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function InvestimentosTab({ investimentos }: { investimentos: any[] }) {
  const totalAplicado = investimentos.reduce((acc, i) => acc + i.valorAplicado, 0);
  const totalAtual = investimentos.reduce((acc, i) => acc + (i.valorAtual || i.valorAplicado), 0);
  const rendimento = totalAtual - totalAplicado;
  const percentual = totalAplicado > 0 ? (rendimento / totalAplicado) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo de Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Investimentos</p>
              <p className="text-2xl font-bold">{investimentos.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Aplicado</p>
              <p className="text-2xl font-bold">{formatarMoeda(totalAplicado)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Rendimento</p>
              <p className={`text-2xl font-bold ${rendimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatarMoeda(rendimento)}</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <p className={`text-lg font-bold ${rendimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {rendimento >= 0 ? '+' : ''}{percentual.toFixed(2)}%
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investimentos.slice(0, 4).map((inv) => {
          const rend = (inv.valorAtual || inv.valorAplicado) - inv.valorAplicado;
          const perc = (rend / inv.valorAplicado) * 100;
          return (
            <Card key={inv.id}>
              <CardHeader>
                <CardTitle className="text-base">{inv.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rendimento</span>
                    <span className={`font-bold ${rend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {rend >= 0 ? '+' : ''}{perc.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Aplicado: {formatarMoeda(inv.valorAplicado)}</span>
                    <span>Atual: {formatarMoeda(inv.valorAtual || inv.valorAplicado)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
