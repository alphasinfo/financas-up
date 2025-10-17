"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, FileText, Loader2 } from "lucide-react";
import { formatarMoeda, formatarData } from "@/lib/formatters";

interface ExtratoFaturaModalProps {
  faturaId: string;
  fatura: {
    mesReferencia: number;
    anoReferencia: number;
    valorTotal: number;
    valorPago: number;
    status: string;
    cartao?: {
      nome: string;
    };
  };
  onClose: () => void;
}

interface TransacaoFatura {
  id: string;
  descricao: string;
  valor: number;
  dataCompetencia: string;
  categoria?: {
    nome: string;
    icone: string;
  };
  parcelado: boolean;
  parcelaAtual?: number;
  parcelaTotal?: number;
}

export function ExtratoFaturaModal({ faturaId, fatura, onClose }: ExtratoFaturaModalProps) {
  const [transacoes, setTransacoes] = useState<TransacaoFatura[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarTransacoes();
  }, [faturaId]);

  const buscarTransacoes = async () => {
    try {
      setCarregando(true);
      const response = await fetch(`/api/faturas/${faturaId}/transacoes`);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar transações");
      }

      const dados = await response.json();
      setTransacoes(dados);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      alert("Erro ao carregar extrato da fatura");
    } finally {
      setCarregando(false);
    }
  };

  const mesNome = new Date(fatura.anoReferencia, fatura.mesReferencia - 1)
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const totalCalculado = transacoes.reduce((acc, t) => acc + t.valor, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="capitalize">Extrato - {mesNome}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {fatura.cartao?.nome || "Cartão"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : transacoes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma transação nesta fatura</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total de transações:</span>
                  <span className="font-medium">{transacoes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-bold text-lg">{formatarMoeda(totalCalculado)}</span>
                </div>
                {fatura.valorPago > 0 && (
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-gray-600">Valor pago:</span>
                    <span className="font-medium text-green-600">{formatarMoeda(fatura.valorPago)}</span>
                  </div>
                )}
                {totalCalculado !== fatura.valorTotal && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    ⚠️ Valor da fatura ({formatarMoeda(fatura.valorTotal)}) difere do total calculado
                  </div>
                )}
              </div>

              {/* Lista de Transações */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Transações</h3>
                {transacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {transacao.categoria && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                          {transacao.categoria.icone}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {transacao.descricao}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{formatarData(transacao.dataCompetencia)}</span>
                          {transacao.categoria && (
                            <>
                              <span>•</span>
                              <span>{transacao.categoria.nome}</span>
                            </>
                          )}
                          {transacao.parcelado && transacao.parcelaAtual && transacao.parcelaTotal && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">
                                {transacao.parcelaAtual}/{transacao.parcelaTotal}x
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        -{formatarMoeda(transacao.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Final */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total da Fatura:</span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatarMoeda(totalCalculado)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="border-t p-4 bg-gray-50">
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </Card>
    </div>
  );
}
