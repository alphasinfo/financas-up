"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const cores = [
  { nome: "Azul", valor: "#3B82F6" },
  { nome: "Verde", valor: "#10B981" },
  { nome: "Roxo", valor: "#8B5CF6" },
  { nome: "Rosa", valor: "#EC4899" },
  { nome: "Laranja", valor: "#F59E0B" },
  { nome: "Vermelho", valor: "#EF4444" },
  { nome: "Cinza", valor: "#6B7280" },
  { nome: "Índigo", valor: "#6366F1" },
];

const bandeiras = ["VISA", "MASTERCARD", "ELO", "AMERICAN EXPRESS", "HIPERCARD", "DINERS"];

export default function NovoCartaoPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    banco: "",
    bandeira: "VISA",
    apelido: "",
    numeroMascara: "",
    limiteTotal: "0",
    diaFechamento: "5",
    diaVencimento: "15",
    cor: "#F59E0B",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    // Validações
    const diaFech = parseInt(formData.diaFechamento);
    const diaVenc = parseInt(formData.diaVencimento);

    if (diaFech < 1 || diaFech > 31) {
      setErro("Dia de fechamento deve estar entre 1 e 31");
      return;
    }

    if (diaVenc < 1 || diaVenc > 31) {
      setErro("Dia de vencimento deve estar entre 1 e 31");
      return;
    }

    if (diaVenc <= diaFech) {
      setErro("Dia de vencimento deve ser após o dia de fechamento");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/cartoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          limiteTotal: parseFloat(formData.limiteTotal),
          diaFechamento: diaFech,
          diaVencimento: diaVenc,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao criar cartão");
        return;
      }

      // Redirecionar usando router.push e forçar refresh
      router.push("/dashboard/cartoes");
      router.refresh();
    } catch (error) {
      setErro("Erro ao criar cartão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/dashboard/cartoes"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cartões
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Novo Cartão de Crédito</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Cadastre um novo cartão para gerenciar suas faturas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cartão</CardTitle>
          <CardDescription>
            Preencha os dados do seu cartão de crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="nome">Nome do Cartão *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Visa Gold"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="banco">Banco Emissor *</Label>
                <Input
                  id="banco"
                  placeholder="Ex: Banco do Brasil"
                  value={formData.banco}
                  onChange={(e) =>
                    setFormData({ ...formData, banco: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="bandeira">Bandeira *</Label>
                <select
                  id="bandeira"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.bandeira}
                  onChange={(e) =>
                    setFormData({ ...formData, bandeira: e.target.value })
                  }
                  disabled={carregando}
                >
                  {bandeiras.map((bandeira) => (
                    <option key={bandeira} value={bandeira}>
                      {bandeira}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="apelido">Apelido (Opcional)</Label>
                <Input
                  id="apelido"
                  placeholder="Ex: Cartão Principal"
                  value={formData.apelido}
                  onChange={(e) =>
                    setFormData({ ...formData, apelido: e.target.value })
                  }
                  disabled={carregando}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="numeroMascara">Últimos 4 Dígitos</Label>
                <Input
                  id="numeroMascara"
                  placeholder="1234"
                  maxLength={4}
                  value={formData.numeroMascara}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroMascara: e.target.value })
                  }
                  disabled={carregando}
                />
                <p className="text-xs text-gray-500">
                  Para identificação visual (ex: ****1234)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="limiteTotal">Limite Total *</Label>
                <Input
                  id="limiteTotal"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.limiteTotal}
                  onChange={(e) =>
                    setFormData({ ...formData, limiteTotal: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                ⚠️ Datas de Fechamento e Vencimento
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                <strong>Importante:</strong> Compras feitas <strong>no dia do fechamento ou depois</strong> entram na fatura do <strong>mês seguinte</strong>.
              </p>
              <p className="text-xs text-blue-600">
                Exemplo: Fechamento dia 5, compra dia 05/09 → Fatura de outubro (vence em 15/10)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="diaFechamento">Dia de Fechamento *</Label>
                <Input
                  id="diaFechamento"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaFechamento}
                  onChange={(e) =>
                    setFormData({ ...formData, diaFechamento: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
                <p className="text-xs text-gray-500">
                  Dia que a fatura fecha (1-31)
                </p>
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
                  Dia de vencimento da fatura (1-31)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor de Identificação</Label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {cores.map((cor) => (
                  <button
                    key={cor.valor}
                    type="button"
                    onClick={() => setFormData({ ...formData, cor: cor.valor })}
                    className={`h-10 rounded-md border-2 transition-all ${
                      formData.cor === cor.valor
                        ? "border-gray-900 scale-110"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: cor.valor }}
                    title={cor.nome}
                    disabled={carregando}
                  />
                ))}
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
                  "Salvar Cartão"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
