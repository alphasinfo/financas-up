import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, PieChart, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

async function getInvestimentos(usuarioId: string) {
  return await prisma.investimento.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: "desc" },
  });
}

export default async function InvestimentosPage() {
  const session = await getServerSession(authOptions);
  const investimentos = await getInvestimentos(session!.user.id);

  const totalInvestido = investimentos.reduce(
    (acc, inv) => acc + inv.valorAplicado,
    0
  );

  const totalAtual = investimentos.reduce(
    (acc, inv) => acc + (inv.valorAtual || inv.valorAplicado),
    0
  );

  const rendimento = totalAtual - totalInvestido;
  const percentualRendimento = totalInvestido > 0 ? (rendimento / totalInvestido) * 100 : 0;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Investimentos</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Acompanhe suas aplicações e rendimentos
          </p>
        </div>
        <Link href="/dashboard/investimentos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Investimento
          </Button>
        </Link>
      </div>

      {/* Card Grande com Resumo */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo de Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-xs text-purple-600 mb-1">Total Investido</p>
              <p className="text-2xl font-bold text-purple-700">{formatarMoeda(totalInvestido)}</p>
              <p className="text-xs text-gray-500 mt-1">{investimentos.length} investimento(s)</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-purple-600 mb-1">Valor Atual</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalAtual)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-purple-600 mb-1">Rendimento</p>
              <p className={`text-2xl font-bold ${rendimento >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatarMoeda(rendimento)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {percentualRendimento >= 0 ? '+' : ''}{percentualRendimento.toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-purple-600 mb-1">Rentabilidade</p>
              <div className="flex items-center justify-center gap-2">
                {rendimento >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
                )}
                <p className={`text-2xl font-bold ${rendimento >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {rendimento >= 0 ? 'Lucro' : 'Prejuízo'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          {totalInvestido > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs text-purple-600 mb-1">
                <span>Crescimento do Patrimônio</span>
                <span>{((totalAtual / totalInvestido) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${rendimento >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${Math.min(((totalAtual / totalInvestido) * 100), 200)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {investimentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum investimento cadastrado
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
              Cadastre seus investimentos para acompanhar rendimentos
            </p>
            <Link href="/dashboard/investimentos/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Investimento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
        {/* Investimentos por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              Investimentos por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(new Set(investimentos.map(i => i.tipo))).map(tipo => {
                const investimentosTipo = investimentos.filter(i => i.tipo === tipo);
                const totalTipo = investimentosTipo.reduce((acc, i) => acc + i.valorAplicado, 0);
                const percentual = (totalTipo / totalInvestido) * 100;
                
                return (
                  <div key={tipo} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{tipo}</span>
                      <span className="text-gray-600">{formatarMoeda(totalTipo)} ({percentual.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {investimentos.map((investimento) => {
            const rendimentoIndividual = (investimento.valorAtual || investimento.valorAplicado) - investimento.valorAplicado;
            const percentualIndividual = (rendimentoIndividual / investimento.valorAplicado) * 100;

            return (
              <Card key={investimento.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{investimento.nome}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{investimento.tipo}</p>
                    </div>
                    <Badge variant="outline">{investimento.instituicao || "N/A"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Valor Aplicado</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatarMoeda(investimento.valorAplicado)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Valor Atual</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatarMoeda(investimento.valorAtual || investimento.valorAplicado)}
                    </p>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <span className="text-sm text-gray-500">Rendimento</span>
                      <div className="text-right">
                        <p className={`font-bold ${rendimentoIndividual >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatarMoeda(rendimentoIndividual)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {percentualIndividual.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm pt-3 border-t">
                    <div>
                      <span className="text-gray-500">Aplicação:</span>
                      <p className="font-medium">{formatarData(investimento.dataAplicacao)}</p>
                    </div>
                    {investimento.dataVencimento && (
                      <div>
                        <span className="text-gray-500">Vencimento:</span>
                        <p className="font-medium">{formatarData(investimento.dataVencimento)}</p>
                      </div>
                    )}
                  </div>

                  {investimento.taxaRendimento && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        <strong>Taxa:</strong> {investimento.taxaRendimento}% a.a.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t">
                    <Link href={`/dashboard/investimentos/${investimento.id}/editar`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </Link>
                    <Link href={`/dashboard/investimentos/${investimento.id}/excluir`} className="flex-1">
                      <Button variant="destructive" size="sm" className="w-full">
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
        </>
      )}
    </div>
  );
}
