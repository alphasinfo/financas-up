/**
 * Sistema de Notificações Push
 * Web Push API, alertas de vencimento, resumo diário
 */

import { prisma } from './prisma';
import { logger } from './logger-production';

export interface NotificacaoPush {
  titulo: string;
  mensagem: string;
  icone?: string;
  badge?: string;
  tag?: string;
  dados?: any;
  acoes?: NotificacaoAcao[];
}

export interface NotificacaoAcao {
  acao: string;
  titulo: string;
  icone?: string;
}

/**
 * Verificar suporte a notificações push
 */
export function verificarSuporteNotificacoes(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Solicitar permissão para notificações
 */
export async function solicitarPermissao(): Promise<NotificationPermission> {
  if (!verificarSuporteNotificacoes()) {
    throw new Error('Notificações não suportadas neste navegador');
  }

  const permissao = await Notification.requestPermission();
  logger.dev('Permissão de notificação:', permissao);
  return permissao;
}

/**
 * Enviar notificação local
 */
export async function enviarNotificacaoLocal(notificacao: NotificacaoPush): Promise<void> {
  if (!verificarSuporteNotificacoes()) {
    logger.dev('Notificações não suportadas');
    return;
  }

  const permissao = await Notification.requestPermission();
  if (permissao !== 'granted') {
    logger.dev('Permissão de notificação negada');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(notificacao.titulo, {
    body: notificacao.mensagem,
    icon: notificacao.icone || '/icons/icon-192x192.png',
    badge: notificacao.badge || '/icons/icon-72x72.png',
    tag: notificacao.tag,
    data: notificacao.dados,
    // actions: notificacao.acoes, // Não suportado em todos os navegadores
  });
}

/**
 * Verificar contas a vencer
 */
export async function verificarContasVencer(userId: string): Promise<NotificacaoPush[]> {
  try {
    const hoje = new Date();
    const daquiA3Dias = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);

    const contasVencer = await prisma.transacao.findMany({
      where: {
        usuarioId: userId,
        status: 'PENDENTE',
        tipo: 'DESPESA',
        dataCompetencia: {
          gte: hoje,
          lte: daquiA3Dias,
        },
      },
      include: {
        categoria: true,
      },
      take: 5,
    });

    return contasVencer.map((conta) => ({
      titulo: '💰 Conta a vencer',
      mensagem: `${conta.descricao} - R$ ${conta.valor.toFixed(2)} vence em ${new Date(conta.dataCompetencia).toLocaleDateString()}`,
      tag: `conta-${conta.id}`,
      dados: { tipo: 'conta-vencer', transacaoId: conta.id },
      acoes: [
        { acao: 'pagar', titulo: 'Pagar agora' },
        { acao: 'lembrar', titulo: 'Lembrar depois' },
      ],
    }));
  } catch (error) {
    logger.error('Erro ao verificar contas a vencer:', error);
    return [];
  }
}

/**
 * Gerar resumo diário
 */
export async function gerarResumoDiario(userId: string): Promise<NotificacaoPush | null> {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const [transacoesHoje, saldoTotal] = await Promise.all([
      prisma.transacao.groupBy({
        by: ['tipo', 'status'],
        where: {
          usuarioId: userId,
          dataCompetencia: {
            gte: hoje,
            lt: amanha,
          },
        },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.contaBancaria.aggregate({
        where: { usuarioId: userId, ativa: true },
        _sum: { saldoAtual: true },
      }),
    ]);

    const receitas = transacoesHoje
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((acc, t) => acc + (t._sum.valor || 0), 0);

    const despesas = transacoesHoje
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((acc, t) => acc + (t._sum.valor || 0), 0);

    const saldo = saldoTotal._sum.saldoAtual || 0;

    return {
      titulo: '📊 Resumo do Dia',
      mensagem: `Receitas: R$ ${receitas.toFixed(2)} | Despesas: R$ ${despesas.toFixed(2)} | Saldo: R$ ${saldo.toFixed(2)}`,
      tag: 'resumo-diario',
      dados: { tipo: 'resumo-diario', data: hoje.toISOString() },
    };
  } catch (error) {
    logger.error('Erro ao gerar resumo diário:', error);
    return null;
  }
}

/**
 * Agendar notificações automáticas
 */
export async function agendarNotificacoes(userId: string): Promise<void> {
  try {
    // Verificar contas a vencer
    const contasVencer = await verificarContasVencer(userId);
    for (const notificacao of contasVencer) {
      await enviarNotificacaoLocal(notificacao);
    }

    // Enviar resumo diário (apenas uma vez por dia)
    const resumo = await gerarResumoDiario(userId);
    if (resumo) {
      await enviarNotificacaoLocal(resumo);
    }

    logger.dev('Notificações agendadas para usuário:', userId);
  } catch (error) {
    logger.error('Erro ao agendar notificações:', error);
  }
}
