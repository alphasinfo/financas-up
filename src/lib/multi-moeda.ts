/**
 * Sistema Multi-moeda
 * Suporte a múltiplas moedas, conversão automática, cotação em tempo real
 */

import { logger } from './logger-production';

export interface Moeda {
  codigo: string;
  nome: string;
  simbolo: string;
  pais: string;
}

export interface Cotacao {
  de: string;
  para: string;
  taxa: number;
  timestamp: Date;
}

export const MOEDAS_SUPORTADAS: Moeda[] = [
  { codigo: 'BRL', nome: 'Real Brasileiro', simbolo: 'R$', pais: 'Brasil' },
  { codigo: 'USD', nome: 'Dólar Americano', simbolo: '$', pais: 'Estados Unidos' },
  { codigo: 'EUR', nome: 'Euro', simbolo: '€', pais: 'União Europeia' },
  { codigo: 'GBP', nome: 'Libra Esterlina', simbolo: '£', pais: 'Reino Unido' },
  { codigo: 'JPY', nome: 'Iene Japonês', simbolo: '¥', pais: 'Japão' },
  { codigo: 'ARS', nome: 'Peso Argentino', simbolo: '$', pais: 'Argentina' },
  { codigo: 'CLP', nome: 'Peso Chileno', simbolo: '$', pais: 'Chile' },
  { codigo: 'MXN', nome: 'Peso Mexicano', simbolo: '$', pais: 'México' },
];

// Cache de cotações (5 minutos)
const cacheCotacoes = new Map<string, { cotacao: Cotacao; expira: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obter cotação em tempo real
 * Usa API pública (exemplo: exchangerate-api.com)
 */
export async function obterCotacao(de: string, para: string): Promise<Cotacao> {
  try {
    // Verificar cache
    const chaveCache = `${de}-${para}`;
    const cached = cacheCotacoes.get(chaveCache);
    
    if (cached && cached.expira > Date.now()) {
      logger.dev('Cotação do cache:', chaveCache);
      return cached.cotacao;
    }

    // Buscar cotação da API
    // TODO: Implementar chamada real à API de cotações
    // Exemplo: https://api.exchangerate-api.com/v4/latest/${de}
    
    // Mock para desenvolvimento
    const taxasMock: Record<string, number> = {
      'USD-BRL': 5.20,
      'EUR-BRL': 5.60,
      'GBP-BRL': 6.50,
      'BRL-USD': 0.19,
      'BRL-EUR': 0.18,
      'USD-EUR': 0.92,
      'EUR-USD': 1.09,
    };

    const taxa = taxasMock[`${de}-${para}`] || 1;

    const cotacao: Cotacao = {
      de,
      para,
      taxa,
      timestamp: new Date(),
    };

    // Salvar no cache
    cacheCotacoes.set(chaveCache, {
      cotacao,
      expira: Date.now() + CACHE_TTL,
    });

    logger.dev('Cotação obtida:', cotacao);
    return cotacao;
  } catch (error) {
    logger.error('Erro ao obter cotação:', error);
    throw new Error('Falha ao obter cotação');
  }
}

/**
 * Converter valor entre moedas
 */
export async function converterMoeda(
  valor: number,
  de: string,
  para: string
): Promise<number> {
  try {
    if (de === para) {
      return valor;
    }

    const cotacao = await obterCotacao(de, para);
    const valorConvertido = valor * cotacao.taxa;

    logger.dev(`Conversão: ${valor} ${de} = ${valorConvertido} ${para}`);
    return valorConvertido;
  } catch (error) {
    logger.error('Erro ao converter moeda:', error);
    throw new Error('Falha ao converter moeda');
  }
}

/**
 * Formatar valor com símbolo da moeda
 */
export function formatarMoeda(valor: number, codigoMoeda: string): string {
  const moeda = MOEDAS_SUPORTADAS.find((m) => m.codigo === codigoMoeda);
  
  if (!moeda) {
    return valor.toFixed(2);
  }

  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);

  return `${moeda.simbolo} ${valorFormatado}`;
}

/**
 * Obter todas as cotações para uma moeda base
 */
export async function obterTodasCotacoes(moedaBase: string): Promise<Cotacao[]> {
  try {
    const cotacoes: Cotacao[] = [];

    for (const moeda of MOEDAS_SUPORTADAS) {
      if (moeda.codigo !== moedaBase) {
        const cotacao = await obterCotacao(moedaBase, moeda.codigo);
        cotacoes.push(cotacao);
      }
    }

    return cotacoes;
  } catch (error) {
    logger.error('Erro ao obter todas as cotações:', error);
    throw new Error('Falha ao obter cotações');
  }
}

/**
 * Calcular valor total em múltiplas moedas
 */
export async function calcularTotalMultiMoeda(
  valores: Array<{ valor: number; moeda: string }>,
  moedaDestino: string
): Promise<number> {
  try {
    let total = 0;

    for (const item of valores) {
      const valorConvertido = await converterMoeda(
        item.valor,
        item.moeda,
        moedaDestino
      );
      total += valorConvertido;
    }

    return total;
  } catch (error) {
    logger.error('Erro ao calcular total multi-moeda:', error);
    throw new Error('Falha ao calcular total');
  }
}

/**
 * Limpar cache de cotações
 */
export function limparCacheCotacoes(): void {
  cacheCotacoes.clear();
  logger.dev('Cache de cotações limpo');
}
