"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PiggyBank, TrendingUp, Target } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import Link from "next/link";

interface Meta {
  id: string;
  titulo: string;
  valorAlvo: number;
  valorAtual: number;
  status: string;
  dataPrazo: string | null;
}

export default function SelecionarMetaPage() {
  const router = useRouter();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarMetas();
  }, []);

  const carregarMetas = async () => {
    try {
      const resposta = await fetch("/api/metas");
      if (resposta.ok) {
        const dados = await resposta.json();
        // Filtrar apenas metas em andamento
        setMetas(dados.filter((m: Meta) => m.status === "EM_ANDAMENTO"));
      }
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
    } finally {
      setCarregando(false);
    }
  };

  const calcularProgresso = (meta: Meta) => {
    return (meta.valorAtual / meta.valorAlvo) * 100;
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Carregando metas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/financeiro">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adicionar à Meta</h1>
          <p className="text-gray-500 mt-1">Selecione a meta para adicionar valor</p>
        </div>
      </div>

      {metas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma meta em andamento
            </h3>
            <p className="text-gray-500 mb-6">
              Crie uma meta para começar a economizar
            </p>
            <Link href="/dashboard/metas/nova">
              <Button>
                <PiggyBank className="h-4 w-4 mr-2" />
                Criar Nova Meta
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metas.map((meta) => {
            const progresso = calcularProgresso(meta);
            const faltam = meta.valorAlvo - meta.valorAtual;

            return (
              <Card
                key={meta.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200"
                onClick={() => router.push(`/dashboard/metas/${meta.id}/adicionar`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-purple-600" />
                        {meta.titulo}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor Alvo:</span>
                      <span className="font-medium text-gray-900">
                        {formatarMoeda(meta.valorAlvo)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor Atual:</span>
                      <span className="font-medium text-purple-600">
                        {formatarMoeda(meta.valorAtual)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Faltam:</span>
                      <span className="font-medium text-orange-600">
                        {formatarMoeda(faltam)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progresso</span>
                      <span>{progresso.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${Math.min(progresso, 100)}%` }}
                      />
                    </div>
                  </div>

                  {meta.dataPrazo && (
                    <div className="text-xs text-gray-500">
                      Prazo: {new Date(meta.dataPrazo).toLocaleDateString("pt-BR")}
                    </div>
                  )}

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Adicionar Valor
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PiggyBank className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">
                Como funciona?
              </h3>
              <p className="text-sm text-blue-700">
                Ao adicionar valor a uma meta, o dinheiro será deduzido da sua conta bancária
                e adicionado ao valor economizado da meta. Isso ajuda a separar o dinheiro
                destinado às suas metas do saldo disponível para gastos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
