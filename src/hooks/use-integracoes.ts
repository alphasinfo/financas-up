/**
 * Hooks para Integrações Externas com React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { toast } from 'sonner';

/**
 * Hook para dados de mercado consolidados
 */
export function useMarketData() {
  return useQuery({
    queryKey: queryKeys.integracoes.market(),
    queryFn: async () => {
      const response = await fetch('/api/integrations?type=market');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de mercado');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });
}

/**
 * Hook para cotações de moedas
 */
export function useCurrencies(base = 'USD', targets = ['BRL', 'EUR', 'GBP']) {
  return useQuery({
    queryKey: [...queryKeys.integracoes.currencies(), { base, targets }],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: 'currencies',
        base,
        targets: targets.join(','),
      });
      
      const response = await fetch(`/api/integrations?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar cotações');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para cotações de ações
 */
export function useStocks(symbols?: string[]) {
  return useQuery({
    queryKey: [...queryKeys.integracoes.stocks(), { symbols }],
    queryFn: async () => {
      const params = new URLSearchParams({ type: 'stocks' });
      if (symbols && symbols.length > 0) {
        params.append('symbols', symbols.join(','));
      }
      
      const response = await fetch(`/api/integrations?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar ações');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
  });
}

/**
 * Hook para cotações de criptomoedas
 */
export function useCrypto(symbols?: string[]) {
  return useQuery({
    queryKey: [...queryKeys.integracoes.crypto(), { symbols }],
    queryFn: async () => {
      const params = new URLSearchParams({ type: 'crypto' });
      if (symbols && symbols.length > 0) {
        params.append('symbols', symbols.join(','));
      }
      
      const response = await fetch(`/api/integrations?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar criptomoedas');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
  });
}

/**
 * Hook para insights com IA
 */
export function useInsights() {
  return useQuery({
    queryKey: queryKeys.integracoes.insights(),
    queryFn: async () => {
      const response = await fetch('/api/integrations?type=insights');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar insights');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hora
    enabled: false, // Não carregar automaticamente
  });
}

/**
 * Hook para gerar insights
 */
export function useGenerateInsights() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/integrations?action=generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao gerar insights');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Atualizar cache de insights
      queryClient.setQueryData(queryKeys.integracoes.insights(), data.data);
      
      toast.success(data.message || 'Insights gerados com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar insights');
    },
  });
}

/**
 * Hook para sincronizar contas bancárias
 */
export function useSyncBankAccounts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/integrations?action=sync-banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao sincronizar contas');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidar transações e contas
      queryClient.invalidateQueries({ queryKey: queryKeys.transacoes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.contas.all });
      
      toast.success(data.message || 'Contas sincronizadas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao sincronizar contas');
    },
  });
}

/**
 * Hook para atualizar dados de mercado
 */
export function useRefreshMarketData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/integrations?action=refresh-market', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar dados');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar todos os dados de mercado
      queryClient.invalidateQueries({ queryKey: queryKeys.integracoes.all });
      
      toast.success('Dados de mercado atualizados!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar dados');
    },
  });
}

/**
 * Hook para estatísticas das integrações
 */
export function useIntegrationStats() {
  return useQuery({
    queryKey: [...queryKeys.integracoes.all, 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/integrations?type=stats');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
