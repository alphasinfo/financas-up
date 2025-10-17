"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, CreditCard, DollarSign } from "lucide-react";
import Link from "next/link";
import { formatarMoeda } from "@/lib/formatters";

interface Cartao {
  id: string;
  nome: string;
  banco: string;
  limiteDisponivel: number;
  limiteTotal: number;
}

interface Fatura {
  id: string;
  valorTotal: number;
  valorPago: number;
  mesReferencia: number;
  anoReferencia: number;
  status: string;
}

interface Conta {
  id: string;
  nome: string;
  instituicao: string;
  saldoDisponivel: number;
}

export default function PagarCartaoPage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [faturaAtual, setFaturaAtual] = useState<Fatura | null>(null);
  const [carregandoFatura, setCarregandoFatura] = useState(false);
  
  const [formData, setFormData] = useState({
    cartaoId: "",
    valorPagamento: "",
    origemPagamento: "CONTA", // CONTA ou CARTEIRA
    contaBancariaId: "",
    dataPagamento: new Date().toISOString().split("T")[0],
    observacoes: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (formData.cartaoId) {
      carregarFaturaAtual();
    }
  }, [formData.cartaoId]);

  const carregarDados = async () => {
    try {
      const [resCartoes, resContas] = await Promise.all([
        fetch("/api/cartoes?ativos=true"),
        fetch("/api/contas?ativas=true"),
      ]);

      if (resCartoes.ok) {
        const cartoesData = await resCartoes.json();
        setCartoes(cartoesData);
        if (cartoesData.length > 0) {
          setFormData(prev => ({ ...prev, cartaoId: cartoesData[0].id }));
        }
      }
      
      if (resContas.ok) {
        const contasData = await resContas.json();
        setContas(contasData);
        if (contasData.length > 0) {
          setFormData(prev => ({ ...prev, contaBancariaId: contasData[0].id }));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const carregarFaturaAtual = async () => {
    if (!formData.cartaoId) return;
    
    setCarregandoFatura(true);
    try {
      const resposta = await fetch(`/api/cartoes/${formData.cartaoId}/fatura-atual`);
      if (resposta.ok) {
        const fatura = await resposta.json();
        setFaturaAtual(fatura);
        
        // Sugerir valor da fatura menos o que já foi pago
        const valorRestante = fatura.valorTotal - fatura.valorPago;
        setFormData(prev => ({ 
          ...prev, 
          valorPagamento: valorRestante > 0 ? valorRestante.toFixed(2) : "0.00"
        }));
      } else {
        setFaturaAtual(null);
        setFormData(prev => ({ ...prev, valorPagamento: "0.00" }));
      }
    } catch (error) {
      console.error("Erro ao carregar fatura:", error);
      setFaturaAtual(null);
    } finally {
      setCarregandoFatura(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const valorPagamento = parseFloat(formData.valorPagamento);

    if (isNaN(valorPagamento) || valorPagamento <= 0) {
      setErro("Valor deve ser maior que zero");
      return;
    }

    if (!faturaAtual) {
      setErro("Nenhuma fatura encontrada para este cartão");
      return;
    }

    const valorRestante = faturaAtual.valorTotal - faturaAtual.valorPago;
    if (valorPagamento > valorRestante) {
      setErro(`Valor não pode ser maior que ${formatarMoeda(valorRestante)}`);
      return;
    }

    // Verificar saldo se for débito de conta
    if (formData.origemPagamento === "CONTA") {
      const contaSelecionada = contas.find(c => c.id === formData.contaBancariaId);
      if (contaSelecionada && valorPagamento > contaSelecionada.saldoDisponivel) {
        setErro(`Saldo insuficiente na conta. Disponível: ${formatarMoeda(contaSelecionada.saldoDisponivel)}`);
        return;
      }
    }

    setSalvando(true);

    try {
      const resposta = await fetch(`/api/faturas/${faturaAtual.id}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valorPago: valorPagamento,
          contaBancariaId: formData.origemPagamento === "CONTA" ? formData.contaBancariaId : null,
          dataPagamento: formData.dataPagamento,
          observacoes: formData.observacoes || `Pagamento fatura cartão`,
        }),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.erro || "Erro ao processar pagamento");
      }

      const resultado = await resposta.json();
      alert(resultado.mensagem);
      router.push("/dashboard/financeiro");
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const cartaoSelecionado = cartoes.find(c => c.id === formData.cartaoId);
  const valorRestante = faturaAtual ? faturaAtual.valorTotal - faturaAtual.valorPago : 0;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3 md:gap-4">
        <Link href="/dashboard/financeiro">
          <Button variant="outline" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">Pagar Cartão</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1 hidden sm:block">Registre o pagamento da fatura do cartão</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Pagamento</CardTitle>
          <CardDescription>
            Selecione o cartão e informe o valor do pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {erro}
              </div>
            )}

            {/* Selecionar Cartão */}
            <div className="space-y-2">
              <Label htmlFor="cartaoId">Cartão de Crédito *</Label>
              <select
                id="cartaoId"
                value={formData.cartaoId}
                onChange={(e) => setFormData({ ...formData, cartaoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione um cartão</option>
                {cartoes.map((cartao) => (
                  <option key={cartao.id} value={cartao.id}>
                    {cartao.nome} - {cartao.banco}
                  </option>
                ))}
              </select>
            </div>

            {/* Informações da Fatura */}
            {carregandoFatura && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}

            {!carregandoFatura && faturaAtual && (
              <div className="bg-blue-50 p-3 md:p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-600 shrink-0" />
                  <p className="font-medium text-sm md:text-base text-gray-900">
                    Fatura {String(faturaAtual.mesReferencia + 1).padStart(2, '0')}/{faturaAtual.anoReferencia}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Valor total:</p>
                    <p className="font-bold text-base md:text-lg">{formatarMoeda(faturaAtual.valorTotal)}</p>
                  </div>
                  {faturaAtual.valorPago > 0 && (
                    <div>
                      <p className="text-gray-600 text-xs">Já pago:</p>
                      <p className="font-bold text-base md:text-lg text-green-600">{formatarMoeda(faturaAtual.valorPago)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600 text-xs">Restante:</p>
                    <p className="font-bold text-base md:text-lg text-blue-600">{formatarMoeda(valorRestante)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Status:</p>
                    <p className="font-medium text-sm">{faturaAtual.status === "PAGA" ? "Paga" : faturaAtual.status === "PARCIAL" ? "Parcial" : "Aberta"}</p>
                  </div>
                </div>
              </div>
            )}

            {!carregandoFatura && !faturaAtual && formData.cartaoId && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                <p className="font-medium mb-2">⚠️ Nenhuma fatura encontrada para este cartão</p>
                <p className="text-sm mb-3">
                  Isso pode acontecer se ainda não há compras registradas neste cartão.
                </p>
                <Link href="/dashboard/financeiro/nova-despesa">
                  <Button type="button" size="sm" variant="outline" className="bg-white">
                    Criar Nova Despesa
                  </Button>
                </Link>
              </div>
            )}

            {/* Valor do Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="valorPagamento">Valor do Pagamento (R$) *</Label>
              <Input
                id="valorPagamento"
                type="number"
                step="0.01"
                value={formData.valorPagamento}
                onChange={(e) => setFormData({ ...formData, valorPagamento: e.target.value })}
                placeholder="0.00"
                required
              />
              {faturaAtual && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, valorPagamento: (valorRestante * 0.15).toFixed(2) })}
                    className="text-xs flex-1 sm:flex-none"
                  >
                    Mínimo (15%)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, valorPagamento: valorRestante.toFixed(2) })}
                    className="text-xs flex-1 sm:flex-none"
                  >
                    Total
                  </Button>
                </div>
              )}
            </div>

            {/* Origem do Pagamento */}
            <div className="space-y-2">
              <Label>Origem do Pagamento *</Label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="CONTA"
                    checked={formData.origemPagamento === "CONTA"}
                    onChange={(e) => setFormData({ ...formData, origemPagamento: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Conta Bancária</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="CARTEIRA"
                    checked={formData.origemPagamento === "CARTEIRA"}
                    onChange={(e) => setFormData({ ...formData, origemPagamento: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Carteira (Dinheiro)</span>
                </label>
              </div>
            </div>

            {/* Conta Bancária (se selecionado) */}
            {formData.origemPagamento === "CONTA" && (
              <div className="space-y-2">
                <Label htmlFor="contaBancariaId">Conta Bancária *</Label>
                <select
                  id="contaBancariaId"
                  value={formData.contaBancariaId}
                  onChange={(e) => setFormData({ ...formData, contaBancariaId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Selecione uma conta</option>
                  {contas.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome} - {conta.instituicao} ({formatarMoeda(conta.saldoDisponivel)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Data do Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="dataPagamento">Data do Pagamento *</Label>
              <Input
                id="dataPagamento"
                type="date"
                value={formData.dataPagamento}
                onChange={(e) => setFormData({ ...formData, dataPagamento: e.target.value })}
                required
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Informações adicionais (opcional)"
              />
            </div>

            {/* Resumo */}
            {cartaoSelecionado && parseFloat(formData.valorPagamento) > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Resumo do Pagamento:</p>
                <div className="space-y-1 text-sm">
                  <p>💳 Cartão: <strong>{cartaoSelecionado.nome}</strong></p>
                  <p>💰 Valor: <strong>{formatarMoeda(parseFloat(formData.valorPagamento))}</strong></p>
                  <p>📅 Data: <strong>{new Date(formData.dataPagamento + 'T12:00:00').toLocaleDateString('pt-BR')}</strong></p>
                  <p>🔓 Limite liberado: <strong>+{formatarMoeda(parseFloat(formData.valorPagamento))}</strong></p>
                  {formData.origemPagamento === "CONTA" && (
                    <p>🏦 Débito: <strong>{contas.find(c => c.id === formData.contaBancariaId)?.nome}</strong></p>
                  )}
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={salvando || !faturaAtual} className="flex-1">
                {salvando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Confirmar Pagamento
                  </>
                )}
              </Button>
              <Link href="/dashboard/financeiro" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
