/**
 * Compartilhamento Avançado
 * Orçamento familiar, permissões granulares, chat entre usuários
 */

import { prisma } from './prisma';
import { logger } from './logger-production';

export interface OrcamentoFamiliar {
  id: string;
  nome: string;
  descricao?: string;
  membros: MembroFamiliar[];
  orcamentoTotal: number;
  gastoAtual: number;
  categorias: CategoriaOrcamento[];
  criadoEm: Date;
}

export interface MembroFamiliar {
  id: string;
  nome: string;
  email: string;
  papel: 'admin' | 'editor' | 'visualizador';
  permissoes: Permissao[];
  ativo: boolean;
}

export interface Permissao {
  recurso: 'transacoes' | 'contas' | 'cartoes' | 'relatorios' | 'configuracoes';
  acao: 'criar' | 'ler' | 'atualizar' | 'deletar';
  permitido: boolean;
}

export interface CategoriaOrcamento {
  categoriaId: string;
  nome: string;
  limite: number;
  gasto: number;
  percentual: number;
}

export interface MensagemChat {
  id: string;
  remetenteId: string;
  destinatarioId: string;
  mensagem: string;
  lida: boolean;
  criadoEm: Date;
}

/**
 * Criar orçamento familiar
 */
export async function criarOrcamentoFamiliar(
  userId: string,
  nome: string,
  orcamentoTotal: number
): Promise<OrcamentoFamiliar> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const orcamento: OrcamentoFamiliar = {
      id: `orc-${Date.now()}`,
      nome,
      orcamentoTotal,
      gastoAtual: 0,
      membros: [
        {
          id: userId,
          nome: usuario.nome,
          email: usuario.email,
          papel: 'admin',
          permissoes: obterPermissoesCompletas(),
          ativo: true,
        },
      ],
      categorias: [],
      criadoEm: new Date(),
    };

    logger.dev('Orçamento familiar criado:', orcamento.id);
    return orcamento;
  } catch (error) {
    logger.error('Erro ao criar orçamento familiar:', error);
    throw new Error('Falha ao criar orçamento familiar');
  }
}

/**
 * Adicionar membro ao orçamento familiar
 */
export async function adicionarMembro(
  orcamentoId: string,
  email: string,
  papel: 'admin' | 'editor' | 'visualizador' = 'visualizador'
): Promise<MembroFamiliar> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const membro: MembroFamiliar = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel,
      permissoes: obterPermissoesPorPapel(papel),
      ativo: true,
    };

    logger.dev('Membro adicionado ao orçamento:', membro.id);
    return membro;
  } catch (error) {
    logger.error('Erro ao adicionar membro:', error);
    throw new Error('Falha ao adicionar membro');
  }
}

/**
 * Verificar permissão de um membro
 */
export function verificarPermissao(
  membro: MembroFamiliar,
  recurso: string,
  acao: string
): boolean {
  // Admin tem todas as permissões
  if (membro.papel === 'admin') {
    return true;
  }

  // Verificar permissões específicas
  const permissao = membro.permissoes.find(
    (p) => p.recurso === recurso && p.acao === acao
  );

  return permissao?.permitido || false;
}

/**
 * Atualizar permissões de um membro
 */
export function atualizarPermissoes(
  membro: MembroFamiliar,
  novasPermissoes: Permissao[]
): MembroFamiliar {
  // Não pode alterar permissões de admin
  if (membro.papel === 'admin') {
    logger.dev('Não é possível alterar permissões de admin');
    return membro;
  }

  membro.permissoes = novasPermissoes;
  logger.dev('Permissões atualizadas para:', membro.id);
  return membro;
}

/**
 * Enviar mensagem no chat
 */
export async function enviarMensagem(
  remetenteId: string,
  destinatarioId: string,
  mensagem: string
): Promise<MensagemChat> {
  try {
    const novaMensagem: MensagemChat = {
      id: `msg-${Date.now()}`,
      remetenteId,
      destinatarioId,
      mensagem,
      lida: false,
      criadoEm: new Date(),
    };

    // TODO: Salvar no banco de dados
    // await prisma.mensagem.create({ data: novaMensagem });

    logger.dev('Mensagem enviada:', novaMensagem.id);
    return novaMensagem;
  } catch (error) {
    logger.error('Erro ao enviar mensagem:', error);
    throw new Error('Falha ao enviar mensagem');
  }
}

/**
 * Obter mensagens entre dois usuários
 */
export async function obterMensagens(
  userId1: string,
  userId2: string,
  limite: number = 50
): Promise<MensagemChat[]> {
  try {
    // TODO: Buscar do banco de dados
    // const mensagens = await prisma.mensagem.findMany({
    //   where: {
    //     OR: [
    //       { remetenteId: userId1, destinatarioId: userId2 },
    //       { remetenteId: userId2, destinatarioId: userId1 },
    //     ],
    //   },
    //   orderBy: { criadoEm: 'desc' },
    //   take: limite,
    // });

    logger.dev('Mensagens obtidas entre:', userId1, userId2);
    return [];
  } catch (error) {
    logger.error('Erro ao obter mensagens:', error);
    return [];
  }
}

/**
 * Marcar mensagens como lidas
 */
export async function marcarComoLidas(
  userId: string,
  mensagensIds: string[]
): Promise<number> {
  try {
    // TODO: Atualizar no banco de dados
    // const resultado = await prisma.mensagem.updateMany({
    //   where: {
    //     id: { in: mensagensIds },
    //     destinatarioId: userId,
    //   },
    //   data: { lida: true },
    // });

    logger.dev('Mensagens marcadas como lidas:', mensagensIds.length);
    return mensagensIds.length;
  } catch (error) {
    logger.error('Erro ao marcar mensagens como lidas:', error);
    return 0;
  }
}

/**
 * Calcular gastos por categoria no orçamento familiar
 */
export async function calcularGastosPorCategoria(
  orcamentoId: string,
  membrosIds: string[]
): Promise<CategoriaOrcamento[]> {
  try {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const gastosPorCategoria = await prisma.transacao.groupBy({
      by: ['categoriaId'],
      where: {
        usuarioId: { in: membrosIds },
        tipo: 'DESPESA',
        status: 'PAGO',
        dataCompetencia: { gte: inicioMes },
      },
      _sum: { valor: true },
    });

    const categorias: CategoriaOrcamento[] = [];

    for (const gasto of gastosPorCategoria) {
      if (gasto.categoriaId) {
        const categoria = await prisma.categoria.findUnique({
          where: { id: gasto.categoriaId },
        });

        if (categoria) {
          const valorGasto = gasto._sum.valor || 0;
          categorias.push({
            categoriaId: categoria.id,
            nome: categoria.nome,
            limite: 0, // Definir limite manualmente
            gasto: valorGasto,
            percentual: 0, // Calcular depois
          });
        }
      }
    }

    logger.dev('Gastos por categoria calculados:', categorias.length);
    return categorias;
  } catch (error) {
    logger.error('Erro ao calcular gastos por categoria:', error);
    return [];
  }
}

/**
 * Obter relatório do orçamento familiar
 */
export async function obterRelatorioFamiliar(
  orcamentoId: string,
  membrosIds: string[]
): Promise<{
  totalGasto: number;
  gastosPorMembro: Array<{ membroId: string; nome: string; gasto: number }>;
  categorias: CategoriaOrcamento[];
}> {
  try {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Gastos por membro
    const gastosPorMembro = [];
    for (const membroId of membrosIds) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: membroId },
      });

      const gastos = await prisma.transacao.aggregate({
        where: {
          usuarioId: membroId,
          tipo: 'DESPESA',
          status: 'PAGO',
          dataCompetencia: { gte: inicioMes },
        },
        _sum: { valor: true },
      });

      gastosPorMembro.push({
        membroId,
        nome: usuario?.nome || 'Desconhecido',
        gasto: gastos._sum.valor || 0,
      });
    }

    const totalGasto = gastosPorMembro.reduce((acc, m) => acc + m.gasto, 0);
    const categorias = await calcularGastosPorCategoria(orcamentoId, membrosIds);

    return {
      totalGasto,
      gastosPorMembro,
      categorias,
    };
  } catch (error) {
    logger.error('Erro ao obter relatório familiar:', error);
    throw new Error('Falha ao obter relatório');
  }
}

// Helpers privados
function obterPermissoesCompletas(): Permissao[] {
  const recursos: Array<'transacoes' | 'contas' | 'cartoes' | 'relatorios' | 'configuracoes'> = [
    'transacoes',
    'contas',
    'cartoes',
    'relatorios',
    'configuracoes',
  ];
  const acoes: Array<'criar' | 'ler' | 'atualizar' | 'deletar'> = ['criar', 'ler', 'atualizar', 'deletar'];

  const permissoes: Permissao[] = [];
  for (const recurso of recursos) {
    for (const acao of acoes) {
      permissoes.push({ recurso, acao, permitido: true });
    }
  }

  return permissoes;
}

function obterPermissoesPorPapel(papel: 'admin' | 'editor' | 'visualizador'): Permissao[] {
  if (papel === 'admin') {
    return obterPermissoesCompletas();
  }

  if (papel === 'editor') {
    return [
      { recurso: 'transacoes', acao: 'criar', permitido: true },
      { recurso: 'transacoes', acao: 'ler', permitido: true },
      { recurso: 'transacoes', acao: 'atualizar', permitido: true },
      { recurso: 'transacoes', acao: 'deletar', permitido: false },
      { recurso: 'contas', acao: 'ler', permitido: true },
      { recurso: 'cartoes', acao: 'ler', permitido: true },
      { recurso: 'relatorios', acao: 'ler', permitido: true },
      { recurso: 'configuracoes', acao: 'ler', permitido: false },
    ];
  }

  // Visualizador
  return [
    { recurso: 'transacoes', acao: 'ler', permitido: true },
    { recurso: 'contas', acao: 'ler', permitido: true },
    { recurso: 'cartoes', acao: 'ler', permitido: true },
    { recurso: 'relatorios', acao: 'ler', permitido: true },
  ];
}
