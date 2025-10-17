"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  Activity,
  Loader2,
  RefreshCw
} from "lucide-react";
import { formatarData } from "@/lib/formatters";

interface Log {
  id: string;
  acao: string;
  recurso: string | null;
  recursoId: string | null;
  ip: string | null;
  userAgent: string | null;
  criadoEm: string;
  usuario: {
    nome: string;
    email: string;
  };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroAcao, setFiltroAcao] = useState("");
  const [filtroRecurso, setFiltroRecurso] = useState("");
  const [limite, setLimite] = useState(50);

  useEffect(() => {
    carregarLogs();
  }, [limite]);

  const carregarLogs = async () => {
    try {
      setCarregando(true);
      const response = await fetch(`/api/logs?limite=${limite}`);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar logs");
      }

      const dados = await response.json();
      setLogs(dados);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      alert("Erro ao carregar logs de acesso");
    } finally {
      setCarregando(false);
    }
  };

  const getIconeAcao = (acao: string) => {
    const icones: Record<string, string> = {
      LOGIN: "🔐",
      LOGOUT: "🚪",
      CRIAR: "➕",
      EDITAR: "✏️",
      EXCLUIR: "🗑️",
      VISUALIZAR: "👁️",
    };
    return icones[acao] || "📝";
  };

  const getCorAcao = (acao: string) => {
    const cores: Record<string, string> = {
      LOGIN: "bg-green-100 text-green-800",
      LOGOUT: "bg-gray-100 text-gray-800",
      CRIAR: "bg-blue-100 text-blue-800",
      EDITAR: "bg-yellow-100 text-yellow-800",
      EXCLUIR: "bg-red-100 text-red-800",
      VISUALIZAR: "bg-purple-100 text-purple-800",
    };
    return cores[acao] || "bg-gray-100 text-gray-800";
  };

  const logsFiltrados = logs.filter((log) => {
    const matchAcao = !filtroAcao || log.acao.toLowerCase().includes(filtroAcao.toLowerCase());
    const matchRecurso = !filtroRecurso || log.recurso?.toLowerCase().includes(filtroRecurso.toLowerCase());
    return matchAcao && matchRecurso;
  });

  const acoesUnicas = Array.from(new Set(logs.map((l) => l.acao)));
  const recursosUnicos = Array.from(new Set(logs.map((l) => l.recurso).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Logs de Acesso
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Histórico de atividades do sistema
          </p>
        </div>
        <Button onClick={carregarLogs} disabled={carregando}>
          {carregando ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filtro-acao">Ação</Label>
              <select
                id="filtro-acao"
                value={filtroAcao}
                onChange={(e) => setFiltroAcao(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Todas</option>
                {acoesUnicas.map((acao) => (
                  <option key={acao} value={acao}>
                    {getIconeAcao(acao)} {acao}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filtro-recurso">Recurso</Label>
              <select
                id="filtro-recurso"
                value={filtroRecurso}
                onChange={(e) => setFiltroRecurso(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Todos</option>
                {recursosUnicos.map((recurso) => (
                  <option key={recurso} value={recurso || ""}>
                    {recurso}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limite">Limite</Label>
              <select
                id="limite"
                value={limite}
                onChange={(e) => setLimite(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="25">25 registros</option>
                <option value="50">50 registros</option>
                <option value="100">100 registros</option>
                <option value="200">200 registros</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividades ({logsFiltrados.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : logsFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logsFiltrados.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Ícone da Ação */}
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${getCorAcao(log.acao)}`}>
                    {getIconeAcao(log.acao)}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getCorAcao(log.acao)}`}>
                        {log.acao}
                      </span>
                      {log.recurso && (
                        <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700">
                          {log.recurso}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{log.usuario.nome}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{log.usuario.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatarData(log.criadoEm)}</span>
                        {log.ip && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">IP: {log.ip}</span>
                          </>
                        )}
                      </div>

                      {log.recursoId && (
                        <div className="text-xs text-gray-400">
                          ID: {log.recursoId}
                        </div>
                      )}
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
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ Sobre os Logs</p>
              <p>
                Os logs de acesso registram todas as ações importantes realizadas no sistema,
                incluindo criação, edição e exclusão de dados. Isso ajuda a manter um histórico
                de auditoria e identificar possíveis problemas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
