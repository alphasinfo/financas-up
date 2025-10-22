/**
 * Instrumentação do Next.js - Financas-Up
 * 
 * Configurações de instrumentação para Sentry e outras ferramentas
 */

export async function register() {
  // Configuração do Sentry apenas em produção
  if (process.env.NODE_ENV === 'production') {
    try {
      await import('./src/lib/sentry');
    } catch (error) {
      console.warn('Sentry não configurado:', error);
    }
  }

  // Suprimir warnings de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    // Suprimir warnings específicos do Prisma/OpenTelemetry
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Filtrar warnings conhecidos e não críticos
      if (
        message.includes('Critical dependency: the request of a dependency is an expression') ||
        message.includes('Critical dependency: require function is used in a way') ||
        message.includes('@prisma/instrumentation') ||
        message.includes('@opentelemetry/instrumentation')
      ) {
        return; // Suprimir estes warnings
      }
      
      // Manter outros warnings
      originalWarn.apply(console, args);
    };
  }
}