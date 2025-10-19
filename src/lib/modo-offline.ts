/**
 * Modo Offline Completo
 * IndexedDB para cache local, sync quando online, conflict resolution
 */

import { logger } from './logger-production';

export interface DadosOffline {
  id: string;
  tipo: 'transacao' | 'conta' | 'cartao' | 'categoria';
  acao: 'criar' | 'atualizar' | 'deletar';
  dados: any;
  timestamp: number;
  sincronizado: boolean;
}

export interface ConflitoDados {
  id: string;
  local: any;
  remoto: any;
  timestamp: number;
}

// Nome do banco IndexedDB
const DB_NAME = 'financas-up-offline';
const DB_VERSION = 1;
const STORE_NAME = 'dados-pendentes';

/**
 * Inicializar IndexedDB
 */
export async function inicializarDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB não suportado'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Criar object store se não existir
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('sincronizado', 'sincronizado', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('tipo', 'tipo', { unique: false });
      }
    };
  });
}

/**
 * Salvar dados offline
 */
export async function salvarDadosOffline(dados: DadosOffline): Promise<void> {
  try {
    const db = await inicializarDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.put(dados);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    logger.dev('Dados salvos offline:', dados.id);
  } catch (error) {
    logger.error('Erro ao salvar dados offline:', error);
    throw new Error('Falha ao salvar dados offline');
  }
}

/**
 * Obter dados pendentes de sincronização
 */
export async function obterDadosPendentes(): Promise<DadosOffline[]> {
  try {
    const db = await inicializarDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('sincronizado');

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(false));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('Erro ao obter dados pendentes:', error);
    return [];
  }
}

/**
 * Marcar dados como sincronizados
 */
export async function marcarComoSincronizado(id: string): Promise<void> {
  try {
    const db = await inicializarDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const dados = await new Promise<DadosOffline>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (dados) {
      dados.sincronizado = true;
      await new Promise<void>((resolve, reject) => {
        const request = store.put(dados);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    logger.dev('Dados marcados como sincronizados:', id);
  } catch (error) {
    logger.error('Erro ao marcar como sincronizado:', error);
  }
}

/**
 * Sincronizar dados pendentes com o servidor
 */
export async function sincronizarDados(): Promise<{ sucesso: number; falhas: number }> {
  try {
    if (!navigator.onLine) {
      logger.dev('Offline - sincronização adiada');
      return { sucesso: 0, falhas: 0 };
    }

    const dadosPendentes = await obterDadosPendentes();
    let sucesso = 0;
    let falhas = 0;

    for (const dados of dadosPendentes) {
      try {
        // Determinar endpoint baseado no tipo
        const endpoint = obterEndpoint(dados.tipo, dados.acao);
        const metodo = obterMetodoHTTP(dados.acao);

        // Enviar para o servidor
        const response = await fetch(endpoint, {
          method: metodo,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dados.dados),
        });

        if (response.ok) {
          await marcarComoSincronizado(dados.id);
          sucesso++;
          logger.dev('Sincronizado:', dados.id);
        } else {
          falhas++;
          logger.error('Falha ao sincronizar:', dados.id, response.status);
        }
      } catch (error) {
        falhas++;
        logger.error('Erro ao sincronizar:', dados.id, error);
      }
    }

    logger.dev(`Sincronização completa: ${sucesso} sucesso, ${falhas} falhas`);
    return { sucesso, falhas };
  } catch (error) {
    logger.error('Erro na sincronização:', error);
    return { sucesso: 0, falhas: 0 };
  }
}

/**
 * Resolver conflitos de dados
 */
export function resolverConflito(
  conflito: ConflitoDados,
  estrategia: 'local' | 'remoto' | 'mais-recente' = 'mais-recente'
): any {
  switch (estrategia) {
    case 'local':
      return conflito.local;
    
    case 'remoto':
      return conflito.remoto;
    
    case 'mais-recente':
      const timestampLocal = conflito.local.atualizadoEm || conflito.local.criadoEm;
      const timestampRemoto = conflito.remoto.atualizadoEm || conflito.remoto.criadoEm;
      
      return new Date(timestampLocal) > new Date(timestampRemoto)
        ? conflito.local
        : conflito.remoto;
    
    default:
      return conflito.remoto;
  }
}

/**
 * Limpar dados sincronizados antigos
 */
export async function limparDadosSincronizados(diasAntigos: number = 7): Promise<number> {
  try {
    const db = await inicializarDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('sincronizado');

    const dadosSincronizados = await new Promise<DadosOffline[]>((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(true));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const limiteTimestamp = Date.now() - diasAntigos * 24 * 60 * 60 * 1000;
    let removidos = 0;

    for (const dados of dadosSincronizados) {
      if (dados.timestamp < limiteTimestamp) {
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(dados.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        removidos++;
      }
    }

    logger.dev(`Removidos ${removidos} registros antigos`);
    return removidos;
  } catch (error) {
    logger.error('Erro ao limpar dados sincronizados:', error);
    return 0;
  }
}

/**
 * Verificar status de conexão
 */
export function verificarConexao(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Configurar listeners de conexão
 */
export function configurarListenersConexao(
  onOnline: () => void,
  onOffline: () => void
): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    logger.dev('Conexão restaurada');
    onOnline();
  });

  window.addEventListener('offline', () => {
    logger.dev('Conexão perdida');
    onOffline();
  });
}

// Helpers privados
function obterEndpoint(tipo: string, acao: string): string {
  const endpoints: Record<string, string> = {
    transacao: '/api/transacoes',
    conta: '/api/contas',
    cartao: '/api/cartoes',
    categoria: '/api/categorias',
  };

  return endpoints[tipo] || '/api/sync';
}

function obterMetodoHTTP(acao: string): string {
  const metodos: Record<string, string> = {
    criar: 'POST',
    atualizar: 'PUT',
    deletar: 'DELETE',
  };

  return metodos[acao] || 'POST';
}
