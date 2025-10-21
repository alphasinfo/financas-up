import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Obter DATABASE_URL de múltiplas fontes (Netlify, Vercel, local)
const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||
    'file:./dev.db' // Fallback para desenvolvimento
  );
};

// Configurações otimizadas para Vercel Serverless + Supabase + Netlify
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    // Configurações para ambientes serverless
    // Timeouts aumentados para suportar importações pesadas e queries paralelas
    // @ts-ignore - Opções específicas para Supabase
    __internal: {
      engine: {
        // Timeout de conexão aumentado para importações pesadas
        connectTimeout: 60000, // 60s (1 minuto)
        // Pool timeout aumentado para queries paralelas e transações longas
        poolTimeout: 60000, // 60s (1 minuto)
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
