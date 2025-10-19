import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configurações otimizadas para Vercel Serverless + Supabase
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configurações para ambientes serverless
    // Reduz o número de conexões e melhora a performance
    // @ts-ignore - Opções específicas para Supabase
    __internal: {
      engine: {
        // Timeout mais curto para ambientes serverless
        connectTimeout: 10000,
        // Pool de conexões otimizado
        poolTimeout: 10000,
      },
    },
  });

// Cache do Prisma Client apenas em desenvolvimento
// Em produção, cada invocação serverless cria uma nova instância
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Não fazer disconnect automático em produção (serverless)
// O Vercel gerencia o ciclo de vida das conexões
if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
