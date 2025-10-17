"use client";

import { useState } from "react";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CreditCard, Calendar, Trash2, Edit } from "lucide-react";
import { TransacaoItem } from "@/components/transacao-item";

interface CompraParceladaCardProps {
  descricaoBase: string;
  parcelas: any[];
  valorTotal: number;
}

export function CompraParceladaCard({ descricaoBase, parcelas, valorTotal }: CompraParceladaCardProps) {
  const [expandido, setExpandido] = useState(false);
  
  // Ordenar parcelas por número
  const parcelasOrdenadas = [...parcelas].sort((a, b) => (a.parcelaAtual || 0) - (b.parcelaAtual || 0));
  const totalParcelas = parcelas[0]?.parcelaTotal || parcelas.length;
  const valorParcela = parcelas[0]?.valor || 0;
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Cabeçalho - Sempre visível */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                <CreditCard className="w-3 h-3 mr-1" />
                Parcelado {totalParcelas}x
              </Badge>
              <Badge variant="outline" className="text-xs">
                {parcelas.length} de {totalParcelas} parcelas
              </Badge>
            </div>
            
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {descricaoBase}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatarMoeda(valorParcela)} por mês
              </span>
              <span>•</span>
              <span className="font-medium text-blue-600">
                Total: {formatarMoeda(valorTotal)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandido(!expandido)}
              className="whitespace-nowrap"
            >
              {expandido ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Ocultar
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Detalhes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Lista de Parcelas - Expansível */}
      {expandido && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Parcelas ({parcelas.length})
            </h4>
            
            {parcelasOrdenadas.map((parcela, index) => (
              <div key={parcela.id} className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {parcela.parcelaAtual}/{parcela.parcelaTotal}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatarData(parcela.dataCompetencia)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">
                        {formatarMoeda(parcela.valor)}
                      </span>
                      
                      {parcela.fatura && (
                        <span className="text-xs text-gray-500">
                          Fatura {parcela.fatura.mesReferencia}/{parcela.fatura.anoReferencia}
                        </span>
                      )}
                      
                      <Badge 
                        variant={parcela.status === "PENDENTE" ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {parcela.status}
                      </Badge>
                    </div>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total das {parcelas.length} parcelas exibidas:
              </span>
              <span className="font-bold text-gray-900 text-base">
                {formatarMoeda(parcelas.reduce((acc, p) => acc + p.valor, 0))}
              </span>
            </div>
            
            {parcelas.length < totalParcelas && (
              <p className="text-xs text-gray-500 mt-2">
                * Faltam {totalParcelas - parcelas.length} parcela(s) futuras
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
