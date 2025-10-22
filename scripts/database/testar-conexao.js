const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco!');
  } catch (error) {
    console.error('❌ Falha na conexão:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
