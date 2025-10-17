"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, PiggyBank, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import Link from "next/link";

interface Meta {
  id: string;
  titulo: string;
  valorAlvo: number;
  valorAtual: number;
  status: string;
}

interface Conta {
  id: string;
  nome: string;
  instituicao: string;
  saldoAtual: number;
  ativa: boolean;
}

export default function AdicionarValorMetaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [contaSelecionada, setContaSelecionada] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [params.id]);

  const carregarDados = async () => {
    try {
      const [respostaMeta, respostaContas] = await Promise.all([
        fetch(`/api/metas/${params.id}`),
        fetch("/api/contas"),
      ]);

      if (respostaMeta.ok) {
        const dadosMeta = await respostaMeta.json();
        setMeta(dadosMeta);
        setDescricao(`Transferência para meta: ${dadosMeta.titulo}`);
      }

      if (respostaContas.ok) {
        const dadosContas = await respostaContas.json();
        setContas(dadosContas.filter((c: Conta) => c.ativa));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro("Erro ao carregar dados");
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!contaSelecionada) {
      setErro("Selecione uma conta");
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro("Valor deve ser maior que zero");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(`/api/metas/${params.id}/adicionar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: valorNumerico,
          contaId: contaSelecionada,
          descricao: descricao || undefined,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        router.push(`/dashboard/metas/${params.id}`);
        router.refresh();
      } else {
        setErro(dados.erro || "Erro ao adicionar valor");
      }
    } catch (error) {
      console.error("Erro ao adicionar valor:", error);
      setErro("Erro ao adicionar valor");
    } finally {
      setSalvando(false);
    }
  };

  const contaSelecionadaObj = contas.find((c) => c.id === contaSelecionada);
  const valorNumerico = parseFloat(valor) || 0;
  const valorRestante = meta ? meta.valorAlvo - meta.valorAtual : 0;
  const percentualAtual = meta ? (meta.valorAtual / meta.valorAlvo) * 100 : 0;
  const percentualAposTransferencia = meta ? ((meta.valorAtual + valorNumerico) / meta.valorAlvo) * 100 : 0;

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Meta não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/metas/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adicionar Valor à Meta</h1>
          <p className="text-gray-500 mt-1">{meta.titulo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transferir da Conta para Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {erro && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{erro}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="conta">Conta de Origem *</Label>
                  <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.nome} - {conta.instituicao} (Saldo: {formatarMoeda(conta.saldoAtual)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {contaSelecionadaObj && contaSelecionadaObj.saldoAtual < valorNumerico && (
                    <p className="text-xs text-red-600">
                      ⚠️ Saldo insuficiente nesta conta
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor a Transferir *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={valorRestante}
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      className="pl-12"
                      placeholder="0,00"
                      required
                      disabled={salvando}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Faltam: {formatarMoeda(valorRestante)}</span>
                    {valorNumerico > 0 && (
                      <span className={valorNumerico > valorRestante ? "text-red-600" : "text-green-600"}>
                        {valorNumerico > valorRestante ? "Valor excede o necessário" : "Valor válido"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Input
                    id="descricao"
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Transferência mensal"
                    disabled={salvando}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={salvando || !contaSelecionada || valorNumerico <= 0}
                    className="flex-1"
                  >
                    {salvando ? "Transferindo..." : "Transferir Valor"}
                  </Button>
                  <Link href={`/dashboard/metas/${params.id}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full" disabled={salvando}>
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          {/* Status Atual da Meta */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <PiggyBank className="h-4 w-4" />
                Status Atual da Meta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600">Valor Alvo:</span>
                <span className="text-sm font-bold text-purple-700">
                  {formatarMoeda(meta.valorAlvo)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600">Valor Atual:</span>
                <span className="text-sm font-bold text-purple-700">
                  {formatarMoeda(meta.valorAtual)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600">Falta:</span>
                <span className="text-sm font-bold text-purple-700">
                  {formatarMoeda(valorRestante)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-xs text-purple-600 mb-1">
                  <span>Progresso</span>
                  <span>{percentualAtual.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${Math.min(percentualAtual, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previsão Após Transferência */}
          {valorNumerico > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Após a Transferência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Novo Valor:</span>
                  <span className="text-sm font-bold text-green-700">
                    {formatarMoeda(meta.valorAtual + valorNumerico)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Faltará:</span>
                  <span className="text-sm font-bold text-green-700">
                    {formatarMoeda(Math.max(0, valorRestante - valorNumerico))}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-green-600 mb-1">
                    <span>Novo Progresso</span>
                    <span>{Math.min(percentualAposTransferencia, 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all duration-300"
                      style={{ width: `${Math.min(percentualAposTransferencia, 100)}%` }}
                    />
                  </div>
                </div>
                {percentualAposTransferencia >= 100 && (
                  <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-700 text-center">
                    🎉 Meta será concluída!
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Saldo da Conta */}
          {contaSelecionadaObj && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Saldo da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Saldo Atual:</span>
                  <span className="text-sm font-bold text-blue-700">
                    {formatarMoeda(contaSelecionadaObj.saldoAtual)}
                  </span>
                </div>
                {valorNumerico > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-600">Após Transferência:</span>
                      <span className={`text-sm font-bold ${
                        contaSelecionadaObj.saldoAtual - valorNumerico >= 0 ? 'text-blue-700' : 'text-red-600'
                      }`}>
                        {formatarMoeda(contaSelecionadaObj.saldoAtual - valorNumerico)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
