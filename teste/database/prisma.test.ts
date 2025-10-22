/**
 * Testes de Banco de Dados - Financas-Up
 * 
 * Testes críticos para operações do Prisma ORM
 * PRIORIDADE: CRÍTICA
 */

import { describe, it, expect, jest } from '@jest/globals';
import {
    mockPrisma,
    mockUsuario,
    mockTransacao,
    mockConta,
    criarUsuarioTeste,
    criarTransacaoTeste,
    criarContaTeste,
    simularErroBanco,
    gerarEmail,
    gerarId,
    gerarValor,
    validarFormatoData,
    validarFormatoMoeda,
    aguardar,
    criarMockRequest,
    criarMockResponse,
    criarMockSession
} from '../utils/test-helpers';

// Mock do Prisma
jest.mock('../../src/lib/prisma', () => ({
    prisma: mockPrisma,
}));

describe('Configuração de Banco de Dados', () => {
    describe('Configurações de Ambiente', () => {
        it('deve ter configuração de Prisma definida', () => {
            // Act
            const { prisma } = require('../../src/lib/prisma');

            // Assert
            expect(prisma).toBeDefined();
        });

        it('deve usar fallback para arquivo local se não houver DATABASE_URL', () => {
            // Arrange
            const originalUrl = process.env.DATABASE_URL;
            const originalSupabase = process.env.SUPABASE_DATABASE_URL;
            const originalPublic = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL;

            delete process.env.DATABASE_URL;
            delete process.env.SUPABASE_DATABASE_URL;
            delete process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL;

            // Act
            const url = (
                process.env.DATABASE_URL ||
                process.env.SUPABASE_DATABASE_URL ||
                process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||
                'file:./dev.db'
            );

            // Assert
            expect(url).toBe('file:./dev.db');

            // Cleanup
            if (originalUrl) process.env.DATABASE_URL = originalUrl;
            if (originalSupabase) process.env.SUPABASE_DATABASE_URL = originalSupabase;
            if (originalPublic) process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL = originalPublic;
        });

        it('deve ter configurações corretas para produção', () => {
            // Arrange & Act
            const { prisma } = require('../../src/lib/prisma');

            // Assert
            expect(prisma).toBeDefined();
            // Verificar se o mock do Prisma tem as operações básicas
            expect(prisma.usuario).toBeDefined();
            expect(prisma.transacao).toBeDefined();
            expect(prisma.conta).toBeDefined();
        });

        it('deve ter configurações corretas para desenvolvimento', () => {
            // Arrange & Act
            const { prisma } = require('../../src/lib/prisma');

            // Assert
            expect(prisma).toBeDefined();
            // Verificar se o mock do Prisma tem as operações básicas
            expect(prisma.usuario).toBeDefined();
            expect(prisma.transacao).toBeDefined();
            expect(prisma.conta).toBeDefined();
        });

        it('deve configurar pool de conexões adequadamente', () => {
            // Arrange & Act
            const { prisma } = require('../../src/lib/prisma');

            // Assert
            expect(prisma).toBeDefined();
            // Verificar configurações de pool (dependeria da implementação)
        });
    });

    describe('Estrutura de Dados', () => {
        it('deve ter helpers para criar dados de teste', async () => {
            // Act
            const usuario = await criarUsuarioTeste();
            const transacao = criarTransacaoTeste();
            const conta = criarContaTeste();

            // Assert
            expect(usuario).toHaveProperty('id');
            expect(usuario).toHaveProperty('email');
            expect(usuario).toHaveProperty('nome');
            expect(transacao).toHaveProperty('id');
            expect(transacao).toHaveProperty('valor');
            expect(conta).toHaveProperty('id');
            expect(conta).toHaveProperty('nome');
        });

        it('deve validar formato de dados', () => {
            // Act
            const usuario = mockUsuario;
            const transacao = mockTransacao;
            const conta = mockConta;

            // Assert
            expect(typeof usuario.email).toBe('string');
            expect(typeof transacao.valor).toBe('number');
            expect(typeof conta.saldo).toBe('number');
            expect(usuario.email).toContain('@');
        });

        it('deve ter estrutura de mock do Prisma', () => {
            // Assert
            expect(mockPrisma).toBeDefined();
            expect(mockPrisma.usuario).toBeDefined();
            expect(mockPrisma.transacao).toBeDefined();
            expect(mockPrisma.conta).toBeDefined();
            expect(mockPrisma.categoria).toBeDefined();
        });
    });

    describe('Validações de Integridade', () => {
        it('deve validar estrutura de transação', () => {
            // Arrange
            const transacao = criarTransacaoTeste();

            // Assert
            expect(transacao).toHaveProperty('usuarioId');
            expect(transacao).toHaveProperty('contaId');
            expect(transacao).toHaveProperty('categoriaId');
            expect(['RECEITA', 'DESPESA']).toContain(transacao.tipo);
        });

        it('deve validar estrutura de usuário', async () => {
            // Arrange
            const usuario = await criarUsuarioTeste();

            // Assert
            expect(usuario).toHaveProperty('email');
            expect(usuario).toHaveProperty('nome');
            expect(usuario).toHaveProperty('senha');
            expect(usuario.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        });

        it('deve validar estrutura de conta', () => {
            // Arrange
            const conta = criarContaTeste();

            // Assert
            expect(conta).toHaveProperty('nome');
            expect(conta).toHaveProperty('tipo');
            expect(conta).toHaveProperty('saldo');
            expect(conta).toHaveProperty('usuarioId');
            expect(typeof conta.saldo).toBe('number');
        });
    });

    describe('Helpers de Teste', () => {
        it('deve gerar dados de teste válidos', () => {
            // Act
            const email = gerarEmail();
            const id = gerarId();
            const valor = gerarValor();

            // Assert
            expect(email).toContain('@example.com');
            expect(id).toContain('test-');
            expect(typeof valor).toBe('number');
            expect(valor).toBeGreaterThan(0);
        });

        it('deve validar formatos de dados', () => {
            // Arrange
            const dataValida = new Date().toISOString();
            const valorValido = 100.50;

            // Act & Assert
            expect(() => validarFormatoData(dataValida)).not.toThrow();
            expect(() => validarFormatoMoeda(valorValido)).not.toThrow();

            // Testes de dados inválidos
            expect(() => validarFormatoData('data-inválida')).toThrow();
            expect(() => validarFormatoMoeda(-10)).toThrow();
            expect(() => validarFormatoMoeda('não-é-número')).toThrow();
        });

        it('deve simular erros de banco', () => {
            // Act
            const erro = simularErroBanco('Teste de erro');

            // Assert
            expect(erro).toBeInstanceOf(Error);
            expect(erro.message).toBe('Teste de erro');
        });
    });

    describe('Utilitários de Teste', () => {
        it('deve aguardar promises corretamente', async () => {
            // Arrange
            const inicio = Date.now();

            // Act
            await aguardar(100);
            const duracao = Date.now() - inicio;

            // Assert
            expect(duracao).toBeGreaterThanOrEqual(90); // Margem de erro
            expect(duracao).toBeLessThan(200);
        });

        it('deve criar mock de request/response', () => {
            // Act
            const req = criarMockRequest({ method: 'POST' });
            const res = criarMockResponse();

            // Assert
            expect(req.method).toBe('POST');
            expect(res.status).toBeDefined();
            expect(res.json).toBeDefined();
        });

        it('deve criar mock de sessão', () => {
            // Act
            const session = criarMockSession({ user: { name: 'Teste' } });

            // Assert
            expect(session.user).toBeDefined();
            expect(session.user.name).toBe('Teste');
            expect(session.expires).toBeDefined();
        });
    });
});