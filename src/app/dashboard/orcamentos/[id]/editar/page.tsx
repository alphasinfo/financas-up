"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditarOrcamentoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    valorLimite: "",
  });

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`/api/orcamentos/${params.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFormData({
          nome: data.nome,
          valorLimite: data.valorLimite.toString(),
        });
      } catch {
        alert("Erro ao carregar orçamento");
        router.push("/dashboard/orcamentos");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/orcamentos/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          valorLimite: parseFloat(formData.valorLimite),
          categoriaId: null,
        }),
      });
      if (!res.ok) throw new Error();
      alert("Orçamento atualizado!");
      router.push("/dashboard/orcamentos");
    } catch {
      alert("Erro ao atualizar");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orcamentos">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Orçamento</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
            </div>
            <div>
              <Label>Valor Limite (R$) *</Label>
              <Input type="number" step="0.01" value={formData.valorLimite} onChange={(e) => setFormData({...formData, valorLimite: e.target.value})} required />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar"}
              </Button>
              <Link href="/dashboard/orcamentos" className="flex-1">
                <Button type="button" variant="outline" className="w-full">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
