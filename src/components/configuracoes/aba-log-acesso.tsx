"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Monitor, Smartphone, MapPin, Clock, AlertTriangle, CheckCircle, Filter } from "lucide-react";

interface LogAcesso {
  id: string;
  ip: string;
  userAgent: string;
  dispositivo: string;
  navegador: string;
  localizacao?: string;
  acao: string;
  sucesso: boolean;
  criadoEm: string;
}

export function AbaLogAcesso() {
  const [logs, setLogs] = useState<LogAcesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<"TODOS" | "SUCESSO" | "FALHA">("TODOS");
  const [periodo, setPeriodo] = useState<"7" | "30" | "90">("30");

  useEffect(() => {
    carregarLogs();
  }, [filtro, periodo]);

  const carregarLogs = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch(`/api/log-acesso?filtro=${filtro}&periodo=${periodo}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setLogs(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    } finally {
      setCarregando(false);
    }
  };

  const getDispositivoIcon = (dispositivo: string) => {
    if (dispositivo.toLowerCase().includes("mobile") || dispositivo.toLowerCase().includes("android") || dispositivo.toLowerCase().includes("iphone")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getAcaoBadge = (acao: string, sucesso: boolean) => {
    if (!sucesso) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><AlertTriangle className="h-3 w-3 mr-1" />Falha</Badge>;
    }

    const badges: Record<string, JSX.Element> = {
      LOGIN: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Login</Badge>,
      LOGOUT: <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Logout</Badge>,
      CRIAR: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Criar</Badge>,
      EDITAR: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Editar</Badge>,
      EXCLUIR: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Excluir</Badge>,
    };
    return badges[acao] || <Badge variant="outline">{acao}</Badge>;
  };

  const logsSucesso = logs.filter(l => l.sucesso).length;
  const logsFalha = logs.filter(l => !l.sucesso).length;
  const dispositivosUnicos = new Set(logs.map(l => l.dispositivo)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Log de Acesso</CardTitle>
              <CardDescription className="text-indigo-700">
                Monitore todos os acessos à sua conta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Acessos</p>
                <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acessos com Sucesso</p>
                <p className="text-2xl font-bold text-green-600">{logsSucesso}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tentativas Falhas</p>
                <p className="text-2xl font-bold text-red-600">{logsFalha}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de Acesso</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value as any)}
              >
                <option value="TODOS">Todos os Acessos</option>
                <option value="SUCESSO">Apenas Sucessos</option>
                <option value="FALHA">Apenas Falhas</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Período</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as any)}
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Histórico de Acessos
          </CardTitle>
          <CardDescription>
            Últimos {periodo} dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
              <p>Carregando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nenhum log encontrado</p>
              <p className="text-sm mt-1">Ajuste os filtros para ver mais resultados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    log.sucesso 
                      ? 'border-gray-200 hover:bg-gray-50' 
                      : 'border-red-200 bg-red-50 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        log.sucesso ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {getDispositivoIcon(log.dispositivo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getAcaoBadge(log.acao, log.sucesso)}
                          <span className="text-sm text-gray-600">•</span>
                          <span className="text-sm text-gray-600">{log.navegador}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Dispositivo:</strong> {log.dispositivo}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {log.ip}
                          </span>
                          {log.localizacao && (
                            <span>{log.localizacao}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.criadoEm).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Segurança */}
      {logsFalha > 3 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">⚠️ Alerta de Segurança</h4>
                <p className="text-sm text-red-700">
                  Detectamos {logsFalha} tentativas de acesso falhadas. Se você não reconhece essas tentativas,
                  recomendamos alterar sua senha imediatamente.
                </p>
                <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700">
                  Alterar Senha Agora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">🔒 Segurança da Conta</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Revise regularmente os logs de acesso</li>
                <li>• Ative notificações para acessos suspeitos</li>
                <li>• Use senhas fortes e únicas</li>
                <li>• Não compartilhe suas credenciais</li>
                <li>• Faça logout em dispositivos públicos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
