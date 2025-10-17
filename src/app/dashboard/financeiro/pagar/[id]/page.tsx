"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatarMoeda } from "@/lib/formatters";

export default function PagarTransacaoPage() {
  const router = useRouter();
  const params = useParams();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [transacao, setTransacao] = useState<any>(null);
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    carregarTransacao();
  }, []);

  const carregarTransacao = async () => {
    try {
      const resposta = await fetch(`/api/transacoes/${params.id}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setTransacao(dados);
      } else {
        setErro("Transação não encontrada");
      }
    } catch (error) {
      setErro("Erro ao carregar transação");
    } finally {
      setCarregando(false);
    }
  };

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      const resposta = await fetch(`/api/transacoes/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: transacao.tipo === "RECEITA" ? "RECEBIDO" : "PAGO",
          dataCompetencia: new Date(dataPagamento),
          dataLiquidacao: new Date(dataPagamento),
        }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados.erro || "Erro ao marcar como pago");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErro("Erro ao processar pagamento");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!transacao) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">{erro || "Transação não encontrada"}</p>
            <div className="mt-4 text-center">
              <Link href="/dashboard">
                <Button variant="outline">Voltar ao Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dataVencimento = new Date(transacao.dataCompetencia);
  const hoje = new Date();
  const diasAtraso = Math.floor((hoje.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Pagar {transacao.tipo === "RECEITA" ? "Receita" : "Despesa"} Vencida
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Marque como pago e atualize a data de pagamento
        </p>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Descrição:</span>
              <span className="font-medium">{transacao.descricao}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor:</span>
              <span className="font-bold text-lg text-red-600">
                {formatarMoeda(transacao.valor)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Data de Vencimento:</span>
              <span className="font-medium">
                {dataVencimento.toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dias de Atraso:</span>
              <span className="font-bold text-red-600">{diasAtraso} dia(s)</span>
            </div>
            {transacao.categoria && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categoria:</span>
                <span className="font-medium">{transacao.categoria.nome}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confirmar Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePagar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataPagamento">
                Data do Pagamento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dataPagamento"
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                disabled={salvando}
                required
              />
              <p className="text-xs text-gray-500">
                Esta será a data registrada no calendário e relatórios
              </p>
            </div>

            {erro && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {erro}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={salvando}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando} className="flex-1 bg-green-600 hover:bg-green-700">
                {salvando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Confirmar Pagamento`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
