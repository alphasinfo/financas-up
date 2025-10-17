"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Share2, 
  Mail,
  Users,
  Loader2,
  Plus,
  X,
  Check,
  AlertCircle,
  Eye,
  Edit,
  Shield
} from "lucide-react";
import { formatarData } from "@/lib/formatters";

interface Compartilhamento {
  id: string;
  conta: {
    nome: string;
    banco: string;
  };
  usuario?: {
    nome: string;
    email: string;
  };
  criador?: {
    nome: string;
    email: string;
  };
  permissao: string;
  ativo: boolean;
  criadoEm: string;
}

interface Convite {
  id: string;
  email: string;
  tipo: string;
  permissao: string;
  token: string;
  aceito: boolean;
  expiraEm: string;
  criadoEm: string;
}

export default function CompartilhamentoPage() {
  const [compartilhamentos, setCompartilhamentos] = useState<{
    criados: Compartilhamento[];
    recebidos: Compartilhamento[];
  }>({ criados: [], recebidos: [] });
  const [convites, setConvites] = useState<Convite[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Form de novo convite
  const [email, setEmail] = useState("");
  const [contaId, setContaId] = useState("");
  const [permissao, setPermissao] = useState("VISUALIZAR");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const response = await fetch("/api/compartilhamento");
      
      if (!response.ok) {
        throw new Error("Erro ao carregar compartilhamentos");
      }

      const dados = await response.json();
      setCompartilhamentos(dados);
    } catch (error) {
      console.error("Erro ao carregar compartilhamentos:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleEnviarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !contaId) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      setEnviando(true);
      const response = await fetch("/api/compartilhamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tipo: "CONTA",
          recursoId: contaId,
          permissao,
        }),
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || "Erro ao enviar convite");
      }

      alert("Convite enviado com sucesso!");
      setModalAberto(false);
      setEmail("");
      setContaId("");
      setPermissao("VISUALIZAR");
      carregarDados();
    } catch (error: any) {
      console.error("Erro ao enviar convite:", error);
      alert(error.message || "Erro ao enviar convite");
    } finally {
      setEnviando(false);
    }
  };

  const handleRevogar = async (compartilhamentoId: string) => {
    if (!confirm("Tem certeza que deseja revogar este acesso?")) {
      return;
    }

    try {
      const response = await fetch(`/api/compartilhamento/${compartilhamentoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao revogar acesso");
      }

      alert("Acesso revogado com sucesso!");
      carregarDados();
    } catch (error) {
      console.error("Erro ao revogar acesso:", error);
      alert("Erro ao revogar acesso");
    }
  };

  const getIconePermissao = (permissao: string) => {
    const icones: Record<string, any> = {
      VISUALIZAR: <Eye className="h-4 w-4" />,
      EDITAR: <Edit className="h-4 w-4" />,
      ADMIN: <Shield className="h-4 w-4" />,
    };
    return icones[permissao] || <Eye className="h-4 w-4" />;
  };

  const getCorPermissao = (permissao: string) => {
    const cores: Record<string, string> = {
      VISUALIZAR: "bg-blue-100 text-blue-800",
      EDITAR: "bg-yellow-100 text-yellow-800",
      ADMIN: "bg-red-100 text-red-800",
    };
    return cores[permissao] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Compartilhamento
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie o acesso às suas contas
          </p>
        </div>
        <Button onClick={() => setModalAberto(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Convite
        </Button>
      </div>

      {/* Alerta de Funcionalidade */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Funcionalidade em Desenvolvimento</p>
              <p>
                O sistema de compartilhamento está parcialmente implementado. 
                A API está funcional, mas o envio de emails e algumas validações ainda estão em desenvolvimento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compartilhamentos Criados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhados por Mim ({compartilhamentos.criados.length})
          </CardTitle>
          <CardDescription>
            Contas que você compartilhou com outros usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : compartilhamentos.criados.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Você ainda não compartilhou nenhuma conta</p>
            </div>
          ) : (
            <div className="space-y-3">
              {compartilhamentos.criados.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{comp.conta.nome}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{comp.usuario?.nome || "Usuário"}</span>
                        <span>•</span>
                        <span>{comp.usuario?.email || "email@example.com"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getCorPermissao(comp.permissao)}`}>
                      {getIconePermissao(comp.permissao)}
                      {comp.permissao}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevogar(comp.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Revogar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compartilhamentos Recebidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Compartilhados Comigo ({compartilhamentos.recebidos.length})
          </CardTitle>
          <CardDescription>
            Contas que outros usuários compartilharam com você
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : compartilhamentos.recebidos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma conta foi compartilhada com você</p>
            </div>
          ) : (
            <div className="space-y-3">
              {compartilhamentos.recebidos.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{comp.conta.nome}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>Compartilhado por {comp.criador?.nome || "Usuário"}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getCorPermissao(comp.permissao)}`}>
                    {getIconePermissao(comp.permissao)}
                    {comp.permissao}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Novo Convite */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Enviar Convite</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setModalAberto(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Compartilhe uma conta com outro usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEnviarConvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email do Usuário</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conta">Conta</Label>
                  <Input
                    id="conta"
                    value={contaId}
                    onChange={(e) => setContaId(e.target.value)}
                    placeholder="ID da conta"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Em breve: seleção de conta por dropdown
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permissao">Permissão</Label>
                  <select
                    id="permissao"
                    value={permissao}
                    onChange={(e) => setPermissao(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="VISUALIZAR">Visualizar</option>
                    <option value="EDITAR">Editar</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={enviando} className="flex-1">
                    {enviando ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Enviar Convite
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalAberto(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
