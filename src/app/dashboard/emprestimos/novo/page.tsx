"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NovoEmprestimoPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [formData, setFormData] = useState({
    instituicao: "",
    descricao: "",
    valorTotal: "",
    numeroParcelas: "",
    taxaJurosMensal: "",
    taxaJurosAnual: "",
    sistemaAmortizacao: "PRICE" as "PRICE" | "SAC",
    dataContratacao: new Date().toISOString().split("T")[0],
    diaVencimento: "10",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const valorTotal = parseFloat(formData.valorTotal);
    const numeroParcelas = parseInt(formData.numeroParcelas);

    if (valorTotal <= 0) {
      setErro("Valor total deve ser maior que zero");
      return;
    }

    if (numeroParcelas < 1 || numeroParcelas > 360) {
      setErro("Número de parcelas deve estar entre 1 e 360");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instituicao: formData.instituicao,
          descricao: formData.descricao || null,
          valorTotal,
          numeroParcelas,
          taxaJurosMensal: formData.taxaJurosMensal ? parseFloat(formData.taxaJurosMensal) : null,
          taxaJurosAnual: formData.taxaJurosAnual ? parseFloat(formData.taxaJurosAnual) : null,
          sistemaAmortizacao: formData.sistemaAmortizacao,
          dataContratacao: new Date(formData.dataContratacao),
          diaVencimento: parseInt(formData.diaVencimento),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao criar empréstimo");
        return;
      }

      router.push("/dashboard/emprestimos");
      router.refresh();
    } catch (error) {
      setErro("Erro ao criar empréstimo. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const valorParcela =
    formData.valorTotal && formData.numeroParcelas
      ? parseFloat(formData.valorTotal) / parseInt(formData.numeroParcelas)
      : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/dashboard/emprestimos"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Empréstimos
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Novo Empréstimo</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Cadastre um novo empréstimo para controlar parcelas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Empréstimo</CardTitle>
          <CardDescription>
            Preencha os dados do empréstimo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="instituicao">Instituição Financeira *</Label>
              <Input
                id="instituicao"
                placeholder="Ex: Banco do Brasil, Financeira XYZ"
                value={formData.instituicao}
                onChange={(e) =>
                  setFormData({ ...formData, instituicao: e.target.value })
                }
                required
                disabled={carregando}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="descricao">Descrição (Opcional)</Label>
              <Input
                id="descricao"
                placeholder="Ex: Empréstimo para reforma"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                disabled={carregando}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="valorTotal">Valor Total *</Label>
                <Input
                  id="valorTotal"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valorTotal}
                  onChange={(e) =>
                    setFormData({ ...formData, valorTotal: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="numeroParcelas">Número de Parcelas *</Label>
                <Input
                  id="numeroParcelas"
                  type="number"
                  min="1"
                  max="360"
                  placeholder="12"
                  value={formData.numeroParcelas}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroParcelas: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>
            </div>

            {valorParcela > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Valor da parcela:</strong> R${" "}
                  {valorParcela.toFixed(2)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="sistemaAmortizacao">Sistema de Amortização *</Label>
              <select
                id="sistemaAmortizacao"
                value={formData.sistemaAmortizacao}
                onChange={(e) =>
                  setFormData({ ...formData, sistemaAmortizacao: e.target.value as "PRICE" | "SAC" })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={carregando}
              >
                <option value="PRICE">PRICE - Parcelas Fixas (Empréstimo Pessoal)</option>
                <option value="SAC">SAC - Parcelas Decrescentes (Financiamento Imobiliário)</option>
              </select>
              <p className="text-xs text-gray-500">
                PRICE: parcelas iguais. SAC: parcelas diminuem ao longo do tempo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="taxaJurosMensal">Taxa de Juros Mensal (%)</Label>
                <Input
                  id="taxaJurosMensal"
                  type="number"
                  step="0.01"
                  placeholder="2.0"
                  value={formData.taxaJurosMensal}
                  onChange={(e) =>
                    setFormData({ ...formData, taxaJurosMensal: e.target.value })
                  }
                  disabled={carregando}
                />
                <p className="text-xs text-gray-500">
                  Exemplo: 2% ao mês
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="taxaJurosAnual">Taxa de Juros Anual (%)</Label>
                <Input
                  id="taxaJurosAnual"
                  type="number"
                  step="0.01"
                  placeholder="26.82"
                  value={formData.taxaJurosAnual}
                  onChange={(e) =>
                    setFormData({ ...formData, taxaJurosAnual: e.target.value })
                  }
                  disabled={carregando}
                />
                <p className="text-xs text-gray-500">
                  Exemplo: 26.82% ao ano
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="diaVencimento">Dia de Vencimento *</Label>
              <Input
                id="diaVencimento"
                type="number"
                min="1"
                max="31"
                value={formData.diaVencimento}
                onChange={(e) =>
                  setFormData({ ...formData, diaVencimento: e.target.value })
                }
                required
                disabled={carregando}
              />
              <p className="text-xs text-gray-500">
                Dia do mês que vence a parcela (1-31)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="dataContratacao">Data de Contratação *</Label>
              <Input
                id="dataContratacao"
                type="date"
                value={formData.dataContratacao}
                onChange={(e) =>
                  setFormData({ ...formData, dataContratacao: e.target.value })
                }
                required
                disabled={carregando}
              />
            </div>

            {/* Card de Resumo - Valor Estimado da Parcela */}
            {formData.valorTotal && formData.numeroParcelas && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-blue-900">📊 Estimativa da Parcela</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Valor Total:</span>
                    <span className="font-semibold text-blue-900">
                      R$ {parseFloat(formData.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Número de Parcelas:</span>
                    <span className="font-semibold text-blue-900">{formData.numeroParcelas}x</span>
                  </div>
                  <div className="border-t border-blue-300 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-blue-700">Valor Estimado da Parcela:</span>
                    <span className="text-lg font-bold text-blue-900">
                      R$ {valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {formData.taxaJurosMensal && (
                    <p className="text-xs text-blue-600 mt-2">
                      ⚠️ Valor aproximado sem juros. Com juros de {formData.taxaJurosMensal}% a.m., o valor real será maior.
                    </p>
                  )}
                  {!formData.taxaJurosMensal && (
                    <p className="text-xs text-blue-600 mt-2">
                      💡 Adicione a taxa de juros para ver o cálculo exato da parcela.
                    </p>
                  )}
                </div>
              </div>
            )}

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
                  "Salvar Empréstimo"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
