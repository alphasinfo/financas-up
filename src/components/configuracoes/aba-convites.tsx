"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, X, Clock, UserCheck, AlertCircle } from "lucide-react";

interface Convite {
  id: string;
  emailConvidado: string;
  permissao: string;
  status: string;
  criadoEm: string;
  proprietario: {
    nome: string;
    email: string;
  };
}

export function AbaConvites() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarConvites();
  }, []);

  const carregarConvites = async () => {
    try {
      const resposta = await fetch("/api/convites");
      if (resposta.ok) {
        const dados = await resposta.json();
        setConvites(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleAceitar = async (id: string) => {
    try {
      const resposta = await fetch(`/api/convites/${id}/aceitar`, {
        method: "POST",
      });

      if (resposta.ok) {
        carregarConvites();
      }
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
    }
  };

  const handleRecusar = async (id: string) => {
    try {
      const resposta = await fetch(`/api/convites/${id}/recusar`, {
        method: "POST",
      });

      if (resposta.ok) {
        carregarConvites();
      }
    } catch (error) {
      console.error("Erro ao recusar convite:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDENTE: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>,
      ACEITO: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><Check className="h-3 w-3 mr-1" />Aceito</Badge>,
      RECUSADO: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><X className="h-3 w-3 mr-1" />Recusado</Badge>,
    };
    return badges[status as keyof typeof badges] || status;
  };

  const getPermissaoBadge = (permissao: string) => {
    const badges = {
      LEITURA: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">👁️ Leitura</Badge>,
      EDICAO: <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">✏️ Edição</Badge>,
      ADMIN: <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">🛡️ Admin</Badge>,
    };
    return badges[permissao as keyof typeof badges] || permissao;
  };

  const convitesPendentes = convites.filter(c => c.status === "PENDENTE");
  const convitesRespondidos = convites.filter(c => c.status !== "PENDENTE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Convites Recebidos</CardTitle>
              <CardDescription className="text-blue-700">
                Gerencie convites para acessar contas de outros usuários
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Convites Pendentes */}
      {convitesPendentes.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="h-5 w-5" />
              Convites Pendentes ({convitesPendentes.length})
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Você tem convites aguardando resposta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {convitesPendentes.map((convite) => (
                <div
                  key={convite.id}
                  className="bg-white border border-yellow-300 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                        {convite.proprietario.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {convite.proprietario.nome}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <p className="text-sm text-gray-600">{convite.proprietario.email}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">Permissão:</span>
                          {getPermissaoBadge(convite.permissao)}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Recebido em {new Date(convite.criadoEm).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAceitar(convite.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecusar(convite.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todos os Convites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Histórico de Convites
          </CardTitle>
          <CardDescription>
            Todos os convites recebidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
              <p>Carregando convites...</p>
            </div>
          ) : convites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nenhum convite recebido</p>
              <p className="text-sm mt-1">Quando alguém compartilhar uma conta com você, aparecerá aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {convites.map((convite) => (
                <div
                  key={convite.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                      {convite.proprietario.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {convite.proprietario.nome}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-600">{convite.proprietario.email}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(convite.criadoEm).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPermissaoBadge(convite.permissao)}
                      {getStatusBadge(convite.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">💡 Como Funciona</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Quando alguém compartilha a conta com você, um convite é enviado</li>
                <li>• Você pode aceitar ou recusar o convite</li>
                <li>• Ao aceitar, você terá acesso à conta conforme a permissão concedida</li>
                <li>• O proprietário pode revogar o acesso a qualquer momento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
