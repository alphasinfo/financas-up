/**
 * Two-Factor Authentication (2FA) Service
 * 
 * Implementa autenticação de dois fatores usando TOTP (Time-based One-Time Password)
 * Compatível com Google Authenticator, Authy, Microsoft Authenticator, etc.
 */

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Configurar otplib
authenticator.options = {
  window: 1, // Aceitar tokens de 30s antes e depois
  step: 30,  // Token válido por 30 segundos
};

/**
 * Gerar secret para 2FA
 */
export function generateSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Gerar URL para QR Code
 */
export function generateQRCodeUrl(email: string, secret: string): string {
  const appName = 'Finanças UP';
  return authenticator.keyuri(email, appName, secret);
}

/**
 * Gerar QR Code como Data URL
 */
export async function generateQRCode(email: string, secret: string): Promise<string> {
  const otpauthUrl = generateQRCodeUrl(email, secret);
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw new Error('Falha ao gerar QR Code');
  }
}

/**
 * Verificar token 2FA
 */
export function verifyToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('Erro ao verificar token 2FA:', error);
    return false;
  }
}

/**
 * Gerar códigos de backup
 * Retorna array de 10 códigos de 8 caracteres cada
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Gerar código aleatório de 8 caracteres (formato: XXXX-XXXX)
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
    codes.push(formatted);
  }
  
  return codes;
}

/**
 * Hash de códigos de backup para armazenamento seguro
 */
export function hashBackupCodes(codes: string[]): string {
  // Armazenar como JSON com hash de cada código
  const hashedCodes = codes.map(code => {
    const hash = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
    return hash;
  });
  
  return JSON.stringify(hashedCodes);
}

/**
 * Verificar código de backup
 */
export function verifyBackupCode(code: string, hashedCodesJson: string): {
  valid: boolean;
  remainingCodes?: string;
} {
  try {
    const hashedCodes: string[] = JSON.parse(hashedCodesJson);
    
    // Hash do código fornecido
    const codeHash = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
    
    // Verificar se o hash existe
    const index = hashedCodes.indexOf(codeHash);
    
    if (index === -1) {
      return { valid: false };
    }
    
    // Remover código usado
    hashedCodes.splice(index, 1);
    
    return {
      valid: true,
      remainingCodes: JSON.stringify(hashedCodes),
    };
  } catch (error) {
    console.error('Erro ao verificar código de backup:', error);
    return { valid: false };
  }
}

/**
 * Contar códigos de backup restantes
 */
export function countBackupCodes(hashedCodesJson: string): number {
  try {
    const hashedCodes: string[] = JSON.parse(hashedCodesJson);
    return hashedCodes.length;
  } catch (error) {
    return 0;
  }
}

/**
 * Formatar código para exibição
 * Remove espaços e hífens, converte para maiúsculas
 */
export function formatTokenInput(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Validar formato de token
 */
export function isValidTokenFormat(token: string): boolean {
  // Token deve ter 6 dígitos
  return /^\d{6}$/.test(token);
}

/**
 * Validar formato de código de backup
 */
export function isValidBackupCodeFormat(code: string): boolean {
  // Código deve ter formato XXXX-XXXX (8 caracteres hexadecimais)
  return /^[A-F0-9]{4}-[A-F0-9]{4}$/i.test(code);
}
