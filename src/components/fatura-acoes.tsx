"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, DollarSign, FileText } from "lucide-react";
import { PagarFaturaModal } from "./pagar-fatura-modal";
import { ExtratoFaturaModal } from "./extrato-fatura-modal";

interface FaturaAcoesProps {
  faturaId: string;
  cartaoId: string;
  fatura: {
    id: string;
    valorTotal: number;
    valorPago: number;
    mesReferencia: number;
    anoReferencia: number;
    status: string;
    cartao?: {
      nome: string;
    };
  };
}

export function FaturaAcoes({ faturaId, cartaoId: _cartaoId, fatura }: FaturaAcoesProps) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);
  const [modalPagarAberto, setModalPagarAberto] = useState(false);
  const [modalExtratoAberto, setModalExtratoAberto] = useState(false);

  const handleExcluir = async () => {
    if (!confirm("Tem certeza que deseja excluir esta fatura? As transações associadas não serão excluídas.")) {
      return;
    }

    setExcluindo(true);

    try {
      const resposta = await fetch(`/api/faturas/${faturaId}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        throw new Error("Erro ao excluir fatura");
      }

      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir fatura:", error);
      alert("Erro ao excluir fatura");
    } finally {
      setExcluindo(false);
    }
  };

  const podeSerPaga = fatura.status !== "PAGA" && fatura.valorTotal > fatura.valorPago;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setModalExtratoAberto(true)}
          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          title="Ver extrato"
        >
          <FileText className="h-4 w-4" />
        </Button>
        {podeSerPaga && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setModalPagarAberto(true)}
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Pagar fatura"
          >
            <DollarSign className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExcluir}
          disabled={excluindo}
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Excluir fatura"
        >
          {excluindo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {modalExtratoAberto && (
        <ExtratoFaturaModal
          faturaId={faturaId}
          fatura={fatura}
          onClose={() => setModalExtratoAberto(false)}
        />
      )}

      {modalPagarAberto && (
        <PagarFaturaModal
          fatura={fatura}
          onClose={() => setModalPagarAberto(false)}
        />
      )}
    </>
  );
}
