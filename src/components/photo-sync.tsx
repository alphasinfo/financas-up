"use client";

import { useSyncPhoto } from "@/hooks/use-sync-photo";

/**
 * Componente para sincronizar foto do usuário com a sessão
 * Deve ser usado dentro do SessionProvider
 */
export function PhotoSync() {
  useSyncPhoto();
  return null; // Não renderiza nada, apenas sincroniza
}
