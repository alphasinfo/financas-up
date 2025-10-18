import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getEmprestimo(id: string, usuarioId: string) {
  const emprestimo = await prisma.emprestimo.findUnique({
    where: { id },
    include: {
      parcelas: {
        orderBy: { numeroParcela: "asc" },
      },
    },
  });

  if (!emprestimo || emprestimo.usuarioId !== usuarioId) {
    return null;
  }

  return emprestimo;
}

export default async function EmprestimoDetalhesPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const emprestimo = await getEmprestimo(params.id, session!.user.id);

  if (!emprestimo) {
    notFound();
  }

  const percentualPago = (emprestimo.parcelasPagas / emprestimo.numeroParcelas) * 100;
  const totalPago = emprestimo.parcelasPagas * emprestimo.valorParcela;
  const totalRestante = emprestimo.valorTotal - totalPago;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/emprestimos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{emprestimo.instituicao}</h1>
          {emprestimo.descricao && (
            <p className="text-gray-500 mt-1">{emprestimo.descricao}</p>
          )}
        </div>
      </div>

      {/* Card de Resumo */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg text-amber-700">Resumo do Empréstimo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-xs text-amber-600 mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-amber-700">{formatarMoeda(emprestimo.valorTotal)}</p>
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
              <p className="text-2xl font-bold text-green-600">{percentualPago.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-amber-600 mb-1">
              <span>Parcelas Pagas</span>
              <span>{emprestimo.parcelasPagas} de {emprestimo.numeroParcelas}</span>
            </div>
            <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${percentualPago}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-xs text-amber-600 mb-1">Valor da Parcela</p>
              <p className="text-lg font-bold">{formatarMoeda(emprestimo.valorParcela)}</p>
            </div>
            {emprestimo.taxaJurosMensal && (
              <div>
                <p className="text-xs text-amber-600 mb-1">Taxa de Juros</p>
                <p className="text-lg font-bold">{emprestimo.taxaJurosMensal.toFixed(2)}% a.m.</p>
              </div>
            )}
            {emprestimo.sistemaAmortizacao && (
              <div>
                <p className="text-xs text-amber-600 mb-1">Sistema</p>
                <p className="text-lg font-bold">{emprestimo.sistemaAmortizacao}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-amber-600 mb-1">Status</p>
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Parcelas */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Parcelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emprestimo.parcelas.map((parcela) => {
              const isPaga = parcela.status === "PAGA";
              const isAtrasada = parcela.status === "ATRASADA";
              const isPendente = parcela.status === "PENDENTE";

              return (
                <div
                  key={parcela.id}
                  className={`p-4 rounded-lg border-2 ${
                    isPaga
                      ? "bg-green-50 border-green-200"
                      : isAtrasada
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isPaga ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : isAtrasada ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          Parcela {parcela.numeroParcela} de {emprestimo.numeroParcelas}
                        </p>
                        <p className="text-sm text-gray-600">
                          Vencimento: {formatarData(parcela.dataVencimento)}
                        </p>
                        {parcela.dataPagamento && (
                          <p className="text-sm text-green-600">
                            Pago em: {formatarData(parcela.dataPagamento)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatarMoeda(parcela.valor)}</p>
                      <Badge
                        variant={
                          isPaga ? "success" : isAtrasada ? "destructive" : "default"
                        }
                      >
                        {isPaga ? "Paga" : isAtrasada ? "Atrasada" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
