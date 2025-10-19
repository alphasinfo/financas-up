"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Database, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";

interface EstatisticasQueries {
  total: number;
  sucesso: number;
  falhas: number;
  taxaSucesso: number;
  comRetry: number;
  taxaRetry: number;
  duracaoMedia: number;
  duracaoMax: number;
  duracaoMin: number;
}

interface EstatisticasAPIs {
  total: number;
  sucesso: number;
  falhas: number;
  taxaSucesso: number;
  duracaoMedia: number;
  duracaoMax: number;
  duracaoMin: number;
  topRotas: Array<{ rota: string; count: number }>;
}

interface QueryLenta {
  nome: string;
  duracao: number;
  sucesso: boolean;
  tentativas: number;
  timestamp: string;
}

interface APILenta {
  rota: string;
  metodo: string;
  duracao: number;
  statusCode: number;
  timestamp: string;
}

interface Erro {
  nome: string;
  erro?: string;
  tentativas: number;
  timestamp: string;
}

export default function MonitoringPage() {
  const [resumo, setResumo] = useState<{
    queries: EstatisticasQueries;
    apis: EstatisticasAPIs;
  } | null>(null);
  const [queriesLentas, setQueriesLentas] = useState<QueryLenta[]>([]);
  const [apisLentas, setAPIsLentas] = useState<APILenta[]>([]);
  const [erros, setErros] = useState<Erro[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar resumo
      const resResumo = await fetch('/api/monitoring?tipo=resumo');
      if (resResumo.ok) {
        const data = await resResumo.json();
        setResumo(data);
      }

      // Carregar queries lentas
      const resQueries = await fetch('/api/monitoring?tipo=queries-lentas&limite=10');
      if (resQueries.ok) {
        const data = await resQueries.json();
        setQueriesLentas(data.queriesLentas || []);
      }

      // Carregar APIs lentas
      const resAPIs = await fetch('/api/monitoring?tipo=apis-lentas&limite=10');
      if (resAPIs.ok) {
        const data = await resAPIs.json();
        setAPIsLentas(data.apisLentas || []);
      }

      // Carregar erros
      const resErros = await fetch('/api/monitoring?tipo=erros&limite=20');
      if (resErros.ok) {
        const data = await resErros.json();
        setErros(data.erros || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetarMetricas = async () => {
    if (!confirm('Tem certeza que deseja resetar todas as métricas?')) {
      return;
    }

    try {
      const res = await fetch('/api/monitoring', { method: 'DELETE' });
      if (res.ok) {
        await carregarDados();
      }
    } catch (error) {
      console.error('Erro ao resetar métricas:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(carregarDados, 5000); // Atualizar a cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading && !resumo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento do Sistema</h1>
          <p className="text-muted-foreground">
            Métricas de performance e saúde do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button variant="outline" onClick={carregarDados}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="destructive" onClick={resetarMetricas}>
            <Trash2 className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo - Queries */}
      {resumo && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Queries</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumo.queries.total}</div>
                <p className="text-xs text-muted-foreground">
                  {resumo.queries.sucesso} sucesso / {resumo.queries.falhas} falhas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resumo.queries.taxaSucesso.toFixed(1)}%
                </div>
                <Badge variant={resumo.queries.taxaSucesso >= 95 ? "default" : "destructive"}>
                  {resumo.queries.taxaSucesso >= 95 ? "Saudável" : "Atenção"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumo.queries.duracaoMedia}ms</div>
                <p className="text-xs text-muted-foreground">
                  Min: {resumo.queries.duracaoMin}ms / Max: {resumo.queries.duracaoMax}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queries com Retry</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumo.queries.comRetry}</div>
                <p className="text-xs text-muted-foreground">
                  {resumo.queries.taxaRetry.toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cards de Resumo - APIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de APIs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumo.apis.total}</div>
                <p className="text-xs text-muted-foreground">
                  {resumo.apis.sucesso} sucesso / {resumo.apis.falhas} falhas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resumo.apis.taxaSucesso.toFixed(1)}%
                </div>
                <Badge variant={resumo.apis.taxaSucesso >= 95 ? "default" : "destructive"}>
                  {resumo.apis.taxaSucesso >= 95 ? "Saudável" : "Atenção"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumo.apis.duracaoMedia}ms</div>
                <p className="text-xs text-muted-foreground">
                  Min: {resumo.apis.duracaoMin}ms / Max: {resumo.apis.duracaoMax}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Rota</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold truncate">
                  {resumo.apis.topRotas[0]?.rota || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {resumo.apis.topRotas[0]?.count || 0} chamadas
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Queries Lentas */}
      <Card>
        <CardHeader>
          <CardTitle>Queries Mais Lentas</CardTitle>
          <CardDescription>Top 10 queries com maior tempo de execução</CardDescription>
        </CardHeader>
        <CardContent>
          {queriesLentas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhuma query registrada</p>
          ) : (
            <div className="space-y-2">
              {queriesLentas.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {query.sucesso ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{query.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {query.tentativas > 1 && `${query.tentativas} tentativas • `}
                        {new Date(query.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={query.duracao > 1000 ? "destructive" : "secondary"}>
                    {query.duracao}ms
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* APIs Lentas */}
      <Card>
        <CardHeader>
          <CardTitle>APIs Mais Lentas</CardTitle>
          <CardDescription>Top 10 APIs com maior tempo de resposta</CardDescription>
        </CardHeader>
        <CardContent>
          {apisLentas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhuma API registrada</p>
          ) : (
            <div className="space-y-2">
              {apisLentas.map((api, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {api.statusCode < 400 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {api.metodo} {api.rota}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {api.statusCode} • {new Date(api.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={api.duracao > 1000 ? "destructive" : "secondary"}>
                    {api.duracao}ms
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Erros Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Erros Recentes</CardTitle>
          <CardDescription>Últimos 20 erros registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {erros.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhum erro registrado! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {erros.map((erro, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border border-red-200 rounded-lg bg-red-50"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{erro.nome}</p>
                    {erro.erro && (
                      <p className="text-sm text-red-600 mt-1">{erro.erro}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {erro.tentativas} tentativas • {new Date(erro.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Rotas */}
      {resumo && resumo.apis.topRotas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Rotas Mais Acessadas</CardTitle>
            <CardDescription>Rotas com maior número de chamadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resumo.apis.topRotas.map((rota, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <p className="font-medium">{rota.rota}</p>
                  </div>
                  <Badge>{rota.count} chamadas</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
