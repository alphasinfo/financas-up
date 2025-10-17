"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Meta {
  id: string;
  titulo: string;
  descricao: string | null;
  valorAlvo: number;
  valorAtual: number;
  status: string;
}

export default function ExcluirMetaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);

  useEffect(() => {
    async function carregarMeta() {
      try {
        const response = await fetch(`/api/metas/${params.id}`);
        if (!response.ok) throw new Error("Meta não encontrada");
        
        const data = await response.json();
        setMeta(data);
      } catch (_error) {
        alert("Erro ao carregar meta");
        router.push("/dashboard/metas");
      } finally {
        setLoading(false);
      }
    }

    carregarMeta();
  }, [params.id, router]);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/metas/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir meta");

      alert("Meta excluída com sucesso!");
      router.push("/dashboard/metas");
    } catch (_error) {
      alert("Erro ao excluir meta");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!meta) {
    return null;
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
          <h1 className="text-3xl font-bold text-gray-900">Excluir Meta</h1>
          <p className="text-gray-500 mt-1">Confirme a exclusão da meta</p>
        </div>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Atenção: Esta ação não pode ser desfeita!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-lg">{meta.titulo}</h3>
            {meta.descricao && (
              <p className="text-gray-600">{meta.descricao}</p>
            )}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
              <div>
                <p className="text-sm text-gray-500">Valor Alvo</p>
                <p className="font-bold">R$ {meta.valorAlvo.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor Atual</p>
                <p className="font-bold text-green-600">R$ {meta.valorAtual.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-100 border border-red-300 rounded-lg p-4">
            <p className="text-red-900 text-sm">
              <strong>Aviso:</strong> Ao excluir esta meta, todos os dados relacionados serão permanentemente removidos.
              {meta.valorAtual > 0 && (
                <span className="block mt-2">
                  <strong>Importante:</strong> Esta meta possui R$ {meta.valorAtual.toFixed(2)} economizados. 
                  Considere transferir este valor antes de excluir.
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
            <Link href="/dashboard/metas" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
