"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Wallet, DollarSign } from "lucide-react";
import Link from "next/link";
import { formatarMoeda } from "@/lib/formatters";

interface Emprestimo {
  id: string;
  instituicao: string;
  descricao: string | null;
  valorTotal: number;
  valorParcela: number;
  numeroParcelas: number;
  parcelasPagas: number;
  status: string;
}

interface Conta {
  id: string;
  nome: string;
  instituicao: string;
  saldoDisponivel: number;
}

export default function PagarEmprestimoPage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  
  const [formData, setFormData] = useState({
    emprestimoId: "",
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
    if (formData.emprestimoId) {
      const emprestimoSelecionado = emprestimos.find(e => e.id === formData.emprestimoId);
      if (emprestimoSelecionado) {
        setFormData(prev => ({ 
          ...prev, 
          valorPagamento: emprestimoSelecionado.valorParcela.toFixed(2)
        }));
      }
    }
  }, [formData.emprestimoId, emprestimos]);

  const carregarDados = async () => {
    try {
      const [resEmprestimos, resContas] = await Promise.all([
        fetch("/api/emprestimos"),
        fetch("/api/contas?ativas=true"),
      ]);

      if (resEmprestimos.ok) {
        const emprestimosData = await resEmprestimos.json();
        const emprestimosAtivos = emprestimosData.filter((e: Emprestimo) => e.status === "ATIVO");
        setEmprestimos(emprestimosAtivos);
        if (emprestimosAtivos.length > 0) {
          setFormData(prev => ({ ...prev, emprestimoId: emprestimosAtivos[0].id }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const valorPagamento = parseFloat(formData.valorPagamento);

    if (isNaN(valorPagamento) || valorPagamento <= 0) {
      setErro("Valor deve ser maior que zero");
      return;
    }

    const emprestimoSelecionado = emprestimos.find(e => e.id === formData.emprestimoId);
    if (!emprestimoSelecionado) {
      setErro("Selecione um empréstimo");
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
      const resposta = await fetch(`/api/emprestimos/${formData.emprestimoId}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valorPago: valorPagamento,
          contaBancariaId: formData.origemPagamento === "CONTA" ? formData.contaBancariaId : null,
          dataPagamento: formData.dataPagamento,
          observacoes: formData.observacoes || `Pagamento empréstimo ${emprestimoSelecionado.instituicao}`,
        }),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.erro || "Erro ao processar pagamento");
      }

      const resultado = await resposta.json();
      alert(resultado.mensagem);
      router.push("/dashboard/emprestimos");
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const emprestimoSelecionado = emprestimos.find(e => e.id === formData.emprestimoId);
  const parcelasRestantes = emprestimoSelecionado 
    ? emprestimoSelecionado.numeroParcelas - emprestimoSelecionado.parcelasPagas 
    : 0;
  const valorRestante = emprestimoSelecionado 
    ? emprestimoSelecionado.valorParcela * parcelasRestantes 
    : 0;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3 md:gap-4">
        <Link href="/dashboard/financeiro">
          <Button variant="outline" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">Pagar Empréstimo</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1 hidden sm:block">Registre o pagamento de parcela do empréstimo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Pagamento</CardTitle>
          <CardDescription>
            Selecione o empréstimo e informe o valor do pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {erro}
              </div>
            )}

            {emprestimos.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                Nenhum empréstimo ativo encontrado.
              </div>
            )}

            {/* Selecionar Empréstimo */}
            <div className="space-y-2">
              <Label htmlFor="emprestimoId">Empréstimo *</Label>
              <select
                id="emprestimoId"
                value={formData.emprestimoId}
                onChange={(e) => setFormData({ ...formData, emprestimoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione um empréstimo</option>
                {emprestimos.map((emprestimo) => (
                  <option key={emprestimo.id} value={emprestimo.id}>
                    {emprestimo.instituicao} - {emprestimo.descricao || 'Empréstimo'}
                  </option>
                ))}
              </select>
            </div>

            {/* Informações do Empréstimo */}
            {emprestimoSelecionado && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-gray-900">
                    {emprestimoSelecionado.instituicao}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Valor da parcela:</p>
                    <p className="font-bold text-lg">{formatarMoeda(emprestimoSelecionado.valorParcela)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Parcelas pagas:</p>
                    <p className="font-bold text-lg">{emprestimoSelecionado.parcelasPagas}/{emprestimoSelecionado.numeroParcelas}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Parcelas restantes:</p>
                    <p className="font-bold text-lg text-blue-600">{parcelasRestantes}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor restante:</p>
                    <p className="font-bold text-lg text-red-600">{formatarMoeda(valorRestante)}</p>
                  </div>
                </div>
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
              {emprestimoSelecionado && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, valorPagamento: emprestimoSelecionado.valorParcela.toFixed(2) })}
                    className="text-xs"
                  >
                    1 Parcela
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, valorPagamento: (emprestimoSelecionado.valorParcela * 2).toFixed(2) })}
                    className="text-xs"
                  >
                    2 Parcelas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, valorPagamento: valorRestante.toFixed(2) })}
                    className="text-xs"
                  >
                    Quitar
                  </Button>
                </div>
              )}
            </div>

            {/* Origem do Pagamento */}
            <div className="space-y-2">
              <Label>Origem do Pagamento *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="CONTA"
                    checked={formData.origemPagamento === "CONTA"}
                    onChange={(e) => setFormData({ ...formData, origemPagamento: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>Conta Bancária</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="CARTEIRA"
                    checked={formData.origemPagamento === "CARTEIRA"}
                    onChange={(e) => setFormData({ ...formData, origemPagamento: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>Carteira (Dinheiro)</span>
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
            {emprestimoSelecionado && parseFloat(formData.valorPagamento) > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Resumo do Pagamento:</p>
                <div className="space-y-1 text-sm">
                  <p>💼 Empréstimo: <strong>{emprestimoSelecionado.instituicao}</strong></p>
                  <p>💰 Valor: <strong>{formatarMoeda(parseFloat(formData.valorPagamento))}</strong></p>
                  <p>📅 Data: <strong>{new Date(formData.dataPagamento + 'T12:00:00').toLocaleDateString('pt-BR')}</strong></p>
                  <p>📊 Parcelas a pagar: <strong>{Math.ceil(parseFloat(formData.valorPagamento) / emprestimoSelecionado.valorParcela)}</strong></p>
                  {formData.origemPagamento === "CONTA" && (
                    <p>🏦 Débito: <strong>{contas.find(c => c.id === formData.contaBancariaId)?.nome}</strong></p>
                  )}
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={salvando || emprestimos.length === 0} className="flex-1">
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
