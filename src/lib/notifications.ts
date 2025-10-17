// Sistema de Notificações Push do Navegador

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = "default";

  private constructor() {
    if (typeof window !== "undefined" && "Notification" in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Solicitar permissão para notificações
  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("Notificações não suportadas neste navegador");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === "granted";
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      return false;
    }
  }

  // Verificar se tem permissão
  hasPermission(): boolean {
    return this.permission === "granted";
  }

  // Enviar notificação
  async sendNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
      silent?: boolean;
    }
  ): Promise<Notification | null> {
    if (!this.hasPermission()) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn("Permissão de notificação negada");
        return null;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: options?.icon || "/logo.png",
        badge: options?.badge || "/logo.png",
        body: options?.body,
        tag: options?.tag,
        data: options?.data,
        requireInteraction: options?.requireInteraction || false,
        silent: options?.silent || false,
      });

      // Adicionar eventos
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Redirecionar baseado no tipo
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return notification;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return null;
    }
  }

  // Notificações específicas do sistema
  async notifyFaturaVencendo(cartao: string, valor: number, dias: number) {
    return this.sendNotification("💳 Fatura Vencendo", {
      body: `Fatura do ${cartao} vence em ${dias} dia${dias !== 1 ? "s" : ""} - R$ ${valor.toFixed(2)}`,
      tag: "fatura-vencendo",
      requireInteraction: true,
      data: {
        type: "fatura",
        url: "/dashboard/cartoes",
      },
    });
  }

  async notifyTransacaoVencida(quantidade: number) {
    return this.sendNotification("⚠️ Transações Vencidas", {
      body: `Você tem ${quantidade} transação${quantidade !== 1 ? "ões" : ""} pendente${quantidade !== 1 ? "s" : ""} vencida${quantidade !== 1 ? "s" : ""}`,
      tag: "transacoes-vencidas",
      requireInteraction: true,
      data: {
        type: "transacao",
        url: "/dashboard/financeiro",
      },
    });
  }

  async notifyMetaAlcancada(meta: string, valor: number) {
    return this.sendNotification("🎯 Meta Alcançada!", {
      body: `Parabéns! Você alcançou a meta "${meta}" de R$ ${valor.toFixed(2)}`,
      tag: "meta-alcancada",
      data: {
        type: "meta",
        url: "/dashboard/metas",
      },
    });
  }

  async notifyOrcamentoEstourado(categoria: string, percentual: number) {
    return this.sendNotification("🚨 Orçamento Estourado", {
      body: `O orçamento de ${categoria} ultrapassou ${percentual}% do limite`,
      tag: "orcamento-estourado",
      requireInteraction: true,
      data: {
        type: "orcamento",
        url: "/dashboard/orcamentos",
      },
    });
  }

  async notifyReceitaRecebida(descricao: string, valor: number) {
    return this.sendNotification("💰 Receita Recebida", {
      body: `${descricao} - R$ ${valor.toFixed(2)}`,
      tag: "receita-recebida",
      data: {
        type: "receita",
        url: "/dashboard/financeiro",
      },
    });
  }

  // Agendar notificação (usando setTimeout)
  scheduleNotification(
    title: string,
    options: Parameters<typeof this.sendNotification>[1],
    delayMs: number
  ) {
    setTimeout(() => {
      this.sendNotification(title, options);
    }, delayMs);
  }

  // Cancelar todas as notificações com uma tag específica
  closeNotificationsByTag(tag: string) {
    // Nota: Não há API nativa para isso, mas podemos manter registro
    console.log(`Fechando notificações com tag: ${tag}`);
  }
}

// Hook para React
export function useNotifications() {
  const service = NotificationService.getInstance();

  return {
    requestPermission: () => service.requestPermission(),
    hasPermission: () => service.hasPermission(),
    notify: (title: string, options?: Parameters<typeof service.sendNotification>[1]) =>
      service.sendNotification(title, options),
    notifyFaturaVencendo: (cartao: string, valor: number, dias: number) =>
      service.notifyFaturaVencendo(cartao, valor, dias),
    notifyTransacaoVencida: (quantidade: number) =>
      service.notifyTransacaoVencida(quantidade),
    notifyMetaAlcancada: (meta: string, valor: number) =>
      service.notifyMetaAlcancada(meta, valor),
    notifyOrcamentoEstourado: (categoria: string, percentual: number) =>
      service.notifyOrcamentoEstourado(categoria, percentual),
    notifyReceitaRecebida: (descricao: string, valor: number) =>
      service.notifyReceitaRecebida(descricao, valor),
  };
}
