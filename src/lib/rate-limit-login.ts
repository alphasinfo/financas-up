/**
 * Rate Limiting para Login
 * 
 * Previne ataques de força bruta limitando tentativas de login
 * por IP e por email.
 * 
 * Limites:
 * - 5 tentativas por IP a cada 15 minutos
 * - 3 tentativas por email a cada 15 minutos
 */

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

// Armazenamento em memória (em produção, usar Redis)
const loginAttemptsByIP = new Map<string, LoginAttempt>();
const loginAttemptsByEmail = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS_PER_IP = 5;
const MAX_ATTEMPTS_PER_EMAIL = 3;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos em ms
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hora

/**
 * Limpar tentativas antigas periodicamente
 */
setInterval(() => {
  const now = Date.now();
  
  // Limpar IPs
  for (const [ip, attempt] of loginAttemptsByIP.entries()) {
    if (attempt.blockedUntil && now > attempt.blockedUntil) {
      loginAttemptsByIP.delete(ip);
    } else if (now - attempt.firstAttempt > BLOCK_DURATION) {
      loginAttemptsByIP.delete(ip);
    }
  }
  
  // Limpar emails
  for (const [email, attempt] of loginAttemptsByEmail.entries()) {
    if (attempt.blockedUntil && now > attempt.blockedUntil) {
      loginAttemptsByEmail.delete(email);
    } else if (now - attempt.firstAttempt > BLOCK_DURATION) {
      loginAttemptsByEmail.delete(email);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Obter IP do cliente
 */
export function getClientIP(request: Request): string {
  // Tentar obter IP real de headers de proxy
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback para IP genérico
  return 'unknown';
}

/**
 * Verificar se IP está bloqueado
 */
export function isIPBlocked(ip: string): { blocked: boolean; remainingTime?: number } {
  const attempt = loginAttemptsByIP.get(ip);
  
  if (!attempt) {
    return { blocked: false };
  }
  
  const now = Date.now();
  
  // Verificar se está bloqueado
  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    const remainingTime = Math.ceil((attempt.blockedUntil - now) / 1000 / 60); // minutos
    return { blocked: true, remainingTime };
  }
  
  // Verificar se passou o tempo de reset
  if (now - attempt.firstAttempt > BLOCK_DURATION) {
    loginAttemptsByIP.delete(ip);
    return { blocked: false };
  }
  
  // Verificar se excedeu tentativas
  if (attempt.count >= MAX_ATTEMPTS_PER_IP) {
    attempt.blockedUntil = now + BLOCK_DURATION;
    const remainingTime = Math.ceil(BLOCK_DURATION / 1000 / 60);
    return { blocked: true, remainingTime };
  }
  
  return { blocked: false };
}

/**
 * Verificar se email está bloqueado
 */
export function isEmailBlocked(email: string): { blocked: boolean; remainingTime?: number } {
  const attempt = loginAttemptsByEmail.get(email.toLowerCase());
  
  if (!attempt) {
    return { blocked: false };
  }
  
  const now = Date.now();
  
  // Verificar se está bloqueado
  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    const remainingTime = Math.ceil((attempt.blockedUntil - now) / 1000 / 60); // minutos
    return { blocked: true, remainingTime };
  }
  
  // Verificar se passou o tempo de reset
  if (now - attempt.firstAttempt > BLOCK_DURATION) {
    loginAttemptsByEmail.delete(email.toLowerCase());
    return { blocked: false };
  }
  
  // Verificar se excedeu tentativas
  if (attempt.count >= MAX_ATTEMPTS_PER_EMAIL) {
    attempt.blockedUntil = now + BLOCK_DURATION;
    const remainingTime = Math.ceil(BLOCK_DURATION / 1000 / 60);
    return { blocked: true, remainingTime };
  }
  
  return { blocked: false };
}

/**
 * Registrar tentativa de login falha
 */
export function recordFailedLogin(ip: string, email: string): void {
  const now = Date.now();
  const emailLower = email.toLowerCase();
  
  // Registrar por IP
  const ipAttempt = loginAttemptsByIP.get(ip);
  if (ipAttempt) {
    ipAttempt.count++;
  } else {
    loginAttemptsByIP.set(ip, {
      count: 1,
      firstAttempt: now,
    });
  }
  
  // Registrar por email
  const emailAttempt = loginAttemptsByEmail.get(emailLower);
  if (emailAttempt) {
    emailAttempt.count++;
  } else {
    loginAttemptsByEmail.set(emailLower, {
      count: 1,
      firstAttempt: now,
    });
  }
}

/**
 * Limpar tentativas após login bem-sucedido
 */
export function clearLoginAttempts(ip: string, email: string): void {
  loginAttemptsByIP.delete(ip);
  loginAttemptsByEmail.delete(email.toLowerCase());
}

/**
 * Obter informações de tentativas
 */
export function getLoginAttemptInfo(ip: string, email: string): {
  ipAttempts: number;
  emailAttempts: number;
  ipRemaining: number;
  emailRemaining: number;
} {
  const ipAttempt = loginAttemptsByIP.get(ip);
  const emailAttempt = loginAttemptsByEmail.get(email.toLowerCase());
  
  return {
    ipAttempts: ipAttempt?.count || 0,
    emailAttempts: emailAttempt?.count || 0,
    ipRemaining: MAX_ATTEMPTS_PER_IP - (ipAttempt?.count || 0),
    emailRemaining: MAX_ATTEMPTS_PER_EMAIL - (emailAttempt?.count || 0),
  };
}
