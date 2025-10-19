"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Download, TrendingUp, TrendingDown, DollarSign, Filter, X, RefreshCw, AlertCircle } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import { exportarRelatorioParaPDF, baixarPDF } from "@/lib/pdf-export";
import { TransacaoItem } from "@/components/transacao-item";
import dynamic from 'next/dynamic';

// Lazy load do componente de gráficos
const LazyChart = dynamic(() => import('@/components/lazy-chart').then(mod => mod.LazyChart), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">Carregando gráficos...</div>
});

interface DadosRelatorio {
  receitasMes: number;
  despesasMes: number;
  saldoMes: number;
  receitasPorCategoria: { categoria: string; valor: number }[];
  despesasPorCategoria: { categoria: string; valor: number }[];
  evolucaoMensal: { mes: string; receitas: number; despesas: number }[];
  transacoes?: Array<{
    id: string;
    descricao: string;
    valor: number;
    tipo: string;
    status: string;
    dataCompetencia: string;
    categoria: { nome: string } | null;
  }>;
  comparacao?: {
    mesAtual: { receitas: number; despesas: number; saldo: number };
    mesAnterior: { receitas: number; despesas: number; saldo: number };
    variacao: { receitas: number; despesas: number; saldo: number };
  };
  previsoes?: Array<{
    mes: string;
    receitaPrevista: number;
    despesaPrevista: number;
    saldoPrevisto: number;
    confianca: number;
  }>;
  insights?: Array<{
    tipo: 'positivo' | 'negativo' | 'neutro';
    titulo: string;
    descricao: string;
    valor?: number;
  }>;
}

export default function RelatoriosPage() {
  const [dados, setDados] = useState<DadosRelatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mesAno, setMesAno] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  });
  
  // Filtros para transações
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [_filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroBusca, setFiltroBusca] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      const resposta = await fetch(`/api/relatorios?mesAno=${mesAno}`, { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!resposta.ok) {
        throw new Error(`Erro ao carregar relatórios: ${resposta.status}`);
      }
      
      const dadosCarregados = await resposta.json();
      setDados(dadosCarregados);
    } catch (error: any) {
      console.error("Erro ao carregar relatórios:", error);
      setErro(error.message || "Erro ao carregar relatórios");
    } finally {
      setCarregando(false);
    }
  }, [mesAno]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleImprimir = () => {
    window.print();
  };

  const handleExportarPDF = () => {
    if (!dados || !dados.transacoes) {
      alert("Nenhum dado disponível para exportar");
      return;
    }

    const [ano, mes] = mesAno.split("-");
    const nomeMes = new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

    const transacoesPDF = dados.transacoes.map((t) => ({
      data: new Date(t.dataCompetencia),
      descricao: t.descricao,
      categoria: t.categoria?.nome || "Sem categoria",
      tipo: t.tipo,
      valor: t.valor,
      status: t.status,
    }));

    const dadosPDF = {
      periodo: nomeMes,
      receitas: dados.receitasMes,
      despesas: dados.despesasMes,
      saldo: dados.saldoMes,
      transacoes: transacoesPDF,
    };

    const doc = exportarRelatorioParaPDF(dadosPDF);
    baixarPDF(doc, `relatorio-${mesAno}.pdf`);
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Carregando relatórios...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-600" />
        <p className="text-gray-900 font-semibold">Erro ao carregar relatórios</p>
        <p className="text-gray-500 text-sm">{erro}</p>
        <Button onClick={carregarDados}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="text-gray-500">Nenhum dado disponível</p>
        <Button onClick={carregarDados}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recarregar
        </Button>
      </div>
    );
  }

  // Dados para gráfico de receitas vs despesas
  const dadosReceitasDespesas = {
    labels: ["Receitas", "Despesas"],
    datasets: [
      {
        label: "Valor (R$)",
        data: [dados.receitasMes, dados.despesasMes],
        backgroundColor: ["rgba(16, 185, 129, 0.5)", "rgba(239, 68, 68, 0.5)"],
        borderColor: ["rgb(16, 185, 129)", "rgb(239, 68, 68)"],
        borderWidth: 2,
      },
    ],
  };

  // Dados para gráfico de categorias de despesas
  const dadosDespesasPorCategoria = {
    labels: dados.despesasPorCategoria.map((d) => d.categoria),
    datasets: [
      {
        data: dados.despesasPorCategoria.map((d) => d.valor),
        backgroundColor: [
          "rgba(239, 68, 68, 0.5)",
          "rgba(245, 158, 11, 0.5)",
          "rgba(139, 92, 246, 0.5)",
          "rgba(16, 185, 129, 0.5)",
          "rgba(236, 72, 153, 0.5)",
        ],
        borderColor: [
          "rgb(239, 68, 68)",
          "rgb(245, 158, 11)",
          "rgb(139, 92, 246)",
          "rgb(16, 185, 129)",
          "rgb(236, 72, 153)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Dados para gráfico de evolução mensal
  const dadosEvolucaoMensal = {
    labels: dados.evolucaoMensal.map((d) => d.mes),
    datasets: [
      {
        label: "Receitas",
        data: dados.evolucaoMensal.map((d) => d.receitas),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.3,
      },
      {
        label: "Despesas",
        data: dados.evolucaoMensal.map((d) => d.despesas),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const opcoes = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Análise completa das suas finanças
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 no-print w-full sm:w-auto">
          <input
            type="month"
            value={mesAno}
            onChange={(e) => setMesAno(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <Button variant="outline" onClick={handleImprimir} className="w-full sm:w-auto">
            <Printer className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Imprimir</span>
            <span className="sm:hidden">Imprimir</span>
          </Button>
          <Button variant="outline" onClick={handleExportarPDF} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 print-area">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Receitas do Período
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xl md:text-2xl font-bold text-green-600">
              {formatarMoeda(dados.receitasMes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Despesas do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatarMoeda(dados.despesasMes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Saldo do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                dados.saldoMes >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatarMoeda(dados.saldoMes)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas com Gráficos */}
      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList className="no-print grid grid-cols-3 md:grid-cols-7 gap-1">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="comparacao">Comparação</TabsTrigger>
          <TabsTrigger value="previsoes">Previsões</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card className="print-area">
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <LazyChart type="bar" data={dadosReceitasDespesas} options={opcoes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
            <Card className="print-area">
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <LazyChart type="pie" data={dadosDespesasPorCategoria} options={opcoes} />
              </CardContent>
            </Card>

            <Card className="print-area">
              <CardHeader>
                <CardTitle>Detalhamento de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dados.despesasPorCategoria.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{item.categoria}</span>
                      <span className="text-red-600 font-bold">
                        {formatarMoeda(item.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evolucao" className="space-y-4">
          <Card className="print-area">
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <LazyChart type="line" data={dadosEvolucaoMensal} options={opcoes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparacao" className="space-y-4">
          {dados.comparacao && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mês Atual vs Anterior</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Receitas</span>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatarMoeda(dados.comparacao.mesAtual.receitas)}</p>
                        <p className={`text-xs ${dados.comparacao.variacao.receitas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dados.comparacao.variacao.receitas >= 0 ? '↑' : '↓'} {Math.abs(dados.comparacao.variacao.receitas).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Despesas</span>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatarMoeda(dados.comparacao.mesAtual.despesas)}</p>
                        <p className={`text-xs ${dados.comparacao.variacao.despesas <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dados.comparacao.variacao.despesas >= 0 ? '↑' : '↓'} {Math.abs(dados.comparacao.variacao.despesas).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Saldo</span>
                      <div className="text-right">
                        <p className={`font-bold ${dados.comparacao.mesAtual.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatarMoeda(dados.comparacao.mesAtual.saldo)}
                        </p>
                        <p className={`text-xs ${dados.comparacao.variacao.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dados.comparacao.variacao.saldo >= 0 ? '↑' : '↓'} {Math.abs(dados.comparacao.variacao.saldo).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Variação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dados.comparacao.variacao.receitas !== 0 && (
                      <div className={`p-3 rounded-lg ${dados.comparacao.variacao.receitas >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm font-medium mb-1">Receitas</p>
                        <p className="text-xs text-gray-600">
                          {dados.comparacao.variacao.receitas >= 0 ? 'Aumentaram' : 'Diminuíram'} {Math.abs(dados.comparacao.variacao.receitas).toFixed(1)}% em relação ao mês anterior
                        </p>
                      </div>
                    )}
                    {dados.comparacao.variacao.despesas !== 0 && (
                      <div className={`p-3 rounded-lg ${dados.comparacao.variacao.despesas <= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                        <p className="text-sm font-medium mb-1">Despesas</p>
                        <p className="text-xs text-gray-600">
                          {dados.comparacao.variacao.despesas >= 0 ? 'Aumentaram' : 'Diminuíram'} {Math.abs(dados.comparacao.variacao.despesas).toFixed(1)}% em relação ao mês anterior
                        </p>
                      </div>
                    )}
                    {dados.comparacao.variacao.saldo !== 0 && (
                      <div className={`p-3 rounded-lg ${dados.comparacao.variacao.saldo >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm font-medium mb-1">Saldo</p>
                        <p className="text-xs text-gray-600">
                          {dados.comparacao.variacao.saldo >= 0 ? 'Melhorou' : 'Piorou'} {Math.abs(dados.comparacao.variacao.saldo).toFixed(1)}% em relação ao mês anterior
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="previsoes" className="space-y-4">
          {dados.previsoes && dados.previsoes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previsões para os Próximos Meses</CardTitle>
                <p className="text-sm text-gray-500">Baseado na média dos últimos 3 meses</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dados.previsoes.map((previsao, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold capitalize">{previsao.mes}</h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {previsao.confianca}% confiança
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Receitas</p>
                          <p className="font-semibold text-green-600">{formatarMoeda(previsao.receitaPrevista)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Despesas</p>
                          <p className="font-semibold text-red-600">{formatarMoeda(previsao.despesaPrevista)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Saldo</p>
                          <p className={`font-semibold ${previsao.saldoPrevisto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatarMoeda(previsao.saldoPrevisto)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {dados.insights && dados.insights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dados.insights.map((insight, index) => (
                <Card key={index} className={
                  insight.tipo === 'positivo' ? 'border-green-200 bg-green-50' :
                  insight.tipo === 'negativo' ? 'border-red-200 bg-red-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {insight.tipo === 'positivo' && <TrendingUp className="h-5 w-5 text-green-600" />}
                      {insight.tipo === 'negativo' && <TrendingDown className="h-5 w-5 text-red-600" />}
                      {insight.tipo === 'neutro' && <DollarSign className="h-5 w-5 text-blue-600" />}
                      {insight.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">{insight.descricao}</p>
                    {insight.valor !== undefined && (
                      <p className={`text-lg font-bold ${
                        insight.tipo === 'positivo' ? 'text-green-600' :
                        insight.tipo === 'negativo' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {formatarMoeda(insight.valor)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Lista Completa de Transações</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {mostrarFiltros ? "Ocultar" : "Mostrar"} Filtros
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtros */}
              {mostrarFiltros && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label>Buscar</Label>
                    <Input
                      placeholder="Descrição..."
                      value={filtroBusca}
                      onChange={(e) => setFiltroBusca(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODOS">Todos</SelectItem>
                        <SelectItem value="RECEITA">Receitas</SelectItem>
                        <SelectItem value="DESPESA">Despesas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODOS">Todos</SelectItem>
                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                        <SelectItem value="PAGO">Pago</SelectItem>
                        <SelectItem value="RECEBIDO">Recebido</SelectItem>
                        <SelectItem value="VENCIDO">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setFiltroTipo("TODOS");
                        setFiltroCategoria("TODAS");
                        setFiltroStatus("TODOS");
                        setFiltroBusca("");
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de Transações */}
              <div className="space-y-3">
                {dados.transacoes && dados.transacoes.length > 0 ? (
                  dados.transacoes
                    .filter((t) => {
                      // Filtro por tipo
                      if (filtroTipo !== "TODOS" && t.tipo !== filtroTipo) return false;
                      // Filtro por status
                      if (filtroStatus !== "TODOS" && t.status !== filtroStatus) return false;
                      // Filtro por busca
                      if (filtroBusca && !t.descricao.toLowerCase().includes(filtroBusca.toLowerCase())) return false;
                      return true;
                    })
                    .map((transacao) => (
                      <TransacaoItem key={transacao.id} transacao={transacao} />
                    ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Nenhuma transação encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
