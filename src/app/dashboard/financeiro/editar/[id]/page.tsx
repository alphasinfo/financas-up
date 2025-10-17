"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Transacao {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  dataCompetencia: string;
  status: string;
  categoriaId: string | null;
  contaBancariaId: string | null;
  cartaoCreditoId: string | null;
}

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
}

interface Conta {
  id: string;
  nome: string;
  banco: string;
}

interface Cartao {
  id: string;
  nome: string;
  banco: string;
}

export default function EditarTransacaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  // Dados da transação
  const [transacao, setTransacao] = useState<Transacao | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [contaBancariaId, setContaBancariaId] = useState("");
  const [cartaoCreditoId, setCartaoCreditoId] = useState("");
  const [status, setStatus] = useState("PENDENTE");
  const [formaPagamento, setFormaPagamento] = useState<"CONTA" | "CARTAO">("CONTA");
  
  // Listas
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      // Carregar transação
      const respostaTransacao = await fetch(`/api/transacoes/${id}`);
      if (respostaTransacao.ok) {
        const dadosTransacao = await respostaTransacao.json();
        setTransacao(dadosTransacao);
        setDescricao(dadosTransacao.descricao);
        setValor(dadosTransacao.valor.toString());
        setData(dadosTransacao.dataCompetencia.split("T")[0]);
        setCategoriaId(dadosTransacao.categoriaId || "");
        setContaBancariaId(dadosTransacao.contaBancariaId || "");
        setCartaoCreditoId(dadosTransacao.cartaoCreditoId || "");
        setStatus(dadosTransacao.status);
        // Definir forma de pagamento baseado nos dados existentes
        if (dadosTransacao.cartaoCreditoId) {
          setFormaPagamento("CARTAO");
        } else {
          setFormaPagamento("CONTA");
        }
      }

      // Carregar categorias, contas e cartões
      const [respCategorias, respContas, respCartoes] = await Promise.all([
        fetch("/api/categorias", { cache: 'no-store' }),
        fetch("/api/contas?ativas=true", { cache: 'no-store' }),
        fetch("/api/cartoes?ativos=true", { cache: 'no-store' }),
      ]);

      if (respCategorias.ok) {
        const dadosCategorias = await respCategorias.json();
        setCategorias(dadosCategorias);
      }

      if (respContas.ok) {
        const dadosContas = await respContas.json();
        setContas(dadosContas);
      }

      if (respCartoes.ok) {
        const dadosCartoes = await respCartoes.json();
        setCartoes(dadosCartoes);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados da transação");
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = async () => {
    if (!descricao || !valor || !data) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setSalvando(true);

    try {
      const dados = {
        descricao,
        valor: parseFloat(valor),
        dataCompetencia: new Date(data + "T12:00:00").toISOString(),
        status,
        categoriaId: categoriaId || null,
        contaBancariaId: formaPagamento === "CONTA" ? contaBancariaId : null,
        cartaoCreditoId: formaPagamento === "CARTAO" ? cartaoCreditoId : null,
      };

      const resposta = await fetch(`/api/transacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (resposta.ok) {
        alert("Transação atualizada com sucesso!");
        router.push("/dashboard/financeiro");
      } else {
        const erro = await resposta.json();
        alert(erro.erro || "Erro ao atualizar transação");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar transação");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!transacao) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 mb-4">Transação não encontrada</p>
        <Link href="/dashboard/financeiro" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const categoriasFiltradas = categorias.filter(
    (c) => c.tipo === transacao.tipo
  );

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/financeiro" className="w-full md:w-auto">
          <Button className="w-full md:w-auto" variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Editar {transacao.tipo === "RECEITA" ? "Receita" : "Despesa"}
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Atualize as informações da transação
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Transação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="descricao">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Salário, Aluguel, Compras..."
                disabled={salvando}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="valor">
                Valor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0.00"
                disabled={salvando}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="data">
                Data <span className="text-red-500">*</span>
              </Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                disabled={salvando}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="categoria">Categoria</Label>
              <select
                id="categoria"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={salvando}
              >
                <option value="">Selecione...</option>
                {categoriasFiltradas.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {transacao.tipo === "DESPESA" && (
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Forma de Pagamento</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormaPagamento("CONTA")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formaPagamento === "CONTA"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    disabled={salvando}
                  >
                    <p className="font-medium text-sm">Conta Bancária</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormaPagamento("CARTAO")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formaPagamento === "CARTAO"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    disabled={salvando}
                  >
                    <p className="font-medium text-sm">Cartão de Crédito</p>
                  </button>
                </div>
              </div>
            )}

            {(transacao.tipo === "RECEITA" || formaPagamento === "CONTA") && (
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="conta">Conta Bancária</Label>
                <select
                  id="conta"
                  value={contaBancariaId}
                  onChange={(e) => setContaBancariaId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={salvando}
                >
                  <option value="">Selecione...</option>
                  {contas.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome} - {conta.banco}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {transacao.tipo === "DESPESA" && formaPagamento === "CARTAO" && (
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="cartao">Cartão de Crédito</Label>
                <select
                  id="cartao"
                  value={cartaoCreditoId}
                  onChange={(e) => setCartaoCreditoId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={salvando}
                >
                  <option value="">Selecione...</option>
                  {cartoes.map((cartao) => (
                    <option key={cartao.id} value={cartao.id}>
                      {cartao.nome} - {cartao.banco}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm md:text-base" htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={salvando}
              >
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="RECEBIDO">Recebido</option>
                <option value="VENCIDO">Vencido</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSalvar}
              disabled={salvando}
              className="flex-1"
            >
              {salvando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
            <Link href="/dashboard/financeiro" className="flex-1">
              <Button variant="outline" className="w-full" disabled={salvando}>
                Cancelar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
