"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  cor: string;
  icone: string;
}

export default function CategoriasPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  
  // Formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"RECEITA" | "DESPESA">("DESPESA");
  const [cor, setCor] = useState("#EF4444");
  const [icone, setIcone] = useState("📦");

  const cores = [
    { nome: "Vermelho", valor: "#EF4444" },
    { nome: "Laranja", valor: "#F59E0B" },
    { nome: "Amarelo", valor: "#EAB308" },
    { nome: "Verde", valor: "#10B981" },
    { nome: "Azul", valor: "#3B82F6" },
    { nome: "Roxo", valor: "#8B5CF6" },
    { nome: "Rosa", valor: "#EC4899" },
    { nome: "Cinza", valor: "#6B7280" },
  ];

  const icones = ["📦", "🍔", "🚗", "🏠", "🏥", "📚", "🎮", "👔", "💰", "💼", "📈", "💵", "🎯", "✈️", "🎬", "🛒"];

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const resposta = await fetch("/api/categorias", { cache: 'no-store' });
      if (resposta.ok) {
        const dados = await resposta.json();
        setCategorias(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditando(categoria);
      setNome(categoria.nome);
      setTipo(categoria.tipo as "RECEITA" | "DESPESA");
      setCor(categoria.cor || "#EF4444");
      setIcone(categoria.icone || "📦");
    } else {
      setEditando(null);
      setNome("");
      setTipo("DESPESA");
      setCor("#EF4444");
      setIcone("📦");
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(null);
    setNome("");
    setTipo("DESPESA");
    setCor("#EF4444");
    setIcone("📦");
  };

  const handleSalvar = async () => {
    if (!nome.trim()) {
      alert("Nome da categoria é obrigatório");
      return;
    }

    setSalvando(true);

    try {
      const dados = { nome, tipo, cor, icone };
      
      const resposta = editando
        ? await fetch(`/api/categorias/${editando.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
          })
        : await fetch("/api/categorias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
          });

      if (resposta.ok) {
        await carregarCategorias();
        fecharModal();
      } else {
        const erro = await resposta.json();
        alert(erro.erro || "Erro ao salvar categoria");
      }
    } catch (error) {
      alert("Erro ao salvar categoria");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    setExcluindo(id);

    try {
      const resposta = await fetch(`/api/categorias/${id}`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        await carregarCategorias();
      } else {
        const erro = await resposta.json();
        alert(erro.erro || "Erro ao excluir categoria");
      }
    } catch (error) {
      alert("Erro ao excluir categoria");
    } finally {
      setExcluindo(null);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Carregando categorias...</p>
      </div>
    );
  }

  const categoriasDespesa = categorias.filter((c) => c.tipo === "DESPESA");
  const categoriasReceita = categorias.filter((c) => c.tipo === "RECEITA");

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/configuracoes" className="w-full md:w-auto">
          <Button className="w-full md:w-auto" variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categorias</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Gerencie suas categorias de receitas e despesas</p>
          </div>
        </div>
        <Button onClick={() => abrirModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Categorias de Despesa */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Despesa ({categoriasDespesa.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasDespesa.map((categoria) => (
              <div
                key={categoria.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${categoria.cor}20` }}
                  >
                    {categoria.icone}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{categoria.nome}</p>
                    <Badge variant="outline" className="text-xs">Despesa</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => abrirModal(categoria)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExcluir(categoria.id)}
                    disabled={excluindo === categoria.id}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {excluindo === categoria.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorias de Receita */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Receita ({categoriasReceita.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasReceita.map((categoria) => (
              <div
                key={categoria.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${categoria.cor}20` }}
                  >
                    {categoria.icone}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{categoria.nome}</p>
                    <Badge variant="outline" className="text-xs">Receita</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => abrirModal(categoria)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExcluir(categoria.id)}
                    disabled={excluindo === categoria.id}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {excluindo === categoria.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editando ? "Editar" : "Nova"} Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base" htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Nome da categoria"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={salvando}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={tipo === "DESPESA" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTipo("DESPESA")}
                    disabled={salvando}
                  >
                    Despesa
                  </Button>
                  <Button
                    type="button"
                    variant={tipo === "RECEITA" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTipo("RECEITA")}
                    disabled={salvando}
                  >
                    Receita
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="grid grid-cols-4 gap-2">
                  {cores.map((c) => (
                    <button
                      key={c.valor}
                      type="button"
                      className={`h-10 rounded-md transition-all ${
                        cor === c.valor ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: c.valor }}
                      onClick={() => setCor(c.valor)}
                      disabled={salvando}
                      title={c.nome}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="grid grid-cols-8 gap-2">
                  {icones.map((i) => (
                    <button
                      key={i}
                      type="button"
                      className={`h-10 text-xl rounded-md border transition-all ${
                        icone === i ? "ring-2 ring-primary ring-offset-2 bg-gray-100" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setIcone(i)}
                      disabled={salvando}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSalvar}
                  disabled={salvando}
                >
                  {salvando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
