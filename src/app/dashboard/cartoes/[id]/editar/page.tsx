"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";

const cores = [
  { nome: "Azul", valor: "#3B82F6" },
  { nome: "Verde", valor: "#10B981" },
  { nome: "Roxo", valor: "#8B5CF6" },
  { nome: "Rosa", valor: "#EC4899" },
  { nome: "Laranja", valor: "#F59E0B" },
  { nome: "Vermelho", valor: "#EF4444" },
  { nome: "Cinza", valor: "#6B7280" },
  { nome: "Índigo", valor: "#6366F1" },
];

const bandeiras = ["VISA", "MASTERCARD", "ELO", "AMERICAN EXPRESS", "HIPERCARD", "DINERS"];

export default function EditarCartaoPage() {
  const router = useRouter();
  const params = useParams();
  const cartaoId = params.id as string;
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    banco: "",
    bandeira: "VISA",
    apelido: "",
    numeroMascara: "",
    limiteTotal: "0",
    diaFechamento: "5",
    diaVencimento: "15",
    cor: "#F59E0B",
    ativo: true,
  });

  useEffect(() => {
    carregarCartao();
  }, [cartaoId]);

  const carregarCartao = async () => {
    try {
      const resposta = await fetch(`/api/cartoes/${cartaoId}`);
      
      if (!resposta.ok) {
        throw new Error("Cartão não encontrado");
      }

      const cartao = await resposta.json();
      
      setFormData({
        nome: cartao.nome || "",
        banco: cartao.banco || "",
        bandeira: cartao.bandeira || "VISA",
        apelido: cartao.apelido || "",
        numeroMascara: cartao.numeroMascara || "",
        limiteTotal: cartao.limiteTotal?.toString() || "0",
        diaFechamento: cartao.diaFechamento?.toString() || "5",
        diaVencimento: cartao.diaVencimento?.toString() || "15",
        cor: cartao.cor || "#F59E0B",
        ativo: cartao.ativo ?? true,
      });
    } catch (error) {
      console.error("Erro ao carregar cartão:", error);
      setErro("Erro ao carregar dados do cartão");
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    // Validações
    const diaFech = parseInt(formData.diaFechamento);
    const diaVenc = parseInt(formData.diaVencimento);

    if (diaFech < 1 || diaFech > 31) {
      setErro("Dia de fechamento deve estar entre 1 e 31");
      return;
    }

    if (diaVenc < 1 || diaVenc > 31) {
      setErro("Dia de vencimento deve estar entre 1 e 31");
      return;
    }

    const limite = parseFloat(formData.limiteTotal);
    if (isNaN(limite) || limite <= 0) {
      setErro("Limite deve ser maior que zero");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(`/api/cartoes/${cartaoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          banco: formData.banco,
          bandeira: formData.bandeira,
          apelido: formData.apelido || null,
          numeroMascara: formData.numeroMascara || null,
          limiteTotal: parseFloat(formData.limiteTotal),
          diaFechamento: parseInt(formData.diaFechamento),
          diaVencimento: parseInt(formData.diaVencimento),
          cor: formData.cor,
          ativo: formData.ativo,
        }),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.erro || "Erro ao atualizar cartão");
      }

      router.push(`/dashboard/cartoes/${cartaoId}`);
      router.refresh();
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!confirm("Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const resposta = await fetch(`/api/cartoes/${cartaoId}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        throw new Error("Erro ao excluir cartão");
      }

      router.push("/dashboard/cartoes");
      router.refresh();
    } catch (error) {
      setErro("Erro ao excluir cartão");
    }
  };

  const toggleAtivo = () => {
    setFormData({ ...formData, ativo: !formData.ativo });
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/cartoes/${cartaoId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Editar Cartão</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Atualize as informações do cartão</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cartão</CardTitle>
          <CardDescription>
            Atualize os dados do seu cartão de crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 p-4 md:p-6">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {erro}
              </div>
            )}

            {/* Status do Cartão */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Status do Cartão</Label>
                <p className="text-sm text-gray-500">
                  {formData.ativo ? "Cartão ativo e disponível para compras" : "Cartão desativado"}
                </p>
              </div>
              <Button
                type="button"
                onClick={toggleAtivo}
                variant={formData.ativo ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {formData.ativo ? (
                  <>
                    <ToggleRight className="h-5 w-5" />
                    <span className="text-green-600 font-medium">Ativo</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5" />
                    <span className="text-gray-500 font-medium">Desativado</span>
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="nome">Nome do Cartão *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Visa Gold"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="banco">Banco *</Label>
                <Input
                  id="banco"
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  placeholder="Ex: Banco do Brasil"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="bandeira">Bandeira *</Label>
                <select
                  id="bandeira"
                  value={formData.bandeira}
                  onChange={(e) => setFormData({ ...formData, bandeira: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {bandeiras.map((bandeira) => (
                    <option key={bandeira} value={bandeira}>
                      {bandeira}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="apelido">Apelido</Label>
                <Input
                  id="apelido"
                  value={formData.apelido}
                  onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
                  placeholder="Ex: Cartão Principal"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="numeroMascara">Últimos 4 dígitos</Label>
                <Input
                  id="numeroMascara"
                  value={formData.numeroMascara}
                  onChange={(e) => setFormData({ ...formData, numeroMascara: e.target.value })}
                  placeholder="Ex: ****1234"
                  maxLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="limiteTotal">Limite Total (R$) *</Label>
                <Input
                  id="limiteTotal"
                  type="number"
                  step="0.01"
                  value={formData.limiteTotal}
                  onChange={(e) => setFormData({ ...formData, limiteTotal: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="diaFechamento">Dia de Fechamento *</Label>
                <Input
                  id="diaFechamento"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaFechamento}
                  onChange={(e) => setFormData({ ...formData, diaFechamento: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">
                  Compras após este dia entram na próxima fatura
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="diaVencimento">Dia de Vencimento *</Label>
                <Input
                  id="diaVencimento"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaVencimento}
                  onChange={(e) => setFormData({ ...formData, diaVencimento: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor do Cartão</Label>
              <div className="flex gap-2 flex-wrap">
                {cores.map((cor) => (
                  <button
                    key={cor.valor}
                    type="button"
                    onClick={() => setFormData({ ...formData, cor: cor.valor })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      formData.cor === cor.valor
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: cor.valor }}
                    title={cor.nome}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={salvando} className="flex-1">
                {salvando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
              
              <Button
                type="button"
                variant="destructive"
                onClick={handleExcluir}
                className="flex items-center gap-2 justify-center"
              >
                <Trash2 className="h-4 w-4" />
                Excluir Cartão
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
