/**
 * Integração Bancária
 * Open Banking, importação automática de extratos, conciliação automática
 */

import { prisma } from './prisma';
import { logger } from './logger-production';

export interface ExtratoImportado {
  data: Date;
  descricao: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  saldo?: number;
  categoria?: string;
}

export interface ResultadoConciliacao {
  total: number;
  conciliadas: number;
  naoEncontradas: number;
  duplicadas: number;
  transacoes: Array<{
    extrato: ExtratoImportado;
    transacao?: any;
    status: 'conciliada' | 'nao-encontrada' | 'duplicada';
  }>;
}

export interface ConexaoBancaria {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: 'corrente' | 'poupanca' | 'investimento';
  ativo: boolean;
  ultimaSync?: Date;
}

/**
 * Parsear arquivo OFX (formato comum de extratos bancários)
 */
export function parsearOFX(conteudoOFX: string): ExtratoImportado[] {
  try {
    const extratos: ExtratoImportado[] = [];
    
    // Regex para extrair transações do OFX
    const transacaoRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    const matches = conteudoOFX.matchAll(transacaoRegex);

    for (const match of matches) {
      const transacao = match[1];
      
      // Extrair campos
      const dataMatch = transacao.match(/<DTPOSTED>(\d{8})/);
      const valorMatch = transacao.match(/<TRNAMT>([-\d.]+)/);
      const descricaoMatch = transacao.match(/<MEMO>(.*?)</);
      const tipoMatch = transacao.match(/<TRNTYPE>(.*?)</);

      if (dataMatch && valorMatch && descricaoMatch) {
        const data = new Date(
          parseInt(dataMatch[1].substring(0, 4)),
          parseInt(dataMatch[1].substring(4, 6)) - 1,
          parseInt(dataMatch[1].substring(6, 8))
        );

        const valor = Math.abs(parseFloat(valorMatch[1]));
        const tipo = parseFloat(valorMatch[1]) > 0 ? 'RECEITA' : 'DESPESA';
        const descricao = descricaoMatch[1].trim();

        extratos.push({
          data,
          descricao,
          valor,
          tipo,
        });
      }
    }

    logger.dev(`Parseados ${extratos.length} registros do OFX`);
    return extratos;
  } catch (error) {
    logger.error('Erro ao parsear OFX:', error);
    throw new Error('Falha ao parsear arquivo OFX');
  }
}

/**
 * Parsear arquivo CSV (formato alternativo)
 */
export function parsearCSV(conteudoCSV: string): ExtratoImportado[] {
  try {
    const extratos: ExtratoImportado[] = [];
    const linhas = conteudoCSV.split('\n');

    // Pular cabeçalho
    for (let i = 1; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      if (!linha) continue;

      // Formato esperado: data,descricao,valor,tipo
      const campos = linha.split(',').map(c => c.trim().replace(/['"]/g, ''));
      
      if (campos.length >= 3) {
        const [dataStr, descricao, valorStr, tipoStr] = campos;
        
        const data = new Date(dataStr);
        const valor = Math.abs(parseFloat(valorStr));
        const tipo = tipoStr?.toUpperCase() === 'RECEITA' || valor > 0 ? 'RECEITA' : 'DESPESA';

        extratos.push({
          data,
          descricao,
          valor,
          tipo,
        });
      }
    }

    logger.dev(`Parseados ${extratos.length} registros do CSV`);
    return extratos;
  } catch (error) {
    logger.error('Erro ao parsear CSV:', error);
    throw new Error('Falha ao parsear arquivo CSV');
  }
}

/**
 * Conciliar extratos importados com transações existentes
 */
export async function conciliarExtratos(
  userId: string,
  extratos: ExtratoImportado[]
): Promise<ResultadoConciliacao> {
  try {
    const resultado: ResultadoConciliacao = {
      total: extratos.length,
      conciliadas: 0,
      naoEncontradas: 0,
      duplicadas: 0,
      transacoes: [],
    };

    for (const extrato of extratos) {
      // Buscar transação correspondente (mesmo valor, data próxima)
      const dataInicio = new Date(extrato.data);
      dataInicio.setDate(dataInicio.getDate() - 2);
      const dataFim = new Date(extrato.data);
      dataFim.setDate(dataFim.getDate() + 2);

      const transacoesEncontradas = await prisma.transacao.findMany({
        where: {
          usuarioId: userId,
          tipo: extrato.tipo,
          valor: extrato.valor,
          dataCompetencia: {
            gte: dataInicio,
            lte: dataFim,
          },
        },
        take: 5,
      });

      if (transacoesEncontradas.length === 0) {
        resultado.naoEncontradas++;
        resultado.transacoes.push({
          extrato,
          status: 'nao-encontrada',
        });
      } else if (transacoesEncontradas.length === 1) {
        resultado.conciliadas++;
        resultado.transacoes.push({
          extrato,
          transacao: transacoesEncontradas[0],
          status: 'conciliada',
        });
      } else {
        resultado.duplicadas++;
        resultado.transacoes.push({
          extrato,
          transacao: transacoesEncontradas[0],
          status: 'duplicada',
        });
      }
    }

    logger.dev('Conciliação concluída:', resultado);
    return resultado;
  } catch (error) {
    logger.error('Erro ao conciliar extratos:', error);
    throw new Error('Falha ao conciliar extratos');
  }
}

/**
 * Importar extratos não encontrados como novas transações
 */
export async function importarNaoEncontrados(
  userId: string,
  contaId: string,
  extratos: ExtratoImportado[]
): Promise<number> {
  try {
    let importados = 0;

    for (const extrato of extratos) {
      await prisma.transacao.create({
        data: {
          usuarioId: userId,
          contaBancariaId: contaId,
          descricao: extrato.descricao,
          valor: extrato.valor,
          tipo: extrato.tipo,
          status: extrato.tipo === 'RECEITA' ? 'RECEBIDO' : 'PAGO',
          dataCompetencia: extrato.data,
          observacoes: 'Importado automaticamente do extrato bancário',
        },
      });
      importados++;
    }

    logger.dev(`Importadas ${importados} transações`);
    return importados;
  } catch (error) {
    logger.error('Erro ao importar transações:', error);
    throw new Error('Falha ao importar transações');
  }
}

/**
 * Conectar com Open Banking (simulado)
 */
export async function conectarOpenBanking(
  userId: string,
  banco: string,
  credenciais: any
): Promise<ConexaoBancaria> {
  try {
    // TODO: Implementar integração real com Open Banking
    // Requer API do banco e autenticação OAuth2
    
    const conexao: ConexaoBancaria = {
      id: `conn-${Date.now()}`,
      banco,
      agencia: credenciais.agencia || '0000',
      conta: credenciais.conta || '00000-0',
      tipo: credenciais.tipo || 'corrente',
      ativo: true,
      ultimaSync: new Date(),
    };

    logger.dev('Conexão Open Banking criada:', conexao);
    return conexao;
  } catch (error) {
    logger.error('Erro ao conectar Open Banking:', error);
    throw new Error('Falha ao conectar com Open Banking');
  }
}

/**
 * Sincronizar transações via Open Banking
 */
export async function sincronizarOpenBanking(
  conexaoId: string,
  diasAtras: number = 30
): Promise<ExtratoImportado[]> {
  try {
    // TODO: Implementar chamada real à API do banco
    // Exemplo: GET /accounts/{accountId}/transactions
    
    logger.dev(`Sincronizando últimos ${diasAtras} dias`);
    return [];
  } catch (error) {
    logger.error('Erro ao sincronizar Open Banking:', error);
    throw new Error('Falha ao sincronizar');
  }
}

/**
 * Categorizar automaticamente transações importadas
 */
export async function categorizarAutomaticamente(
  userId: string,
  transacoes: ExtratoImportado[]
): Promise<ExtratoImportado[]> {
  try {
    // Buscar categorias do usuário
    const categorias = await prisma.categoria.findMany({
      where: { usuarioId: userId },
    });

    // Palavras-chave para categorização
    const palavrasChave: Record<string, string[]> = {
      'Alimentação': ['mercado', 'supermercado', 'restaurante', 'lanchonete', 'padaria'],
      'Transporte': ['uber', 'taxi', 'gasolina', 'combustivel', 'estacionamento'],
      'Saúde': ['farmacia', 'hospital', 'clinica', 'medico', 'laboratorio'],
      'Educação': ['escola', 'faculdade', 'curso', 'livro', 'material escolar'],
      'Lazer': ['cinema', 'teatro', 'show', 'streaming', 'netflix'],
    };

    for (const transacao of transacoes) {
      const descricaoLower = transacao.descricao.toLowerCase();
      
      for (const [nomeCategoria, palavras] of Object.entries(palavrasChave)) {
        if (palavras.some(palavra => descricaoLower.includes(palavra))) {
          transacao.categoria = nomeCategoria;
          break;
        }
      }
    }

    return transacoes;
  } catch (error) {
    logger.error('Erro ao categorizar automaticamente:', error);
    return transacoes;
  }
}
