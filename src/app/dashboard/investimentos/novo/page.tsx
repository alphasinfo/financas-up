"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const tiposInvestimento = [
  "RENDA_FIXA",
  "RENDA_VARIAVEL",
  "FUNDO",
  "TESOURO",
  "CDB",
  "LCI",
  "LCA",
  "DEBENTURE",
  "ACAO",
  "CRIPTOMOEDA",
  "OUTRO"
];

export default function NovoInvestimentoPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "RENDA_FIXA",
    valorAplicado: "",
    valorAtual: "",
    taxaRendimento: "",
    dataAplicacao: new Date().toISOString().split("T")[0],
    dataVencimento: "",
    instituicao: "",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const valorAplicado = parseFloat(formData.valorAplicado);
    if (valorAplicado <= 0) {
      setErro("Valor aplicado deve ser maior que zero");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/investimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          tipo: formData.tipo,
          valorAplicado,
          valorAtual: formData.valorAtual ? parseFloat(formData.valorAtual) : null,
          taxaRendimento: formData.taxaRendimento ? parseFloat(formData.taxaRendimento) : null,
          dataAplicacao: new Date(formData.dataAplicacao),
          dataVencimento: formData.dataVencimento ? new Date(formData.dataVencimento) : null,
          instituicao: formData.instituicao || null,
          observacoes: formData.observacoes || null,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao criar investimento");
        return;
      }

      router.push("/dashboard/investimentos");
      router.refresh();
    } catch (_error) {
      setErro("Erro ao criar investimento. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/dashboard/investimentos"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Investimentos
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Novo Investimento</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Cadastre um novo investimento
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Investimento</CardTitle>
          <CardDescription>
            Preencha os dados do investimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="nome">Nome do Investimento *</Label>
              <Input
                id="nome"
                placeholder="Ex: Tesouro Selic 2027"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
                disabled={carregando}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="tipo">Tipo *</Label>
                <select
                  id="tipo"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  disabled={carregando}
                >
                  {tiposInvestimento.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="instituicao">Instituição</Label>
                <Input
                  id="instituicao"
                  placeholder="Ex: XP Investimentos"
                  value={formData.instituicao}
                  onChange={(e) =>
                    setFormData({ ...formData, instituicao: e.target.value })
                  }
                  disabled={carregando}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="valorAplicado">Valor Aplicado *</Label>
                <Input
                  id="valorAplicado"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valorAplicado}
                  onChange={(e) =>
                    setFormData({ ...formData, valorAplicado: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="valorAtual">Valor Atual</Label>
                <Input
                  id="valorAtual"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valorAtual}
                  onChange={(e) =>
                    setFormData({ ...formData, valorAtual: e.target.value })
                  }
                  disabled={carregando}
                />
                <p className="text-xs text-gray-500">
                  Deixe em branco para usar o valor aplicado
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="taxaRendimento">Taxa de Rendimento (% a.a.)</Label>
              <Input
                id="taxaRendimento"
                type="number"
                step="0.01"
                placeholder="13.65"
                value={formData.taxaRendimento}
                onChange={(e) =>
                  setFormData({ ...formData, taxaRendimento: e.target.value })
                }
                disabled={carregando}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="dataAplicacao">Data de Aplicação *</Label>
                <Input
                  id="dataAplicacao"
                  type="date"
                  value={formData.dataAplicacao}
                  onChange={(e) =>
                    setFormData({ ...formData, dataAplicacao: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="dataVencimento">Data de Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={formData.dataVencimento}
                  onChange={(e) =>
                    setFormData({ ...formData, dataVencimento: e.target.value })
                  }
                  disabled={carregando}
                />
              </div>
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
                  "Salvar Investimento"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
