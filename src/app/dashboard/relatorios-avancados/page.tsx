"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";

interface Comparacao {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface Previsao {
  mes: string;
  receitaPrevista: number;
  despesaPrevista: number;
  saldoPrevisto: number;
  confianca: number;
}

interface Insight {
  tipo: 'positivo' | 'negativo' | 'neutro';
  titulo: string;
  descricao: string;
  valor?: number;
}

export default function RelatoriosAvancadosPage() {
  const [comparacoes, setComparacoes] = useState<Comparacao[]>([]);
  const [previsoes, setPrevisoes] = useState<Previsao[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [mesesComparacao, setMesesComparacao] = useState(6);
  const [mesesPrevisao, setMesesPrevisao] = useState(3);

  useEffect(() => {
    carregarDados();
  }, [mesesComparacao, mesesPrevisao]);

  async function carregarDados() {
    setLoading(true);
    try {
      await Promise.all([
        carregarComparacoes(),
        carregarPrevisoes(),
        carregarInsights(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarComparacoes() {
    try {
      const response = await fetch(`/api/relatorios-avancados/comparacao?meses=${mesesComparacao}`);
      const data = await response.json();
      setComparacoes(data.comparacoes || []);
    } catch (error) {
      console.error('Erro ao carregar comparações:', error);
    }
  }

  async function carregarPrevisoes() {
    try {
      const response = await fetch(`/api/relatorios-avancados/previsoes?meses=${mesesPrevisao}`);
      const data = await response.json();
      setPrevisoes(data.previsoes || []);
    } catch (error) {
      console.error('Erro ao carregar previsões:', error);
    }
  }

  async function carregarInsights() {
    try {
      const response = await fetch('/api/relatorios-avancados/insights');
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
    }
  }

  async function exportarRelatorio() {
    try {
      const response = await fetch('/api/relatorios-avancados/exportar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-avancado-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  }

  function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
          <p className="text-gray-600 mt-1">
            Análises detalhadas e previsões com IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={carregarDados} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={exportarRelatorio}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Insights IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Insights Automáticos (IA)
          </CardTitle>
          <CardDescription>
            Análises inteligentes baseadas nos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : insights.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum insight disponível no momento
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.tipo === 'positivo'
                      ? 'bg-green-50 border-green-500'
                      : insight.tipo === 'negativo'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <h3 className="font-semibold mb-1">{insight.titulo}</h3>
                  <p className="text-sm text-gray-700">{insight.descricao}</p>
                  {insight.valor && (
                    <p className="text-lg font-bold mt-2">
                      {formatarMoeda(insight.valor)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="comparacao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparacao">
            <LineChart className="h-4 w-4 mr-2" />
            Comparação Mensal
          </TabsTrigger>
          <TabsTrigger value="previsoes">
            <TrendingUp className="h-4 w-4 mr-2" />
            Previsões (IA)
          </TabsTrigger>
          <TabsTrigger value="patrimonio">
            <PieChart className="h-4 w-4 mr-2" />
            Evolução Patrimonial
          </TabsTrigger>
        </TabsList>

        {/* Comparação Mensal */}
        <TabsContent value="comparacao" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Comparação dos Últimos Meses</CardTitle>
                <select
                  value={mesesComparacao}
                  onChange={(e) => setMesesComparacao(Number(e.target.value))}
                  className="px-3 py-1 border rounded-lg"
                >
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {comparacoes.map((comp, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{comp.mes}</h3>
                        <span
                          className={`font-bold ${
                            comp.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatarMoeda(comp.saldo)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Receitas</p>
                          <p className="font-semibold text-green-600">
                            {formatarMoeda(comp.receitas)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Despesas</p>
                          <p className="font-semibold text-red-600">
                            {formatarMoeda(comp.despesas)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Previsões */}
        <TabsContent value="previsoes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Previsões com Inteligência Artificial</CardTitle>
                  <CardDescription>
                    Baseado no histórico dos últimos 12 meses
                  </CardDescription>
                </div>
                <select
                  value={mesesPrevisao}
                  onChange={(e) => setMesesPrevisao(Number(e.target.value))}
                  className="px-3 py-1 border rounded-lg"
                >
                  <option value={1}>1 mês</option>
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {previsoes.map((prev, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{prev.mes}</h3>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Confiança</p>
                          <p className="font-bold">{prev.confianca}%</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Receita Prevista</p>
                          <p className="font-semibold text-green-600">
                            {formatarMoeda(prev.receitaPrevista)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Despesa Prevista</p>
                          <p className="font-semibold text-red-600">
                            {formatarMoeda(prev.despesaPrevista)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Saldo Previsto</p>
                          <p
                            className={`font-semibold ${
                              prev.saldoPrevisto >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatarMoeda(prev.saldoPrevisto)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolução Patrimonial */}
        <TabsContent value="patrimonio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Patrimonial</CardTitle>
              <CardDescription>
                Acompanhe o crescimento do seu patrimônio ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>Gráfico de evolução patrimonial</p>
                <p className="text-sm mt-2">
                  Visualização interativa em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
