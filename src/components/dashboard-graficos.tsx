"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DadosGraficos {
  contas: { nome: string; saldo: number }[];
  cartoes: { nome: string; utilizado: number; disponivel: number }[];
  investimentos: { tipo: string; valor: number }[];
  categorias: { nome: string; valor: number }[];
}

export function DashboardGraficos() {
  const [dados, setDados] = useState<DadosGraficos | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Buscar dados de contas
      const respContas = await fetch("/api/contas", { cache: 'no-store' });
      const contas = respContas.ok ? await respContas.json() : [];

      // Buscar dados de cartões
      const respCartoes = await fetch("/api/cartoes", { cache: 'no-store' });
      const cartoes = respCartoes.ok ? await respCartoes.json() : [];

      // Buscar dados de investimentos
      const respInvestimentos = await fetch("/api/investimentos", { cache: 'no-store' });
      const investimentos = respInvestimentos.ok ? await respInvestimentos.json() : [];

      // Buscar transações para categorias
      const respTransacoes = await fetch("/api/transacoes", { cache: 'no-store' });
      const transacoes = respTransacoes.ok ? await respTransacoes.json() : [];

      // Agrupar despesas por categoria
      const categorias: { [key: string]: number } = {};
      transacoes
        .filter((t: any) => t.tipo === "DESPESA")
        .forEach((t: any) => {
          const cat = t.categoria?.nome || "Sem categoria";
          categorias[cat] = (categorias[cat] || 0) + t.valor;
        });

      setDados({
        contas: contas.map((c: any) => ({ nome: c.nome, saldo: c.saldoAtual })),
        cartoes: cartoes.map((c: any) => ({
          nome: c.nome,
          utilizado: c.limiteTotal - c.limiteDisponivel,
          disponivel: c.limiteDisponivel,
        })),
        investimentos: investimentos.map((i: any) => ({
          tipo: i.tipo,
          valor: i.valorAplicado,
        })),
        categorias: Object.entries(categorias).map(([nome, valor]) => ({ nome, valor: valor as number })),
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando || !dados) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando gráficos...</p>
      </div>
    );
  }

  // Gráfico de Contas
  const dadosContas = {
    labels: dados.contas.map((c) => c.nome),
    datasets: [
      {
        label: "Saldo (R$)",
        data: dados.contas.map((c) => c.saldo),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
      },
    ],
  };

  // Gráfico de Cartões
  const dadosCartoes = {
    labels: dados.cartoes.map((c) => c.nome),
    datasets: [
      {
        label: "Utilizado (R$)",
        data: dados.cartoes.map((c) => c.utilizado),
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 2,
      },
      {
        label: "Disponível (R$)",
        data: dados.cartoes.map((c) => c.disponivel),
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 2,
      },
    ],
  };

  // Gráfico de Investimentos
  const dadosInvestimentos = {
    labels: dados.investimentos.map((i) => i.tipo),
    datasets: [
      {
        data: dados.investimentos.map((i) => i.valor),
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(16, 185, 129, 0.5)",
          "rgba(245, 158, 11, 0.5)",
          "rgba(139, 92, 246, 0.5)",
          "rgba(236, 72, 153, 0.5)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(139, 92, 246)",
          "rgb(236, 72, 153)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Gráfico de Categorias
  const dadosCategorias = {
    labels: dados.categorias.map((c) => c.nome),
    datasets: [
      {
        data: dados.categorias.map((c) => c.valor),
        backgroundColor: [
          "rgba(239, 68, 68, 0.5)",
          "rgba(245, 158, 11, 0.5)",
          "rgba(139, 92, 246, 0.5)",
          "rgba(236, 72, 153, 0.5)",
          "rgba(59, 130, 246, 0.5)",
        ],
        borderColor: [
          "rgb(239, 68, 68)",
          "rgb(245, 158, 11)",
          "rgb(139, 92, 246)",
          "rgb(236, 72, 153)",
          "rgb(59, 130, 246)",
        ],
        borderWidth: 2,
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
    <Tabs defaultValue="geral" className="space-y-4">
      <TabsList>
        <TabsTrigger value="geral">Visão Geral</TabsTrigger>
        <TabsTrigger value="contas">Contas</TabsTrigger>
        <TabsTrigger value="cartoes">Cartões</TabsTrigger>
        <TabsTrigger value="investimentos">Investimentos</TabsTrigger>
      </TabsList>

      <TabsContent value="geral" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <Doughnut data={dadosCategorias} options={opcoes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saldo em Contas</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={dadosContas} options={opcoes} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="contas">
        <Card>
          <CardHeader>
            <CardTitle>Saldo por Conta Bancária</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={dadosContas} options={opcoes} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cartoes">
        <Card>
          <CardHeader>
            <CardTitle>Limite de Cartões (Utilizado vs Disponível)</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={dadosCartoes} options={opcoes} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="investimentos">
        <Card>
          <CardHeader>
            <CardTitle>Investimentos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={dadosInvestimentos} options={opcoes} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
