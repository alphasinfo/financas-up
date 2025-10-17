"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditarInvestimentoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "",
    instituicao: "",
    valorAplicado: "",
    valorAtual: "",
    taxaRendimento: "",
    dataVencimento: "",
  });

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`/api/investimentos/${params.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFormData({
          nome: data.nome,
          tipo: data.tipo,
          instituicao: data.instituicao || "",
          valorAplicado: data.valorAplicado.toString(),
          valorAtual: data.valorAtual?.toString() || "",
          taxaRendimento: data.taxaRendimento?.toString() || "",
          dataVencimento: data.dataVencimento ? new Date(data.dataVencimento).toISOString().split('T')[0] : "",
        });
      } catch {
        alert("Erro ao carregar investimento");
        router.push("/dashboard/investimentos");
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
      const res = await fetch(`/api/investimentos/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          tipo: formData.tipo,
          instituicao: formData.instituicao || null,
          valorAplicado: parseFloat(formData.valorAplicado),
          valorAtual: formData.valorAtual ? parseFloat(formData.valorAtual) : null,
          taxaRendimento: formData.taxaRendimento ? parseFloat(formData.taxaRendimento) : null,
          dataVencimento: formData.dataVencimento || null,
        }),
      });
      if (!res.ok) throw new Error();
      alert("Investimento atualizado!");
      router.push("/dashboard/investimentos");
    } catch {
      alert("Erro ao atualizar");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/investimentos">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Investimento</h1>
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
              <Label>Tipo *</Label>
              <Input value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} required />
            </div>
            <div>
              <Label>Instituição</Label>
              <Input value={formData.instituicao} onChange={(e) => setFormData({...formData, instituicao: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Aplicado (R$) *</Label>
                <Input type="number" step="0.01" value={formData.valorAplicado} onChange={(e) => setFormData({...formData, valorAplicado: e.target.value})} required />
              </div>
              <div>
                <Label>Valor Atual (R$)</Label>
                <Input type="number" step="0.01" value={formData.valorAtual} onChange={(e) => setFormData({...formData, valorAtual: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Taxa Rendimento (% a.a.)</Label>
                <Input type="number" step="0.01" value={formData.taxaRendimento} onChange={(e) => setFormData({...formData, taxaRendimento: e.target.value})} />
              </div>
              <div>
                <Label>Data Vencimento</Label>
                <Input type="date" value={formData.dataVencimento} onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar"}
              </Button>
              <Link href="/dashboard/investimentos" className="flex-1">
                <Button type="button" variant="outline" className="w-full">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
