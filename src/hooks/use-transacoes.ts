/**
 * Hooks para Transações com React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { toast } from 'sonner';

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: 'RECEITA' | 'DESPESA';
  categoria: string;
  contaId: string;
}

/**
 * Hook para listar transações
 */
export function useTransacoes(filters?: string) {
  return useQuery({
    queryKey: queryKeys.transacoes.list(filters || ''),
    queryFn: async () => {
      const url = filters ? `/api/transacoes?${filters}` : '/api/transacoes';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar transações');
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obter uma transação específica
 */
export function useTransacao(id: string) {
  return useQuery({
    queryKey: queryKeys.transacoes.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/transacoes/${id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar transação');
      }
      
      return response.json();
    },
    enabled: !!id, // Só executa se tiver ID
  });
}

/**
 * Hook para criar transação
 */
export function useCreateTransacao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Transacao>) => {
      const response = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar transação');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar lista de transações
      queryClient.invalidateQueries({ queryKey: queryKeys.transacoes.lists() });
      
      // Invalidar relatórios
      queryClient.invalidateQueries({ queryKey: queryKeys.relatorios.all });
      
      toast.success('Transação criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar transação');
    },
  });
}

/**
 * Hook para atualizar transação
 */
export function useUpdateTransacao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transacao> }) => {
      const response = await fetch(`/api/transacoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar transação');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar transação específica
      queryClient.invalidateQueries({ queryKey: queryKeys.transacoes.detail(variables.id) });
      
      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: queryKeys.transacoes.lists() });
      
      // Invalidar relatórios
      queryClient.invalidateQueries({ queryKey: queryKeys.relatorios.all });
      
      toast.success('Transação atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar transação');
    },
  });
}

/**
 * Hook para deletar transação
 */
export function useDeleteTransacao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transacoes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar transação');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: queryKeys.transacoes.lists() });
      
      // Invalidar relatórios
      queryClient.invalidateQueries({ queryKey: queryKeys.relatorios.all });
      
      toast.success('Transação deletada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao deletar transação');
    },
  });
}

/**
 * Hook para obter estatísticas de transações
 */
export function useTransacoesStats() {
  return useQuery({
    queryKey: [...queryKeys.transacoes.all, 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/transacoes/stats');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
