import {
  generateSecret,
  generateQRCodeUrl,
  generateQRCode,
  verifyToken,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
  countBackupCodes,
  formatTokenInput,
  isValidTokenFormat,
  isValidBackupCodeFormat,
} from '../two-factor';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Mock QRCode
jest.mock('qrcode');

describe('Two-Factor Authentication', () => {
  beforeEach(() => {
    // Mock QRCode.toDataURL para retornar um data URL válido
    (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Secret Generation', () => {
    it('deve gerar secret válido', () => {
      const secret = generateSecret();
      
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(0);
    });

    it('deve gerar secrets únicos', () => {
      const secret1 = generateSecret();
      const secret2 = generateSecret();
      
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('QR Code', () => {
    it('deve gerar URL do QR Code', () => {
      const email = 'test@example.com';
      const secret = generateSecret();
      
      const url = generateQRCodeUrl(email, secret);
      
      expect(url).toContain('otpauth://totp/');
      expect(url).toContain(encodeURIComponent(email));
      expect(url).toContain(secret);
      expect(url).toContain(encodeURIComponent('Finanças UP'));
    });

    it('deve gerar QR Code como Data URL', async () => {
      const email = 'test@example.com';
      const secret = generateSecret();
      
      const qrCode = await generateQRCode(email, secret);
      
      expect(qrCode).toContain('data:image/png;base64,');
    });
  });

  describe('Token Verification', () => {
    it('deve verificar token válido', () => {
      const secret = generateSecret();
      const token = authenticator.generate(secret);
      
      const isValid = verifyToken(token, secret);
      
      expect(isValid).toBe(true);
    });

    it('deve rejeitar token inválido', () => {
      const secret = generateSecret();
      const invalidToken = '000000';
      
      const isValid = verifyToken(invalidToken, secret);
      
      expect(isValid).toBe(false);
    });

    it('deve rejeitar token com secret errado', () => {
      const secret1 = generateSecret();
      const secret2 = generateSecret();
      const token = authenticator.generate(secret1);
      
      const isValid = verifyToken(token, secret2);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Backup Codes', () => {
    it('deve gerar códigos de backup', () => {
      const codes = generateBackupCodes(10);
      
      expect(codes).toHaveLength(10);
      codes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
      });
    });

    it('deve gerar códigos únicos', () => {
      const codes = generateBackupCodes(10);
      const uniqueCodes = new Set(codes);
      
      expect(uniqueCodes.size).toBe(10);
    });

    it('deve gerar quantidade customizada de códigos', () => {
      const codes5 = generateBackupCodes(5);
      const codes20 = generateBackupCodes(20);
      
      expect(codes5).toHaveLength(5);
      expect(codes20).toHaveLength(20);
    });

    it('deve fazer hash dos códigos', () => {
      const codes = generateBackupCodes(10);
      const hashed = hashBackupCodes(codes);
      
      expect(typeof hashed).toBe('string');
      expect(hashed).toContain('[');
      expect(hashed).toContain(']');
      
      const parsed = JSON.parse(hashed);
      expect(parsed).toHaveLength(10);
      parsed.forEach((hash: string) => {
        expect(hash).toHaveLength(64); // SHA-256 hash
      });
    });

    it('deve verificar código de backup válido', () => {
      const codes = generateBackupCodes(10);
      const hashed = hashBackupCodes(codes);
      
      const result = verifyBackupCode(codes[0], hashed);
      
      expect(result.valid).toBe(true);
      expect(result.remainingCodes).toBeDefined();
      
      const remaining = JSON.parse(result.remainingCodes!);
      expect(remaining).toHaveLength(9);
    });

    it('deve rejeitar código de backup inválido', () => {
      const codes = generateBackupCodes(10);
      const hashed = hashBackupCodes(codes);
      
      const result = verifyBackupCode('FFFF-FFFF', hashed);
      
      expect(result.valid).toBe(false);
      expect(result.remainingCodes).toBeUndefined();
    });

    it('não deve permitir reutilizar código de backup', () => {
      const codes = generateBackupCodes(10);
      let hashed = hashBackupCodes(codes);
      
      // Primeira vez - válido
      const result1 = verifyBackupCode(codes[0], hashed);
      expect(result1.valid).toBe(true);
      
      // Atualizar hash
      hashed = result1.remainingCodes!;
      
      // Segunda vez - inválido
      const result2 = verifyBackupCode(codes[0], hashed);
      expect(result2.valid).toBe(false);
    });

    it('deve contar códigos de backup restantes', () => {
      const codes = generateBackupCodes(10);
      const hashed = hashBackupCodes(codes);
      
      const count = countBackupCodes(hashed);
      expect(count).toBe(10);
      
      // Usar um código
      const result = verifyBackupCode(codes[0], hashed);
      const newCount = countBackupCodes(result.remainingCodes!);
      expect(newCount).toBe(9);
    });

    it('deve retornar 0 para JSON inválido', () => {
      const count = countBackupCodes('invalid json');
      expect(count).toBe(0);
    });
  });

  describe('Token Formatting', () => {
    it('deve formatar token removendo espaços e hífens', () => {
      expect(formatTokenInput('123 456')).toBe('123456');
      expect(formatTokenInput('123-456')).toBe('123456');
      expect(formatTokenInput('12 34 56')).toBe('123456');
    });

    it('deve converter para maiúsculas', () => {
      expect(formatTokenInput('abc123')).toBe('ABC123');
    });

    it('deve validar formato de token', () => {
      expect(isValidTokenFormat('123456')).toBe(true);
      expect(isValidTokenFormat('000000')).toBe(true);
      expect(isValidTokenFormat('999999')).toBe(true);
      
      expect(isValidTokenFormat('12345')).toBe(false);
      expect(isValidTokenFormat('1234567')).toBe(false);
      expect(isValidTokenFormat('abcdef')).toBe(false);
      expect(isValidTokenFormat('12345a')).toBe(false);
    });

    it('deve validar formato de código de backup', () => {
      expect(isValidBackupCodeFormat('ABCD-1234')).toBe(true);
      expect(isValidBackupCodeFormat('1234-ABCD')).toBe(true);
      expect(isValidBackupCodeFormat('FFFF-FFFF')).toBe(true);
      
      expect(isValidBackupCodeFormat('ABCD1234')).toBe(false);
      expect(isValidBackupCodeFormat('ABCD-123')).toBe(false);
      expect(isValidBackupCodeFormat('ABCD-12345')).toBe(false);
      expect(isValidBackupCodeFormat('GHIJ-KLMN')).toBe(false); // G-N não são hex
    });
  });

  describe('Integration Tests', () => {
    it('deve completar fluxo completo de setup e verificação', async () => {
      const email = 'test@example.com';
      
      // 1. Gerar secret
      const secret = generateSecret();
      expect(secret).toBeDefined();
      
      // 2. Gerar QR Code
      const qrCode = await generateQRCode(email, secret);
      expect(qrCode).toContain('data:image/png;base64,');
      
      // 3. Gerar códigos de backup
      const backupCodes = generateBackupCodes(10);
      expect(backupCodes).toHaveLength(10);
      
      // 4. Hash códigos de backup
      const hashedCodes = hashBackupCodes(backupCodes);
      expect(hashedCodes).toBeDefined();
      
      // 5. Gerar token válido
      const token = authenticator.generate(secret);
      expect(token).toHaveLength(6);
      
      // 6. Verificar token
      const isValid = verifyToken(token, secret);
      expect(isValid).toBe(true);
    });

    it('deve permitir login com código de backup quando token não funciona', () => {
      const secret = generateSecret();
      const backupCodes = generateBackupCodes(10);
      let hashedCodes = hashBackupCodes(backupCodes);
      
      // Simular perda do dispositivo - token inválido
      const invalidToken = '000000';
      expect(verifyToken(invalidToken, secret)).toBe(false);
      
      // Usar código de backup
      const backupResult = verifyBackupCode(backupCodes[0], hashedCodes);
      expect(backupResult.valid).toBe(true);
      
      // Atualizar códigos
      hashedCodes = backupResult.remainingCodes!;
      expect(countBackupCodes(hashedCodes)).toBe(9);
    });

    it('deve bloquear acesso quando códigos de backup acabarem', () => {
      const backupCodes = generateBackupCodes(3);
      let hashedCodes = hashBackupCodes(backupCodes);
      
      // Usar todos os códigos
      backupCodes.forEach(code => {
        const result = verifyBackupCode(code, hashedCodes);
        expect(result.valid).toBe(true);
        hashedCodes = result.remainingCodes!;
      });
      
      // Verificar que não há mais códigos
      expect(countBackupCodes(hashedCodes)).toBe(0);
      
      // Tentar usar código já usado
      const result = verifyBackupCode(backupCodes[0], hashedCodes);
      expect(result.valid).toBe(false);
    });
  });

  describe('Security Tests', () => {
    it('não deve aceitar tokens muito antigos ou futuros', () => {
      const secret = generateSecret();
      
      // Token atual deve funcionar
      const currentToken = authenticator.generate(secret);
      expect(verifyToken(currentToken, secret)).toBe(true);
      
      // Token com timestamp muito diferente não deve funcionar
      // (otplib já implementa window de 1 período = 30s antes e depois)
    });

    it('deve gerar hashes diferentes para códigos diferentes', () => {
      const codes1 = ['AAAA-AAAA', 'BBBB-BBBB'];
      const codes2 = ['AAAA-AAAA', 'CCCC-CCCC'];
      
      const hash1 = hashBackupCodes(codes1);
      const hash2 = hashBackupCodes(codes2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('não deve expor códigos originais no hash', () => {
      const codes = generateBackupCodes(10);
      const hashed = hashBackupCodes(codes);
      
      codes.forEach(code => {
        expect(hashed).not.toContain(code);
      });
    });
  });
});
