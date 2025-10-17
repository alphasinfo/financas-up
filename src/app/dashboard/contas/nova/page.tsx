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

export default function NovaContaPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    instituicao: "",
    tipo: "CORRENTE",
    agencia: "",
    numero: "",
    saldoInicial: "0",
    cor: "#3B82F6",
    temLimiteCredito: false,
    limiteCredito: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          saldoInicial: parseFloat(formData.saldoInicial),
          limiteCredito: parseFloat(formData.limiteCredito),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao criar conta");
        return;
      }

      // Forçar reload completo da página de contas
      window.location.href = "/dashboard/contas";
    } catch (error) {
      setErro("Erro ao criar conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/dashboard/contas"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Contas
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nova Conta Bancária</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Cadastre uma nova conta para começar a gerenciar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Preencha os dados da sua conta bancária
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="nome">Nome da Conta *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Conta Corrente Principal"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="instituicao">Instituição Financeira *</Label>
                <Input
                  id="instituicao"
                  placeholder="Ex: Banco do Brasil"
                  value={formData.instituicao}
                  onChange={(e) =>
                    setFormData({ ...formData, instituicao: e.target.value })
                  }
                  required
                  disabled={carregando}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="tipo">Tipo de Conta *</Label>
              <select
                id="tipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
                disabled={carregando}
              >
                <option value="CORRENTE">Conta Corrente</option>
                <option value="POUPANCA">Poupança</option>
                <option value="CARTEIRA">Carteira (Dinheiro)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="agencia">Agência</Label>
                <Input
                  id="agencia"
                  placeholder="Ex: 1234-5"
                  value={formData.agencia}
                  onChange={(e) =>
                    setFormData({ ...formData, agencia: e.target.value })
                  }
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="numero">Número da Conta</Label>
                <Input
                  id="numero"
                  placeholder="Ex: 12345-6"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                  disabled={carregando}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="saldoInicial">Saldo Inicial *</Label>
              <Input
                id="saldoInicial"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.saldoInicial}
                onChange={(e) =>
                  setFormData({ ...formData, saldoInicial: e.target.value })
                }
                required
                disabled={carregando}
              />
              <p className="text-xs text-gray-500">
                Informe o saldo atual da conta
              </p>
            </div>

            {/* Crédito Especial */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="temLimiteCredito"
                  checked={formData.temLimiteCredito}
                  onChange={(e) =>
                    setFormData({ ...formData, temLimiteCredito: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={carregando}
                />
                <Label htmlFor="temLimiteCredito" className="text-sm md:text-base font-medium cursor-pointer">
                  Esta conta possui crédito especial (cheque especial)
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Alguns bancos oferecem crédito especial que permite saldo negativo até um limite.
              </p>

              {formData.temLimiteCredito && (
                <div className="space-y-2 pl-6">
                  <Label className="text-sm md:text-base" htmlFor="limiteCredito">
                    Limite de Crédito Disponível *
                  </Label>
                  <Input
                    id="limiteCredito"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.limiteCredito}
                    onChange={(e) =>
                      setFormData({ ...formData, limiteCredito: e.target.value })
                    }
                    required={formData.temLimiteCredito}
                    disabled={carregando}
                  />
                  <p className="text-xs text-gray-500">
                    Valor máximo que pode ficar negativo na conta
                  </p>
                </div>
              )}
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

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={carregando}
                className="w-full sm:flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={carregando} className="w-full sm:flex-1">
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Conta"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
