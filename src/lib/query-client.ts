/**
 * React Query Client Configuration
 * 
 * Configuração centralizada do TanStack Query para:
 * - Cache automático de requisições
 * - Sincronização de dados
 * - Retry automático
 * - Invalidação inteligente
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      
      // Manter cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      
      // Retry 3 vezes em caso de erro
      retry: 3,
      
      // Backoff exponencial para retry
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Não refetch ao focar na janela (pode ser habilitado por query)
      refetchOnWindowFocus: false,
      
      // Refetch ao reconectar
      refetchOnReconnect: true,
      
      // Não refetch ao montar (usar cache)
      refetchOnMount: false,
    },
    mutations: {
      // Retry 2 vezes para mutations
      retry: 2,
      
      // Backoff para mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

/**
 * Query Keys para organização
 */
export const queryKeys = {
  // Transações
  transacoes: {
    all: ['transacoes'] as const,
    lists: () => [...queryKeys.transacoes.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.transacoes.lists(), { filters }] as const,
    details: () => [...queryKeys.transacoes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transacoes.details(), id] as const,
  },
  
  // Contas
  contas: {
    all: ['contas'] as const,
    lists: () => [...queryKeys.contas.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.contas.lists(), { filters }] as const,
    details: () => [...queryKeys.contas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.contas.details(), id] as const,
  },
  
  // Cartões
  cartoes: {
    all: ['cartoes'] as const,
    lists: () => [...queryKeys.cartoes.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.cartoes.lists(), { filters }] as const,
    details: () => [...queryKeys.cartoes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cartoes.details(), id] as const,
  },
  
  // Categorias
  categorias: {
    all: ['categorias'] as const,
    lists: () => [...queryKeys.categorias.all, 'list'] as const,
  },
  
  // Orçamentos
  orcamentos: {
    all: ['orcamentos'] as const,
    lists: () => [...queryKeys.orcamentos.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.orcamentos.lists(), { filters }] as const,
    details: () => [...queryKeys.orcamentos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orcamentos.details(), id] as const,
  },
  
  // Metas
  metas: {
    all: ['metas'] as const,
    lists: () => [...queryKeys.metas.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.metas.lists(), { filters }] as const,
    details: () => [...queryKeys.metas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.metas.details(), id] as const,
  },
  
  // Relatórios
  relatorios: {
    all: ['relatorios'] as const,
    dashboard: () => [...queryKeys.relatorios.all, 'dashboard'] as const,
    mensal: (mes: string) => [...queryKeys.relatorios.all, 'mensal', mes] as const,
    anual: (ano: string) => [...queryKeys.relatorios.all, 'anual', ano] as const,
  },
  
  // Integrações
  integracoes: {
    all: ['integracoes'] as const,
    market: () => [...queryKeys.integracoes.all, 'market'] as const,
    currencies: () => [...queryKeys.integracoes.all, 'currencies'] as const,
    stocks: () => [...queryKeys.integracoes.all, 'stocks'] as const,
    crypto: () => [...queryKeys.integracoes.all, 'crypto'] as const,
    insights: () => [...queryKeys.integracoes.all, 'insights'] as const,
  },
  
  // Notificações
  notificacoes: {
    all: ['notificacoes'] as const,
    lists: () => [...queryKeys.notificacoes.all, 'list'] as const,
    unread: () => [...queryKeys.notificacoes.all, 'unread'] as const,
    stats: () => [...queryKeys.notificacoes.all, 'stats'] as const,
  },
  
  // Alertas
  alertas: {
    all: ['alertas'] as const,
    lists: () => [...queryKeys.alertas.all, 'list'] as const,
    list: (filter: string) => [...queryKeys.alertas.lists(), { filter }] as const,
    unresolved: () => [...queryKeys.alertas.all, 'unresolved'] as const,
  },
  
  // Monitoring
  monitoring: {
    all: ['monitoring'] as const,
    health: () => [...queryKeys.monitoring.all, 'health'] as const,
    stats: () => [...queryKeys.monitoring.all, 'stats'] as const,
    cache: () => [...queryKeys.monitoring.all, 'cache'] as const,
  },
  
  // Usuário
  usuario: {
    all: ['usuario'] as const,
    profile: () => [...queryKeys.usuario.all, 'profile'] as const,
    preferences: () => [...queryKeys.usuario.all, 'preferences'] as const,
    notifications: () => [...queryKeys.usuario.all, 'notifications'] as const,
  },
};

/**
 * Helper para invalidar queries relacionadas
 */
export function invalidateRelatedQueries(queryClient: QueryClient, keys: string[]) {
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
}

/**
 * Helper para prefetch de dados
 */
export async function prefetchQuery<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}
