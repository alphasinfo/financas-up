// @ts-ignore - getServerSession existe no next-auth v4
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Filter, CreditCard, PiggyBank } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TransacaoItem } from "@/components/transacao-item";

// Desabilitar cache para sempre buscar dados atualizados
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTransacoes(usuarioId: string) {
  const transacoes = await prisma.transacao.findMany({
    where: { usuarioId },
    orderBy: { dataCompetencia: "desc" },
    take: 50,
    include: {
      categoria: true,
      contaBancaria: true,
      cartaoCredito: true,
    },
  });

  // Calcular totais do mês atual
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
    .filter((t) => t.tipo === "RECEITA" && (t.status === "RECEBIDO" || t.status === "PAGO"))
    .reduce((acc, t) => acc + t.valor, 0);

  // Separar despesas de cartão das demais
  // Cartão: incluir PENDENTE (compras não pagas) e PAGO (faturas pagas)
  const despesasCartaoMes = transacoesMes
    .filter((t) => t.tipo === "DESPESA" && t.cartaoCreditoId !== null)
    .reduce((acc, t) => acc + t.valor, 0);

  // Despesas normais: apenas PAGAS
  const despesasMes = transacoesMes
    .filter((t) => t.tipo === "DESPESA" && t.cartaoCreditoId === null && t.status === "PAGO")
    .reduce((acc, t) => acc + t.valor, 0);

  return {
    transacoes,
    receitasMes,
    despesasMes,
    despesasCartaoMes,
    saldoMes: receitasMes - despesasMes, // Saldo sem incluir cartão
  };
}

export default async function FinanceiroPage() {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user) {
    notFound();
  }

  const   const dados = await getTransacoes(session.user.id);

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <div className="grid grid-cols-2 md:flex gap-2">
          <Link href="/dashboard/financeiro/nova-receita" className="w-full md:w-auto">
            <Button variant="outline" className="w-full bg-green-50 text-green-700 hover:bg-green-100 text-xs md:text-sm">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Nova </span>Receita
            </Button>
          </Link>
          <Link href="/dashboard/financeiro/nova-despesa" className="w-full md:w-auto">
            <Button className="w-full text-xs md:text-sm">
              <TrendingDown className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Nova </span>Despesa
            </Button>
          </Link>
          <Link href="/dashboard/financeiro/pagar-cartao" className="w-full md:w-auto">
            <Button variant="outline" className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs md:text-sm">
              <CreditCard className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Pagar </span>Cartão
            </Button>
          </Link>
          <Link href="/dashboard/financeiro/pagar-emprestimo" className="w-full md:w-auto">
            <Button variant="outline" className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs md:text-sm">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Pagar </span>Empréstimo
            </Button>
          </Link>
          <Link href="/dashboard/financeiro/adicionar-meta" className="w-full md:w-auto">
            <Button variant="outline" className="w-full bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs md:text-sm">
              <PiggyBank className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Adicionar à </span>Meta
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-1 md:gap-2">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600 shrink-0" />
              <span className="truncate">Receitas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg md:text-2xl font-bold text-green-600">
              {formatarMoeda(dados.receitasMes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-1 md:gap-2">
              <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600 shrink-0" />
              <span className="truncate">Despesas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg md:text-2xl font-bold text-red-600">
              {formatarMoeda(dados.despesasMes)}
            </p>
            <p className="text-xs text-gray-500 mt-1 hidden md:block">
              Sem cartão de crédito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-1 md:gap-2">
              <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-blue-600 shrink-0" />
              <span className="truncate">Cartão</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg md:text-2xl font-bold text-blue-600">
              {formatarMoeda(dados.despesasCartaoMes)}
            </p>
            <p className="text-xs text-gray-500 mt-1 hidden md:block">
              Compras do mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-1 md:gap-2">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
              <span className="truncate">Saldo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p
              className={`text-lg md:text-2xl font-bold ${
                dados.saldoMes >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatarMoeda(dados.saldoMes)}
            </p>
            <p className="text-xs text-gray-500 mt-1 hidden md:block">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dados.transacoes.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma transação cadastrada
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Comece registrando suas receitas e despesas
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/dashboard/financeiro/nova-receita">
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Nova Receita
                  </Button>
                </Link>
                <Link href="/dashboard/financeiro/nova-despesa">
                  <Button size="sm">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Nova Despesa
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {dados.transacoes.map((transacao) => (
                <TransacaoItem key={transacao.id} transacao={transacao} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
