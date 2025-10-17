"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserPhotoContextType {
  fotoUrl: string | null;
  setFotoUrl: (url: string | null) => void;
  carregando: boolean;
  recarregarFoto: () => Promise<void>;
}

const UserPhotoContext = createContext<UserPhotoContextType>({
  fotoUrl: null,
  setFotoUrl: () => {},
  carregando: true,
  recarregarFoto: async () => {},
});

export function LogoProvider({ children }: { children: ReactNode }) {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Função para carregar foto da API
  const carregarFotoDaAPI = async () => {
    try {
      const resposta = await fetch("/api/usuario/logo");
      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados.foto) {
          setFotoUrl(dados.foto);
          localStorage.setItem("usuario_foto", dados.foto);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar foto:", error);
    }
  };

  useEffect(() => {
    // Carregar foto do localStorage primeiro
    const fotoSalva = localStorage.getItem("usuario_foto");
    if (fotoSalva) {
      setFotoUrl(fotoSalva);
    }
    setCarregando(false);
  }, []);

  const updateFotoUrl = (url: string | null) => {
    setFotoUrl(url);
    if (url) {
      localStorage.setItem("usuario_foto", url);
    } else {
      localStorage.removeItem("usuario_foto");
    }
  };

  return (
    <UserPhotoContext.Provider value={{ fotoUrl, setFotoUrl: updateFotoUrl, carregando, recarregarFoto: carregarFotoDaAPI }}>
      {children}
    </UserPhotoContext.Provider>
  );
}

// Manter compatibilidade com o nome antigo
export function useLogo() {
  const context = useContext(UserPhotoContext);
  return {
    logoUrl: context.fotoUrl,
    setLogoUrl: context.setFotoUrl,
    carregando: context.carregando,
  };
}

// Novo hook específico para foto do usuário
export function useUserPhoto() {
  return useContext(UserPhotoContext);
}
