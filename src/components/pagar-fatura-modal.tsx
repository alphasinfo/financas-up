"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, DollarSign, CreditCard } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";

interface Fatura {
  id: string;
  valorTotal: number;
  valorPago: number;
  mesReferencia: number;
  anoReferencia: number;
  cartao?: {
    nome: string;
  };
}

interface ContaBancaria {
  id: string;
  nome: string;
  saldoDisponivel: number;
}

interface PagarFaturaModalProps {
  fatura: Fatura;
  onClose: () => void;
}

export function PagarFaturaModal({ fatura, onClose }: PagarFaturaModalProps) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  
  const valorRestante = fatura.valorTotal - fatura.valorPago;
  
  const [formData, setFormData] = useState({
    valorPago: valorRestante.toString(),
    contaBancariaId: "",
    dataPagamento: new Date().toISOString().split("T")[0],
    observacoes: "",
  });

  useEffect(() => {
    carregarContas();
    
    // Fechar modal com tecla ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const carregarContas = async () => {
    try {
      const resposta = await fetch("/api/contas");
      if (resposta.ok) {
        const dados = await resposta.json();
        setContas(dados);
        if (dados.length > 0) {
          setFormData(prev => ({ ...prev, contaBancariaId: dados[0].id }));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const valorPago = parseFloat(formData.valorPago);

    if (isNaN(valorPago) || valorPago <= 0) {
      setErro("Valor deve ser maior que zero");
      return;
    }

    if (valorPago > valorRestante) {
      setErro(`Valor não pode ser maior que ${formatarMoeda(valorRestante)}`);
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(`/api/faturas/${fatura.id}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valorPago,
          contaBancariaId: formData.contaBancariaId || null,
          dataPagamento: formData.dataPagamento,
          observacoes: formData.observacoes || null,
        }),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.erro || "Erro ao processar pagamento");
      }

      const resultado = await resposta.json();
      
      alert(resultado.mensagem);
      router.refresh();
      onClose();
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handlePagamentoTotal = () => {
    setFormData(prev => ({ ...prev, valorPago: valorRestante.toString() }));
  };

  const handlePagamentoMinimo = () => {
    const minimo = valorRestante * 0.15; // 15% do valor
    setFormData(prev => ({ ...prev, valorPago: minimo.toFixed(2) }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pagar Fatura</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {erro}
              </div>
            )}

            {/* Informações da Fatura */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <p className="font-medium text-gray-900">
                  {fatura.cartao?.nome || "Cartão"}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Fatura: {String(fatura.mesReferencia + 1).padStart(2, '0')}/{fatura.anoReferencia}
              </p>
              <div className="pt-2 border-t border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-medium">{formatarMoeda(fatura.valorTotal)}</span>
                </div>
                {fatura.valorPago > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Já pago:</span>
                    <span className="font-medium text-green-600">
                      {formatarMoeda(fatura.valorPago)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>Restante:</span>
                  <span className="text-blue-600">{formatarMoeda(valorRestante)}</span>
                </div>
              </div>
            </div>

            {/* Valor do Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="valorPago">Valor a Pagar *</Label>
              <Input
                id="valorPago"
                type="number"
                step="0.01"
                value={formData.valorPago}
                onChange={(e) => setFormData({ ...formData, valorPago: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePagamentoMinimo}
                  className="text-xs"
                >
                  Mínimo (15%)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePagamentoTotal}
                  className="text-xs"
                >
                  Total
                </Button>
              </div>
            </div>

            {/* Conta Bancária */}
            <div className="space-y-2">
              <Label htmlFor="contaBancariaId">Conta para Débito</Label>
              <select
                id="contaBancariaId"
                value={formData.contaBancariaId}
                onChange={(e) => setFormData({ ...formData, contaBancariaId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Não debitar de conta</option>
                {contas.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} - {formatarMoeda(conta.saldoDisponivel)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Se selecionada, o valor será debitado automaticamente
              </p>
            </div>

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
                rows={2}
                placeholder="Informações adicionais (opcional)"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={salvando} className="flex-1">
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
              <Button type="button" variant="outline" onClick={onClose} disabled={salvando}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
