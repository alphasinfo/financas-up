/**
 * Helpers para Testes - Financas-Up
 * 
 * Utilitários comuns para facilitar a criação e manutenção de testes
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

// Tipos do Jest para TypeScript
declare global {
  namespace jest {
    interface MockedFunction<T extends (...args: any[]) => any> extends Function {
      (...args: Parameters<T>): ReturnType<T>;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn?: T): MockedFunction<T>;
      mockReturnValue(value: ReturnType<T>): MockedFunction<T>;
      mockResolvedValue(value: Awaited<ReturnType<T>>): MockedFunction<T>;
      mockRejectedValue(value: any): MockedFunction<T>;
    }
  }

  const jest: {
    fn: <T extends (...args: any[]) => any>(implementation?: T) => jest.MockedFunction<T>;
    isMockFunction: (fn: any) => fn is jest.MockedFunction<any>;
  };

  const expect: {
    (actual: any): {
      toBe: (expected: any) => void;
      toEqual: (expected: any) => void;
      toHaveProperty: (property: string) => void;
      toBeGreaterThanOrEqual: (expected: number) => void;
      toBeInstanceOf: (expected: any) => void;
      not: {
        toBeNaN: () => void;
      };
      toMatch: (expected: RegExp | string) => void;
      toBeGreaterThan: (expected: number) => void;
    };
  };
}

// Mock do Prisma para testes - versão simplificada
export const mockPrisma = {
  usuario: {
    findUnique: (() => {}) as any,
    findMany: (() => {}) as any,
    create: (() => {}) as any,
    update: (() => {}) as any,
    delete: (() => {}) as any,
  },
  transacao: {
    findMany: (() => {}) as any,
    create: (() => {}) as any,
    update: (() => {}) as any,
    delete: (() => {}) as any,
    count: (() => {}) as any,
  },
  conta: {
    findMany: (() => {}) as any,
    create: (() => {}) as any,
    update: (() => {}) as any,
    delete: (() => {}) as any,
  },
  categoria: {
    findMany: (() => {}) as any,
    create: (() => {}) as any,
    update: (() => {}) as any,
    delete: (() => {}) as any,
  },
  cartao: {
    findMany: (() => {}) as any,
    create: (() => {}) as any,
    update: (() => {}) as any,
    delete: (() => {}) as any,
  },
  fatura: {
    findMany: (() => {}) as any,
    create: (() => {}) as any,
    update: (() => {}) as any,
    delete: (() => {}) as any,
  },
  $transaction: (() => {}) as any,
  $disconnect: (() => {}) as any,
};

// Mock de usuário para testes
export const mockUsuario = {
  id: 'test-user-id',
  email: 'test@example.com',
  nome: 'Usuário Teste',
  senha: 'hashed-password',
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock de transação para testes
export const mockTransacao = {
  id: 'test-transaction-id',
  descricao: 'Transação de Teste',
  valor: 100.50,
  tipo: 'RECEITA',
  data: new Date(),
  usuarioId: 'test-user-id',
  contaId: 'test-account-id',
  categoriaId: 'test-category-id',
  status: 'CONFIRMADA',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock de conta para testes
export const mockConta = {
  id: 'test-account-id',
  nome: 'Conta Teste',
  tipo: 'CORRENTE',
  saldo: 1000.00,
  usuarioId: 'test-user-id',
  ativa: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock de categoria para testes
export const mockCategoria = {
  id: 'test-category-id',
  nome: 'Categoria Teste',
  cor: '#3B82F6',
  icone: 'shopping-cart',
  usuarioId: 'test-user-id',
  ativa: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Helper para criar usuário de teste
export async function criarUsuarioTeste(dados?: Partial<typeof mockUsuario>) {
  const senhaHash = await hash('123456', 12);
  return {
    ...mockUsuario,
    senha: senhaHash,
    ...dados,
  };
}

// Helper para criar transação de teste
export function criarTransacaoTeste(dados?: Partial<typeof mockTransacao>) {
  return {
    ...mockTransacao,
    ...dados,
  };
}

// Helper para criar conta de teste
export function criarContaTeste(dados?: Partial<typeof mockConta>) {
  return {
    ...mockConta,
    ...dados,
  };
}

// Helper para criar categoria de teste
export function criarCategoriaTeste(dados?: Partial<typeof mockCategoria>) {
  return {
    ...mockCategoria,
    ...dados,
  };
}

// Helper para limpar mocks
export function limparMocks() {
  // Esta função será implementada nos testes individuais
  // onde os mocks reais do Jest estão disponíveis
}

// Helper para mock de request/response
export function criarMockRequest(dados?: any) {
  return {
    method: 'GET',
    url: '/api/test',
    headers: {},
    body: {},
    query: {},
    ...dados,
  };
}

export function criarMockResponse() {
  const res = {
    status: (() => res) as any,
    json: (() => res) as any,
    send: (() => res) as any,
    end: (() => res) as any,
    setHeader: (() => res) as any,
  };
  return res;
}

// Helper para mock de sessão NextAuth
export function criarMockSession(dados?: any) {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Usuário Teste',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...dados,
  };
}

// Helper para aguardar promises
export function aguardar(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper para gerar dados aleatórios
export function gerarEmail() {
  return `test-${Math.random().toString(36).substring(7)}@example.com`;
}

export function gerarId() {
  return `test-${Math.random().toString(36).substring(7)}`;
}

export function gerarValor(min = 1, max = 1000) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Helper para validar estrutura de resposta da API
export function validarRespostaAPI(resposta: any, campos: string[]) {
  campos.forEach(campo => {
    if (!resposta || typeof resposta !== 'object' || !(campo in resposta)) {
      throw new Error(`Campo '${campo}' não encontrado na resposta`);
    }
  });
}

// Helper para validar formato de data
export function validarFormatoData(data: any) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  if (!dateRegex.test(data)) {
    throw new Error(`Data '${data}' não está no formato esperado`);
  }
  
  const dateObj = new Date(data);
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new Error(`Data '${data}' não é uma data válida`);
  }
}

// Helper para validar formato de moeda
export function validarFormatoMoeda(valor: any) {
  if (typeof valor !== 'number') {
    throw new Error(`Valor '${valor}' não é um número`);
  }
  if (valor < 0) {
    throw new Error(`Valor '${valor}' não pode ser negativo`);
  }
  if (!Number.isFinite(valor)) {
    throw new Error(`Valor '${valor}' não é um número finito`);
  }
}

// Helper para validar UUID
export function validarUUID(id: any) {
  if (typeof id !== 'string') {
    throw new Error(`ID '${id}' não é uma string`);
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error(`ID '${id}' não é um UUID válido`);
  }
}

// Helper para simular erro de banco
export function simularErroBanco(mensagem = 'Database connection failed') {
  return new Error(mensagem);
}

// Helper para simular timeout
export function simularTimeout(ms = 5000) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
}

// Constantes para testes
export const TESTE_TIMEOUT = 10000; // 10 segundos
export const TESTE_RETRY_COUNT = 3;

// Tipos para testes
export interface MockAPIResponse {
  status: number;
  data?: any;
  error?: string;
  message?: string;
}

export interface TestUser {
  id: string;
  email: string;
  nome: string;
  senha?: string;
}

export interface TestTransaction {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  data: Date;
  usuarioId: string;
}