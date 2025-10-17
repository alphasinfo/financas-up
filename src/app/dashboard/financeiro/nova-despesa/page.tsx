"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Categoria {
  id: string;
  nome: string;
  cor?: string;
}

interface Conta {
  id: string;
  nome: string;
  instituicao: string;
  cor?: string;
}

interface Cartao {
  id: string;
  nome: string;
  banco: string;
  limiteDisponivel: number;
  cor?: string;
}

export default function NovaDespesaPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    dataCompetencia: new Date().toISOString().split("T")[0],
    categoriaId: "",
    formaPagamento: "CONTA", // CONTA ou CARTAO
    contaBancariaId: "",
    cartaoCreditoId: "",
    parcelado: false,
    numeroParcelas: "1",
    observacoes: "",
    statusPagamento: "PAGO", // PAGO, AGENDADO, PENDENTE
    recorrente: false,
    frequenciaRecorrencia: "MENSAL", // DIARIO, SEMANAL, MENSAL, ANUAL
    quantidadeRecorrencias: "12",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resCategorias, resContas, resCartoes] = await Promise.all([
        fetch("/api/categorias?tipo=DESPESA", { cache: 'no-store' }),
        fetch("/api/contas?ativas=true", { cache: 'no-store' }),
        fetch("/api/cartoes?ativos=true", { cache: 'no-store' }),
      ]);

      if (resCategorias.ok) {
        const cats = await resCategorias.json();
        console.log("Categorias carregadas:", cats.length);
        setCategorias(cats);
        if (cats.length > 0 && !formData.categoriaId) {
          setFormData(prev => ({ ...prev, categoriaId: cats[0].id }));
        }
      }
      
      if (resContas.ok) {
        const cts = await resContas.json();
        console.log("Contas carregadas:", cts.length, cts);
        setContas(cts);
        if (cts.length > 0 && !formData.contaBancariaId) {
          setFormData(prev => ({ ...prev, contaBancariaId: cts[0].id }));
        }
      }
      
      if (resCartoes.ok) {
        const crs = await resCartoes.json();
        console.log("Cartões carregados:", crs.length, crs);
        setCartoes(crs);
        if (crs.length > 0 && !formData.cartaoCreditoId) {
          setFormData(prev => ({ ...prev, cartaoCreditoId: crs[0].id }));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const valor = parseFloat(formData.valor);
    if (valor <= 0) {
      setErro("Valor deve ser maior que zero");
      return;
    }

    if (formData.formaPagamento === "CONTA" && !formData.contaBancariaId) {
      setErro("Selecione uma conta bancária");
      return;
    }

    if (formData.formaPagamento === "CARTAO" && !formData.cartaoCreditoId) {
      setErro("Selecione um cartão de crédito");
      return;
    }

    if (formData.parcelado) {
      const parcelas = parseInt(formData.numeroParcelas);
      if (parcelas < 2 || parcelas > 48) {
        setErro("Número de parcelas deve estar entre 2 e 48");
        return;
      }
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/transacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "DESPESA",
          descricao: formData.descricao,
          valor,
          dataCompetencia: new Date(formData.dataCompetencia),
          status: formData.statusPagamento,
          categoriaId: formData.categoriaId || null,
          contaBancariaId:
            formData.formaPagamento === "CONTA" ? formData.contaBancariaId : null,
          cartaoCreditoId:
            formData.formaPagamento === "CARTAO" ? formData.cartaoCreditoId : null,
          parcelado: formData.parcelado,
          numeroParcelas: formData.parcelado ? parseInt(formData.numeroParcelas) : 1,
          observacoes: formData.observacoes || null,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao criar despesa");
        return;
      }

      router.push("/dashboard/financeiro");
      router.refresh();
    } catch (error) {
      setErro("Erro ao criar despesa. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const cartaoSelecionado = cartoes.find((c) => c.id === formData.cartaoCreditoId);
  const valorParcela = formData.parcelado
    ? parseFloat(formData.valor) / parseInt(formData.numeroParcelas)
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/dashboard/financeiro"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Financeiro
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nova Despesa</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Registre uma nova saída de dinheiro
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Despesa</CardTitle>
          <CardDescription>
            Preencha os dados da despesa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                placeholder="Ex: Compra no supermercado"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                required
                disabled={carregando}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="valor">Valor *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="dataCompetencia">Data *</Label>
                <Input
                  id="dataCompetencia"
                  type="date"
                  value={formData.dataCompetencia}
                  onChange={(e) =>
                    setFormData({ ...formData, dataCompetencia: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="categoriaId">Categoria</Label>
              <select
                id="categoriaId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.categoriaId}
                onChange={(e) =>
                  setFormData({ ...formData, categoriaId: e.target.value })
                }
                disabled={carregando}
              >
                <option value="">Sem categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Forma de Pagamento *</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, formaPagamento: "CONTA" })
                  }
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.formaPagamento === "CONTA"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={carregando}
                >
                  <p className="font-medium">Conta Bancária</p>
                  <p className="text-xs text-gray-500">Débito imediato</p>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, formaPagamento: "CARTAO" })
                  }
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.formaPagamento === "CARTAO"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={carregando}
                >
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-xs text-gray-500">Fatura futura</p>
                </button>
              </div>
            </div>

            {formData.formaPagamento === "CONTA" && (
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="contaBancariaId">Conta Bancária *</Label>
                <select
                  id="contaBancariaId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.contaBancariaId}
                  onChange={(e) =>
                    setFormData({ ...formData, contaBancariaId: e.target.value })
                  }
                  required
                  disabled={carregando}
                >
                  <option value="">Selecione uma conta</option>
                  {contas.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome} - {conta.instituicao}
                    </option>
                  ))}
                </select>
                {contas.length === 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    Nenhuma conta encontrada. <button type="button" onClick={carregarDados} className="underline font-medium">Recarregar</button> ou <Link href="/dashboard/contas/nova" className="underline font-medium">cadastre uma conta</Link>.
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  ⚠️ O valor será debitado imediatamente do saldo da conta
                </p>
              </div>
            )}

            {formData.formaPagamento === "CARTAO" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm md:text-base" htmlFor="cartaoCreditoId">Cartão de Crédito *</Label>
                  <select
                    id="cartaoCreditoId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.cartaoCreditoId}
                    onChange={(e) =>
                      setFormData({ ...formData, cartaoCreditoId: e.target.value })
                    }
                    required
                    disabled={carregando}
                  >
                    <option value="">Selecione um cartão</option>
                    {cartoes.map((cartao) => (
                      <option key={cartao.id} value={cartao.id}>
                        {cartao.nome} - {cartao.banco}
                      </option>
                    ))}
                  </select>
                  {cartoes.length === 0 && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      Nenhum cartão encontrado. <button type="button" onClick={carregarDados} className="underline font-medium">Recarregar</button> ou <Link href="/dashboard/cartoes/novo" className="underline font-medium">cadastre um cartão</Link>.
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    ⚠️ O limite disponível será reduzido imediatamente
                  </p>
                </div>

                {cartaoSelecionado && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-orange-900">
                      <strong>Limite disponível:</strong> R${" "}
                      {cartaoSelecionado.limiteDisponivel.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="parcelado"
                      checked={formData.parcelado}
                      onChange={(e) =>
                        setFormData({ ...formData, parcelado: e.target.checked })
                      }
                      disabled={carregando}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="parcelado" className="text-sm md:text-base cursor-pointer">
                      Parcelar compra
                    </Label>
                  </div>
                </div>

                {formData.parcelado && (
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base" htmlFor="numeroParcelas">Número de Parcelas *</Label>
                    <Input
                      id="numeroParcelas"
                      type="number"
                      min="2"
                      max="48"
                      value={formData.numeroParcelas}
                      onChange={(e) =>
                        setFormData({ ...formData, numeroParcelas: e.target.value })
                      }
                      required
                      disabled={carregando}
                    />
                    {formData.valor && parseInt(formData.numeroParcelas) > 1 && (
                      <p className="text-sm text-gray-600">
                        {formData.numeroParcelas}x de R$ {valorParcela.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="statusPagamento">Status do Pagamento *</Label>
              <select
                id="statusPagamento"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.statusPagamento}
                onChange={(e) =>
                  setFormData({ ...formData, statusPagamento: e.target.value })
                }
                disabled={carregando}
              >
                <option value="PAGO">Pago</option>
                <option value="AGENDADO">Agendado</option>
                <option value="PENDENTE">Pendente</option>
              </select>
              <p className="text-xs text-gray-500">
                {formData.statusPagamento === "AGENDADO" && "⏰ Será pago na data selecionada"}
                {formData.statusPagamento === "PENDENTE" && "⏳ Aguardando pagamento"}
                {formData.statusPagamento === "PAGO" && "✅ Já foi pago"}
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id="recorrente"
                  checked={formData.recorrente}
                  onChange={(e) =>
                    setFormData({ ...formData, recorrente: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={carregando}
                />
                <Label htmlFor="recorrente" className="text-sm md:text-base cursor-pointer">
                  Despesa recorrente
                </Label>
              </div>

              {formData.recorrente && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base" htmlFor="frequenciaRecorrencia">Frequência *</Label>
                    <select
                      id="frequenciaRecorrencia"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.frequenciaRecorrencia}
                      onChange={(e) =>
                        setFormData({ ...formData, frequenciaRecorrencia: e.target.value })
                      }
                      disabled={carregando}
                    >
                      <option value="DIARIO">Diário</option>
                      <option value="SEMANAL">Semanal</option>
                      <option value="MENSAL">Mensal</option>
                      <option value="ANUAL">Anual</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm md:text-base" htmlFor="quantidadeRecorrencias">Repetições *</Label>
                    <Input
                      id="quantidadeRecorrencias"
                      type="number"
                      min="2"
                      max="120"
                      value={formData.quantidadeRecorrencias}
                      onChange={(e) =>
                        setFormData({ ...formData, quantidadeRecorrencias: e.target.value })
                      }
                      disabled={carregando}
                    />
                    <p className="text-xs text-gray-500">
                      Será criada {formData.quantidadeRecorrencias}x
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Informações adicionais (opcional)"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                disabled={carregando}
              />
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
                disabled={carregando}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={carregando} className="flex-1 w-full md:w-auto">
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Despesa"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
