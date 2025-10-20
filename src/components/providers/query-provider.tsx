'use client';

/**
 * React Query Provider
 * 
 * Provider para TanStack Query com:
 * - Configuração do QueryClient
 * - DevTools em desenvolvimento
 * - Persistência de cache (opcional)
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Criar QueryClient no estado para evitar recriação
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}
