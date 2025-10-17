"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ExcluirInvestimentoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [investimento, setInvestimento] = useState<any>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`/api/investimentos/${params.id}`);
        if (!res.ok) throw new Error();
        setInvestimento(await res.json());
      } catch {
        alert("Erro ao carregar");
        router.push("/dashboard/investimentos");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [params.id, router]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/investimentos/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      alert("Investimento excluído!");
      router.push("/dashboard/investimentos");
    } catch {
      alert("Erro ao excluir");
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;
  if (!investimento) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/investimentos">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">Excluir Investimento</h1>
      </div>
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />Atenção: Ação irreversível!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-lg">{investimento.nome}</h3>
            <p className="text-gray-600">{investimento.tipo}</p>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t mt-3">
              <div>
                <p className="text-sm text-gray-500">Valor Aplicado</p>
                <p className="font-bold">R$ {investimento.valorAplicado.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor Atual</p>
                <p className="font-bold text-green-600">R$ {(investimento.valorAtual || investimento.valorAplicado).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-100 border border-red-300 rounded-lg p-4">
            <p className="text-red-900 text-sm"><strong>Aviso:</strong> Todos os dados serão permanentemente removidos.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDelete} disabled={deleting} variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />{deleting ? "Excluindo..." : "Confirmar"}
            </Button>
            <Link href="/dashboard/investimentos" className="flex-1">
              <Button variant="outline" className="w-full">Cancelar</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
