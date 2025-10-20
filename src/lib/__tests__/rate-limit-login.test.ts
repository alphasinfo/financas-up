import {
  isIPBlocked,
  isEmailBlocked,
  recordFailedLogin,
  clearLoginAttempts,
  getLoginAttemptInfo,
} from '../rate-limit-login';

describe('Rate Limiting de Login', () => {
  const testIP = '192.168.1.1';
  const testEmail = 'test@example.com';

  beforeEach(() => {
    // Limpar tentativas antes de cada teste
    clearLoginAttempts(testIP, testEmail);
  });

  describe('Bloqueio por IP', () => {
    it('não deve bloquear IP sem tentativas', () => {
      const result = isIPBlocked(testIP);
      expect(result.blocked).toBe(false);
    });

    it('não deve bloquear IP com poucas tentativas', () => {
      recordFailedLogin(testIP, testEmail);
      recordFailedLogin(testIP, testEmail);
      
      const result = isIPBlocked(testIP);
      expect(result.blocked).toBe(false);
    });

    it('deve bloquear IP após 5 tentativas', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedLogin(testIP, `test${i}@example.com`);
      }
      
      const result = isIPBlocked(testIP);
      expect(result.blocked).toBe(true);
      expect(result.remainingTime).toBeGreaterThan(0);
    });

    it('deve informar tempo restante de bloqueio', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedLogin(testIP, `test${i}@example.com`);
      }
      
      const result = isIPBlocked(testIP);
      expect(result.blocked).toBe(true);
      expect(result.remainingTime).toBeLessThanOrEqual(15); // 15 minutos
    });
  });

  describe('Bloqueio por Email', () => {
    it('não deve bloquear email sem tentativas', () => {
      const result = isEmailBlocked(testEmail);
      expect(result.blocked).toBe(false);
    });

    it('não deve bloquear email com poucas tentativas', () => {
      recordFailedLogin('192.168.1.1', testEmail);
      recordFailedLogin('192.168.1.2', testEmail);
      
      const result = isEmailBlocked(testEmail);
      expect(result.blocked).toBe(false);
    });

    it('deve bloquear email após 3 tentativas', () => {
      recordFailedLogin('192.168.1.1', testEmail);
      recordFailedLogin('192.168.1.2', testEmail);
      recordFailedLogin('192.168.1.3', testEmail);
      
      const result = isEmailBlocked(testEmail);
      expect(result.blocked).toBe(true);
      expect(result.remainingTime).toBeGreaterThan(0);
    });

    it('deve ser case-insensitive', () => {
      recordFailedLogin('192.168.1.1', 'Test@Example.com');
      recordFailedLogin('192.168.1.2', 'TEST@EXAMPLE.COM');
      recordFailedLogin('192.168.1.3', 'test@example.com');
      
      const result = isEmailBlocked('TeSt@ExAmPlE.cOm');
      expect(result.blocked).toBe(true);
    });
  });

  describe('Limpar Tentativas', () => {
    it('deve limpar tentativas de IP', () => {
      recordFailedLogin(testIP, testEmail);
      recordFailedLogin(testIP, testEmail);
      
      let info = getLoginAttemptInfo(testIP, testEmail);
      expect(info.ipAttempts).toBe(2);
      
      clearLoginAttempts(testIP, testEmail);
      
      info = getLoginAttemptInfo(testIP, testEmail);
      expect(info.ipAttempts).toBe(0);
    });

    it('deve limpar tentativas de email', () => {
      recordFailedLogin(testIP, testEmail);
      recordFailedLogin(testIP, testEmail);
      
      let info = getLoginAttemptInfo(testIP, testEmail);
      expect(info.emailAttempts).toBe(2);
      
      clearLoginAttempts(testIP, testEmail);
      
      info = getLoginAttemptInfo(testIP, testEmail);
      expect(info.emailAttempts).toBe(0);
    });
  });

  describe('Informações de Tentativas', () => {
    it('deve retornar contadores corretos', () => {
      recordFailedLogin(testIP, testEmail);
      recordFailedLogin(testIP, testEmail);
      
      const info = getLoginAttemptInfo(testIP, testEmail);
      
      expect(info.ipAttempts).toBe(2);
      expect(info.emailAttempts).toBe(2);
      expect(info.ipRemaining).toBe(3); // 5 - 2
      expect(info.emailRemaining).toBe(1); // 3 - 2
    });

    it('deve retornar zeros para IP/email sem tentativas', () => {
      const info = getLoginAttemptInfo('1.1.1.1', 'new@example.com');
      
      expect(info.ipAttempts).toBe(0);
      expect(info.emailAttempts).toBe(0);
      expect(info.ipRemaining).toBe(5);
      expect(info.emailRemaining).toBe(3);
    });
  });

  describe('Cenários Combinados', () => {
    it('deve bloquear por IP mesmo com emails diferentes', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedLogin(testIP, `test${i}@example.com`);
      }
      
      const result = isIPBlocked(testIP);
      expect(result.blocked).toBe(true);
    });

    it('deve bloquear por email mesmo com IPs diferentes', () => {
      for (let i = 0; i < 3; i++) {
        recordFailedLogin(`192.168.1.${i}`, testEmail);
      }
      
      const result = isEmailBlocked(testEmail);
      expect(result.blocked).toBe(true);
    });

    it('deve permitir login após limpar tentativas', () => {
      // Bloquear
      for (let i = 0; i < 5; i++) {
        recordFailedLogin(testIP, testEmail);
      }
      
      expect(isIPBlocked(testIP).blocked).toBe(true);
      expect(isEmailBlocked(testEmail).blocked).toBe(true);
      
      // Limpar
      clearLoginAttempts(testIP, testEmail);
      
      expect(isIPBlocked(testIP).blocked).toBe(false);
      expect(isEmailBlocked(testEmail).blocked).toBe(false);
    });
  });
});
