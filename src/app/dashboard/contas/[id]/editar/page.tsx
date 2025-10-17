"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function EditarContaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [conta, setConta] = useState({
    nome: "",
    instituicao: "",
    agencia: "",
    numero: "",
    tipo: "CORRENTE",
    saldoInicial: 0,
    cor: "#3b82f6",
    ativa: true,
    temLimiteCredito: false,
    limiteCredito: 0,
  });

  useEffect(() => {
    carregarConta();
  }, [id]);

  const carregarConta = async () => {
    try {
      const response = await fetch(`/api/contas/${id}`);
      if (!response.ok) throw new Error("Erro ao carregar conta");
      
      const data = await response.json();
      setConta({
        nome: data.nome || "",
        instituicao: data.instituicao || "",
        agencia: data.agencia || "",
        numero: data.numero || "",
        tipo: data.tipo || "CORRENTE",
        saldoInicial: data.saldoInicial || 0,
        cor: data.cor || "#3b82f6",
        ativa: data.ativa ?? true,
        temLimiteCredito: data.temLimiteCredito || false,
        limiteCredito: data.limiteCredito || 0,
      });
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/contas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conta),
      });

      if (!response.ok) throw new Error("Erro ao salvar");

      toast.success("Conta atualizada com sucesso!");
      router.push("/dashboard/contas");
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao atualizar conta");
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async () => {
    if (!confirm("Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const response = await fetch(`/api/contas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast.success("Conta excluída com sucesso!");
      router.push("/dashboard/contas");
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao excluir conta");
    }
  };

  const toggleAtiva = () => {
    setConta({ ...conta, ativa: !conta.ativa });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/contas"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Contas
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Conta Bancária</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status da Conta */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Status da Conta</Label>
                <p className="text-sm text-gray-500">
                  {conta.ativa ? "Conta ativa e disponível para movimentações" : "Conta desativada"}
                </p>
              </div>
              <Button
                type="button"
                onClick={toggleAtiva}
                variant={conta.ativa ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {conta.ativa ? (
                  <>
                    <ToggleRight className="h-5 w-5" />
                    <span className="text-green-600 font-medium">Ativa</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5" />
                    <span className="text-gray-500 font-medium">Desativada</span>
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome da Conta *</Label>
                <Input
                  id="nome"
                  value={conta.nome}
                  onChange={(e) => setConta({ ...conta, nome: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="instituicao">Instituição *</Label>
                <Input
                  id="instituicao"
                  value={conta.instituicao}
                  onChange={(e) => setConta({ ...conta, instituicao: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de Conta *</Label>
                <select
                  id="tipo"
                  value={conta.tipo}
                  onChange={(e) => setConta({ ...conta, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="CORRENTE">Conta Corrente</option>
                  <option value="POUPANCA">Poupança</option>
                  <option value="CARTEIRA">Carteira</option>
                </select>
              </div>

              <div>
                <Label htmlFor="agencia">Agência</Label>
                <Input
                  id="agencia"
                  value={conta.agencia}
                  onChange={(e) => setConta({ ...conta, agencia: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="numero">Número da Conta</Label>
                <Input
                  id="numero"
                  value={conta.numero}
                  onChange={(e) => setConta({ ...conta, numero: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="saldoInicial">Saldo Inicial</Label>
                <Input
                  id="saldoInicial"
                  type="number"
                  step="0.01"
                  value={conta.saldoInicial}
                  onChange={(e) => setConta({ ...conta, saldoInicial: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  type="color"
                  value={conta.cor}
                  onChange={(e) => setConta({ ...conta, cor: e.target.value })}
                />
              </div>
            </div>

            {/* Crédito Especial */}
            <div className="space-y-4 border-t pt-4 mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="temLimiteCredito"
                  checked={conta.temLimiteCredito}
                  onChange={(e) =>
                    setConta({ ...conta, temLimiteCredito: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={saving}
                />
                <Label htmlFor="temLimiteCredito" className="text-sm md:text-base font-medium cursor-pointer">
                  Esta conta possui crédito especial (cheque especial)
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Alguns bancos oferecem crédito especial que permite saldo negativo até um limite.
              </p>

              {conta.temLimiteCredito && (
                <div className="space-y-2 pl-6">
                  <Label className="text-sm md:text-base" htmlFor="limiteCredito">
                    Limite de Crédito Disponível *
                  </Label>
                  <Input
                    id="limiteCredito"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={conta.limiteCredito}
                    onChange={(e) =>
                      setConta({ ...conta, limiteCredito: parseFloat(e.target.value) || 0 })
                    }
                    required={conta.temLimiteCredito}
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500">
                    Valor máximo que pode ficar negativo na conta
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleExcluir}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir Conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
