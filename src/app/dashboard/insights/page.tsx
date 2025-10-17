"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";

interface Resumo {
  receitas: number;
  despesas: number;
  saldo: number;
  categorias: { nome: string; valor: number }[];
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<string>("");
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mesAno, setMesAno] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  });

  const carregarInsights = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await fetch(`/api/insights?mesAno=${mesAno}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setInsights(dados.insights);
        setResumo(dados.resumo);
      }
    } catch (error) {
      console.error("Erro ao carregar insights:", error);
    } finally {
      setCarregando(false);
    }
  }, [mesAno]);

  useEffect(() => {
    carregarInsights();
  }, [carregarInsights]);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-gray-500">Analisando seus dados financeiros...</p>
        <p className="text-sm text-gray-400">Gerando insights personalizados com IA</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Insights Financeiros
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Análise inteligente dos seus dados financeiros
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={mesAno}
            onChange={(e) => setMesAno(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button variant="outline" onClick={carregarInsights}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Receitas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatarMoeda(resumo.receitas)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Despesas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatarMoeda(resumo.despesas)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Saldo
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  resumo.saldo >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatarMoeda(resumo.saldo)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Análise Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {insights}
            </div>
          </div>
        </CardContent>
      </Card>

      {resumo && resumo.categorias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumo.categorias
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 5)
                .map((categoria, index) => {
                  const percentual = (categoria.valor / resumo.despesas) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{categoria.nome}</span>
                        <span className="text-gray-500">
                          {formatarMoeda(categoria.valor)} ({percentual.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 mb-1">
                Sobre os Insights com IA
              </p>
              <p className="text-sm text-yellow-800">
                Os insights são gerados usando inteligência artificial para analisar seus padrões
                de gastos e fornecer recomendações personalizadas. Configure sua chave da OpenAI
                nas variáveis de ambiente (OPENAI_API_KEY) para ativar a análise avançada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
