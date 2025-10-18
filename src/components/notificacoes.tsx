"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check, AlertCircle, CreditCard, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { useRouter } from "next/navigation";

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
  dados?: any;
}

export function Notificacoes() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<Notificacao | null>(null);

  useEffect(() => {
    if (aberto) {
      carregarNotificacoes();
    }
  }, [aberto]);

  const carregarNotificacoes = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch("/api/notificacoes");
      if (resposta.ok) {
        const dados = await resposta.json();
        setNotificacoes(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setCarregando(false);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      const resposta = await fetch(`/api/notificacoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lida: true }),
      });

      if (resposta.ok) {
        setNotificacoes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
        );
      }
    } catch (error) {
      console.error("Erro ao marcar notificação:", error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const resposta = await fetch("/api/notificacoes/marcar-todas", {
        method: "POST",
      });

      if (resposta.ok) {
        setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
      }
    } catch (error) {
      console.error("Erro ao marcar todas:", error);
    }
  };

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case "VENCIMENTO":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "FATURA":
        return <CreditCard className="h-5 w-5 text-orange-600" />;
      case "ALERTA":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleClickNotificacao = (notificacao: Notificacao) => {
    setNotificacaoSelecionada(notificacao);
    setModalAberto(true);
    setAberto(false);
    marcarComoLida(notificacao.id);
  };

  const handleIrPara = () => {
    if (!notificacaoSelecionada) return;

    setModalAberto(false);

    // Redirecionar baseado no tipo
    switch (notificacaoSelecionada.tipo) {
      case "FATURA":
        router.push("/dashboard/cartoes");
        break;
      case "ALERTA":
        router.push("/dashboard/financeiro");
        break;
      case "VENCIMENTO":
        router.push("/dashboard/calendario");
        break;
      default:
        router.push("/dashboard");
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setAberto(!aberto)}
        aria-label="Notificações"
        title="Ver notificações"
      >
        <Bell className="h-5 w-5" />
        {naoLidas > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </Button>

      {aberto && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setAberto(false)}
          />

          {/* Painel de Notificações */}
          <div className="absolute right-0 top-12 w-96 max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                {naoLidas > 0 && (
                  <p className="text-xs text-gray-500">
                    {naoLidas} não {naoLidas === 1 ? "lida" : "lidas"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {naoLidas > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={marcarTodasComoLidas}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAberto(false)}
                  className="h-8 w-8"
                  aria-label="Fechar notificações"
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[500px]">
              {carregando ? (
                <div className="p-8 text-center text-gray-500">
                  Carregando...
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Nenhuma notificação
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificacoes.map((notificacao) => (
                    <div
                      key={notificacao.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notificacao.lida ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => handleClickNotificacao(notificacao)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcone(notificacao.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm text-gray-900">
                              {notificacao.titulo}
                            </p>
                            {!notificacao.lida && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notificacao.mensagem}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatarData(notificacao.criadoEm)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de Detalhes */}
      {modalAberto && notificacaoSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getIcone(notificacaoSelecionada.tipo)}
                  <CardTitle>{notificacaoSelecionada.titulo}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setModalAberto(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-700">{notificacaoSelecionada.mensagem}</p>
              </div>

              {notificacaoSelecionada.dados && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-600">Detalhes:</p>
                  {notificacaoSelecionada.tipo === "FATURA" && (
                    <>
                      <p className="text-sm">
                        <span className="font-medium">Cartão:</span>{" "}
                        {notificacaoSelecionada.dados.cartao?.nome}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Valor:</span>{" "}
                        {formatarMoeda(notificacaoSelecionada.dados.valorTotal)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Vencimento:</span>{" "}
                        {formatarData(notificacaoSelecionada.dados.dataVencimento)}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-400">
                {formatarData(notificacaoSelecionada.criadoEm)}
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleIrPara} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir para
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModalAberto(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
