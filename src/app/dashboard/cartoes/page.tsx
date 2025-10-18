import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, calcularPorcentagem, formatarPorcentagem } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard } from "lucide-react";
import Link from "next/link";

// Forçar revalidação a cada requisição
export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getCartoes(usuarioId: string) {
  const cartoes = await prisma.cartaoCredito.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: "desc" },
    include: {
      faturas: {
        where: {
          status: { in: ["ABERTA", "FECHADA"] },
        },
        orderBy: { dataVencimento: "asc" },
      },
    },
  });

  // Para cada cartão, identificar a fatura atual baseada no fechamento
  const hoje = new Date();
  const cartoesComFaturaAtual = cartoes.map(cartao => {
    // Encontrar a fatura do período atual
    const faturaAtual = cartao.faturas.find(fatura => {
      const dataFechamento = new Date(fatura.dataFechamento);
      const dataVencimento = new Date(fatura.dataVencimento);
      // Fatura atual é aquela cujo fechamento já passou mas vencimento ainda não
      return dataFechamento <= hoje && dataVencimento >= hoje;
    }) || cartao.faturas.find(fatura => {
      // Se não encontrou, pegar a próxima fatura em aberto
      const dataVencimento = new Date(fatura.dataVencimento);
      return dataVencimento >= hoje && fatura.status === "ABERTA";
    });

    return {
      ...cartao,
      faturas: faturaAtual ? [faturaAtual] : [],
    };
  });

  return cartoesComFaturaAtual;
}

export default async function CartoesPage() {
  const session = await getServerSession(authOptions);
  const cartoes = await getCartoes(session!.user.id);

  const limiteTotal = cartoes
    .filter((c) => c.ativo)
    .reduce((acc, cartao) => acc + cartao.limiteTotal, 0);

  const limiteDisponivel = cartoes
    .filter((c) => c.ativo)
    .reduce((acc, cartao) => acc + cartao.limiteDisponivel, 0);

  const limiteUtilizado = limiteTotal - limiteDisponivel;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cartões de Crédito</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Gerencie seus cartões e acompanhe suas faturas
          </p>
        </div>
        <Link href="/dashboard/cartoes/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cartão
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Limite Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {formatarMoeda(limiteTotal)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Limite Utilizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {formatarMoeda(limiteUtilizado)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatarPorcentagem(calcularPorcentagem(limiteUtilizado, limiteTotal))} do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Limite Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(limiteDisponivel)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatarPorcentagem(calcularPorcentagem(limiteDisponivel, limiteTotal))} do total
            </p>
          </CardContent>
        </Card>
      </div>

      {cartoes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum cartão cadastrado
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
              Cadastre seus cartões de crédito para controlar faturas, limites e
              parcelamentos automaticamente
            </p>
            <Link href="/dashboard/cartoes/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Cartão
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {cartoes.map((cartao) => {
            const percentualUtilizado = calcularPorcentagem(
              cartao.limiteTotal - cartao.limiteDisponivel,
              cartao.limiteTotal
            );

            return (
              <Card
                key={cartao.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center border-2"
                        style={{
                          backgroundColor: `${cartao.cor || "#F59E0B"}20`,
                          borderColor: cartao.cor || "#F59E0B",
                        }}
                      >
                        <CreditCard
                          className="h-6 w-6"
                          style={{ color: cartao.cor || "#F59E0B" }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {cartao.apelido || cartao.nome}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {cartao.banco} - {cartao.bandeira}
                        </p>
                      </div>
                    </div>
                    <Badge variant={cartao.ativo ? "success" : "outline"}>
                      {cartao.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Limite Disponível</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatarMoeda(cartao.limiteDisponivel)}
                      </p>
                      <p className="text-xs text-gray-500">
                        de {formatarMoeda(cartao.limiteTotal)}
                      </p>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentualUtilizado > 80
                            ? "bg-red-500"
                            : percentualUtilizado > 50
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${percentualUtilizado}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Fechamento:</span>
                        <p className="font-medium">Dia {cartao.diaFechamento}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Vencimento:</span>
                        <p className="font-medium">Dia {cartao.diaVencimento}</p>
                      </div>
                    </div>

                    {cartao.faturas[0] && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Fatura Atual</p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatarMoeda(cartao.faturas[0].valorTotal)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link href={`/dashboard/cartoes/${cartao.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Detalhes
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
