"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Meta {
  id: string;
  titulo: string;
  descricao: string | null;
  valorAlvo: number;
  valorAtual: number;
  dataPrazo: string | null;
  status: string;
}

export default function EditarMetaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    valorAlvo: "",
    dataPrazo: "",
  });

  useEffect(() => {
    async function carregarMeta() {
      try {
        const response = await fetch(`/api/metas/${params.id}`);
        if (!response.ok) throw new Error("Meta não encontrada");
        
        const data = await response.json();
        setMeta(data);
        setFormData({
          titulo: data.titulo,
          descricao: data.descricao || "",
          valorAlvo: data.valorAlvo.toString(),
          dataPrazo: data.dataPrazo ? new Date(data.dataPrazo).toISOString().split('T')[0] : "",
        });
      } catch (_error) {
        alert("Erro ao carregar meta");
        router.push("/dashboard/metas");
      } finally {
        setLoading(false);
      }
    }

    carregarMeta();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/metas/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: formData.titulo,
          descricao: formData.descricao || null,
          valorAlvo: parseFloat(formData.valorAlvo),
          dataPrazo: formData.dataPrazo ? new Date(formData.dataPrazo).toISOString() : null,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar meta");

      alert("Meta atualizada com sucesso!");
      router.push("/dashboard/metas");
    } catch (_error) {
      alert("Erro ao atualizar meta");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/metas">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Meta</h1>
          <p className="text-gray-500 mt-1">Atualize as informações da meta</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="valorAlvo">Valor Alvo (R$) *</Label>
              <Input
                id="valorAlvo"
                type="number"
                step="0.01"
                value={formData.valorAlvo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, valorAlvo: e.target.value })}
                required
              />
              {meta && (
                <p className="text-sm text-gray-500 mt-1">
                  Valor atual: R$ {meta.valorAtual.toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dataPrazo">Data Prazo</Label>
              <Input
                id="dataPrazo"
                type="date"
                value={formData.dataPrazo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dataPrazo: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Link href="/dashboard/metas" className="flex-1">
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
