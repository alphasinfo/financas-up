import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Ajustar sample rate baseado no ambiente
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configurações de ambiente
  environment: process.env.NODE_ENV,
  
  // Ignorar erros conhecidos
  ignoreErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],
  
  // Filtrar dados sensíveis
  beforeSend(event, hint) {
    // Remover variáveis de ambiente sensíveis
    if (event.extra) {
      const sanitized = { ...event.extra };
      ['DATABASE_URL', 'NEXTAUTH_SECRET', 'OPENAI_API_KEY'].forEach(key => {
        if (sanitized[key]) {
          sanitized[key] = '***';
        }
      });
      event.extra = sanitized;
    }
    
    // Remover dados sensíveis de contexto
    if (event.contexts?.runtime?.env) {
      const env: Record<string, any> = { ...event.contexts.runtime.env };
      Object.keys(env).forEach(key => {
        if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')) {
          env[key] = '***';
        }
      });
      event.contexts.runtime.env = env;
    }
    
    return event;
  },
  
  // Integração com performance monitoring
  integrations: [
    Sentry.httpIntegration(),
  ],
});
