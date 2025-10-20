'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  suggestedActions?: string[];
}

export default function AlertasPage() {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/alerts?filter=${filter}`);
      const result = await response.json();
      
      if (result.success) {
        setAlerts(result.alerts || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Alerta resolvido');
        loadAlerts();
      }
    } catch (error) {
      toast.error('Erro ao resolver alerta');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alertas do Sistema</h1>
          <p className="text-muted-foreground">
            Monitore e resolva alertas de performance e segurança
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'unresolved' ? 'default' : 'outline'}
            onClick={() => setFilter('unresolved')}
          >
            Não Resolvidos
          </Button>
          <Button onClick={loadAlerts} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Não Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {alerts.filter(a => !a.resolved).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.resolved).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">Nenhum alerta encontrado</p>
              <p className="text-muted-foreground text-center mt-2">
                {filter === 'unresolved' 
                  ? 'Todos os alertas foram resolvidos!'
                  : 'Não há alertas no sistema no momento.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{alert.type}</CardTitle>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {alert.resolved && (
                          <Badge variant="outline">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Resolvido
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{alert.message}</CardDescription>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolver
                    </Button>
                  )}
                </div>
              </CardHeader>
              {alert.suggestedActions && alert.suggestedActions.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Ações Sugeridas:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {alert.suggestedActions.map((action, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
