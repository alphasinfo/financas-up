import { NextResponse } from 'next/server';
import { 
  getClientIP, 
  isIPBlocked, 
  isEmailBlocked,
  recordFailedLogin,
  clearLoginAttempts,
  getLoginAttemptInfo
} from '@/lib/rate-limit-login';

/**
 * POST /api/auth/check-rate-limit
 * 
 * Verifica se o usuário pode tentar fazer login
 */
export async function POST(request: Request) {
  try {
    const { email, action } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }
    
    const ip = getClientIP(request);
    
    // Verificar bloqueios
    const ipCheck = isIPBlocked(ip);
    const emailCheck = isEmailBlocked(email);
    
    if (ipCheck.blocked) {
      return NextResponse.json(
        { 
          blocked: true,
          reason: 'ip',
          message: `Muitas tentativas de login deste IP. Tente novamente em ${ipCheck.remainingTime} minutos.`,
          remainingTime: ipCheck.remainingTime
        },
        { status: 429 }
      );
    }
    
    if (emailCheck.blocked) {
      return NextResponse.json(
        { 
          blocked: true,
          reason: 'email',
          message: `Muitas tentativas de login para este email. Tente novamente em ${emailCheck.remainingTime} minutos.`,
          remainingTime: emailCheck.remainingTime
        },
        { status: 429 }
      );
    }
    
    // Se for para registrar falha
    if (action === 'record-failure') {
      recordFailedLogin(ip, email);
      
      const info = getLoginAttemptInfo(ip, email);
      
      return NextResponse.json({
        blocked: false,
        recorded: true,
        info
      });
    }
    
    // Se for para limpar tentativas (login bem-sucedido)
    if (action === 'clear') {
      clearLoginAttempts(ip, email);
      
      return NextResponse.json({
        blocked: false,
        cleared: true
      });
    }
    
    // Apenas verificar
    const info = getLoginAttemptInfo(ip, email);
    
    return NextResponse.json({
      blocked: false,
      info
    });
    
  } catch (error) {
    console.error('Erro ao verificar rate limit:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar rate limit' },
      { status: 500 }
    );
  }
}
