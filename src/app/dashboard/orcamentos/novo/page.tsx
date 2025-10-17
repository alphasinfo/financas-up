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
}

export default function NovoOrcamentoPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const [formData, setFormData] = useState({
    nome: "",
    categoriaId: "",
    valorLimite: "",
  });

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const resposta = await fetch("/api/categorias?tipo=DESPESA", { cache: 'no-store' });
      if (resposta.ok) {
        const dados = await resposta.json();
        setCategorias(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const valorLimite = parseFloat(formData.valorLimite);
    if (valorLimite <= 0) {
      setErro("Valor limite deve ser maior que zero");
      return;
    }

    setCarregando(true);

    try {
      const hoje = new Date();
      const resposta = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          categoriaId: formData.categoriaId || null,
          valorLimite,
          mesReferencia: hoje.getMonth() + 1,
          anoReferencia: hoje.getFullYear(),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao criar orçamento");
        return;
      }

      router.push("/dashboard/orcamentos");
      router.refresh();
    } catch (_error) {
      setErro("Erro ao criar orçamento. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/dashboard/orcamentos"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Orçamentos
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Novo Orçamento</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Defina um limite de gastos para o mês atual
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Orçamento</CardTitle>
          <CardDescription>
            Preencha os dados do orçamento mensal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="nome">Nome do Orçamento *</Label>
              <Input
                id="nome"
                placeholder="Ex: Alimentação Mensal"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
                disabled={carregando}
              />
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
                <option value="">Sem categoria específica</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Vincule a uma categoria de despesa (opcional)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="valorLimite">Valor Limite *</Label>
              <Input
                id="valorLimite"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.valorLimite}
                onChange={(e) =>
                  setFormData({ ...formData, valorLimite: e.target.value })
                }
                required
                disabled={carregando}
              />
              <p className="text-xs text-gray-500">
                Limite máximo de gastos para o mês atual
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Período:</strong> Mês atual ({new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })})
              </p>
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
                  "Salvar Orçamento"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
