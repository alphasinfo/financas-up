"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, Check, X, Loader2, Download } from "lucide-react";
import { formatarMoeda, formatarData } from "@/lib/formatters";

interface TransacaoImportada {
  data: Date;
  descricao: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
  categoria?: string;
  selecionada: boolean;
  contaBancariaId?: string;
  categoriaId?: string;
}

export default function ConciliacaoPage() {
  const [etapa, setEtapa] = useState<"upload" | "revisao" | "sucesso">("upload");
  const [tipoArquivo, setTipoArquivo] = useState<"OFX" | "CSV" | "XML" | "CNAB">("CSV");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [transacoes, setTransacoes] = useState<TransacaoImportada[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [tipoDestino, setTipoDestino] = useState<"conta" | "cartao">("conta");
  const [contaSelecionada, setContaSelecionada] = useState("");
  const [cartaoSelecionado, setCartaoSelecionado] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregarContas();
    carregarCartoes();
    carregarCategorias();
  }, []);

  const carregarContas = async () => {
    try {
      const resposta = await fetch("/api/contas?ativas=true", { cache: 'no-store' });
      if (resposta.ok) {
        const dados = await resposta.json();
        setContas(dados);
        if (dados.length > 0) {
          setContaSelecionada(dados[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  const carregarCartoes = async () => {
    try {
      const resposta = await fetch("/api/cartoes?ativos=true", { cache: 'no-store' });
      if (resposta.ok) {
        const dados = await resposta.json();
        setCartoes(dados);
        if (dados.length > 0) {
          setCartaoSelecionado(dados[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
    }
  };

  const carregarCategorias = async () => {
    try {
      const resposta = await fetch("/api/categorias", { cache: 'no-store' });
      if (resposta.ok) {
        const dados = await resposta.json();
        setCategorias(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const handleSelecionarArquivo = () => {
    inputRef.current?.click();
  };

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivoSelecionado = e.target.files?.[0];
    if (arquivoSelecionado) {
      setArquivo(arquivoSelecionado);
      setErro("");
    }
  };

  const handleProcessarArquivo = async () => {
    if (!arquivo) {
      setErro("Selecione um arquivo primeiro");
      return;
    }

    if (tipoDestino === "conta" && !contaSelecionada) {
      setErro("Selecione uma conta bancária");
      return;
    }

    if (tipoDestino === "cartao" && !cartaoSelecionado) {
      setErro("Selecione um cartão de crédito");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      formData.append("tipo", tipoArquivo);

      const resposta = await fetch("/api/conciliacao", {
        method: "POST",
        body: formData,
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao processar arquivo");
      }

      // Adicionar campos extras às transações
      const transacoesProcessadas = dados.transacoes.map((t: any) => ({
        ...t,
        data: new Date(t.data),
        selecionada: true,
        contaBancariaId: contaSelecionada,
        categoriaId: categorizarAutomaticamente(t.descricao),
      }));

      setTransacoes(transacoesProcessadas);
      setEtapa("revisao");
    } catch (error: any) {
      setErro(error.message || "Erro ao processar arquivo");
    } finally {
      setCarregando(false);
    }
  };

  const categorizarAutomaticamente = (descricao: string): string | undefined => {
    const descLower = descricao.toLowerCase();
    
    // Regras simples de categorização
    if (descLower.includes("mercado") || descLower.includes("supermercado")) {
      return categorias.find((c) => c.nome === "Alimentação")?.id;
    }
    if (descLower.includes("posto") || descLower.includes("combustível") || descLower.includes("gasolina")) {
      return categorias.find((c) => c.nome === "Transporte")?.id;
    }
    if (descLower.includes("salário") || descLower.includes("pagamento")) {
      return categorias.find((c) => c.nome === "Salário")?.id;
    }
    
    return undefined;
  };

  const handleToggleTransacao = (index: number) => {
    const novasTransacoes = [...transacoes];
    novasTransacoes[index].selecionada = !novasTransacoes[index].selecionada;
    setTransacoes(novasTransacoes);
  };

  const handleImportar = async () => {
    const transacoesSelecionadas = transacoes.filter((t) => t.selecionada);

    if (transacoesSelecionadas.length === 0) {
      setErro("Selecione pelo menos uma transação para importar");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const transacoesParaImportar = transacoesSelecionadas.map((t) => ({
        descricao: t.descricao,
        valor: Number(t.valor),
        tipo: t.tipo,
        dataCompetencia: t.data instanceof Date ? t.data.toISOString() : new Date(t.data).toISOString(),
        contaBancariaId: t.contaBancariaId!,
        categoriaId: t.categoriaId || undefined,
      }));

      const resposta = await fetch("/api/conciliacao/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transacoes: transacoesParaImportar }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao importar transações");
      }

      setEtapa("sucesso");
    } catch (error: any) {
      setErro(error.message || "Erro ao importar transações");
    } finally {
      setCarregando(false);
    }
  };

  const handleNovaImportacao = () => {
    setEtapa("upload");
    setArquivo(null);
    setTransacoes([]);
    setErro("");
  };

  // Etapa de Upload
  if (etapa === "upload") {
    return (
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Conciliação Bancária</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Importe extratos e concilie transações automaticamente
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Selecione o Tipo de Arquivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(["OFX", "CSV", "XML", "CNAB"] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTipoArquivo(tipo)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    tipoArquivo === tipo
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <FileText className={`h-8 w-8 mx-auto mb-2 ${
                    tipoArquivo === tipo ? "text-primary" : "text-gray-400"
                  }`} />
                  <p className="font-medium text-center">{tipo}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Selecione o Destino</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setTipoDestino("conta")}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  tipoDestino === "conta"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium text-center">Conta Bancária</p>
              </button>
              <button
                onClick={() => setTipoDestino("cartao")}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  tipoDestino === "cartao"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium text-center">Cartão de Crédito</p>
              </button>
            </div>

            {tipoDestino === "conta" ? (
              <select
                value={contaSelecionada}
                onChange={(e) => setContaSelecionada(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione uma conta</option>
                {contas.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} - {conta.instituicao}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={cartaoSelecionado}
                onChange={(e) => setCartaoSelecionado(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione um cartão</option>
                {cartoes.map((cartao) => (
                  <option key={cartao.id} value={cartao.id}>
                    {cartao.nome} - {cartao.bandeira}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              3. Faça Upload do Arquivo
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
              {arquivo ? `Arquivo selecionado: ${arquivo.name}` : "Nenhum arquivo selecionado"}
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".ofx,.csv,.xml,.txt"
              onChange={handleArquivoSelecionado}
              className="hidden"
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSelecionarArquivo}>
                <FileText className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
              
              {arquivo && (
                <Button onClick={handleProcessarArquivo} disabled={carregando}>
                  {carregando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Processar Arquivo
                    </>
                  )}
                </Button>
              )}
            </div>

            {erro && (
              <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {erro}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatos Suportados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">OFX (Open Financial Exchange)</p>
                  <p className="text-sm text-gray-500">Formato padrão de extratos bancários</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">CSV (Valores Separados)</p>
                  <p className="text-sm text-gray-500">Planilhas exportadas do Excel</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">XML (Extratos em XML)</p>
                  <p className="text-sm text-gray-500">Formato estruturado de dados</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">CNAB 240/400</p>
                  <p className="text-sm text-gray-500">Padrão bancário brasileiro</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Baixar Modelos de Exemplo</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const csv = "data,descricao,valor,tipo\\n2025-01-15,Salário,5000.00,RECEITA\\n2025-01-16,Supermercado,-250.50,DESPESA\\n2025-01-17,Combustível,-180.00,DESPESA";
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'modelo_extrato_conta.csv';
                    a.click();
                  }}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Modelo Conta Bancária
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const csv = "data,descricao,valor,parcelas\\n2025-01-10,Compra Loja A,450.00,1\\n2025-01-12,Restaurante,120.50,1\\n2025-01-15,Eletrônico,1200.00,3";
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'modelo_extrato_cartao.csv';
                    a.click();
                  }}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Modelo Cartão de Crédito
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                <strong>Formato CSV:</strong> Use vírgula como separador. Campos obrigatórios: data (AAAA-MM-DD), descricao, valor. 
                Para conta bancária adicione coluna "tipo" (RECEITA ou DESPESA). Para cartão, valores são sempre despesas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Etapa de Revisão
  if (etapa === "revisao") {
    const selecionadas = transacoes.filter((t) => t.selecionada).length;
    const totalReceitas = transacoes.filter((t) => t.selecionada && t.tipo === "RECEITA").reduce((acc, t) => acc + t.valor, 0);
    const totalDespesas = transacoes.filter((t) => t.selecionada && t.tipo === "DESPESA").reduce((acc, t) => acc + t.valor, 0);

    return (
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Revisar Transações</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              {selecionadas} de {transacoes.length} transações selecionadas
            </p>
          </div>
          <Button variant="outline" onClick={handleNovaImportacao}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Selecionadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{selecionadas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalReceitas)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{formatarMoeda(totalDespesas)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transações Importadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transacoes.map((transacao, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 border rounded-lg ${
                    transacao.selecionada ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={transacao.selecionada}
                    onChange={() => handleToggleTransacao(index)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{transacao.descricao}</p>
                    <p className="text-sm text-gray-500">{formatarData(transacao.data)}</p>
                  </div>
                  <Badge variant={transacao.tipo === "RECEITA" ? "default" : "destructive"}>
                    {transacao.tipo === "RECEITA" ? "Receita" : "Despesa"}
                  </Badge>
                  <p className={`font-bold ${transacao.tipo === "RECEITA" ? "text-green-600" : "text-red-600"}`}>
                    {formatarMoeda(transacao.valor)}
                  </p>
                </div>
              ))}
            </div>

            {erro && (
              <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {erro}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handleNovaImportacao} className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleImportar} disabled={carregando || selecionadas === 0} className="flex-1">
                {carregando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Importar {selecionadas} Transações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Etapa de Sucesso
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Importação Concluída!
          </h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            As transações foram importadas com sucesso e os saldos foram atualizados.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleNovaImportacao}>
              Nova Importação
            </Button>
            <Button onClick={() => window.location.href = "/dashboard/financeiro"}>
              Ver Transações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
