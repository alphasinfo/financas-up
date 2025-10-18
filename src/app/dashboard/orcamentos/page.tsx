import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, calcularPorcentagem, formatarPorcentagem } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, PiggyBank, AlertTriangle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

async function getOrcamentos(usuarioId: string) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  return await prisma.orcamento.findMany({
    where: {
      usuarioId,
      mesReferencia: mesAtual,
      anoReferencia: anoAtual,
    },
    include: {
      categoria: true,
    },
    orderBy: { criadoEm: "desc" },
  });
}

export default async function OrcamentosPage() {
  const session = await getServerSession(authOptions) as Session | null;
  const orcamentos = await getOrcamentos(session?.user.id);

  const totalLimite = orcamentos.reduce((acc, orc) => acc + orc.valorLimite, 0);
  const totalGasto = orcamentos.reduce((acc, orc) => acc + orc.valorGasto, 0);
  const totalDisponivel = totalLimite - totalGasto;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Controle seus gastos por categoria
          </p>
        </div>
        <Link href="/dashboard/orcamentos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Orçamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatarMoeda(totalLimite)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {formatarMoeda(totalGasto)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatarPorcentagem(calcularPorcentagem(totalGasto, totalLimite))} do orçamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalDisponivel >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatarMoeda(totalDisponivel)}
            </p>
          </CardContent>
        </Card>
      </div>

      {orcamentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PiggyBank className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum orçamento cadastrado
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
              Defina orçamentos por categoria para controlar seus gastos
            </p>
            <Link href="/dashboard/orcamentos/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Orçamento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orcamentos.map((orcamento) => {
            const percentualGasto = calcularPorcentagem(
              orcamento.valorGasto,
              orcamento.valorLimite
            );
            const disponivel = orcamento.valorLimite - orcamento.valorGasto;
            const estourado = percentualGasto > 100;
            const alerta = percentualGasto > 80 && !estourado;

            return (
              <Card key={orcamento.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{orcamento.nome}</CardTitle>
                      {orcamento.categoria && (
                        <p className="text-sm text-gray-500 mt-1">
                          {orcamento.categoria.nome}
                        </p>
                      )}
                    </div>
                    {estourado ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Estourado
                      </Badge>
                    ) : alerta ? (
                      <Badge variant="warning">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Atenção
                      </Badge>
                    ) : (
                      <Badge variant="success">No limite</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Orçamento</p>
                      <p className="text-lg font-bold">
                        {formatarMoeda(orcamento.valorLimite)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gasto</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatarMoeda(orcamento.valorGasto)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Disponível</p>
                      <p className={`text-lg font-bold ${disponivel >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatarMoeda(Math.abs(disponivel))}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Utilização</span>
                      <span className="text-sm font-medium">
                        {formatarPorcentagem(percentualGasto)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          estourado
                            ? "bg-red-500"
                            : alerta
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(percentualGasto, 100)}%` }}
                      />
                    </div>
                  </div>

                  {estourado && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-900">
                        <strong>Atenção!</strong> Você ultrapassou o orçamento em{" "}
                        {formatarMoeda(Math.abs(disponivel))}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t">
                    <Link href={`/dashboard/orcamentos/${orcamento.id}/editar`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </Link>
                    <Link href={`/dashboard/orcamentos/${orcamento.id}/excluir`} className="flex-1">
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
    </div>
  );
}
