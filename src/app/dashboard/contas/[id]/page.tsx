import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TransacaoItem } from "@/components/transacao-item";

async function getContaDetalhes(contaId: string, usuarioId: string) {
  const conta = await prisma.contaBancaria.findFirst({
    where: {
      id: contaId,
      usuarioId,
    },
  });

  if (!conta) {
    return null;
  }

  // Buscar transações da conta
  const transacoes = await prisma.transacao.findMany({
    where: {
      contaBancariaId: contaId,
      usuarioId,
    },
    orderBy: { dataCompetencia: "desc" },
    take: 50,
    include: {
      categoria: true,
      contaBancaria: true,
    },
  });

  // Calcular estatísticas
  const totalReceitas = transacoes
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valor, 0);

  // Transações do mês atual
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const fimMes = new Date();
  fimMes.setMonth(fimMes.getMonth() + 1);
  fimMes.setDate(0);
  fimMes.setHours(23, 59, 59, 999);

  const transacoesMes = transacoes.filter(
    (t) => t.dataCompetencia >= inicioMes && t.dataCompetencia <= fimMes
  );

  const receitasMes = transacoesMes
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valor, 0);

  const despesasMes = transacoesMes
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valor, 0);

  return {
    conta,
    transacoes,
    totalReceitas,
    totalDespesas,
    receitasMes,
    despesasMes,
  };
}

export default async function ContaDetalhesPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const dados = await getContaDetalhes(params.id, session!.user.id);

  if (!dados) {
    notFound();
  }

  const { conta, transacoes, totalReceitas, totalDespesas, receitasMes, despesasMes } = dados;

  const getTipoConta = (tipo: string) => {
    const tipos: Record<string, string> = {
      CORRENTE: "Conta Corrente",
      POUPANCA: "Poupança",
      CARTEIRA: "Carteira",
      INVESTIMENTO: "Investimento",
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/contas" className="w-full md:w-auto">
          <Button className="w-full md:w-auto" variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{conta.nome}</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">{conta.instituicao}</p>
          </div>
        </div>
        <Link href={`/dashboard/contas/${conta.id}/editar`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Editar Conta
          </Button>
        </Link>
      </div>

      {/* Informações da Conta */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tipo:</span>
              <Badge variant="outline">{getTipoConta(conta.tipo)}</Badge>
            </div>
            {conta.agencia && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Agência:</span>
                <span className="text-sm font-medium">{conta.agencia}</span>
              </div>
            )}
            {conta.numero && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Número:</span>
                <span className="text-sm font-medium">{conta.numero}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Status:</span>
              <Badge variant={conta.ativa ? "success" : "destructive"}>
                {conta.ativa ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Saldo Inicial:</span>
              <span className="text-sm font-medium">
                {formatarMoeda(conta.saldoInicial)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Saldo Atual:</span>
              <span className={`text-base md:text-lg font-bold ${conta.saldoAtual >= 0 ? 'text-primary' : 'text-red-600'}`}>
                {formatarMoeda(conta.saldoAtual)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Saldo Disponível:</span>
              <span className="text-sm font-medium text-green-600">
                {formatarMoeda(conta.saldoDisponivel)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card de Crédito Especial */}
        {(conta as any).temLimiteCredito && (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Crédito Especial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600">Limite Total:</span>
                <span className="text-sm font-bold text-purple-700">
                  {formatarMoeda((conta as any).limiteCredito)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600">Limite Usado:</span>
                <span className={`text-sm font-bold ${conta.saldoAtual < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatarMoeda(Math.max(0, -conta.saldoAtual))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600">Limite Disponível:</span>
                <span className="text-base font-bold text-purple-700">
                  {formatarMoeda((conta as any).limiteCredito + Math.min(0, conta.saldoAtual))}
                </span>
              </div>
              {conta.saldoAtual < 0 && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                  ⚠️ Você está usando o crédito especial
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estatísticas do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Receitas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(receitasMes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Despesas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatarMoeda(despesasMes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Saldo do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                receitasMes - despesasMes >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatarMoeda(receitasMes - despesasMes)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Receitas (Histórico)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-green-600">
              {formatarMoeda(totalReceitas)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {transacoes.filter((t) => t.tipo === "RECEITA").length} transação(ões)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Despesas (Histórico)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-600">
              {formatarMoeda(totalDespesas)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {transacoes.filter((t) => t.tipo === "DESPESA").length} transação(ões)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transacoes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-sm text-gray-500">
                Esta conta ainda não possui transações registradas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transacoes.map((transacao) => (
                <TransacaoItem key={transacao.id} transacao={transacao} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
