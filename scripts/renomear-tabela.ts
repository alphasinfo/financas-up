import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`ALTER TABLE \"Emprestimo\" RENAME TO \"emprestimos\";`;
  console.log('✅ Tabela renomeada');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
