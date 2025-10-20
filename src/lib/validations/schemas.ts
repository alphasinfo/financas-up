/**
 * Schemas de Validação com Zod
 * 
 * Schemas para validação de dados de entrada nas APIs
 */

import { z } from 'zod';

// Schema base para transações
export const transacaoSchema = z.object({
  descricao: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  valor: z.number()
    .positive('Valor deve ser positivo')
    .max(999999999, 'Valor muito alto'),
  tipo: z.enum(['RECEITA', 'DESPESA'], {
    errorMap: () => ({ message: 'Tipo deve ser RECEITA ou DESPESA' })
  }),
  status: z.enum(['PENDENTE', 'PAGO', 'RECEBIDO', 'CANCELADO', 'AGENDADO']).optional(),
  dataCompetencia: z.string().datetime('Data deve estar no formato ISO'),
  dataVencimento: z.string().datetime().optional(),
  categoriaId: z.string().uuid('ID da categoria inválido').optional(),
  contaBancariaId: z.string().uuid('ID da conta inválido').optional(),
  cartaoCreditoId: z.string().uuid('ID do cartão inválido').optional(),
  observacoes: z.string().max(500, 'Observações muito longas').optional(),
  numeroDocumento: z.string().max(50).optional(),
  localTransacao: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

// Schema para criação de transação
export const criarTransacaoSchema = transacaoSchema.omit({ 
  status: true 
}).extend({
  status: z.enum(['PENDENTE', 'PAGO', 'RECEBIDO', 'AGENDADO']).default('PENDENTE'),
});

// Schema para atualização de transação
export const atualizarTransacaoSchema = transacaoSchema.partial();

// Schema para conta bancária
export const contaBancariaSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  tipo: z.enum(['CORRENTE', 'POUPANCA', 'CARTEIRA'], {
    errorMap: () => ({ message: 'Tipo deve ser CORRENTE, POUPANCA ou CARTEIRA' })
  }),
  saldoInicial: z.number()
    .min(-999999999, 'Saldo inicial muito baixo')
    .max(999999999, 'Saldo inicial muito alto'),
  limiteCredito: z.number()
    .min(0, 'Limite de crédito não pode ser negativo')
    .max(999999999, 'Limite de crédito muito alto')
    .optional(),
  banco: z.string().max(100).optional(),
  agencia: z.string().max(20).optional(),
  conta: z.string().max(20).optional(),
  observacoes: z.string().max(500).optional(),
  ativa: z.boolean().default(true),
});

// Schema para cartão de crédito
export const cartaoCreditoSchema = z.object({
  apelido: z.string()
    .min(3, 'Apelido deve ter pelo menos 3 caracteres')
    .max(50, 'Apelido deve ter no máximo 50 caracteres'),
  bandeira: z.string()
    .min(3, 'Bandeira deve ter pelo menos 3 caracteres')
    .max(30, 'Bandeira deve ter no máximo 30 caracteres'),
  limiteTotal: z.number()
    .positive('Limite total deve ser positivo')
    .max(999999999, 'Limite total muito alto'),
  diaVencimento: z.number()
    .int('Dia de vencimento deve ser um número inteiro')
    .min(1, 'Dia de vencimento deve ser entre 1 e 31')
    .max(31, 'Dia de vencimento deve ser entre 1 e 31'),
  diaFechamento: z.number()
    .int('Dia de fechamento deve ser um número inteiro')
    .min(1, 'Dia de fechamento deve ser entre 1 e 31')
    .max(31, 'Dia de fechamento deve ser entre 1 e 31'),
  observacoes: z.string().max(500).optional(),
  ativo: z.boolean().default(true),
});

// Schema para categoria
export const categoriaSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  tipo: z.enum(['RECEITA', 'DESPESA'], {
    errorMap: () => ({ message: 'Tipo deve ser RECEITA ou DESPESA' })
  }),
  cor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional(),
  icone: z.string().max(50).optional(),
  descricao: z.string().max(200).optional(),
  ativa: z.boolean().default(true),
});

// Schema para meta financeira
export const metaSchema = z.object({
  titulo: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500).optional(),
  valorAlvo: z.number()
    .positive('Valor alvo deve ser positivo')
    .max(999999999, 'Valor alvo muito alto'),
  valorAtual: z.number()
    .min(0, 'Valor atual não pode ser negativo')
    .max(999999999, 'Valor atual muito alto')
    .default(0),
  dataPrazo: z.string().datetime('Data prazo deve estar no formato ISO'),
  categoria: z.string().max(50).optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA']).default('MEDIA'),
});

// Schema para orçamento
export const orcamentoSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  valorLimite: z.number()
    .positive('Valor limite deve ser positivo')
    .max(999999999, 'Valor limite muito alto'),
  mesReferencia: z.number()
    .int('Mês deve ser um número inteiro')
    .min(1, 'Mês deve ser entre 1 e 12')
    .max(12, 'Mês deve ser entre 1 e 12'),
  anoReferencia: z.number()
    .int('Ano deve ser um número inteiro')
    .min(2020, 'Ano deve ser maior que 2020')
    .max(2050, 'Ano deve ser menor que 2050'),
  categoriaId: z.string().uuid('ID da categoria inválido').optional(),
  observacoes: z.string().max(500).optional(),
  ativo: z.boolean().default(true),
});

// Schema para empréstimo
export const emprestimoSchema = z.object({
  instituicao: z.string()
    .min(3, 'Instituição deve ter pelo menos 3 caracteres')
    .max(100, 'Instituição deve ter no máximo 100 caracteres'),
  descricao: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  valorTotal: z.number()
    .positive('Valor total deve ser positivo')
    .max(999999999, 'Valor total muito alto'),
  valorParcela: z.number()
    .positive('Valor da parcela deve ser positivo')
    .max(999999999, 'Valor da parcela muito alto'),
  numeroParcelas: z.number()
    .int('Número de parcelas deve ser inteiro')
    .min(1, 'Deve ter pelo menos 1 parcela')
    .max(360, 'Máximo 360 parcelas'),
  taxaJuros: z.number()
    .min(0, 'Taxa de juros não pode ser negativa')
    .max(100, 'Taxa de juros muito alta')
    .optional(),
  dataContratacao: z.string().datetime('Data de contratação inválida'),
  dataPrimeiraParcela: z.string().datetime('Data da primeira parcela inválida'),
  observacoes: z.string().max(500).optional(),
});

// Schema para investimento
export const investimentoSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  tipo: z.enum(['RENDA_FIXA', 'RENDA_VARIAVEL', 'FUNDO', 'CRIPTO', 'OUTROS']),
  valorAplicado: z.number()
    .positive('Valor aplicado deve ser positivo')
    .max(999999999, 'Valor aplicado muito alto'),
  valorAtual: z.number()
    .min(0, 'Valor atual não pode ser negativo')
    .max(999999999, 'Valor atual muito alto')
    .optional(),
  dataAplicacao: z.string().datetime('Data de aplicação inválida'),
  dataVencimento: z.string().datetime().optional(),
  rentabilidadeEsperada: z.number()
    .min(0, 'Rentabilidade esperada não pode ser negativa')
    .max(1000, 'Rentabilidade esperada muito alta')
    .optional(),
  observacoes: z.string().max(500).optional(),
});

// Schema para usuário
export const usuarioSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email muito longo'),
  senha: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
  telefone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000')
    .optional(),
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00')
    .optional(),
  dataNascimento: z.string().datetime().optional(),
});

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
  lembrarMe: z.boolean().optional(),
});

// Schema para login rate limit
export const rateLimitCheckSchema = z.object({
  email: z.string().email('Email inválido'),
  action: z.enum(['record-failure', 'clear']).optional(),
});

// Schema para paginação
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  order: z.enum(['asc', 'desc']).default('desc'),
  orderBy: z.string().optional(),
});

// Schema para filtros de transação
export const filtrosTransacaoSchema = z.object({
  tipo: z.enum(['RECEITA', 'DESPESA']).optional(),
  status: z.enum(['PENDENTE', 'PAGO', 'RECEBIDO', 'CANCELADO', 'AGENDADO']).optional(),
  categoriaId: z.string().uuid().optional(),
  contaBancariaId: z.string().uuid().optional(),
  cartaoCreditoId: z.string().uuid().optional(),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
  valorMinimo: z.number().min(0).optional(),
  valorMaximo: z.number().min(0).optional(),
  busca: z.string().max(100).optional(),
});

// Schema para relatórios
export const relatorioSchema = z.object({
  tipo: z.enum(['MENSAL', 'ANUAL', 'PERIODO', 'CATEGORIA']),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
  categorias: z.array(z.string().uuid()).optional(),
  contas: z.array(z.string().uuid()).optional(),
  cartoes: z.array(z.string().uuid()).optional(),
  formato: z.enum(['PDF', 'CSV', 'EXCEL']).default('PDF'),
  incluirGraficos: z.boolean().default(true),
  incluirDetalhes: z.boolean().default(true),
});

// Schema para backup
export const backupSchema = z.object({
  incluirTransacoes: z.boolean().default(true),
  incluirContas: z.boolean().default(true),
  incluirCartoes: z.boolean().default(true),
  incluirCategorias: z.boolean().default(true),
  incluirMetas: z.boolean().default(true),
  incluirOrcamentos: z.boolean().default(true),
  incluirEmprestimos: z.boolean().default(true),
  incluirInvestimentos: z.boolean().default(true),
  formato: z.enum(['JSON', 'CSV']).default('JSON'),
  compactar: z.boolean().default(true),
});

// Schema para configurações
export const configuracaoSchema = z.object({
  moedaPadrao: z.string().length(3, 'Código da moeda deve ter 3 caracteres').default('BRL'),
  fusoHorario: z.string().max(50).default('America/Sao_Paulo'),
  formatoData: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  formatoHora: z.enum(['24h', '12h']).default('24h'),
  idioma: z.enum(['pt-BR', 'en-US', 'es-ES']).default('pt-BR'),
  tema: z.enum(['light', 'dark', 'auto']).default('light'),
  notificacoes: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    vencimentos: z.boolean().default(true),
    resumoDiario: z.boolean().default(false),
    metasAlcancadas: z.boolean().default(true),
  }).default({}),
});

// Schema para 2FA
export const twoFactorSchema = z.object({
  token: z.string()
    .length(6, 'Token deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Token deve conter apenas números'),
});

export const backupCodeSchema = z.object({
  code: z.string()
    .length(9, 'Código de backup deve ter 9 caracteres')
    .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Código deve estar no formato XXXX-XXXX'),
});

// Schema para importação de dados
export const importacaoSchema = z.object({
  formato: z.enum(['CSV', 'OFX', 'XML', 'CNAB']),
  arquivo: z.string().min(1, 'Arquivo é obrigatório'),
  contaBancariaId: z.string().uuid('ID da conta inválido'),
  configuracoes: z.object({
    separador: z.string().length(1).optional(),
    encoding: z.enum(['UTF-8', 'ISO-8859-1', 'Windows-1252']).default('UTF-8'),
    pularLinhas: z.number().int().min(0).max(10).default(0),
    mapeamentoColunas: z.record(z.string(), z.number()).optional(),
  }).optional(),
});

// Função helper para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Função para formatar erros de validação
export function formatValidationErrors(errors: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  });
  
  return formatted;
}