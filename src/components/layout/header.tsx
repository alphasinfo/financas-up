"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Notificacoes } from "@/components/notificacoes";
import { UserMenu } from "@/components/user-menu";
import { WifiOff, Wifi } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOEDAS = [
  { codigo: 'BRL', simbolo: 'R$', nome: 'Real' },
  { codigo: 'USD', simbolo: '$', nome: 'Dólar' },
  { codigo: 'EUR', simbolo: '€', nome: 'Euro' },
  { codigo: 'GBP', simbolo: '£', nome: 'Libra' },
  { codigo: 'JPY', simbolo: '¥', nome: 'Iene' },
  { codigo: 'ARS', simbolo: '$', nome: 'Peso Argentino' },
  { codigo: 'CLP', simbolo: '$', nome: 'Peso Chileno' },
  { codigo: 'PYG', simbolo: '₲', nome: 'Guarani' },
];

export function Header() {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [moedaSelecionada, setMoedaSelecionada] = useState('BRL');

  useEffect(() => {
    // Monitorar status online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar operações pendentes
    verificarPendencias();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function verificarPendencias() {
    try {
      const response = await fetch('/api/sync/pendencias');
      const data = await response.json();
      setPendingSync(data.quantidade || 0);
    } catch (error) {
      console.error('Erro ao verificar pendências:', error);
    }
  }

  async function handleMoedaChange(novaMoeda: string) {
    setMoedaSelecionada(novaMoeda);
    
    // Salvar preferência do usuário
    try {
      await fetch('/api/usuario/preferencias', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moedaPadrao: novaMoeda }),
      });
    } catch (error) {
      console.error('Erro ao salvar moeda:', error);
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="ml-14 md:ml-0 min-w-0 flex-1">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
            Bem-vindo, {session?.user?.name?.split(" ")[0] || "Usuário"}!
          </h2>
          <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
            Gerencie suas finanças de forma simples e eficiente
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Indicador de Status Online/Offline */}
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm">
              <WifiOff className="h-4 w-4" />
              <span className="hidden md:inline">
                Offline {pendingSync > 0 && `• ${pendingSync} pendentes`}
              </span>
            </div>
          )}

          {/* Seletor de Moeda */}
          <Select value={moedaSelecionada} onValueChange={handleMoedaChange}>
            <SelectTrigger className="w-[100px] md:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOEDAS.map((moeda) => (
                <SelectItem key={moeda.codigo} value={moeda.codigo}>
                  {moeda.simbolo} {moeda.codigo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Notificacoes />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
