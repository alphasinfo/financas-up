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

export default function EditarEmprestimoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    instituicao: "",
    descricao: "",
    valorTotal: "",
    valorParcela: "",
    numeroParcelas: "",
    taxaJurosMensal: "",
    taxaJurosAnual: "",
    sistemaAmortizacao: "PRICE" as "PRICE" | "SAC",
  });

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`/api/emprestimos/${params.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFormData({
          instituicao: data.instituicao,
          descricao: data.descricao || "",
          valorTotal: data.valorTotal.toString(),
          valorParcela: data.valorParcela.toString(),
          numeroParcelas: data.numeroParcelas.toString(),
          taxaJurosMensal: data.taxaJurosMensal?.toString() || "",
          taxaJurosAnual: data.taxaJurosAnual?.toString() || "",
          sistemaAmortizacao: data.sistemaAmortizacao || "PRICE",
        });
      } catch {
        alert("Erro ao carregar empréstimo");
        router.push("/dashboard/emprestimos");
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
      const res = await fetch(`/api/emprestimos/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instituicao: formData.instituicao,
          descricao: formData.descricao || null,
          valorTotal: parseFloat(formData.valorTotal),
          valorParcela: parseFloat(formData.valorParcela),
          numeroParcelas: parseInt(formData.numeroParcelas),
          taxaJurosMensal: formData.taxaJurosMensal ? parseFloat(formData.taxaJurosMensal) : null,
          taxaJurosAnual: formData.taxaJurosAnual ? parseFloat(formData.taxaJurosAnual) : null,
          sistemaAmortizacao: formData.sistemaAmortizacao,
        }),
      });
      if (!res.ok) throw new Error();
      alert("Empréstimo atualizado!");
      router.push("/dashboard/emprestimos");
    } catch {
      alert("Erro ao atualizar");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/emprestimos">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Empréstimo</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Instituição *</Label>
              <Input value={formData.instituicao} onChange={(e) => setFormData({...formData, instituicao: e.target.value})} required />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Total (R$) *</Label>
                <Input type="number" step="0.01" value={formData.valorTotal} onChange={(e) => setFormData({...formData, valorTotal: e.target.value})} required />
              </div>
              <div>
                <Label>Valor Parcela (R$) *</Label>
                <Input type="number" step="0.01" value={formData.valorParcela} onChange={(e) => setFormData({...formData, valorParcela: e.target.value})} required />
              </div>
            </div>
            <div>
              <Label>Número de Parcelas *</Label>
              <Input type="number" value={formData.numeroParcelas} onChange={(e) => setFormData({...formData, numeroParcelas: e.target.value})} required />
            </div>
            <div>
              <Label>Sistema de Amortização *</Label>
              <select
                value={formData.sistemaAmortizacao}
                onChange={(e) => setFormData({...formData, sistemaAmortizacao: e.target.value as "PRICE" | "SAC"})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PRICE">PRICE - Parcelas Fixas</option>
                <option value="SAC">SAC - Parcelas Decrescentes</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Taxa de Juros Mensal (%)</Label>
                <Input type="number" step="0.01" value={formData.taxaJurosMensal} onChange={(e) => setFormData({...formData, taxaJurosMensal: e.target.value})} />
              </div>
              <div>
                <Label>Taxa de Juros Anual (%)</Label>
                <Input type="number" step="0.01" value={formData.taxaJurosAnual} onChange={(e) => setFormData({...formData, taxaJurosAnual: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar"}
              </Button>
              <Link href="/dashboard/emprestimos" className="flex-1">
                <Button type="button" variant="outline" className="w-full">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
