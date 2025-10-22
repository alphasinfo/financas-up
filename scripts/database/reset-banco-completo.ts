import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetDatabase() {
  // Detectar tipo de banco
  const dbTypeResult = await prisma.$queryRaw`SELECT 'postgresql' as db_type`
    .catch(() => [{ db_type: 'sqlite' }]);

  const dbType = Array.isArray(dbTypeResult) ? dbTypeResult[0].db_type : 'sqlite';
  console.log(`🔍 Detectado banco: ${dbType}`);

  if (dbType === 'postgresql') {
    // PostgreSQL: listar tabelas do schema public
    const tabelas = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `;

    for (const tabela of tabelas) {
      await prisma.$executeRawUnsafe(`DROP TABLE \"${tabela.tablename}\" CASCADE;`);
    }

    // Recriar extensão pgcrypto se necessário
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  } else {
    // SQLite: listar tabelas do sqlite_schema
    const tabelas = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_schema
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;

    for (const tabela of tabelas) {
      await prisma.$executeRawUnsafe(`DROP TABLE \"${tabela.name}\"`);
    }
  }

  console.log('✅ Banco resetado com sucesso!');
}

resetDatabase()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
