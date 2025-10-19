"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Mail, Smartphone, Clock, DollarSign, Target, CreditCard, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface ConfigNotificacoes {
  pushAtivado: boolean;
  emailAtivado: boolean;
  vencimentos: boolean;
  metasAtingidas: boolean;
  resumoDiario: boolean;
  gastoAlto: boolean;
  limiteCartao: boolean;
  investimentos: boolean;
  horarioResumo: string;
}

export default function NotificacoesPage() {
  const [config, setConfig] = useState<ConfigNotificacoes>({
    pushAtivado: false,
    emailAtivado: true,
    vencimentos: true,
    metasAtingidas: true,
    resumoDiario: false,
    gastoAlto: true,
    limiteCartao: true,
    investimentos: false,
    horarioResumo: '08:00',
  });
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [permissaoPush, setPermissaoPush] = useState<NotificationPermission>('default');

  useEffect(() => {
    carregarConfiguracoes();
    verificarPermissaoPush();
  }, []);

  async function carregarConfiguracoes() {
    try {
      setLoading(true);
      const response = await fetch('/api/usuario/notificacoes');
      const data = await response.json();
      if (data.configuracoes) {
        setConfig(data.configuracoes);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }

  function verificarPermissaoPush() {
    if ('Notification' in window) {
      setPermissaoPush(Notification.permission);
    }
  }

  async function solicitarPermissaoPush() {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações push');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissaoPush(permission);

      if (permission === 'granted') {
        toast.success('Permissão concedida! Notificações ativadas.');
        setConfig({ ...config, pushAtivado: true });
        
        // Registrar service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registrado:', registration);
        }
      } else {
        toast.error('Permissão negada. Você não receberá notificações push.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão para notificações');
    }
  }

  async function salvarConfiguracoes() {
    try {
      setSalvando(true);
      
      const response = await fetch('/api/usuario/notificacoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  }

  async function testarNotificacao() {
    if (permissaoPush !== 'granted') {
      toast.error('Permissão para notificações não concedida');
      return;
    }

    try {
      const response = await fetch('/api/notificacoes-push/testar', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao enviar notificação');

      toast.success('Notificação de teste enviada!');
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
      toast.error('Erro ao enviar notificação de teste');
    }
  }

  function handleToggle(campo: keyof ConfigNotificacoes) {
    setConfig({ ...config, [campo]: !config[campo] });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurar Notificações</h1>
          <p className="text-gray-600 mt-1">
            Escolha como e quando deseja ser notificado
          </p>
        </div>
        <Button onClick={salvarConfiguracoes} disabled={salvando} size="lg">
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      {/* Notificações Push */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Notificações Push
              </CardTitle>
              <CardDescription>
                Receba notificações em tempo real no navegador
              </CardDescription>
            </div>
            <Switch
              checked={config.pushAtivado && permissaoPush === 'granted'}
              onCheckedChange={() => {
                if (permissaoPush !== 'granted') {
                  solicitarPermissaoPush();
                } else {
                  handleToggle('pushAtivado');
                }
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {permissaoPush === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                ⚠️ Você bloqueou as notificações. Para ativar, vá nas configurações do navegador.
              </p>
            </div>
          )}
          {permissaoPush === 'default' && (
            <Button onClick={solicitarPermissaoPush} variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Ativar Notificações Push
            </Button>
          )}
          {permissaoPush === 'granted' && config.pushAtivado && (
            <div className="space-y-2">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações push ativadas
              </p>
              <Button onClick={testarNotificacao} variant="outline" size="sm">
                Enviar Notificação de Teste
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificações por Email */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notificações por Email
              </CardTitle>
              <CardDescription>
                Receba resumos e alertas por email
              </CardDescription>
            </div>
            <Switch
              checked={config.emailAtivado}
              onCheckedChange={() => handleToggle('emailAtivado')}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Tipos de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificações</CardTitle>
          <CardDescription>
            Escolha quais eventos você deseja ser notificado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vencimentos */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <Label className="font-semibold">Vencimentos</Label>
                <p className="text-sm text-gray-600">
                  Alertas de contas e faturas próximas ao vencimento
                </p>
              </div>
            </div>
            <Switch
              checked={config.vencimentos}
              onCheckedChange={() => handleToggle('vencimentos')}
            />
          </div>

          {/* Metas Atingidas */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <Label className="font-semibold">Metas Atingidas</Label>
                <p className="text-sm text-gray-600">
                  Quando você atingir uma meta financeira
                </p>
              </div>
            </div>
            <Switch
              checked={config.metasAtingidas}
              onCheckedChange={() => handleToggle('metasAtingidas')}
            />
          </div>

          {/* Resumo Diário */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <Label className="font-semibold">Resumo Diário</Label>
                <p className="text-sm text-gray-600">
                  Resumo das suas finanças todos os dias
                </p>
              </div>
            </div>
            <Switch
              checked={config.resumoDiario}
              onCheckedChange={() => handleToggle('resumoDiario')}
            />
          </div>

          {config.resumoDiario && (
            <div className="ml-12 p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Horário do Resumo</Label>
              <input
                type="time"
                value={config.horarioResumo}
                onChange={(e) => setConfig({ ...config, horarioResumo: e.target.value })}
                className="mt-2 px-3 py-2 border rounded-lg"
              />
            </div>
          )}

          {/* Gasto Alto */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-red-500" />
              <div>
                <Label className="font-semibold">Gasto Alto Detectado</Label>
                <p className="text-sm text-gray-600">
                  Quando um gasto acima da média for detectado
                </p>
              </div>
            </div>
            <Switch
              checked={config.gastoAlto}
              onCheckedChange={() => handleToggle('gastoAlto')}
            />
          </div>

          {/* Limite Cartão */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-purple-500" />
              <div>
                <Label className="font-semibold">Limite do Cartão</Label>
                <p className="text-sm text-gray-600">
                  Quando o limite do cartão estiver próximo de estourar
                </p>
              </div>
            </div>
            <Switch
              checked={config.limiteCartao}
              onCheckedChange={() => handleToggle('limiteCartao')}
            />
          </div>

          {/* Investimentos */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-teal-500" />
              <div>
                <Label className="font-semibold">Investimentos</Label>
                <p className="text-sm text-gray-600">
                  Atualizações sobre seus investimentos
                </p>
              </div>
            </div>
            <Switch
              checked={config.investimentos}
              onCheckedChange={() => handleToggle('investimentos')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar (mobile) */}
      <div className="md:hidden">
        <Button
          onClick={salvarConfiguracoes}
          disabled={salvando}
          className="w-full"
          size="lg"
        >
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
