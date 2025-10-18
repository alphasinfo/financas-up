import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingDown, AlertCircle, HandCoins, PieChart, Calendar, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getEmprestimos(usuarioId: string) {
  return await prisma.emprestimo.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: "desc" },
    include: {
      parcelas: {
        orderBy: { numeroParcela: "asc" },
      },
    },
  });
}

export default async function EmprestimosPage() {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user) {
    notFound();
  }

  const emprestimos = await getEmprestimos(session.user.id);

  const totalEmprestado = emprestimos
    .filter((e) => e.status === "ATIVO")
    .reduce((acc, emp) => acc + emp.valorTotal, 0);

  const totalPago = emprestimos.reduce(
    (acc, emp) => acc + emp.parcelasPagas * emp.valorParcela,
    0
  );

  const totalRestante = totalEmprestado - totalPago;
  const percentualPago = totalEmprestado > 0 ? (totalPago / totalEmprestado) * 100 : 0;
  const emprestimosAtivos = emprestimos.filter(e => e.status === "ATIVO").length;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Empréstimos</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Gerencie seus empréstimos e parcelas
          </p>
        </div>
        <Link href="/dashboard/emprestimos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Empréstimo
          </Button>
        </Link>
      </div>

      {/* Card Grande com Resumo */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg text-amber-700 flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Resumo de Empréstimos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-xs text-amber-600 mb-1">Total Emprestado</p>
              <p className="text-2xl font-bold text-amber-700">{formatarMoeda(totalEmprestado)}</p>
              <p className="text-xs text-gray-500 mt-1">{emprestimosAtivos} ativo(s)</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-amber-600 mb-1">Total Pago</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalPago)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-amber-600 mb-1">Saldo Devedor</p>
              <p className="text-2xl font-bold text-red-600">{formatarMoeda(totalRestante)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-amber-600 mb-1">Progresso</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {percentualPago.toFixed(1)}%
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Quitado</p>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          {totalEmprestado > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs text-amber-600 mb-1">
                <span>Progresso de Pagamento</span>
                <span>{percentualPago.toFixed(1)}% pago</span>
              </div>
              <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${Math.min(percentualPago, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Pago: {formatarMoeda(totalPago)}</span>
                <span>Restante: {formatarMoeda(totalRestante)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {emprestimos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingDown className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum empréstimo cadastrado
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
              Cadastre seus empréstimos para controlar parcelas e juros
            </p>
            <Link href="/dashboard/emprestimos/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Empréstimo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">
          {emprestimos.map((emprestimo) => {
            const percentualPago =
              (emprestimo.parcelasPagas / emprestimo.numeroParcelas) * 100;
            const proximaParcela = emprestimo.parcelas.find(
              (p) => p.status === "PENDENTE"
            );

            return (
              <Card key={emprestimo.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {emprestimo.instituicao}
                      </CardTitle>
                      {emprestimo.descricao && (
                        <p className="text-sm text-gray-500 mt-1">
                          {emprestimo.descricao}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        emprestimo.status === "ATIVO"
                          ? "warning"
                          : emprestimo.status === "QUITADO"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {emprestimo.status === "ATIVO"
                        ? "Ativo"
                        : emprestimo.status === "QUITADO"
                        ? "Quitado"
                        : "Atrasado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Valor Total</p>
                      <p className="text-lg font-bold">
                        {formatarMoeda(emprestimo.valorTotal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valor da Parcela</p>
                      <p className="text-lg font-bold">
                        {formatarMoeda(emprestimo.valorParcela)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Parcelas</p>
                      <p className="text-lg font-bold">
                        {emprestimo.parcelasPagas}/{emprestimo.numeroParcelas}
                      </p>
                    </div>
                    {emprestimo.taxaJurosMensal && (
                      <div>
                        <p className="text-sm text-gray-500">Taxa de Juros</p>
                        <p className="text-lg font-bold">
                          {emprestimo.taxaJurosMensal.toFixed(2)}% a.m.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Progresso</span>
                      <span className="text-sm font-medium">
                        {percentualPago.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentualPago}%` }}
                      />
                    </div>
                  </div>

                  {proximaParcela && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-orange-900">
                            Próxima Parcela
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <p className="text-sm text-orange-700">
                                Parcela {proximaParcela.numeroParcela} de{" "}
                                {emprestimo.numeroParcelas}
                              </p>
                              <p className="text-sm text-orange-700">
                                Vencimento:{" "}
                                {formatarData(proximaParcela.dataVencimento)}
                              </p>
                            </div>
                            <p className="text-lg font-bold text-orange-900">
                              {formatarMoeda(proximaParcela.valor)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-2">
                    <Link href={`/dashboard/emprestimos/${emprestimo.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Todas as Parcelas
                      </Button>
                    </Link>
                    
                    <div className="flex gap-2">
                      <Link href={`/dashboard/emprestimos/${emprestimo.id}/editar`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                      <Link href={`/dashboard/emprestimos/${emprestimo.id}/excluir`} className="flex-1">
                        <Button variant="destructive" size="sm" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </Link>
                    </div>
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
