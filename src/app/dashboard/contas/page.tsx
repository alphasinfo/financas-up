import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, Building2, DollarSign } from "lucide-react";
import Link from "next/link";

// Forçar revalidação a cada requisição
export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getContas(usuarioId: string) {
  return await prisma.contaBancaria.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: "desc" },
  });
}

export default async function ContasPage() {
  const session = await getServerSession(authOptions) as Session | null;
  const contas = await getContas(session?.user.id);

  const totalSaldo = contas
    .filter((c) => c.ativa)
    .reduce((acc, conta) => acc + conta.saldoAtual, 0);

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contas Bancárias</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Gerencie suas contas e acompanhe seus saldos
          </p>
        </div>
        <Link href="/dashboard/contas/nova" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Saldo Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-900">
            {formatarMoeda(totalSaldo)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {contas.filter((c) => c.ativa).length} conta(s) ativa(s)
          </p>
        </CardContent>
      </Card>

      {contas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma conta cadastrada
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
              Comece cadastrando suas contas bancárias para ter controle total
              sobre seus saldos e movimentações
            </p>
            <Link href="/dashboard/contas/nova">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeira Conta
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {contas.map((conta) => (
            <Card
              key={conta.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center border-2"
                      style={{
                        backgroundColor: `${conta.cor || "#3B82F6"}20`,
                        borderColor: conta.cor || "#3B82F6",
                      }}
                    >
                      <Wallet
                        className="h-6 w-6"
                        style={{ color: conta.cor || "#3B82F6" }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{conta.nome}</CardTitle>
                      <p className="text-sm text-gray-500">{conta.instituicao}</p>
                    </div>
                  </div>
                  <Badge variant={conta.ativa ? "success" : "outline"}>
                    {conta.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                {/* Badge de Crédito Especial */}
                {(conta as any).temLimiteCredito && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Crédito: {formatarMoeda((conta as any).limiteCredito)}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Saldo Atual</p>
                    <p className={`text-2xl font-bold ${conta.saldoAtual >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {formatarMoeda(conta.saldoAtual)}
                    </p>
                    {(conta as any).temLimiteCredito && conta.saldoAtual < 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Usando crédito especial
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="font-medium text-gray-900">
                      {conta.tipo === "CORRENTE"
                        ? "Conta Corrente"
                        : conta.tipo === "POUPANCA"
                        ? "Poupança"
                        : "Carteira"}
                    </span>
                  </div>
                  {conta.agencia && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Agência:</span>
                      <span className="font-medium text-gray-900">
                        {conta.agencia}
                      </span>
                    </div>
                  )}
                  {conta.numero && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Conta:</span>
                      <span className="font-medium text-gray-900">
                        {conta.numero}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href={`/dashboard/contas/${conta.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
