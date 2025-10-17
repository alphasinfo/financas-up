"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Trash2, Check, X, Clock, UserPlus, Shield } from "lucide-react";

interface Compartilhamento {
  id: string;
  email: string;
  emailConvidado?: string;
  permissao: string;
  status?: string;
  criadoEm: string;
  usuario?: {
    nome: string;
    email: string;
  };
  criador?: {
    nome: string;
    email: string;
  };
}

export function AbaCompartilhamento() {
  const [compartilhamentos, setCompartilhamentos] = useState<Compartilhamento[]>([]);
  const [emailConvidado, setEmailConvidado] = useState("");
  const [permissao, setPermissao] = useState("LEITURA");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    carregarCompartilhamentos();
  }, []);

  const carregarCompartilhamentos = async () => {
    try {
      const resposta = await fetch("/api/compartilhamento");
      if (resposta.ok) {
        const dados = await resposta.json();
        // A API retorna um objeto com arrays
        const compartilhamentosCriados = dados.compartilhamentosCriados || [];
        const convitesPendentes = dados.convitesPendentes || [];
        // Combinar compartilhamentos criados e convites pendentes
        setCompartilhamentos([...compartilhamentosCriados, ...convitesPendentes]);
      } else {
        setCompartilhamentos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar compartilhamentos:", error);
      setCompartilhamentos([]);
    }
  };

  const handleConvidar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    setSucesso(false);

    try {
      const resposta = await fetch("/api/compartilhamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailConvidado,
          tipo: "SISTEMA",
          permissao: permissao === "LEITURA" ? "VISUALIZAR" : permissao === "EDICAO" ? "EDITAR" : permissao,
        }),
      });

      if (resposta.ok) {
        setSucesso(true);
        setEmailConvidado("");
        setPermissao("LEITURA");
        carregarCompartilhamentos();
        setTimeout(() => setSucesso(false), 3000);
      } else {
        const dados = await resposta.json();
        setErro(dados.erro || "Erro ao enviar convite");
      }
    } catch (error) {
      setErro("Erro ao enviar convite");
    } finally {
      setCarregando(false);
    }
  };

  const handleRevogar = async (id: string) => {
    if (!confirm("Deseja realmente revogar este compartilhamento?")) return;

    try {
      const resposta = await fetch(`/api/compartilhamento/${id}`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        carregarCompartilhamentos();
      }
    } catch (error) {
      console.error("Erro ao revogar:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDENTE: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>,
      ACEITO: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><Check className="h-3 w-3 mr-1" />Ativo</Badge>,
      RECUSADO: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><X className="h-3 w-3 mr-1" />Recusado</Badge>,
    };
    return badges[status as keyof typeof badges] || status;
  };

  const getPermissaoBadge = (permissao: string) => {
    const badges = {
      LEITURA: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">👁️ Leitura</Badge>,
      VISUALIZAR: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">👁️ Leitura</Badge>,
      EDICAO: <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">✏️ Edição</Badge>,
      EDITAR: <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">✏️ Edição</Badge>,
      ADMIN: <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300"><Shield className="h-3 w-3 mr-1" />Admin</Badge>,
    };
    return badges[permissao as keyof typeof badges] || permissao;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Compartilhamento de Conta</CardTitle>
              <CardDescription className="text-purple-700">
                Compartilhe acesso à sua conta com outras pessoas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Convidar Novo Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Convidar Usuário
          </CardTitle>
          <CardDescription>
            Envie um convite para compartilhar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConvidar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailConvidado">Email do Convidado</Label>
                <Input
                  id="emailConvidado"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={emailConvidado}
                  onChange={(e) => setEmailConvidado(e.target.value)}
                  required
                  disabled={carregando}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permissao">Nível de Permissão</Label>
                <select
                  id="permissao"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={permissao}
                  onChange={(e) => setPermissao(e.target.value)}
                  disabled={carregando}
                >
                  <option value="LEITURA">👁️ Leitura (Apenas visualizar)</option>
                  <option value="EDICAO">✏️ Edição (Visualizar e editar)</option>
                  <option value="ADMIN">🛡️ Admin (Controle total)</option>
                </select>
              </div>
            </div>

            {/* Descrição das Permissões */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Níveis de Permissão:</h4>
              <ul className="space-y-1 text-blue-700">
                <li><strong>👁️ Leitura:</strong> Pode visualizar todas as informações, mas não pode fazer alterações</li>
                <li><strong>✏️ Edição:</strong> Pode visualizar e criar/editar transações, metas e orçamentos</li>
                <li><strong>🛡️ Admin:</strong> Controle total, incluindo configurações e exclusão de dados</li>
              </ul>
            </div>

            {sucesso && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                ✅ Convite enviado com sucesso!
              </div>
            )}

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                ❌ {erro}
              </div>
            )}

            <Button type="submit" disabled={carregando} className="w-full md:w-auto">
              {carregando ? "Enviando..." : "Enviar Convite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Compartilhamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Compartilhamentos Ativos
          </CardTitle>
          <CardDescription>
            Usuários com acesso à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {compartilhamentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nenhum compartilhamento ativo</p>
              <p className="text-sm mt-1">Convide alguém para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {compartilhamentos.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {(comp.email || comp.emailConvidado || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {comp.usuario?.nome || comp.criador?.nome || comp.email || comp.emailConvidado}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-600">{comp.email || comp.emailConvidado}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPermissaoBadge(comp.permissao)}
                      {comp.status && getStatusBadge(comp.status)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevogar(comp.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aviso de Segurança */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">⚠️ Aviso de Segurança</h4>
              <p className="text-sm text-yellow-700">
                Ao compartilhar sua conta, você está dando acesso às suas informações financeiras.
                Compartilhe apenas com pessoas de confiança e revise regularmente os acessos ativos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
