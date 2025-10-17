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

export default function NovaReceitaPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    dataCompetencia: new Date().toISOString().split("T")[0],
    categoriaId: "",
    contaBancariaId: "",
    observacoes: "",
    statusPagamento: "RECEBIDO",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resCategorias, resContas] = await Promise.all([
        fetch("/api/categorias?tipo=RECEITA", { cache: 'no-store' }),
        fetch("/api/contas?ativas=true", { cache: 'no-store' }),
      ]);

      if (resCategorias.ok) {
        const cats = await resCategorias.json();
        setCategorias(cats);
        if (cats.length > 0 && !formData.categoriaId) {
          setFormData(prev => ({ ...prev, categoriaId: cats[0].id }));
        }
      }
      
      if (resContas.ok) {
        const cts = await resContas.json();
        setContas(cts);
        if (cts.length > 0 && !formData.contaBancariaId) {
          setFormData(prev => ({ ...prev, contaBancariaId: cts[0].id }));
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

    setCarregando(true);

    try {
      const resposta = await fetch("/api/transacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "RECEITA",
          descricao: formData.descricao,
          valor,
          dataCompetencia: new Date(formData.dataCompetencia),
          status: formData.statusPagamento,
          categoriaId: formData.categoriaId || null,
          contaBancariaId: formData.contaBancariaId || null,
          observacoes: formData.observacoes || null,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao criar receita");
        return;
      }

      router.push("/dashboard/financeiro");
      router.refresh();
    } catch (error) {
      setErro("Erro ao criar receita. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nova Receita</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Registre uma nova entrada de dinheiro
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Receita</CardTitle>
          <CardDescription>
            Preencha os dados da receita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                placeholder="Ex: Salário, Freelance, Venda"
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
              <Label className="text-sm md:text-base" htmlFor="contaBancariaId">Conta de Destino</Label>
              <select
                id="contaBancariaId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.contaBancariaId}
                onChange={(e) =>
                  setFormData({ ...formData, contaBancariaId: e.target.value })
                }
                disabled={carregando}
              >
                <option value="">Selecione uma conta (opcional)</option>
                {contas.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} - {conta.instituicao}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                {formData.contaBancariaId
                  ? "✅ O valor será creditado na conta selecionada"
                  : "💰 Se não selecionar, será considerado como dinheiro em carteira"}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="statusPagamento">Status *</Label>
              <select
                id="statusPagamento"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.statusPagamento}
                onChange={(e) =>
                  setFormData({ ...formData, statusPagamento: e.target.value })
                }
                disabled={carregando}
              >
                <option value="RECEBIDO">Recebido</option>
                <option value="PENDENTE">Pendente</option>
                <option value="AGENDADO">Agendado</option>
              </select>
              <p className="text-xs text-gray-500">
                {formData.statusPagamento === "AGENDADO" && "⏰ Será recebido na data selecionada"}
                {formData.statusPagamento === "PENDENTE" && "⏳ Aguardando recebimento"}
                {formData.statusPagamento === "RECEBIDO" && "✅ Já foi recebido"}
              </p>
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
                  "Salvar Receita"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
