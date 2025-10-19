/**
 * Helper para retry de operações do Prisma em ambientes serverless
 * Útil para lidar com timeouts e conexões perdidas
 */

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Erros que NÃO devem ser retentados
      const nonRetryableErrors = [
        'P2002', // Unique constraint
        'P2003', // Foreign key constraint
        'P2025', // Record not found
        'P2014', // Relation violation
      ];

      if (error.code && nonRetryableErrors.includes(error.code)) {
        throw error;
      }

      // Erros de conexão que DEVEM ser retentados
      const retryableErrors = [
        'P1001', // Can't reach database server
        'P1002', // Database server timeout
        'P1008', // Operations timed out
        'P1017', // Server has closed the connection
        'P2028', // Transaction API error
      ];

      const shouldRetry = 
        error.code && retryableErrors.includes(error.code) ||
        error.message?.includes('timeout') ||
        error.message?.includes('connection') ||
        error.message?.includes('Transaction not found');

      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }

      // Esperar antes de tentar novamente (exponential backoff)
      const delay = delayMs * Math.pow(2, attempt - 1);
      console.log(`[Prisma Retry] Tentativa ${attempt}/${maxRetries} falhou. Tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Operação falhou após múltiplas tentativas');
}

/**
 * Wrapper para queries do Prisma com retry automático
 */
export function createPrismaQuery<T extends (...args: any[]) => Promise<any>>(
  queryFn: T,
  maxRetries: number = 3
): T {
  return ((...args: any[]) => {
    return withRetry(() => queryFn(...args), maxRetries);
  }) as T;
}
