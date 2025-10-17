"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserPhoto } from "@/contexts/logo-context";

/**
 * Hook para sincronizar foto do usuário com a sessão
 * Deve ser usado dentro de um componente que está dentro do SessionProvider
 */
export function useSyncPhoto() {
  const { status } = useSession();
  const { recarregarFoto, setFotoUrl } = useUserPhoto();

  useEffect(() => {
    if (status === "authenticated") {
      // Quando o usuário faz login, recarregar foto
      recarregarFoto();
    } else if (status === "unauthenticated") {
      // Quando o usuário faz logout, limpar foto
      setFotoUrl(null);
      localStorage.removeItem("usuario_foto");
    }
  }, [status, recarregarFoto, setFotoUrl]);
}
