import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData, calcularFaturaCartao } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, CreditCard, Calendar, DollarSign, AlertCircle, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TransacaoItem } from "@/components/transacao-item";
import { FaturaAcoes } from "@/components/fatura-acoes";
import { CompraParceladaCard } from "@/components/compra-parcelada-card";

async function getCartaoDetalhes(cartaoId: string, usuarioId: string) {
  const cartao = await prisma.cartaoCredito.findFirst({
    where: {
      id: cartaoId,
      usuarioId,
    },
  });

  if (!cartao) {
    return null;
  }

  // Buscar faturas do cartão
  const faturas = await prisma.fatura.findMany({
    where: { cartaoId },
    orderBy: [{ anoReferencia: "desc" }, { mesReferencia: "desc" }],
    take: 12,
  });

  // Buscar transações do cartão
  const transacoes = await prisma.transacao.findMany({
    where: {
      cartaoCreditoId: cartaoId,
      usuarioId,
    },
    orderBy: { dataCompetencia: "desc" },
    take: 50,
    include: {
      categoria: true,
      cartaoCredito: true,
      fatura: true,
    },
  });

  // Fatura atual (usar regra de fechamento do cartão)
  const hoje = new Date();
  const periodo = calcularFaturaCartao(hoje, cartao.diaFechamento);
  const faturaAtual = faturas.find(
    (f) => f.mesReferencia === periodo.mes && f.anoReferencia === periodo.ano
  );

  // Próxima fatura (mês seguinte ao período atual)
  const proximoMes = periodo.mes === 12 ? 1 : periodo.mes + 1;
  const proximoAno = periodo.mes === 12 ? periodo.ano + 1 : periodo.ano;
  let proximaFatura = faturas.find(
    (f) => f.mesReferencia === proximoMes && f.anoReferencia === proximoAno
  );

  // Calcular estatísticas
  const totalGasto = transacoes.reduce((acc, t) => acc + t.valor, 0);

  // Calcular valor real da fatura atual (soma das transações)
  const valorRealFaturaAtual = faturaAtual
    ? transacoes
        .filter((t) => t.faturaId === faturaAtual.id)
        .reduce((acc, t) => acc + t.valor, 0)
    : 0;

  // Calcular valor real da próxima fatura
  const valorRealProximaFatura = proximaFatura
    ? transacoes
        .filter((t) => t.faturaId === proximaFatura.id)
        .reduce((acc, t) => acc + t.valor, 0)
    : 0;

  return {
    cartao,
    faturas,
    transacoes,
    faturaAtual,
    proximaFatura,
    totalGasto,
    valorRealFaturaAtual,
    valorRealProximaFatura,
  };
}

export default async function CartaoDetalhesPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions) as Session | null;
  const dados = await getCartaoDetalhes(params.id, session?.user.id);

  if (!dados) {
    notFound();
  }

  const { cartao, faturas, transacoes, faturaAtual, proximaFatura, totalGasto, valorRealFaturaAtual, valorRealProximaFatura } = dados;

  const getBandeira = (bandeira: string) => {
    const bandeiras: Record<string, string> = {
      VISA: "Visa",
      MASTERCARD: "Mastercard",
      ELO: "Elo",
      AMEX: "American Express",
      HIPERCARD: "Hipercard",
    };
    return bandeiras[bandeira] || bandeira;
  };

  const getStatusFatura = (status: string) => {
    const statuses: Record<string, { variant: any; label: string }> = {
      ABERTA: { variant: "warning", label: "Aberta" },
      FECHADA: { variant: "default", label: "Fechada" },
      PAGA: { variant: "success", label: "Paga" },
      VENCIDA: { variant: "destructive", label: "Vencida" },
    };
    return statuses[status] || { variant: "outline", label: status };
  };

  const percentualUtilizado = (cartao.limiteTotal - cartao.limiteDisponivel) / cartao.limiteTotal * 100;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cartoes" className="w-full md:w-auto">
          <Button className="w-full md:w-auto" variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{cartao.nome}</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              {cartao.banco} • {getBandeira(cartao.bandeira)}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/cartoes/${cartao.id}/editar`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Editar Cartão
          </Button>
        </Link>
      </div>

      {/* Informações do Cartão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Informações do Cartão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Bandeira:</span>
              <Badge variant="outline">{getBandeira(cartao.bandeira)}</Badge>
            </div>
            {cartao.apelido && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Apelido:</span>
                <span className="text-sm font-medium">{cartao.apelido}</span>
              </div>
            )}
            {cartao.numeroMascara && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Número:</span>
                <span className="text-sm font-medium font-mono">{cartao.numeroMascara}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Dia Fechamento:</span>
              <span className="text-sm font-medium">Dia {cartao.diaFechamento}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Dia Vencimento:</span>
              <span className="text-sm font-medium">Dia {cartao.diaVencimento}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Status:</span>
              <Badge variant={cartao.ativo ? "success" : "destructive"}>
                {cartao.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Limite do Cartão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Limite Total:</span>
              <span className="text-base md:text-lg font-bold text-primary">
                {formatarMoeda(cartao.limiteTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Limite Utilizado:</span>
              <span className="text-sm font-medium text-orange-600">
                {formatarMoeda(cartao.limiteTotal - cartao.limiteDisponivel)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Limite Disponível:</span>
              <span className="text-sm font-medium text-green-600">
                {formatarMoeda(cartao.limiteDisponivel)}
              </span>
            </div>
            
            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Utilização do limite</span>
                <span>{percentualUtilizado.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    percentualUtilizado > 80
                      ? "bg-red-500"
                      : percentualUtilizado > 50
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(percentualUtilizado, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Gasto (Histórico)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {formatarMoeda(totalGasto)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {transacoes.length} transação(ões)
            </p>
          </CardContent>
        </Card>

        {faturaAtual && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Fatura Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">
                {formatarMoeda(valorRealFaturaAtual)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Vence em {formatarData(faturaAtual.dataVencimento)}
              </p>
            </CardContent>
          </Card>
        )}

        {proximaFatura && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Próxima Fatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {formatarMoeda(valorRealProximaFatura)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Vence em {formatarData(proximaFatura.dataVencimento)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Faturas */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          {faturas.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">Nenhuma fatura encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {faturas.map((fatura) => {
                const statusFatura = getStatusFatura(fatura.status);
                const mesNome = new Date(fatura.anoReferencia, fatura.mesReferencia - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
                
                return (
                  <div
                    key={fatura.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{mesNome}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Vencimento: {formatarData(fatura.dataVencimento)}</span>
                          <span>•</span>
                          <span>Fechamento: {formatarData(fatura.dataFechamento)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={statusFatura.variant}>
                        {statusFatura.label}
                      </Badge>
                      <div className="text-right">
                        <p className="text-base md:text-lg font-bold text-gray-900">
                          {formatarMoeda(fatura.valorTotal)}
                        </p>
                        {fatura.valorPago > 0 && (
                          <p className="text-xs text-gray-500">
                            Pago: {formatarMoeda(fatura.valorPago)}
                          </p>
                        )}
                      </div>
                      <FaturaAcoes 
                        faturaId={fatura.id} 
                        cartaoId={cartao.id}
                        fatura={{
                          id: fatura.id,
                          valorTotal: fatura.valorTotal,
                          valorPago: fatura.valorPago,
                          mesReferencia: fatura.mesReferencia,
                          anoReferencia: fatura.anoReferencia,
                          status: fatura.status,
                          cartao: {
                            nome: cartao.nome,
                          },
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Compras */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {transacoes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                Nenhuma compra encontrada
              </h3>
              <p className="text-sm text-gray-500">
                Este cartão ainda não possui compras registradas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                // Agrupar compras parceladas pelo prefixo da descrição (antes de "(i/n)")
                const grupos: Array<{
                  chave: string;
                  descricaoBase: string;
                  itens: any[];
                  total: number;
                }> = [];
                const mapa = new Map<string, { descricaoBase: string; itens: any[]; total: number }>();

                const extrairBase = (descricao: string) => {
                  const m = descricao.match(/^(.*)\s\(\d+\/\d+\)$/);
                  return m ? m[1] : descricao;
                };

                // Ordenar por data desc já vem do banco, manter
                for (const t of transacoes) {
                  if (t.parcelado && t.parcelaTotal && t.parcelaTotal > 1) {
                    const base = extrairBase(t.descricao);
                    const chave = `${base}__${t.parcelaTotal}`;
                    if (!mapa.has(chave)) {
                      mapa.set(chave, { descricaoBase: base, itens: [], total: 0 });
                    }
                    const g = mapa.get(chave)!;
                    g.itens.push(t);
                    g.total += t.valor;
                  } else {
                    const chave = `single__${t.id}`;
                    mapa.set(chave, { descricaoBase: t.descricao, itens: [t], total: t.valor });
                  }
                }

                for (const [chave, g] of mapa.entries()) {
                  grupos.push({ chave, descricaoBase: g.descricaoBase, itens: g.itens, total: g.total });
                }

                // Renderizar grupos (mantém ordem de inserção)
                return grupos.map((g) => {
                  if (g.itens.length > 1) {
                    // Grupo parcelado - usar componente melhorado
                    return (
                      <CompraParceladaCard
                        key={g.chave}
                        descricaoBase={g.descricaoBase}
                        parcelas={g.itens}
                        valorTotal={g.total}
                      />
                    );
                  }
                  // Item único
                  return <TransacaoItem key={g.chave} transacao={g.itens[0]} />;
                });
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
