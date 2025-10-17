"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

// Função para obter data local no formato YYYY-MM-DD
function getDataLocalISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export default function NovaMetaPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    valorAlvo: "",
    valorAtual: "0",
    dataInicio: getDataLocalISO(),
    dataPrazo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const valorAlvo = parseFloat(formData.valorAlvo);
    const valorAtual = parseFloat(formData.valorAtual);

    if (valorAlvo <= 0) {
      setErro("Valor alvo deve ser maior que zero");
      return;
    }

    if (valorAtual < 0) {
      setErro("Valor atual não pode ser negativo");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: formData.titulo,
          descricao: formData.descricao || null,
          valorAlvo,
          valorAtual,
          dataInicio: new Date(formData.dataInicio),
          dataPrazo: formData.dataPrazo ? new Date(formData.dataPrazo) : null,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao criar meta");
        return;
      }

      router.push("/dashboard/metas");
      router.refresh();
    } catch (_error) {
      setErro("Erro ao criar meta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const percentual = formData.valorAlvo && formData.valorAtual
    ? (parseFloat(formData.valorAtual) / parseFloat(formData.valorAlvo)) * 100
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/dashboard/metas"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Metas
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nova Meta Financeira</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Defina um objetivo financeiro para alcançar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Meta</CardTitle>
          <CardDescription>
            Preencha os dados da sua meta financeira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="titulo">Título da Meta *</Label>
              <Input
                id="titulo"
                placeholder="Ex: Viagem para Europa, Reserva de Emergência"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                required
                disabled={carregando}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Descreva sua meta (opcional)"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                disabled={carregando}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="valorAlvo">Valor Alvo *</Label>
                <Input
                  id="valorAlvo"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valorAlvo}
                  onChange={(e) =>
                    setFormData({ ...formData, valorAlvo: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
                <p className="text-xs text-gray-500">
                  Quanto você quer alcançar
                </p>
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
                  Quanto você já tem
                </p>
              </div>
            </div>

            {percentual > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-900">Progresso Inicial</span>
                  <span className="text-sm font-medium text-blue-900">
                    {percentual.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(percentual, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="dataInicio">Data de Início *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, dataInicio: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="dataPrazo">Data Prazo</Label>
                <Input
                  id="dataPrazo"
                  type="date"
                  value={formData.dataPrazo}
                  onChange={(e) =>
                    setFormData({ ...formData, dataPrazo: e.target.value })
                  }
                  disabled={carregando}
                />
                <p className="text-xs text-gray-500">
                  Quando você quer alcançar (opcional)
                </p>
              </div>
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
                  "Salvar Meta"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
