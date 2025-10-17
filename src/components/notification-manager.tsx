"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, BellOff, Check } from "lucide-react";
import { useNotifications } from "@/lib/notifications";

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);
  const notifications = useNotifications();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const granted = await notifications.requestPermission();
      setPermission(granted ? "granted" : "denied");
      
      if (granted) {
        // Enviar notificação de teste
        await notifications.notify("🎉 Notificações Ativadas!", {
          body: "Você receberá alertas sobre faturas, metas e transações importantes.",
          tag: "welcome",
        });
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
    } finally {
      setLoading(false);
    }
  };

  if (typeof window === "undefined" || !("Notification" in window)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Não Suportadas
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas em tempo real sobre suas finanças
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === "default" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Ative as notificações para receber alertas sobre:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 pl-5">
              <li>• Faturas vencendo nos próximos dias</li>
              <li>• Transações pendentes vencidas</li>
              <li>• Metas financeiras alcançadas</li>
              <li>• Orçamentos estourados</li>
              <li>• Receitas recebidas</li>
            </ul>
            <Button onClick={handleRequestPermission} disabled={loading} className="w-full">
              {loading ? "Solicitando..." : "Ativar Notificações"}
            </Button>
          </div>
        )}

        {permission === "granted" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">Notificações Ativadas</span>
            </div>
            <p className="text-sm text-gray-600">
              Você receberá alertas em tempo real sobre eventos importantes.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => notifications.notifyFaturaVencendo("Teste", 1500, 3)}
              >
                Testar Fatura
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => notifications.notifyTransacaoVencida(2)}
              >
                Testar Vencida
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => notifications.notifyMetaAlcancada("Teste", 5000)}
              >
                Testar Meta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => notifications.notifyOrcamentoEstourado("Alimentação", 120)}
              >
                Testar Orçamento
              </Button>
            </div>
          </div>
        )}

        {permission === "denied" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <BellOff className="h-5 w-5" />
              <span className="font-medium">Notificações Bloqueadas</span>
            </div>
            <p className="text-sm text-gray-600">
              Você bloqueou as notificações. Para ativar, acesse as configurações do navegador.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Chrome:</strong> Configurações → Privacidade → Notificações</p>
              <p><strong>Firefox:</strong> Configurações → Privacidade → Permissões</p>
              <p><strong>Edge:</strong> Configurações → Cookies e permissões</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
