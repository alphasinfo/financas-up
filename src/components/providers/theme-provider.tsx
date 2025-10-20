'use client';

/**
 * Theme Provider
 * 
 * Provider para gerenciamento de temas com:
 * - Dark mode / Light mode / System
 * - Persistência de preferência
 * - Transições suaves
 * - SSR-safe
 */

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
