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
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitorar status online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar operações pendentes
    verificarPendencias();
    
    // Buscar saldo total
    buscarSaldoTotal();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    // Atualizar saldo quando moeda mudar
    buscarSaldoTotal();
  }, [moedaSelecionada]);

  async function verificarPendencias() {
    try {
      const response = await fetch('/api/sync/pendencias');
      if (response.ok) {
        const data = await response.json();
        setPendingSync(data.quantidade || 0);
      }
    } catch (error) {
      // Silencioso - API opcional
    }
  }
  
  async function buscarSaldoTotal() {
    try {
      setLoading(true);
      const response = await fetch(`/api/contas?moeda=${moedaSelecionada}`);
      if (response.ok) {
        const contas = await response.json();
        const total = contas.reduce((acc: number, conta: any) => acc + (conta.saldo || 0), 0);
        setSaldoTotal(total);
      }
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
    } finally {
      setLoading(false);
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

          {/* Saldo Total e Seletor de Moeda */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
            <div className="text-right">
              <div className="text-xs text-gray-500">Saldo Total</div>
              <div className="text-sm font-bold text-blue-600">
                {loading ? '...' : `${MOEDAS.find(m => m.codigo === moedaSelecionada)?.simbolo} ${saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
            </div>
            <Select value={moedaSelecionada} onValueChange={handleMoedaChange}>
              <SelectTrigger className="w-[80px] border-0 bg-transparent" aria-label="Selecionar moeda">
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
          </div>

          <Notificacoes />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
