/**
 * Testes de Validação (Novos)
 * 
 * Testa as funções de validação implementadas
 */

import {
  validateCPF,
  validateCNPJ,
  validateEmail,
  validatePhone,
  validateCEP,
  validateCurrency,
  validateDate,
  validateRequired,
  validateLength,
  validateNumeric,
  validateURL,
  validateStrongPassword,
  validateFields,
} from '../validation-helper';

describe('Validação (Implementada)', () => {
  describe('validateCPF', () => {
    it('deve validar CPF válido', () => {
      expect(validateCPF('11144477735')).toBe(true);
    });

    it('deve rejeitar CPF inválido', () => {
      expect(validateCPF('12345678901')).toBe(false);
      expect(validateCPF('111.111.111-11')).toBe(false);
      expect(validateCPF('000.000.000-00')).toBe(false);
    });

    it('deve rejeitar formato inválido', () => {
      expect(validateCPF('123')).toBe(false);
      expect(validateCPF('')).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    it('deve validar CNPJ válido', () => {
      expect(validateCNPJ('11222333000181')).toBe(true);
    });

    it('deve rejeitar CNPJ inválido', () => {
      expect(validateCNPJ('11.111.111/1111-11')).toBe(false);
      expect(validateCNPJ('00.000.000/0000-00')).toBe(false);
    });

    it('deve rejeitar formato inválido', () => {
      expect(validateCNPJ('123')).toBe(false);
      expect(validateCNPJ('')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('deve validar email válido', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('deve rejeitar formato vazio', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('   ')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('deve validar telefone celular', () => {
      expect(validatePhone('11987654321')).toBe(true);
      expect(validatePhone('(11) 98765-4321')).toBe(true);
    });

    it('deve validar telefone fixo', () => {
      expect(validatePhone('1133334444')).toBe(true);
      expect(validatePhone('(11) 3333-4444')).toBe(true);
    });

    it('deve rejeitar telefone inválido', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('1234567890123')).toBe(false);
    });
  });

  describe('validateCEP', () => {
    it('deve validar CEP válido', () => {
      expect(validateCEP('01234567')).toBe(true);
      expect(validateCEP('01234-567')).toBe(true);
    });

    it('deve rejeitar CEP inválido', () => {
      expect(validateCEP('123')).toBe(false);
      expect(validateCEP('123456789')).toBe(false);
    });
  });

  describe('validateCurrency', () => {
    it('deve validar valores monetários', () => {
      expect(validateCurrency(100.50)).toBe(true);
      expect(validateCurrency(0)).toBe(true);
      expect(validateCurrency('100.50')).toBe(true);
    });

    it('deve rejeitar valores inválidos', () => {
      expect(validateCurrency(-100)).toBe(false);
      expect(validateCurrency('abc')).toBe(false);
      expect(validateCurrency('')).toBe(false);
    });

    it('deve permitir valores negativos se especificado', () => {
      expect(validateCurrency(-100, { allowNegative: true })).toBe(true);
      expect(validateCurrency(-100, { allowNegative: false })).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('deve validar datas válidas', () => {
      expect(validateDate('2025-01-19')).toBe(true);
      expect(validateDate(new Date())).toBe(true);
    });

    it('deve rejeitar datas inválidas', () => {
      expect(validateDate('2025-13-01')).toBe(false);
      expect(validateDate('invalid-date')).toBe(false);
    });

    it('deve validar range de datas', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      expect(validateDate(tomorrow, { minDate: today })).toBe(true);
      expect(validateDate(yesterday, { minDate: today })).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('deve validar campos obrigatórios', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired(true)).toBe(true);
    });

    it('deve rejeitar valores vazios', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('validateLength', () => {
    it('deve validar comprimento mínimo', () => {
      expect(validateLength('test', { min: 3 })).toBe(true);
      expect(validateLength('test', { min: 5 })).toBe(false);
    });

    it('deve validar comprimento máximo', () => {
      expect(validateLength('test', { max: 5 })).toBe(true);
      expect(validateLength('test', { max: 3 })).toBe(false);
    });

    it('deve validar comprimento exato', () => {
      expect(validateLength('test', { exact: 4 })).toBe(true);
      expect(validateLength('test', { exact: 3 })).toBe(false);
    });
  });

  describe('validateNumeric', () => {
    it('deve validar números', () => {
      expect(validateNumeric(123)).toBe(true);
      expect(validateNumeric(123.45)).toBe(true);
      expect(validateNumeric('123')).toBe(true);
    });

    it('deve rejeitar não-números', () => {
      expect(validateNumeric('abc')).toBe(false);
      expect(validateNumeric('')).toBe(false);
    });

    it('deve validar apenas inteiros', () => {
      expect(validateNumeric(123, { integer: true })).toBe(true);
      expect(validateNumeric(123.45, { integer: true })).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('deve validar URLs válidas', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://localhost:3000')).toBe(true);
    });

    it('deve rejeitar URLs inválidas', () => {
      expect(validateURL('not-a-url')).toBe(false);
      expect(validateURL('')).toBe(false);
    });
  });

  describe('validateStrongPassword', () => {
    it('deve validar senha forte', () => {
      const result = validateStrongPassword('MinhaSenh@123');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
    });

    it('deve rejeitar senha fraca', () => {
      const result = validateStrongPassword('123');
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateFields', () => {
    it('deve validar múltiplos campos', () => {
      const data = {
        email: 'test@example.com',
        phone: '11987654321',
        name: 'João Silva',
      };

      const rules = {
        email: { required: true, type: 'email' as const },
        phone: { required: true, type: 'phone' as const },
        name: { required: true },
      };

      const result = validateFields(data, rules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('deve detectar campos inválidos', () => {
      const data = {
        email: 'invalid-email',
        phone: '123',
        name: '',
      };

      const rules = {
        email: { required: true, type: 'email' as const },
        phone: { required: true, type: 'phone' as const },
        name: { required: true },
      };

      const result = validateFields(data, rules);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });
  });
});