/**
 * Testes dos Formatadores (Novos)
 * 
 * Testa as funções de formatação implementadas
 */

import {
  formatCurrency,
  formatDate,
  formatPercentage,
  formatNumber,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  formatFileSize,
  formatRelativeTime,
  truncateText,
  capitalize,
  formatProperName,
} from '../formatters';

describe('Formatadores (Implementados)', () => {
  describe('formatCurrency', () => {
    it('deve formatar moeda brasileira', () => {
      expect(formatCurrency(1234.56)).toContain('1.234,56');
      expect(formatCurrency(0)).toContain('0,00');
    });

    it('deve formatar outras moedas', () => {
      expect(formatCurrency(1234.56, 'USD')).toContain('1.234,56');
      expect(formatCurrency(1234.56, 'EUR')).toContain('1.234,56');
    });

    it('deve lidar com valores grandes', () => {
      expect(formatCurrency(1000000)).toContain('1.000.000,00');
    });
  });

  describe('formatDate', () => {
    it('deve formatar data brasileira', () => {
      const date = new Date('2025-01-19T10:30:00');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/19\/01\/2025/);
    });

    it('deve formatar data com hora', () => {
      const date = new Date('2025-01-19T10:30:00');
      const formatted = formatDate(date, 'datetime');
      expect(formatted).toMatch(/19\/01\/2025.*10:30/);
    });

    it('deve lidar com strings de data', () => {
      const formatted = formatDate('2025-01-19');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/2025/);
    });

    it('deve lidar com datas inválidas', () => {
      expect(formatDate('data-inválida')).toBe('Data inválida');
    });
  });

  describe('formatPercentage', () => {
    it('deve formatar porcentagem', () => {
      expect(formatPercentage(0.1234)).toContain('12,34%');
      expect(formatPercentage(0.5)).toContain('50,00%');
    });

    it('deve formatar com casas decimais customizadas', () => {
      expect(formatPercentage(0.1234, 1)).toContain('12,3%');
      expect(formatPercentage(0.1234, 0)).toContain('12%');
    });
  });

  describe('formatNumber', () => {
    it('deve formatar números', () => {
      expect(formatNumber(1234.56)).toContain('1.234,56');
      expect(formatNumber(1000000)).toContain('1.000.000');
    });

    it('deve formatar com casas decimais', () => {
      expect(formatNumber(1234.5678, 2)).toContain('1.234,57');
      expect(formatNumber(1234, 2)).toContain('1.234,00');
    });
  });

  describe('formatCPF', () => {
    it('deve formatar CPF', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
    });

    it('deve lidar com CPF já formatado', () => {
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
    });

    it('deve lidar com CPF inválido', () => {
      expect(formatCPF('123')).toBe('123');
      expect(formatCPF('')).toBe('');
    });
  });

  describe('formatCNPJ', () => {
    it('deve formatar CNPJ', () => {
      expect(formatCNPJ('12345678000195')).toBe('12.345.678/0001-95');
    });

    it('deve lidar com CNPJ inválido', () => {
      expect(formatCNPJ('123')).toBe('123');
    });
  });

  describe('formatPhone', () => {
    it('deve formatar telefone celular', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    });

    it('deve formatar telefone fixo', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
    });

    it('deve lidar com telefone inválido', () => {
      expect(formatPhone('123')).toBe('123');
    });
  });

  describe('formatCEP', () => {
    it('deve formatar CEP', () => {
      expect(formatCEP('01234567')).toBe('01234-567');
    });

    it('deve lidar com CEP inválido', () => {
      expect(formatCEP('123')).toBe('123');
    });
  });

  describe('formatFileSize', () => {
    it('deve formatar tamanhos de arquivo', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
    });
  });

  describe('formatRelativeTime', () => {
    it('deve formatar tempo relativo', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      expect(formatRelativeTime(oneHourAgo)).toContain('há 1 hora');
    });

    it('deve lidar com tempo muito recente', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('agora mesmo');
    });
  });

  describe('truncateText', () => {
    it('deve truncar texto longo', () => {
      expect(truncateText('Este é um texto muito longo', 10)).toBe('Este é ...');
    });

    it('deve manter texto curto', () => {
      expect(truncateText('Curto', 10)).toBe('Curto');
    });
  });

  describe('capitalize', () => {
    it('deve capitalizar primeira letra', () => {
      expect(capitalize('teste')).toBe('Teste');
      expect(capitalize('TESTE')).toBe('Teste');
    });
  });

  describe('formatProperName', () => {
    it('deve formatar nome próprio', () => {
      expect(formatProperName('joão da silva')).toBe('João da Silva');
      expect(formatProperName('MARIA DOS SANTOS')).toBe('Maria dos Santos');
    });
  });
});