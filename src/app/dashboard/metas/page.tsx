import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData, calcularPorcentagem, formatarPorcentagem } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, CheckCircle2, Clock, PiggyBank, TrendingUp, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

async function getMetas(usuarioId: string) {
  return await prisma.meta.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: "desc" },
  });
}

export default async function MetasPage() {
  const session = await getServerSession(authOptions) as Session | null;
  const metas = await getMetas(session?.user.id);

  const metasAtivas = metas.filter((m) => m.status === "EM_ANDAMENTO");
  const metasConcluidas = metas.filter((m) => m.status === "CONCLUIDA");

  const totalAlvo = metasAtivas.reduce((acc, meta) => acc + meta.valorAlvo, 0);
  const totalAtual = metasAtivas.reduce((acc, meta) => acc + meta.valorAtual, 0);
  const totalFaltante = totalAlvo - totalAtual;
  const percentualGeral = totalAlvo > 0 ? (totalAtual / totalAlvo) * 100 : 0;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Metas Financeiras</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Defina e acompanhe seus objetivos financeiros
          </p>
        </div>
        <Link href="/dashboard/metas/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </Link>
      </div>

      {/* Card Grande com Resumo */}
      <Card className="border-pink-200 bg-pink-50">
        <CardHeader>
          <CardTitle className="text-lg text-pink-700 flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Resumo de Metas Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-xs text-pink-600 mb-1">Metas Ativas</p>
              <p className="text-2xl font-bold text-pink-700">{metasAtivas.length}</p>
              <p className="text-xs text-gray-500 mt-1">{metasConcluidas.length} concluída(s)</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-pink-600 mb-1">Progresso Total</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalAtual)}</p>
              <p className="text-xs text-gray-500 mt-1">de {formatarMoeda(totalAlvo)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-pink-600 mb-1">Faltam</p>
              <p className="text-2xl font-bold text-orange-600">{formatarMoeda(totalFaltante)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-pink-600 mb-1">Progresso Geral</p>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <p className="text-2xl font-bold text-green-600">
                  {percentualGeral.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          {totalAlvo > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs text-pink-600 mb-1">
                <span>Progresso das Metas</span>
                <span>{percentualGeral.toFixed(1)}% alcançado</span>
              </div>
              <div className="h-3 bg-pink-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-600 transition-all duration-300"
                  style={{ width: `${Math.min(percentualGeral, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Economizado: {formatarMoeda(totalAtual)}</span>
                <span>Faltam: {formatarMoeda(totalFaltante)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {metas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma meta cadastrada
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
              Defina metas financeiras para alcançar seus objetivos
            </p>
            <Link href="/dashboard/metas/nova">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeira Meta
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">
          {metasAtivas.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Metas em Andamento
              </h2>
              {metasAtivas.map((meta) => {
                const percentual = calcularPorcentagem(meta.valorAtual, meta.valorAlvo);
                const faltam = meta.valorAlvo - meta.valorAtual;

                return (
                  <Card key={meta.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                          {meta.descricao && (
                            <p className="text-sm text-gray-500 mt-1">{meta.descricao}</p>
                          )}
                        </div>
                        <Badge variant="warning">Em andamento</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Meta</p>
                          <p className="text-lg font-bold">
                            {formatarMoeda(meta.valorAlvo)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Atual</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatarMoeda(meta.valorAtual)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Faltam</p>
                          <p className="text-lg font-bold text-orange-600">
                            {formatarMoeda(faltam)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">Progresso</span>
                          <span className="text-sm font-medium">
                            {formatarPorcentagem(percentual)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full transition-all"
                            style={{ width: `${Math.min(percentual, 100)}%` }}
                          />
                        </div>
                      </div>

                      {meta.dataPrazo && (
                        <div className="flex items-center justify-between text-sm pt-3 border-t">
                          <span className="text-gray-500">Prazo:</span>
                          <span className="font-medium">{formatarData(meta.dataPrazo)}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t">
                        <Link href={`/dashboard/metas/${meta.id}/editar`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </Link>
                        <Link href={`/dashboard/metas/${meta.id}/excluir`} className="flex-1">
                          <Button variant="destructive" className="w-full">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {metasConcluidas.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Metas Concluídas
              </h2>
              {metasConcluidas.map((meta) => (
                <Card key={meta.id} className="bg-green-50 border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                        {meta.descricao && (
                          <p className="text-sm text-gray-500 mt-1">{meta.descricao}</p>
                        )}
                      </div>
                      <Badge variant="success">Concluída</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <span className="text-sm text-gray-600">Meta alcançada:</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatarMoeda(meta.valorAlvo)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t">
                        <Link href={`/dashboard/metas/${meta.id}/excluir`} className="flex-1">
                          <Button variant="destructive" className="w-full">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
