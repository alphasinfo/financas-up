"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Pencil, Trash2, Loader2 } from "lucide-react";

interface TransacaoItemProps {
  transacao: any;
}

export function TransacaoItem({ transacao }: TransacaoItemProps) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  const isReceita = transacao.tipo === "RECEITA";
  const isCartao = !!transacao.cartaoCreditoId;

  const getStatusBadge = (): { variant: any; label: string; className?: string } => {
    if (isCartao) {
      return { variant: "default" as const, label: "Cartão", className: "bg-blue-500" };
    }

    const badges: Record<string, { variant: any; label: string }> = {
      PENDENTE: { variant: "warning", label: "Pendente" },
      PAGO: { variant: "success", label: "Pago" },
      RECEBIDO: { variant: "success", label: "Recebido" },
      VENCIDO: { variant: "destructive", label: "Vencido" },
      CANCELADO: { variant: "outline", label: "Cancelado" },
    };
    return badges[transacao.status] || { variant: "outline", label: transacao.status };
  };

  const handleEditar = () => {
    // Redirecionar para página de edição
    router.push(`/dashboard/financeiro/editar/${transacao.id}`);
  };

  const handleExcluir = async () => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) {
      return;
    }

    setExcluindo(true);

    try {
      const response = await fetch(`/api/transacoes/${transacao.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.erro || "Erro ao excluir transação");
      }
    } catch {
      alert("Erro ao excluir transação");
    } finally {
      setExcluindo(false);
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Parte superior (mobile) / Esquerda (desktop) */}
      <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
        <div
          className={`h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-full flex items-center justify-center ${
            isReceita ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isReceita ? (
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm md:text-base text-gray-900 truncate">{transacao.descricao}</p>
          <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500">
            <span className="whitespace-nowrap">{formatarData(transacao.dataCompetencia)}</span>
            {transacao.categoria && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="truncate">{transacao.categoria.nome}</span>
              </>
            )}
            {transacao.contaBancaria && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="truncate hidden sm:inline">{transacao.contaBancaria.nome}</span>
              </>
            )}
            {transacao.cartaoCredito && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="truncate hidden sm:inline">{transacao.cartaoCredito.nome}</span>
              </>
            )}
            {transacao.parcelado && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="whitespace-nowrap">
                  {transacao.parcelaAtual}/{transacao.parcelaTotal}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Parte inferior (mobile) / Direita (desktop) */}
      <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={statusBadge.variant} className={`${statusBadge.className} text-xs`}>
            {statusBadge.label}
          </Badge>
          <p
            className={`text-base md:text-lg font-bold ${
              isReceita ? "text-green-600" : "text-red-600"
            }`}
          >
            {isReceita ? "+" : "-"}
            {formatarMoeda(transacao.valor)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEditar}
            className="h-7 w-7 md:h-8 md:w-8 p-0"
            title="Editar"
          >
            <Pencil className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExcluir}
            disabled={excluindo}
            className="h-7 w-7 md:h-8 md:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Excluir"
          >
            {excluindo ? (
              <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
