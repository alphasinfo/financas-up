"use client";

import { useEffect, useState } from "react";
import { useLogo } from "@/contexts/logo-context";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [_showInstallButton, setShowInstallButton] = useState(false);
  const { logoUrl } = useLogo();

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch((error) => {
          console.log('Falha ao registrar Service Worker:', error);
        });
    }

    // Detectar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar se já foi instalado
    window.addEventListener('appinstalled', () => {
      console.log('PWA foi instalado');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Atualizar ícones quando a logo mudar
  useEffect(() => {
    if (logoUrl && 'serviceWorker' in navigator) {
      // Forçar atualização do service worker quando a logo mudar
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
        }
      });
    }
  }, [logoUrl]);

  const _handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuário ${outcome} a instalação do PWA`);
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // Não renderizar nada, apenas gerenciar PWA
  return null;
}

// Hook para usar PWA em outros componentes
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se está rodando como PWA
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      setIsStandalone(isStandaloneMode || isIOSStandalone);
    };

    checkStandalone();

    // Verificar se foi instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
    });

    // Verificar mudanças no display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);

    return () => {
      mediaQuery.removeEventListener('change', checkStandalone);
    };
  }, []);

  return {
    isInstalled,
    isStandalone,
    canInstall: 'serviceWorker' in navigator && 'PushManager' in window,
  };
}
