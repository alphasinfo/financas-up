"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Filter, 
  X,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Wallet,
  CreditCard,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
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
  // Dados básicos
  receitasMes: number;
  despesasMes: number;
  saldoMes: number;
  receitasPorCategoria: { categoria: string; valor: number; percentual: number }[];
  despesasPorCategoria: { categoria: string; valor: number; percentual: number }[];
  evolucaoMensal: { mes: string; receitas: number; despesas: number; saldo: number }[];
  
  // Transações
  transacoes?: Array<{
    id: string;
    descricao: string;
    valor: number;
    tipo: string;
    status: string;
    dataCompetencia: string;
    categoria: { nome: string } | null;
    conta?: { nome: string } | null;
    cartao?: { nome: string } | null;
  }>;
  
  // Dados avançados
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
  
  // Resumo por contas e cartões
  resumoContas?: Array<{
    nome: string;
    saldo: number;
    movimentacoes: number;
  }>;
  
  resumoCartoes?: Array<{
    nome: string;
    limite: number;
    utilizado: number;
    percentual: number;
  }>;
  
  // Metas e orçamentos
  orcamentos?: Array<{
    categoria: string;
    planejado: number;
    realizado: number;
    percentual: number;
    status: 'ok' | 'alerta' | 'excedido';
  }>;
  
  metas?: Array<{
    nome: string;
    objetivo: number;
    atual: number;
    percentual: number;
    prazo?: string;
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
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");
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

  // Continua na próxima parte...
