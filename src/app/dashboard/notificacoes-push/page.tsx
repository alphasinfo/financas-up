'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Send, Users, BarChart3, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationStats {
  totalTemplates: number;
  totalSegments: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  scheduledNotifications: number;
  totalSent: number;
  averageEngagementRate: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
}

interface UserSegment {
  id: string;
  name: string;
  conditions: any[];
}

export default function NotificacoesPushPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    loadStats();
    loadTemplates();
    loadSegments();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/notifications-push?type=stats');
      const result = await response.json();
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/notifications-push?type=templates');
      const result = await response.json();
      if (result.templates) {
        setTemplates(result.templates);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadSegments = async () => {
    try {
      const response = await fetch('/api/notifications-push?type=segments');
      const result = await response.json();
      if (result.segments) {
        setSegments(result.segments);
      }
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!selectedTemplate) {
      toast.error('Selecione um template');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/notifications-push?action=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          customData: { test: true },
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao enviar notificação');
      }
    } catch (error) {
      toast.error('Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notificações não suportadas neste navegador');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Permissão concedida para notificações');
    } else {
      toast.error('Permissão negada para notificações');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificações Push</h1>
          <p className="text-muted-foreground">
            Gerencie notificações push e engajamento de usuários
          </p>
        </div>
        <Button onClick={requestNotificationPermission}>
          <Bell className="mr-2 h-4 w-4" />
          Ativar Notificações
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTemplates}</div>
              <p className="text-xs text-muted-foreground">
                Templates disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscritos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                de {stats.totalSubscriptions} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent}</div>
              <p className="text-xs text-muted-foreground">
                Notificações enviadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageEngagementRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa média
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">
            <Bell className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="segments">
            <Users className="mr-2 h-4 w-4" />
            Segmentos
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="mr-2 h-4 w-4" />
            Enviar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.body}</p>
                  <Button 
                    className="mt-4 w-full" 
                    variant="outline"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    {selectedTemplate === template.id ? (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    ) : (
                      <Bell className="mr-2 h-4 w-4" />
                    )}
                    {selectedTemplate === template.id ? 'Selecionado' : 'Selecionar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <CardTitle>{segment.name}</CardTitle>
                  <CardDescription>
                    {segment.conditions.length} condições configuradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">
                    {segment.id}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Notificação de Teste</CardTitle>
              <CardDescription>
                Envie uma notificação de teste para você mesmo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplate ? (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Template Selecionado:</p>
                  <p className="text-sm text-muted-foreground">
                    {templates.find(t => t.id === selectedTemplate)?.name}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Selecione um template na aba "Templates" primeiro
                </p>
              )}
              <Button 
                onClick={sendTestNotification} 
                disabled={loading || !selectedTemplate}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Notificação de Teste
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
