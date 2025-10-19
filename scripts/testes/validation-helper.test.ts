import { validateRequest, commonSchemas, sanitizeInput } from '../../src/lib/validation-helper';
import { z } from 'zod';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

describe('Validation Helper', () => {
  describe('validateRequest', () => {
    const schema = z.object({
      nome: z.string().min(3),
      idade: z.number().positive(),
    });

    it('deve validar dados corretos', () => {
      const result = validateRequest(schema, { nome: 'João', idade: 25 });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nome).toBe('João');
        expect(result.data.idade).toBe(25);
      }
    });

    it('deve retornar erro para dados inválidos', () => {
      const result = validateRequest(schema, { nome: 'Jo', idade: 25 });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response).toBeDefined();
      }
    });

    it('deve retornar erro para campo faltando', () => {
      const result = validateRequest(schema, { nome: 'João' });
      
      expect(result.success).toBe(false);
    });

    it('deve retornar erro para tipo incorreto', () => {
      const result = validateRequest(schema, { nome: 'João', idade: 'vinte' });
      
      expect(result.success).toBe(false);
    });
  });

  describe('commonSchemas', () => {
    it('deve validar email corretamente', () => {
      expect(commonSchemas.email.safeParse('test@example.com').success).toBe(true);
      expect(commonSchemas.email.safeParse('invalid-email').success).toBe(false);
    });

    it('deve validar senha forte', () => {
      expect(commonSchemas.senha.safeParse('Senha123').success).toBe(true);
      expect(commonSchemas.senha.safeParse('senha123').success).toBe(false); // Sem maiúscula
      expect(commonSchemas.senha.safeParse('SENHA123').success).toBe(false); // Sem minúscula
      expect(commonSchemas.senha.safeParse('SenhaForte').success).toBe(false); // Sem número
      expect(commonSchemas.senha.safeParse('Sen123').success).toBe(false); // Muito curta
    });

    it('deve validar nome', () => {
      expect(commonSchemas.nome.safeParse('João Silva').success).toBe(true);
      expect(commonSchemas.nome.safeParse('Jo').success).toBe(false); // Muito curto
      expect(commonSchemas.nome.safeParse('a'.repeat(101)).success).toBe(false); // Muito longo
    });

    it('deve validar valor', () => {
      expect(commonSchemas.valor.safeParse(100.50).success).toBe(true);
      expect(commonSchemas.valor.safeParse(-10).success).toBe(false); // Negativo
      expect(commonSchemas.valor.safeParse(Infinity).success).toBe(false); // Infinito
    });

    it('deve validar tipo de transação', () => {
      expect(commonSchemas.tipo.safeParse('RECEITA').success).toBe(true);
      expect(commonSchemas.tipo.safeParse('DESPESA').success).toBe(true);
      expect(commonSchemas.tipo.safeParse('TRANSFERENCIA').success).toBe(true);
      expect(commonSchemas.tipo.safeParse('INVALIDO').success).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('deve remover espaços em branco de strings', () => {
      expect(sanitizeInput('  teste  ')).toBe('teste');
    });

    it('deve sanitizar objetos recursivamente', () => {
      const input = {
        nome: '  João  ',
        email: '  test@example.com  ',
        nested: {
          valor: '  100  ',
        },
      };

      const result = sanitizeInput(input);
      
      expect(result.nome).toBe('João');
      expect(result.email).toBe('test@example.com');
      expect(result.nested.valor).toBe('100');
    });

    it('deve sanitizar arrays', () => {
      const input = ['  item1  ', '  item2  '];
      const result = sanitizeInput(input);
      
      expect(result).toEqual(['item1', 'item2']);
    });

    it('deve manter números e booleanos inalterados', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(true)).toBe(true);
      expect(sanitizeInput(false)).toBe(false);
    });
  });

});
