'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  TrendingUp,
  TrendingDown,
  Activity,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
} from 'lucide-react';

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export default function CacheMonitoringPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cache/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Tem certeza que deseja limpar todo o cache?')) {
      return;
    }

    setClearing(true);
    try {
      const response = await fetch('/api/cache/stats', {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStats();
        alert('Cache limpo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      alert('Erro ao limpar cache');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000); // Atualizar a cada 5s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const totalRequests = (stats?.hits || 0) + (stats?.misses || 0);
  const hitRate = stats?.hitRate || 0;
  const missRate = 100 - hitRate;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Monitoramento de Cache
          </h1>
          <p className="text-muted-foreground mt-2">
            Estatísticas em tempo real do sistema de cache em memória
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="destructive" onClick={handleClearCache} disabled={clearing}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
        </div>
      </div>

      {/* Última Atualização */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </div>
            {autoRefresh && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Atualizando a cada 5s
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hit Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Acerto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{hitRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.hits || 0} hits
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                hitRate >= 80 ? 'bg-green-100' : hitRate >= 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {hitRate >= 80 ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : hitRate >= 50 ? (
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
            <Progress value={hitRate} className="mt-3" />
          </CardContent>
        </Card>

        {/* Miss Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Falha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{missRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.misses || 0} misses
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                missRate <= 20 ? 'bg-green-100' : missRate <= 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <XCircle className={`h-6 w-6 ${
                  missRate <= 20 ? 'text-green-600' : missRate <= 50 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <Progress value={missRate} className="mt-3" />
          </CardContent>
        </Card>

        {/* Total de Requisições */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Requisições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Desde o último reset
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tamanho do Cache */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entradas em Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats?.size || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Chaves armazenadas
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>
              Análise da eficiência do cache
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status Geral</span>
                <Badge variant={hitRate >= 80 ? 'default' : hitRate >= 50 ? 'secondary' : 'destructive'}>
                  {hitRate >= 80 ? 'Excelente' : hitRate >= 50 ? 'Bom' : 'Precisa Melhorar'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Economia de Queries</span>
                <span className="font-semibold">
                  {stats?.hits || 0} queries evitadas
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Redução de Carga</span>
                <span className="font-semibold text-green-600">
                  -{hitRate.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Recomendações</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {hitRate >= 80 ? (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Cache funcionando perfeitamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Mantendo configuração atual</span>
                    </li>
                  </>
                ) : hitRate >= 50 ? (
                  <>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span>Considere aumentar o TTL de algumas chaves</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span>Analise padrões de acesso para otimizar</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Taxa de acerto baixa - revisar estratégia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Considere migrar para Redis para melhor performance</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Detalhes
            </CardTitle>
            <CardDescription>
              Informações técnicas do cache
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Tipo de Cache</span>
                <Badge variant="outline">In-Memory</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">TTL Padrão</span>
                <span className="text-sm font-semibold">120s (Dashboard)</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Limpeza Automática</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  A cada 5 min
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Invalidação</span>
                <Badge variant="outline">Por Padrão</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Métricas Calculadas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eficiência</span>
                  <span className="font-semibold">
                    {totalRequests > 0 ? ((stats?.hits || 0) / totalRequests * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Média por Entrada</span>
                  <span className="font-semibold">
                    {stats?.size ? (totalRequests / stats.size).toFixed(1) : 0} req/key
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilização</span>
                  <span className="font-semibold">
                    {stats?.size || 0} / ∞ keys
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Requisições</CardTitle>
          <CardDescription>
            Visualização da proporção entre hits e misses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barra de Hits */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Cache Hits</span>
                </div>
                <span className="text-sm font-semibold">{stats?.hits || 0}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{ width: `${hitRate}%` }}
                ></div>
              </div>
            </div>

            {/* Barra de Misses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Cache Misses</span>
                </div>
                <span className="text-sm font-semibold">{stats?.misses || 0}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                  style={{ width: `${missRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Meta:</strong> Manter taxa de acerto acima de 80% para performance ideal.
              Atualmente em <strong>{hitRate.toFixed(1)}%</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
