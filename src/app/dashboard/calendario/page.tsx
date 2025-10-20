"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, X, Check } from "lucide-react";
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { exportarCalendarioParaPDF, baixarPDF } from "@/lib/pdf-export";

interface Transacao {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  dataCompetencia: string;
  status: string;
  categoria?: { nome: string };
  contaBancaria?: { nome: string };
  cartaoCredito?: { nome: string };
}

interface Cartao {
  id: string;
  nome: string;
  diaFechamento: number;
  diaVencimento: number;
  banco: string;
}

interface Fatura {
  id: string;
  cartaoId: string;
  mesReferencia: number;
  anoReferencia: number;
  dataFechamento: string;
  dataVencimento: string;
  valorTotal: number;
  status: string;
  cartao?: Cartao;
}

interface EventoCalendario {
  id: string;
  title: string;
  date: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    transacao?: Transacao;
    tipo?: string;
    fatura?: Fatura;
    emprestimo?: any;
    parcela?: any;
  };
}

export default function CalendarioPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null);
  const [faturaSelecionada, setFaturaSelecionada] = useState<Fatura | null>(null);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState<any>(null);
  const [parcelaSelecionada, setParcelaSelecionada] = useState<any>(null);
  const [tipoModal, setTipoModal] = useState<'transacao' | 'fatura' | 'emprestimo' | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date());

  useEffect(() => {
    carregarDados(mesAtual);
  }, [mesAtual]);

  const carregarDados = async (data: Date) => {
    try {
      // Calcular range do mês (com margem de 2 meses antes e depois)
      const inicioMes = new Date(data.getFullYear(), data.getMonth() - 2, 1);
      const fimMes = new Date(data.getFullYear(), data.getMonth() + 3, 0, 23, 59, 59);
      
      const params = new URLSearchParams({
        dataInicio: inicioMes.toISOString(),
        dataFim: fimMes.toISOString()
      });
      
      const [respostaTransacoes, respostaFaturas, respostaEmprestimos] = await Promise.all([
        fetch(`/api/transacoes?${params}`),
        fetch(`/api/faturas?${params}`),
        fetch(`/api/emprestimos?${params}`),
      ]);

      let trans: Transacao[] = [];
      let fats: Fatura[] = [];
      let emps: any[] = [];

      if (respostaTransacoes.ok) {
        trans = await respostaTransacoes.json();
        setTransacoes(trans);
      }

      if (respostaFaturas.ok) {
        fats = await respostaFaturas.json();
        setFaturas(fats);
      }

      if (respostaEmprestimos.ok) {
        emps = await respostaEmprestimos.json();
      }

      converterParaEventos(trans, fats, emps);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Erro ao carregar dados do calendário:", error);
      }
    } finally {
      setCarregando(false);
    }
  };

  const converterParaEventos = (transacoes: Transacao[], faturas: Fatura[], emprestimos: any[] = []) => {

    // Eventos de transações
    const eventosTransacoes = transacoes
      .filter(t => t.dataCompetencia) // Filtrar apenas com data válida
      .map((transacao) => {
        const isReceita = transacao.tipo === "RECEITA";
        const isPendente = transacao.status === "PENDENTE";
        const isVencido = transacao.status === "VENCIDO";
        const isPago = transacao.status === "PAGO" || transacao.status === "RECEBIDO";
        
        let cor = isReceita ? "#10B981" : "#EF4444";
        if (isPendente) cor = "#F59E0B";
        if (isVencido) cor = "#DC2626";
        if (isPago && isReceita) cor = "#059669";
        if (isPago && !isReceita) cor = "#DC2626";

        // Extrair apenas a data (YYYY-MM-DD)
        const dataFormatada = transacao.dataCompetencia.includes('T') 
          ? transacao.dataCompetencia.split("T")[0]
          : transacao.dataCompetencia.split(" ")[0];

        const origem = transacao.cartaoCredito?.nome 
          ? `💳 ${transacao.cartaoCredito.nome}`
          : transacao.contaBancaria?.nome 
          ? `🏦 ${transacao.contaBancaria.nome}`
          : '';

        return {
          id: `trans-${transacao.id}`,
          title: `${isReceita ? "+" : "-"}${formatarMoeda(transacao.valor)} - ${transacao.descricao}${origem ? ' (' + origem + ')' : ''}`,
          date: dataFormatada,
          backgroundColor: cor,
          borderColor: cor,
          extendedProps: {
            transacao,
            tipo: "transacao",
          },
        };
      });

    // Eventos de fechamento e vencimento de cartões
    const eventosFaturas: EventoCalendario[] = [];
    faturas.forEach((fatura) => {
      if (!fatura.cartao) return;

      // Calcular data de fechamento: NO MESMO MÊS da fatura
      const dataFechamento = `${fatura.anoReferencia}-${String(fatura.mesReferencia).padStart(2, '0')}-${String(fatura.cartao.diaFechamento).padStart(2, '0')}`;

      // Calcular data de vencimento: NO MESMO MÊS da fatura
      const dataVencimento = `${fatura.anoReferencia}-${String(fatura.mesReferencia).padStart(2, '0')}-${String(fatura.cartao.diaVencimento).padStart(2, '0')}`;

      // Evento de fechamento
      eventosFaturas.push({
        id: `fech-${fatura.id}`,
        title: `📋 Fechamento: ${fatura.cartao.nome}`,
        date: dataFechamento,
        backgroundColor: "#8B5CF6",
        borderColor: "#8B5CF6",
        extendedProps: {
          tipo: "fechamento",
          fatura,
        },
      });

      // Evento de vencimento
      eventosFaturas.push({
        id: `venc-${fatura.id}`,
        title: `💳 Vencimento: ${formatarMoeda(fatura.valorTotal)} - ${fatura.cartao.nome}`,
        date: dataVencimento,
        backgroundColor: "#3B82F6",
        borderColor: "#3B82F6",
        extendedProps: {
          tipo: "vencimento",
          fatura,
        },
      });
    });

    // Eventos de empréstimos (parcelas)
    const eventosEmprestimos: EventoCalendario[] = [];
    emprestimos.forEach((emprestimo) => {
      if (!emprestimo.parcelas || emprestimo.parcelas.length === 0) return;
      
      emprestimo.parcelas.forEach((parcela: any) => {
        if (!parcela.dataVencimento) return;
        
        const dataVencimento = parcela.dataVencimento.includes('T')
          ? parcela.dataVencimento.split("T")[0]
          : parcela.dataVencimento.split(" ")[0];
        
        const isPago = parcela.status === "PAGO";
        const cor = isPago ? "#10B981" : "#F59E0B";
        
        eventosEmprestimos.push({
          id: `emp-${parcela.id}`,
          title: `💰 Empréstimo: ${emprestimo.instituicao} (${parcela.numero}/${emprestimo.numeroParcelas}) - ${formatarMoeda(parcela.valor)}`,
          date: dataVencimento,
          backgroundColor: cor,
          borderColor: cor,
          extendedProps: {
            tipo: "emprestimo",
            emprestimo,
            parcela,
          },
        });
      });
    });

    const todosEventos = [...eventosTransacoes, ...eventosFaturas, ...eventosEmprestimos];
    setEventos(todosEventos);
  };

  const handleEventClick = (info: any) => {
    const { tipo, transacao, fatura, emprestimo, parcela } = info.event.extendedProps;
    
    if (tipo === "transacao" && transacao) {
      setTransacaoSelecionada(transacao);
      setFaturaSelecionada(null);
      setTipoModal('transacao');
      setModalAberto(true);
    } else if ((tipo === "fechamento" || tipo === "vencimento") && fatura) {
      setFaturaSelecionada(fatura);
      setTransacaoSelecionada(null);
      setTipoModal('fatura');
      setModalAberto(true);
    } else if (tipo === "emprestimo" && emprestimo && parcela) {
      setEmprestimoSelecionado(emprestimo);
      setParcelaSelecionada(parcela);
      setTransacaoSelecionada(null);
      setFaturaSelecionada(null);
      setTipoModal('emprestimo');
      setModalAberto(true);
    }
  };

  const handleMarcarComoPago = async (id: string) => {
    try {
      const resposta = await fetch(`/api/transacoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAGO" }),
      });

      if (resposta.ok) {
        await carregarDados(mesAtual);
        setModalAberto(false);
      }
    } catch (error) {
      // Silenciar erro em produção
    }
  };

  const handleMarcarComoRecebido = async (id: string) => {
    try {
      const resposta = await fetch(`/api/transacoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RECEBIDO" }),
      });

      if (resposta.ok) {
        await carregarDados(mesAtual);
        setModalAberto(false);
      }
    } catch (error) {
      // Silenciar erro em produção
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { variant: any; label: string }> = {
      PENDENTE: { variant: "warning", label: "Pendente" },
      PAGO: { variant: "success", label: "Pago" },
      RECEBIDO: { variant: "success", label: "Recebido" },
      VENCIDO: { variant: "destructive", label: "Vencido" },
      CANCELADO: { variant: "outline", label: "Cancelado" },
    };
    return badges[status] || { variant: "outline", label: status };
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleExportarPDF = () => {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = String(hoje.getFullYear());

    const transacoesPDF = transacoes.map((t) => ({
      data: new Date(t.dataCompetencia),
      descricao: t.descricao,
      categoria: t.categoria?.nome || "Sem categoria",
      tipo: t.tipo,
      valor: t.valor,
      status: t.status,
    }));

    const doc = exportarCalendarioParaPDF(transacoesPDF, mes, ano);
    baixarPDF(doc, `calendario-${ano}-${mes}.pdf`);
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Carregando calendário...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendário Financeiro</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Visualize suas transações por data
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 no-print w-full sm:w-auto">
          <Button variant="outline" onClick={handleImprimir} className="w-full sm:w-auto">
            <Printer className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Imprimir</span>
            <span className="sm:hidden">Imprimir</span>
          </Button>
          <Button variant="outline" onClick={handleExportarPDF} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>

      <Card className="print-area">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Visão Mensal</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <style jsx global>{`
            .fc {
              font-size: 0.75rem;
            }
            @media (min-width: 768px) {
              .fc {
                font-size: 1rem;
              }
            }
            .fc .fc-toolbar {
              flex-direction: column;
              gap: 0.5rem;
            }
            @media (min-width: 768px) {
              .fc .fc-toolbar {
                flex-direction: row;
              }
            }
            .fc .fc-toolbar-chunk {
              display: flex;
              justify-content: center;
              gap: 0.25rem;
            }
            .fc .fc-button {
              padding: 0.25rem 0.5rem;
              font-size: 0.75rem;
            }
            @media (min-width: 768px) {
              .fc .fc-button {
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
              }
            }
            .fc .fc-toolbar-title {
              font-size: 1rem;
            }
            @media (min-width: 768px) {
              .fc .fc-toolbar-title {
                font-size: 1.5rem;
              }
            }
            .fc .fc-daygrid-day-number {
              font-size: 0.75rem;
              padding: 2px;
            }
            @media (min-width: 768px) {
              .fc .fc-daygrid-day-number {
                font-size: 0.875rem;
                padding: 4px;
              }
            }
            .fc .fc-event {
              font-size: 0.65rem;
              padding: 1px 2px;
              margin-bottom: 1px;
            }
            @media (min-width: 768px) {
              .fc .fc-event {
                font-size: 0.75rem;
                padding: 2px 4px;
                margin-bottom: 2px;
              }
            }

            /* Estilos de impressão para A4 */
            @media print {
              @page {
                size: A4 landscape;
                margin: 10mm;
              }

              body {
                margin: 0;
                padding: 0;
              }

              .no-print {
                display: none !important;
              }

              .print-area {
                page-break-inside: avoid;
                width: 100% !important;
                max-width: 100% !important;
              }

              .fc {
                width: 100% !important;
                max-width: 100% !important;
                font-size: 0.7rem !important;
              }

              .fc .fc-toolbar {
                display: none !important;
              }

              .fc .fc-view-harness {
                width: 100% !important;
                height: auto !important;
              }

              .fc-daygrid {
                width: 100% !important;
              }

              .fc-scrollgrid {
                width: 100% !important;
                border: 1px solid #ddd !important;
              }

              .fc-col-header-cell {
                width: 14.28% !important;
                min-width: 14.28% !important;
                max-width: 14.28% !important;
                padding: 4px 2px !important;
                font-size: 0.75rem !important;
                font-weight: bold !important;
                text-align: center !important;
                border: 1px solid #ddd !important;
              }

              .fc-daygrid-day {
                width: 14.28% !important;
                min-width: 14.28% !important;
                max-width: 14.28% !important;
                height: 80px !important;
                min-height: 80px !important;
                border: 1px solid #ddd !important;
                padding: 2px !important;
              }

              .fc-daygrid-day-frame {
                height: 100% !important;
              }

              .fc-daygrid-day-number {
                font-size: 0.7rem !important;
                padding: 2px !important;
              }

              .fc-event {
                font-size: 0.6rem !important;
                padding: 1px 2px !important;
                margin-bottom: 1px !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
              }

              .fc-daygrid-day-events {
                margin-top: 2px !important;
              }

              /* Forçar 7 colunas */
              .fc-scrollgrid-sync-table {
                width: 100% !important;
                table-layout: fixed !important;
              }

              .fc-scrollgrid-sync-table colgroup col {
                width: 14.28% !important;
              }
            }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={ptBrLocale}
            events={eventos}
            eventClick={handleEventClick}
            datesSet={(dateInfo) => setMesAtual(dateInfo.view.currentStart)}
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "today",
            }}
            buttonText={{
              today: "Hoje",
              month: "Mês",
              week: "Semana",
            }}
            height="auto"
            eventDisplay="block"
            displayEventTime={false}
            dayMaxEvents={2}
          />
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card className="print-area no-print">
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-500 rounded"></div>
              <span className="text-sm">Receita Recebida</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-red-500 rounded"></div>
              <span className="text-sm">Despesa Paga</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-red-600 rounded"></div>
              <span className="text-sm">Vencido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Fechamento Cartão</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Vencimento Fatura</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes da Transação */}
      {modalAberto && tipoModal === 'transacao' && transacaoSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Detalhes da Transação</CardTitle>
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
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="font-medium">{transacaoSelecionada.descricao}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className={`text-lg font-bold ${
                    transacaoSelecionada.tipo === "RECEITA"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {transacaoSelecionada.tipo === "RECEITA" ? "+" : "-"}
                    {formatarMoeda(transacaoSelecionada.valor)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={getStatusBadge(transacaoSelecionada.status).variant}>
                    {getStatusBadge(transacaoSelecionada.status).label}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">
                  {formatarData(transacaoSelecionada.dataCompetencia)}
                </p>
              </div>

              {transacaoSelecionada.categoria && (
                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="font-medium">{transacaoSelecionada.categoria.nome}</p>
                </div>
              )}

              {transacaoSelecionada.contaBancaria && (
                <div>
                  <p className="text-sm text-gray-500">Conta</p>
                  <p className="font-medium">{transacaoSelecionada.contaBancaria.nome}</p>
                </div>
              )}

              {transacaoSelecionada.cartaoCredito && (
                <div>
                  <p className="text-sm text-gray-500">Cartão</p>
                  <p className="font-medium">{transacaoSelecionada.cartaoCredito.nome}</p>
                </div>
              )}

              {transacaoSelecionada.status === "PENDENTE" && (
                <div className="flex gap-2 pt-4 border-t">
                  {transacaoSelecionada.tipo === "DESPESA" ? (
                    <Button
                      onClick={() => handleMarcarComoPago(transacaoSelecionada.id)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Marcar como Pago
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleMarcarComoRecebido(transacaoSelecionada.id)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Marcar como Recebido
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Detalhes da Fatura */}
      {modalAberto && tipoModal === 'fatura' && faturaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>
                  {faturaSelecionada.cartao?.nome || 'Cartão de Crédito'}
                </CardTitle>
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Valor Total da Fatura</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">
                  {formatarMoeda(faturaSelecionada.valorTotal)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mês de Referência</p>
                  <p className="font-medium">
                    {String(faturaSelecionada.mesReferencia).padStart(2, '0')}/{faturaSelecionada.anoReferencia}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={faturaSelecionada.status === 'PAGA' ? 'success' : 'warning'}>
                    {faturaSelecionada.status === 'PAGA' ? 'Paga' : 'Aberta'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Data de Fechamento</p>
                <p className="font-medium">
                  📋 {(() => {
                    // Fechamento no MESMO MÊS da fatura
                    const diaFech = faturaSelecionada.cartao?.diaFechamento || 1;
                    return `${String(diaFech).padStart(2, '0')}/${String(faturaSelecionada.mesReferencia).padStart(2, '0')}/${faturaSelecionada.anoReferencia}`;
                  })()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Data de Vencimento</p>
                <p className="font-medium">
                  💳 {(() => {
                    // Calcular data de vencimento correta
                    const diaVenc = faturaSelecionada.cartao?.diaVencimento || 1;
                    return `${String(diaVenc).padStart(2, '0')}/${String(faturaSelecionada.mesReferencia).padStart(2, '0')}/${faturaSelecionada.anoReferencia}`;
                  })()}
                </p>
              </div>

              {faturaSelecionada.cartao && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Informações do Cartão</p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-600">Banco:</span>{' '}
                      <span className="font-medium">{faturaSelecionada.cartao.banco}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Fechamento:</span>{' '}
                      <span className="font-medium">Dia {faturaSelecionada.cartao.diaFechamento}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Vencimento:</span>{' '}
                      <span className="font-medium">Dia {faturaSelecionada.cartao.diaVencimento}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                💡 <strong>Dica:</strong> Compras feitas a partir do dia {faturaSelecionada.cartao?.diaFechamento || '?'} (data de fechamento) 
                entram na fatura do próximo mês.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Detalhes do Empréstimo */}
      {modalAberto && tipoModal === 'emprestimo' && emprestimoSelecionado && parcelaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Detalhes do Empréstimo</CardTitle>
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
                <p className="text-sm text-gray-500">Instituição</p>
                <p className="font-medium text-lg">{emprestimoSelecionado.instituicao}</p>
              </div>

              {emprestimoSelecionado.descricao && (
                <div>
                  <p className="text-sm text-gray-500">Descrição</p>
                  <p className="font-medium">{emprestimoSelecionado.descricao}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Parcela</p>
                  <p className="text-lg font-bold text-amber-600">
                    {parcelaSelecionada.numeroParcela}/{emprestimoSelecionado.numeroParcelas}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Valor da Parcela</p>
                  <p className="text-lg font-bold text-amber-600">
                    {formatarMoeda(parcelaSelecionada.valor)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={parcelaSelecionada.status === "PAGO" ? "default" : "secondary"}>
                    {parcelaSelecionada.status === "PAGO" ? "Pago" : "Pendente"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Vencimento</p>
                  <p className="font-medium">
                    {formatarData(parcelaSelecionada.dataVencimento)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Informações do Empréstimo</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Valor Total</p>
                    <p className="font-medium">{formatarMoeda(emprestimoSelecionado.valorTotal)}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Valor da Parcela</p>
                    <p className="font-medium">{formatarMoeda(emprestimoSelecionado.valorParcela)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Parcelas Pagas</p>
                    <p className="font-medium">{emprestimoSelecionado.parcelasPagas}/{emprestimoSelecionado.numeroParcelas}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Sistema</p>
                    <p className="font-medium">{emprestimoSelecionado.sistemaAmortizacao || 'PRICE'}</p>
                  </div>
                </div>

                {emprestimoSelecionado.taxaJurosMensal && (
                  <div className="text-sm">
                    <p className="text-gray-500">Taxa de Juros</p>
                    <p className="font-medium">{emprestimoSelecionado.taxaJurosMensal.toFixed(2)}% ao mês</p>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 p-3 rounded text-sm text-amber-800">
                💰 <strong>Detalhes da Parcela:</strong> Esta é a parcela {parcelaSelecionada.numeroParcela} de {emprestimoSelecionado.numeroParcelas}. 
                {parcelaSelecionada.status === "PAGO" 
                  ? " Parcela já paga." 
                  : ` Vence em ${formatarData(parcelaSelecionada.dataVencimento)}.`}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setModalAberto(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => window.location.href = `/dashboard/emprestimos/${emprestimoSelecionado.id}`}
                  className="flex-1"
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
